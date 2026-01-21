# Operational Readiness Manual
PSG Technology – MCA (2025–2027) Placement Preparation Program

---

## Phase 6: Real-World Dry Run Plan

**Objective:** Validate system stability and role enforcement before full rollout.
**Participants:** 1 Coordinator (`coord@psgtech.ac.in`), 1 Placement Rep (`rep@psgtech.ac.in`), 3 Team Leaders (`tl1`, `tl2`, `tl3`), 15 Test Students.

### Day 1: Task Check & "Forgot Submission" Simulation
*   **Activity:**
    *   Coordinator publishes "Day 1 Task".
    *   TL1 submits attendance at 5:00 PM (On time).
    *   TL2 opens app but *forgets* to submit (Intentional failure).
    *   TL3 submits partial attendance.
*   **Expectation:**
    *   Tasks visible to all students immediately.
    *   8:00 PM Cron runs.
    *   **TL1 Team:** Saved as submitted.
    *   **TL2 Team:** Entire team marked `ABSENT` by system.
*   **Verification:**
    *   Check Firestore `attendance_submissions`: Should have entry for TL1 & System entry for TL2.
    *   Check `attendance_records`: TL2 members should all have `status: "ABSENT"` and `markedBy: "SYSTEM"`.

### Day 2: The "Lock" Test
*   **Activity:**
    *   TL3 attempts to submit attendance at 8:05 PM.
    *   Placement Rep overrides 1 student from TL2 (Day 1 absent) to `PRESENT` with reason "Medical - Validated".
*   **Expectation:**
    *   TL3 App shows "Locked/Already Submitted" or prevents submission.
    *   Rep Override succeeds.
    *   Audit Log created for Rep action.
*   **Verification:**
    *   Confirm TL3 could not write to Firestore (Security Rules validation).
    *   Check `audit_logs` collection for new document.

### Day 3: Full Cycle
*   **Activity:** Standard day. Everyone does job correctly.
*   **Verification:** Smooth operation. No errors in Cloud Function logs.

---

## Phase 7: User Onboarding Material

### 🎓 For Students
*   **Login:** Open app > Enter valid `@psgtech.ac.in` email > Click link in email.
*   **Daily Routine:** Check "Today's Task" every morning.
*   **Attendance:**
    *   Your Team Leader marks attendance daily before 6 PM.
    *   View your stats in "My Log".
    *   **Disputes:** If you were present but marked absent, contact your Team Leader *before 8 PM*. After 8 PM, records are **permanent**.
*   **Note:** No signup required. Your account is pre-created by the placement cell.

### 👑 For Team Leaders
*   **Responsibility:** You are the single source of truth for your team's attendance.
*   **The Checkpoint:**
    *   Open "Team" tab after 4:30 PM.
    *   Mark everyone correctly.
    *   Click **Submit** before **6:00 PM**.
*   **The Hard Line:** The system locks at **8:00 PM sharp**.
    *   If you forget, your **entire team is marked absent**.
    *   There is no "Unsubmit" or "Edit" button. Be careful.

### 📋 For Coordinators
*   **Task Publishing:** Post the "Daily Task" (LeetCode + Topic) before 9:00 AM.
*   **Monitoring:** Keep an eye on the "Analytics" tab (future feature) ensures TLs are submitting.
*   **Power:** You cannot change attendance. Refer disputes to the Placement Rep.

### 🛡️ For Placement Representative (God Mode)
*   **The Power:** You have the only specific "Override" key in the system.
*   **When to Use:**
    *   Genuine Medical Leave (with proof).
    *   Team Leader technical failure (e.g., app crashed at 7:59 PM).
*   **When NOT to Use:**
    *   "I forgot to tell my TL."
    *   "Please bro, just this once."
*   **Accountability:** Every override is logged forever with your ID, timestamp, and the reason you type. These logs are audited by faculty.

---

## Phase 8: UX & Friction Review

### Identified Friction Points
1.  **"Did I submit?" Panic:** TLs might forget if they clicked submit.
    *   *Fix:* Add large green banner "Submission Received for [Date]" on Team Tab if confirmed.
2.  **"Why can't I login?"**: Students using personal Gmail vs College Mail.
    *   *Fix:* Login screen warning "Only @psgtech.ac.in addresses accepted".
3.  **"It's 8:01 PM!"**: TLs trying to submit just after lock.
    *   *Fix:* Client-side clock check showing "Attendance Locked" state instead of a failing submit button.

---

## Phase 9: Incident Response Plan

### Scenario A: Attendance Cron Failure (8 PM Lock didn't run)
*   **Detection:** Coordinator notices "Absent" teams still look like "Not Submitted" next morning.
*   **Immediate Action:**
    1.  Go to Google Cloud Console > Cloud Scheduler.
    2.  Click "Force Run" on `scheduledLockAttendance`.
*   **Communication:** "System Update: Attendance lock was delayed. Processing now. No data lost."

### Scenario B: Wrong Attendance Marked by TL
*   **Detection:** Student complains to Rep.
*   **Immediate Action:**
    1.  Rep uses "God Mode" to override specifically that student.
    2.  Rep logs reason: "TL Error - Correction".
*   **Communication:** N/A (Handled 1:1).

### Scenario C: Firestore Outage (App not loading)
*   **Detection:** App spins forever.
*   **Immediate Action:**
    1.  Notify students via WhatsApp Group: "Server Maintenance. Tasks will be posted to WhatsApp for today."
    2.  Attendance Policy: "Attendance for today is suspended/All Present."
*   **Long-term Fix:** Google usually fixes this in <1 hour.

### Scenario D: Accidental Whitelist Omission (Student can't login)
*   **Detection:** "User not authorized" error on login.
*   **Immediate Action:**
    1.  Admin manually adds document to `whitelist` collection in Firestore.
    2.  Ask student to try again in 1 min.

---

## Phase 10: Final Go/No-Go Checklist

**Must be TRUE to Launch:**
*   [ ] All 120 Emails + RegNos loaded into `whitelist` collection.
*   [ ] All 10-15 Team IDs assigned and mapped to TL UIDs.
*   [ ] Cloud Function `scheduledLockAttendance` deployed & active.
*   [ ] Firestore Rules `allow write: if false` (except specific roles) verified.
*   [ ] App distributed (APK or TestFlight) to all 120 students.

**Week 1 Health Metrics:**
*   **Login Success Rate:** >95% of whitelist has logged in once.
*   **Submission Rate:** 100% of Teams submitted before 8 PM. (Any missing = operational training issue).
*   **Override Rate:** < 2 overrides per day. (High overrides = TLs are failing or system is confusing).

---
**Status:** READY FOR DEPLOYMENT
