# PSG Technology MCA Placement App (2025-2027)

## 🚀 Deployment Status: READY FOR PROD

The development phase is complete. The system is frozen for release.

### 📚 Documentation
*   **[SETUP_GUIDE.md](SETUP_GUIDE.md):**  <-- **START HERE** (Run these commands to launch)
*   **[RELEASE_MANUAL.md](RELEASE_MANUAL.md):** Operational procedures for Coordinators/Release Engineers.
*   **[OPERATIONAL_READINESS.md](OPERATIONAL_READINESS.md):** Manuals for end-users (Students/Leaders).

### 🛠 Scripts
*   `scripts/seed_users.js`: Hydrates Firestore with the initial whitelist of authorized users.
*   `functions/`: Contains the 8:00 PM auto-lock logic and user profile creation triggers.

### ⚠️ Critical
*   **Do not modify** `lib/services/` logic without a full re-test.
*   **Do not skip** the Seeding Step (Step 5 in Setup Guide) or login will fail.
