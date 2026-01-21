import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/app_user.dart';
import '../services/auth_service.dart';
import '../services/user_repository.dart';

class UserProvider with ChangeNotifier {
  final AuthService _authService;
  final UserRepository _userRepo;

  AppUser? _currentUser;
  bool _isLoading = true;

  UserProvider({required AuthService authService, required UserRepository userRepo})
      : _authService = authService,
        _userRepo = userRepo {
    _init();
  }

  AppUser? get currentUser => _currentUser;
  bool get isLoading => _isLoading;

  bool get isTeamLeader => _currentUser?.isTeamLeader ?? false;
  bool get isCoordinator => _currentUser?.isCoordinator ?? false;
  bool get isPlacementRep => _currentUser?.isPlacementRep ?? false;

  void _init() {
    _authService.authStateChanges.listen((User? firebaseUser) async {
      if (firebaseUser != null) {
        try {
          _currentUser = await _userRepo.ensureUserDocument(firebaseUser.uid, firebaseUser.email!);
        } catch (e) {
          print("Error fetching user: $e");
          await _authService.signOut();
          _currentUser = null;
        }
      } else {
        _currentUser = null;
      }
      _isLoading = false;
      notifyListeners();
    });
  }

  Future<void> sendLoginLink(String email) async {
    await _authService.sendSignInLink(email);
  }

  Future<void> signInWithLink(String email, String link) async {
    await _authService.signInWithEmailLink(email, link);
  }

  Future<void> signOut() async {
    await _authService.signOut();
  }
}
