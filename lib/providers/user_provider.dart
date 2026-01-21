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
  bool _initComplete = false;

  UserProvider({required AuthService authService, required UserRepository userRepo})
      : _authService = authService,
        _userRepo = userRepo {
    _init();
  }

  AppUser? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get initComplete => _initComplete;

  bool get isTeamLeader => _currentUser?.isTeamLeader ?? false;
  bool get isCoordinator => _currentUser?.isCoordinator ?? false;
  bool get isPlacementRep => _currentUser?.isPlacementRep ?? false;

  void _init() {
    debugPrint('[UserProvider] Initializing...');
    _checkAuthStateOnce();
  }

  Future<void> _checkAuthStateOnce() async {
    try {
      // Get current Firebase user immediately
      final firebaseUser = _authService.currentUser;
      debugPrint('[UserProvider] Current Firebase user: ${firebaseUser?.email}');

      if (firebaseUser != null) {
        try {
          _currentUser = await _userRepo.ensureUserDocument(firebaseUser.uid, firebaseUser.email!);
          debugPrint('[UserProvider] User loaded: ${_currentUser?.email}');
        } catch (e) {
          debugPrint('[UserProvider] Error fetching user: $e');
          await _authService.signOut();
          _currentUser = null;
        }
      } else {
        debugPrint('[UserProvider] No user signed in');
        _currentUser = null;
      }
    } catch (e) {
      debugPrint('[UserProvider] Error in initial check: $e');
      _currentUser = null;
    } finally {
      _isLoading = false;
      _initComplete = true;
      notifyListeners();
      
      // Now listen for ongoing auth state changes
      _listenToAuthStateChanges();
    }
  }

  void _listenToAuthStateChanges() {
    _authService.authStateChanges.listen(
      (User? firebaseUser) async {
        debugPrint('[UserProvider] Auth state changed: ${firebaseUser?.email}');
        if (firebaseUser != null) {
          try {
            _currentUser = await _userRepo.ensureUserDocument(firebaseUser.uid, firebaseUser.email!);
            debugPrint('[UserProvider] User loaded: ${_currentUser?.email}');
          } catch (e) {
            debugPrint('[UserProvider] Error fetching user: $e');
            await _authService.signOut();
            _currentUser = null;
          }
        } else {
          debugPrint('[UserProvider] User signed out');
          _currentUser = null;
        }
        notifyListeners();
      },
      onError: (e) {
        debugPrint('[UserProvider] Auth stream error: $e');
      },
    );
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
