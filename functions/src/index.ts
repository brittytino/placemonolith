import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Email validation on signup
export const beforeCreateUser = functions.auth
  .user()
  .beforeCreate((user) => {
    if (!user.email || !user.email.endsWith("@psgtech.ac.in")) {
      throw new functions.auth.HttpsError(
        "invalid-argument",
        "Only @psgtech.ac.in emails allowed"
      );
    }
  });

// Hydrate user profile on first login
export const onUserCreated = functions.auth
  .user()
  .onCreate(async (user) => {
    const email = user.email;
    if (!email) return;

    try {
      const whitelistDoc = await db.collection("whitelist").doc(email).get();

      if (whitelistDoc.exists) {
        const data = whitelistDoc.data();
        await db.collection("users").doc(user.uid).set({
          email,
          name: data?.name || "Unknown",
          regNo: data?.regNo || "",
          teamId: data?.teamId || "",
          roles: data?.roles || { isStudent: true },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.info(
          `User ${user.uid} (${email}) hydrated from whitelist`
        );
      } else {
        functions.logger.warn(`User ${email} not in whitelist`);
      }
    } catch (error) {
      functions.logger.error(`Error hydrating user ${user.uid}:`, error);
    }
  });

