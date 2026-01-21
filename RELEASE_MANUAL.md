# PSG Technology MCA (2025–2027) Placement App - Release Manual

## Phase 23: Production Freeze

### 1. Codebase Classification
*   **CORE (Requires Full Migration & Release Cycle)**
    *   `lib/services/auth_service.dart` (Authentication flow)
    *   `lib/services/firestore_service.dart` (Critical Data Path)
    *   `lib/providers/user_provider.dart` (Role & State Management)
    *   `functions/src/index.ts` (Lock Logic & Security)
    *   `firestore.rules` (Security & Access Control)
*   **SAFE (UI Tweaks Permitted hotfix/minor)**
    *   `lib/ui/widgets/` (Design System Components)
    *   `lib/core/theme/` (Colors/Typography)
    *   `lib/ui/*` (Screen Layouts, text changes)
*   **IMMUTABLE (Do Not Touch without Data Migration)**
    *   `lib/models/` (Data structure definitions)
    *   Firestore Schema Structure

### 2. Git & Versioning Strategy
*   **Branching:**
    *   `main`: Production-ready code ONLY. Protected branch.
    *   `release/v1.x`: Staging for release.
    *   `dev` or `hotfix/xxx`: Work branches.
*   **Tagging:**
    *   Tag `v1.0.0` on `main` immediately after successful deployment.
*   **Hotfix Procedure:**
    1.  Branch from `main` -> `hotfix/critical-attendance-bug`.
    2.  Fix logic.
    3.  Detailed local test of THAT specific bug.
    4.  Merge to `main`.
    5.  Bump version `v1.0.1`.
    6.  Deploy.

---

## Phase 24: Environment Separation

### Strategy
Since this is a student project with limited resources, we will use **One Project with Strict Naming** or **Emulator for Dev**.

*   **Production:** `psg-mca-placement` (The Live Firebase Project).
*   **Development:** Use **Firebase Emulators**.
    *   `firebase emulators:start` locally.
    *   Flutter: `await FirebaseAuth.instance.useAuthEmulator('localhost', 9099);` (Enable conditionally in `main.dart` if `kDebugMode`).
*   **Protection:**
    *   `firestore.rules` preventing writes to `attendance_records` from unknown clients is the primary defense.
    *   **NEVER** share `google-services.json` or `firebase_options.dart` of production in public repos.

---

## Phase 25: Final Smoke Test Script (1 Hour)

| Step | Action | Expected UI Result | Expected Data Result |
| :--- | :--- | :--- | :--- |
| 1 | **Login (Student)** | Email sent screen -> Dashboard loads. | `users` doc created/read. |
| 2 | **View Task** | "Today's Task" card visible. | Read from `daily_tasks/{today}`. |
| 3 | **Submit Attendance (Leader)** | Select students -> Click Final Submit -> Success Snackbar. "Locked" state appears. | `attendance_submissions`: Doc created. `attendance_records`: Docs created. |
| 4 | **Re-Submit (Leader)** | "Already Submitted" message. | Write denied by Rules/Logic. |
| 5 | **Coordinator Publish** | Fill form -> Publish -> Success. | `daily_tasks`: Doc created/updated. |
| 6 | **Rep Override** | Go to Admin -> Select Student -> Change status -> Reason "Test" -> Submit. | `attendance_records`: Status changed. `audit_logs`: Log created. |
| 7 | **Force Close & Re-open** | App opens directly to Dashboard (No login). | Session persisted. |

---

## Phase 26: Release Communication

### 📢 To Coordinators
> **Subject: MCA Placement App - Live Deployment**
>
> The Placement Preparation App is now LIVE.
> *   **Action Required:** Please ensure tomorrow's task is published by 9:00 AM.
> *   **Monitoring:** Check the app to ensure Team Leaders are submitting before 6:00 PM.
> *   **Note:** You rely on the system. Do not accept manual excel sheets unless the system is down.

### ⚠️ To Team Leaders
> **Subject: IMMEDIATE ACTION: Attendance System Live**
>
> You are now responsible for marking daily attendance in the app.
> *   **Deadline:** 6:00 PM Daily.
> *   **Hard Lock:** 8:00 PM Strict. If you miss this, your entire team is marked ABSENT.
> *   **Edits:** You cannot edit after submitting. Be careful.
> *   **Login:** Use your `@psgtech.ac.in` email.

### 🎓 To Students
> **Subject: Placement Prep - Daily Tasks & Attendance**
>
> Efficient preparation requires discipline.
> *   **App:** [Link to Web/APK will be here]
> *   **Login:** Use your college email. No password needed.
> *   **Use:** Check daily LeetCode tasks. Track your attendance %.
> *   **Disputes:** Contact your Team Leader before 8:00 PM.

---

## Phase 27: Post-Launch Monitoring (First 72 Hours)

### Metrics to Watch (Firebase Console)
1.  **Cloud Functions:** Check `scheduledLockAttendance` logs daily at 8:01 PM.
    *   *Success:* "Locked X submissions."
    *   *Failure:* Error/Crash logs.
2.  **Firestore Usage:** Ensure reads/writes are within free tier limits (approx). 120 users * 10 reads shouldn't spike.
3.  **Auth:** Check for "Failed Login" spikes (indicates whitelist issues).

### Intervention Protocol
*   **Red Flag:** Function execution error.
    *   *Action:* Manually run the function code or fix data via Rep Override.
*   **Red Flag:** >10 Students reporting "User not authorized".
    *   *Action:* Check `whitelist` collection.
*   **Non-Event:** "I forgot to mark attendance."
    *   *Action:* **Do not intervene.** Let the system mark them absent. They will learn for tomorrow. This is about discipline.

---

## RELEASE STATUS:
**SYSTEM FROZEN. READY FOR DEPLOYMENT.**
**DO NOT COMMIT NEW FEATURES.**
