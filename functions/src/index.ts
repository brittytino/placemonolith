import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// 1. Hard Lock at 8:00 PM IST (Asia/Kolkata)
// Crontab: 0 20 * * *
export const scheduledLockAttendance = functions.pubsub
  .schedule("0 20 * * *")
  .timeZone("Asia/Kolkata")
  .onRun(async (context) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    // 1. Lock existing submissions
    const submissionsSnapshot = await db.collection("attendance_submissions")
      .where("date", "==", today)
      .where("isLocked", "==", false)
      .get();

    const batch = db.batch();
    submissionsSnapshot.forEach((doc) => {
      batch.update(doc.ref, { "isLocked": true });
    });

    // 2. Mark Absent for Missing Teams
    // Get all teams
    const teamsSnapshot = await db.collection("teams").get();
    const teamIds = teamsSnapshot.docs.map(t => t.id);

    // Get submitted team IDs
    const submittedRef = submissionsSnapshot.docs.map(d => d.data().teamId);
    // Also check generic query in case some were already locked manually?
    // Safer to just get all submissions for today.
    const allSubmissionsForToday = await db.collection("attendance_submissions")
        .where("date", "==", today).get();
    
    const submittedTeamIds = new Set(allSubmissionsForToday.docs.map(d => d.data().teamId));

    const missingTeamIds = teamIds.filter(id => !submittedTeamIds.has(id));

    // For each missing team, mark all members absent
    // This could be heavy, so splitting batches is needed in prod.
    // Simplifying for demo logic.
    
    for (const teamId of missingTeamIds) {
        // Create locked submission record
        const subRef = db.collection("attendance_submissions").doc(`${today}_${teamId}`);
        batch.set(subRef, {
            date: today,
            teamId: teamId,
            submittedBy: "SYSTEM_AUTO_ABSENT",
            submittedAt: admin.firestore.FieldValue.serverTimestamp(),
            isLocked: true
        });

        // Get students in this team
        const students = await db.collection("users")
            .where("teamId", "==", teamId)
            .where("roles.isStudent", "==", true)
            .get();

        students.forEach((studentDoc) => {
            const data = studentDoc.data();
            const recordRef = db.collection("attendance_records").doc(`${today}_${data.regNo}`);
            batch.set(recordRef, {
                date: today,
                studentUid: studentDoc.id,
                regNo: data.regNo,
                teamId: teamId,
                status: "ABSENT",
                markedBy: "SYSTEM",
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        });
    }

    await batch.commit();
    console.log(`Locked ${submissionsSnapshot.size} submissions. Marked ${missingTeamIds.length} teams absent.`);
    return null;
  });

// 2. Safety Net: Block non-PSG emails on creation if client check fails
export const beforeCreateUser = functions.auth.user().beforeCreate((user, context) => {
  if (!user.email || !user.email.endsWith("@psgtech.ac.in")) {
    throw new functions.auth.HttpsError(
      "invalid-argument", 
      "Only @psgtech.ac.in emails are allowed."
    );
  }
});

// 3. Hydrate User Profile from Whitelist on Creation
// This ensures that when a student logs in for the first time,
// their Role/Team data is copied from the 'whitelist' to their 'users' doc.
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const email = user.email;
  if (!email) return;

  const whitelistDoc = await db.collection("whitelist").doc(email).get();
  
  if (whitelistDoc.exists) {
    const data = whitelistDoc.data();
    // Copy data to the actual User document keyed by UID
    await db.collection("users").doc(user.uid).set({
      email: email,
      name: data?.name || "Unknown",
      regNo: data?.regNo || "",
      teamId: data?.teamId || "",
      roles: data?.roles || { isStudent: true },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Hydrated user ${user.uid} (${email}) from whitelist.`);
  } else {
    // Optional: Delete the auth user if they aren't in whitelist?
    // Or just let them exist with no profile (UI will show "Contact Admin")
    console.log(`User ${email} not in whitelist. No profile created.`);
  }
});

