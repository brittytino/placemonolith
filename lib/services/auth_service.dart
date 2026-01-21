import 'package:firebase_auth/firebase_auth.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  Future<void> sendSignInLink(String email) async {
    if (!email.endsWith('@psgtech.ac.in')) {
      throw Exception('Only @psgtech.ac.in emails are allowed.');
    }

    var acs = ActionCodeSettings(
      url: 'https://psgmx-placement.web.app/finishSignUp?cartId=1234', // Replace with your deep link
      handleCodeInApp: true,
      iOSBundleId: 'com.psgtech.psgmxPlacement',
      androidPackageName: 'com.psgtech.psgmx_placement_prep',
      androidInstallApp: true,
      androidMinimumVersion: '12',
    );

    await _auth.sendSignInLinkToEmail(
      email: email,
      actionCodeSettings: acs,
    );
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
