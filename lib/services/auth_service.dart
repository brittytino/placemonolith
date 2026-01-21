import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  User? get currentUser => _auth.currentUser;
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  Future<void> sendSignInLink(String email) async {
    if (!email.endsWith('@psgtech.ac.in')) {
      throw Exception('Only @psgtech.ac.in emails are allowed.');
    }

    try {
      debugPrint('[AuthService] Preparing to send sign-in link to: $email');

      // Use Firebase Hosting URL for email link
      // This domain is already authorized in Firebase Console
      var acs = ActionCodeSettings(
        url: 'https://psgmx-flutter.web.app/?email=$email',
        handleCodeInApp: true,
        iOSBundleId: 'com.example.psgmxPlacementPrep',
        androidPackageName: 'com.example.psgmx_placement_prep',
        androidInstallApp: true,
      );

      debugPrint('[AuthService] ActionCodeSettings created: url=${acs.url}');

      await _auth.sendSignInLinkToEmail(
        email: email,
        actionCodeSettings: acs,
      );

      debugPrint('[AuthService] Sign-in link sent successfully to $email');
    } on FirebaseAuthException catch (e) {
      debugPrint('[AuthService] Firebase Auth Error: ${e.code} - ${e.message}');
      throw 'Firebase Error: ${e.message}';
    } catch (e) {
      debugPrint('[AuthService] Error: $e');
      rethrow;
    }
  }

  Future<UserCredential> signInWithEmailLink(String email, String emailLink) async {
    if (_auth.isSignInWithEmailLink(emailLink)) {
      return await _auth.signInWithEmailLink(email: email, emailLink: emailLink);
    } else {
      throw Exception('Invalid email link.');
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }
}
