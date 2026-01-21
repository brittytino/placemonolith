# PROD SETUP EXECUTION GUIDE

You have completed the design and logic phases. Now you must perform the **Release setup** on your local machine.

## 🛑 PREREQUISITES
1.  **Flutter SDK** installed.
2.  **Node.js** installed (for Cloud Functions & Seeding).
3.  **Firebase CLI** installed (`npm install -g firebase-tools`).

---

## STEP 1: Generate Platform Code (Fix Missing Android Folder)
Your workspace currently lacks the native Android project structure. 
Run this **IMMEDIATELY** in your terminal:

```bash
flutter create . --platforms android
```
*(Ignore if you already have an `android` folder with `build.gradle` inside)*

---

## STEP 2: Configure Firebase Credentials
You must link your Flutter code to your Firebase Project (`psg-mca-placement`).

1.  **Login:**
    ```bash
    firebase login
    ```
2.  **Download Config:**
    ```bash
    dart pub global activate flutterfire_cli
    flutterfire configure --project=psg-mca-placement
    ```
    *   Select **Android** (and iOS/Web if needed).
    *   This will generate `lib/firebase_options.dart`.

---

## STEP 3: Enable Firebase in App Code
I have prepared the code, but you must enable the connection.

1.  Open `lib/main.dart`.
2.  **Uncomment** these lines:
    ```dart
    import 'firebase_options.dart'; // Line ~4
    ```
    ```dart
    // Inside main()
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    ```

---

## STEP 4: Deploy Backend Logic
Push the Security Rules and Cloud Functions I wrote for you.

```bash
# 1. Install Function Dependencies
cd functions
npm install
cd ..

# 2. Deploy Rules & Functions
firebase deploy --only firestore:rules,functions
```

**Verify:** Go to Firebase Console -> Functions. Ensure `scheduledLockAttendance` and `onUserCreated` are listed.

---

## STEP 5: Seed Master Data (CRITICAL)
Without this, **NO ONE** can log in because the security rules block unknown users.

1.  **Get Key:**
    *   Go to [Firebase Console > Project Settings > Service Accounts](https://console.firebase.google.com/).
    *   Click **Generate new private key**.
    *   Save it as `scripts/service-account.json`.

2.  **Review Data:**
    *   Check `scripts/users_master.json`. I have added **You (25MX354)** as a Coordinator.
    *   Add other students now if you have their emails.

3.  **Run Script:**
    ```bash
    cd scripts
    npm install firebase-admin
    node seed_users.js
    ```

---

## STEP 6: Build Production App
Now you are ready to build the APK.

```bash
flutter build apk --release
```

**Distribute:** Share the APK with Team Leaders first.
