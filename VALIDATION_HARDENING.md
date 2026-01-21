# Pre-Production Hardening & Validation Analysis

## Phase 1: Data & Rule Validation

### 1.1 Firestore Security Strategy
The `firestore.rules` file has been implemented to strictly enforce the "Additive Role" model.
- **Immutability for Leaders**: Leaders have `create` permission but NO `update` permission on `attendance_records` and `attendance_submissions`. This strictly enforces the "One Submission" rule at the database level. Even if the app client is hacked to send an update request, Firestore will reject it.
- **God Mode Isolation**: Only users with `isPlacementRep == true` can call `update`.
- **Hierarchy Privacy**: 
  - Students can only query `attendance_records` where `studentUid == auth.uid`.
  - Leaders can only query records where `teamId == user.teamId`.
  - Global read access is reserved for Coordinators and Reps.

### 1.2 Server-Side Validations
- **Cloud Function Lock**: The 8:00 PM lock is enforced by the `scheduledLockAttendance` function. This runs in a trusted environment (Node.js) and uses the server's timezone configuration ("Asia/Kolkata"), eliminating client-side timezone manipulation risks.
- **Registration Range**: The `auth.user().beforeCreate` trigger ensures that no user can be created without a valid `@psgtech.ac.in` email, protecting the system from unauthorized entry even if the registration UI is bypassed.

---

## Phase 2: Failure & Edge-Case Analysis

### Scenario 1: Leader submits at 7:59:59 PM (Race Condition)
- **Behavior**: The Leader's transaction attempts to write `attendance_submissions`.
- **Outcome**: 
  - If the transaction commits **before** 8:00:00 PM Cron: The submission is accepted. When the Cron runs milliseconds later, it sees the submission exists and updates `isLocked = true`. Data is saved.
  - If the Cron runs **before** the transaction commits: The Cron creates a lock record (`submittedBy: SYSTEM`). The Leader's transaction fails because `attendance_submissions` doc now exists (Preventing overwrite). The Leader gets an error.
- **Consistency**: Preserved. One source of truth wins.

### Scenario 2: Leader goes offline mid-submission
- **Behavior**: Updates are queued locally by Firestore SDK.
- **Outcome**: 
  - If they reconnect **before** 8:00 PM: The pending writes sync and succeed.
  - If they reconnect **after** 8:00 PM: The Cron has already created a lock file or marked the team absent. The synced write attempts to create the document, finds it exists (or violates a time rule if we added one), and fails.
- **Consistency**: Preserved. Late data is rejected.

### Scenario 3: Student reinstalls app
- **Behavior**: Re-authentication via Email Link.
- **Outcome**: `UserRepository.ensureUserDocument` checks if the user doc exists in `users`. Since it persists in Firestore, the student regains access to their existing role and history. No data loss.

### Scenario 4: Placement Rep edits twice
- **Behavior**: Rep makes two overrides.
- **Outcome**: 
  - 1st Edit: Updates `attendance_records`, creates `audit_logs` Entry A.
  - 2nd Edit: Updates `attendance_records`, creates `audit_logs` Entry B.
  - History is preserved in `audit_logs`. The record shows the latest state.

### Scenario 5: Coordinator tries to write Attendance
- **Behavior**: Malicious or buggy coordinator client attempts write.
- **Outcome**: Firestore Security Rules check `isLeader()` or `isRep()`. Coordinator fails both checks for `create/update` on attendance. Write denied.

### Scenario 6: User missing master data (Whitelist)
- **Behavior**: Login succeeds (Firebase Auth), but `UserProvider` calls `ensureUserDocument`.
- **Outcome**: `ensureUserDocument` checks `whitelist` collection. If email not found, it throws Exception. User is signed out immediately in the UI.

### Scenario 7: Cloud Function fails at 8:00 PM
- **Behavior**: Google Cloud transient error.
- **Outcome**: The lock is not applied immediately.
  - **Risk**: Leaders *could* technically submit at 8:05 PM.
  - **Mitigation**: Cloud Scheduler retries failed jobs. The function is idempotent (checking `!isLocked` and existing submissions). Run 2 will catch up. The strict "One Submission" rule prevents data corruption regardless of lock time.

### Scenario 8: Duplicate Login Links
- **Behavior**: User clicks link on Laptop, then Phone.
- **Outcome**: `signInWithEmailLink` consumes the one-time code. The second attempt fails with `auth/invalid-action-code`. User must request a new link for the second device.

---

## Phase 3: Audit & Traceability

### 3.1 Strategy
- **Source of Truth**: The `audit_logs` collection is the legal record of changes.
- **Immutability**: Firestore Rules `allow update/delete: if false`. Not even the Placement Rep can scrub their tracks.
- **Mandatory Reason**: The UI enforces inputting a reason. While malicious Reps could bypass the UI to send an empty reason via API, the `performedBy` UID is always stamped by `request.auth.uid`.

### 3.2 Visibility
- **Students**: See only final status (`attendance_records`). No visibility of who changed it.
- **Leaders**: See submission status.
- **Coordinators/Reps**: Can view the `AuditLogView` (to be added if needed, currently data exists, UI view recommended for Admin Dashboard).

---

## Phase 4: Operational Readiness

### 4.1 Health Checks
1.  **Cron Monitoring**: Use GCP Console > Cloud Scheduler to view "Last Run Status".
2.  **Function Logs**: functions.logger.log used in `scheduledLockAttendance`. Filter logs for `textPayload:"Locked"` to verify daily success.

### 4.2 Logging
- **Override Logs**: Stored in `audit_logs` Firestore collection.
- **System Logs**: Google Cloud Logging.

### 4.3 Timezone Safety
- **Enforcement**:
  - **Backend**: `functions.pubsub.schedule(...).timeZone("Asia/Kolkata")` hardcoded.
  - **Database**: All timestamps stored as `FieldValue.serverTimestamp()` (UTC).
  - **UI**: Converted to Local Time only for display. Date logic (`YYYY-MM-DD`) is derived from ISO string which is date-based, critical to ensure consistent "Day" definition. (Recommendation: UI should strictly use IST for Date generation if users are traveling, but for a campus app, Local Phone Time ~ IST is an acceptable assumption).

---

## Phase 5: Deployment Checklist

### Pre-Requisites
- [ ] **Firebase Project Created**: `psgmx-placement-prod`
- [ ] **Blaze Plan Enabled**: Required for Scheduled Cloud Functions.

### Configuration
- [ ] **Auth**: Enable "Email Link (Passwordless)". Add `psgmx-placement.web.app` to Authorized Domains.
- [ ] **Firestore**: Create database in `asia-south1` (Mumbai) for low latency.
- [ ] **Indexes**: Deploy `firestore.indexes.json` (Auto-created on first complex query).
  - Likely needed for: `attendance_records` simple queries (composite not heavy yet).

### Data Setup
- [ ] **Whitelist Import**: Bulk upload the 120 student JSON to `whitelist` collection.
- [ ] **Teams Setup**: Bulk upload `teams` collection mapping.

### Validation
- [ ] **Dry Run**:
  1. Set Cron to run in 5 mins.
  2. Have 3 Test Leaders submit.
  3. Wait for Cron.
  4. Verify 3 submissions locked, others marked Absent.
  5. Verify Leader cannot edit.
  6. Verify Rep can override.

### Rollback
- [ ] **Scenario**: Attendance logic has critical bug.
- [ ] **Action**:
  1. Disable Cron Job via GCP Console.
  2. Placement Rep manually unlocks/fixes records via God Mode.
  3. Deploy fix.
  
