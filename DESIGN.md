# PSG Technology MCA (2025–2027) Placement Prep App - Design Document

## 1. System Architecture
The application follows a Clean Architecture approach with a focus on separation of concerns.

- **Presentation Layer**: Flutter UI (Material 3).
- **Business Logic Layer**: Providers / ViewModels managing state.
- **Data Layer**: Repositories interacting with Firebase.
- **Backend Layer**: Firebase Cloud Functions for trusted logic (time enforcement, cron jobs).

## 2. Firestore Schema

### `users` (Collection)
Master storage for user profiles and roles.
```json
{
  "uid": "firebase_auth_uid",
  "email": "12mx123@psgtech.ac.in",
  "regNo": "12MX123",
  "name": "John Doe",
  "teamId": "TEAM_A",
  "roles": {
    "isStudent": true,
    "isTeamLeader": false,
    "isCoordinator": false,
    "isPlacementRep": false
  },
  "metadata": {
    "createdAt": "timestamp",
    "lastLogin": "timestamp"
  }
}
```

### `teams` (Collection)
Static mapping of teams.
```json
{
  "id": "TEAM_A",
  "leaderId": "user_uid_of_leader",
  "members": ["uid1", "uid2", "uid3"]
}
```

### `daily_tasks` (Collection)
Daily content published by coordinators. Document ID: `YYYY-MM-DD`
```json
{
  "date": "2025-10-24",
  "leetcodeUrl": "https://leetcode.com/...",
  "csTopic": "Dynamic Programming",
  "csTopicDescription": "Study Memoization...",
  "publishedBy": "coordinator_uid",
  "motivationQuote": "network_cached_quote"
}
```

### `attendance_submissions` (Collection)
Tracks the act of submission by a TL to enforce "One Submission Per Day".
Document ID: `YYYY-MM-DD_TEAM_ID`
```json
{
  "date": "2025-10-24",
  "teamId": "TEAM_A",
  "submittedBy": "leader_uid",
  "submittedAt": "timestamp",
  "isLocked": true
}
```

### `attendance_records` (Collection)
Individual attendance status.
Document ID: `YYYY-MM-DD_REGNO`
```json
{
  "date": "2025-10-24",
  "studentUid": "uid",
  "regNo": "12MX123",
  "teamId": "TEAM_A",
  "status": "PRESENT" | "ABSENT",
  "markedBy": "leader_uid",
  "timestamp": "timestamp",
  "overriddenBy": null // or "rep_uid"
}
```

### `audit_logs` (Collection)
For Placement Rep overrides.
```json
{
  "action": "OVERRIDE_ATTENDANCE",
  "targetDate": "2025-10-24",
  "targetRegNo": "12MX123",
  "previousStatus": "ABSENT",
  "newStatus": "PRESENT",
  "reason": "Medical certificate verified",
  "performedBy": "rep_uid",
  "timestamp": "timestamp"
}
```

## 3. Security Rules (Overview)
- **Users**: Read-only for self and hierarchy (TL reads team, Coord reads all). Write restricted to server-side or limited fields.
- **Attendance**:
  - TL: Create only (if not exists for day + team). No Update/Delete.
  - Student: Read own.
  - Rep: Read/Write all.
  - Coordinator: Read all.

## 4. Cloud Functions
1.  **`scheduledLockAttendance`**: Runs daily at 8:00 PM IST.
    - Locks all `attendance_submissions`.
    - (Optional) Marks unmarked teams as ABSENT.
2.  **`checkRegistrationRange`**: Auth Trigger.
    - Validates email/reg number against allowed list.
