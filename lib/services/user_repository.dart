import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/app_user.dart';

class UserRepository {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Future<AppUser?> getUser(String uid) async {
    final doc = await _db.collection('users').doc(uid).get();
    if (doc.exists) {
      return AppUser.fromMap(uid, doc.data()!);
    }
    return null;
  }

  Future<AppUser> ensureUserDocument(String uid, String email) async {
    final userRef = _db.collection('users').doc(uid);
    final userDoc = await userRef.get();

    if (userDoc.exists) {
      return AppUser.fromMap(uid, userDoc.data()!);
    }

    // User doesn't exist in 'users' collection, check whitelist
    final whitelistDoc = await _db.collection('whitelist').doc(email).get(); // Doc ID is email
    
    if (!whitelistDoc.exists) {
      throw Exception('User not authorized in whitelist');
    }

    final data = whitelistDoc.data()!;
    // Create user document
    final userData = {
      'email': email,
      'regNo': data['regNo'],
      'name': data['name'],
      'teamId': data['teamId'],
      'roles': data['roles'] ?? {}, // e.g. {'isTeamLeader': true}
      'createdAt': FieldValue.serverTimestamp(),
    };

    await userRef.set(userData);
    return AppUser.fromMap(uid, userData);
  }
}
