import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../providers/user_provider.dart';
import '../services/auth_service.dart';
import '../ui/auth/login_screen.dart';
import '../ui/auth/email_sent_screen.dart';
import '../ui/student/dashboard_screen.dart';
import '../ui/splash_screen.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();
bool _emailLinkProcessed = false;

final GoRouter appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
     GoRoute(
      path: '/email_sent',
      builder: (context, state) {
        final email = state.extra as String? ?? '';
        return EmailSentScreen(email: email);
      },
    ),
    GoRoute(
      path: '/',
      builder: (context, state) => const DashboardScreen(),
    ),
  ],
  redirect: (context, state) async {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final authService = Provider.of<AuthService>(context, listen: false);
    
    final fullUrl = state.uri.toString();
    debugPrint('[Router] Redirect check - URI: $fullUrl');
    debugPrint('[Router] Query params: ${state.uri.queryParameters}');
    
    // 1. Still initializing - show splash screen
    if (!userProvider.initComplete) {
      debugPrint('[Router] Not initialized yet, showing splash');
      if (state.uri.toString() != '/splash') {
        return '/splash';
      }
      return null;
    }

    // 2. Check if this is a deep link with email sign-in (oobCode present)
    // AND hasn't been processed yet (prevent multiple attempts)
    if (state.uri.queryParameters.containsKey('oobCode') && !_emailLinkProcessed) {
      _emailLinkProcessed = true;
      debugPrint('[Router] ============================================');
      debugPrint('[Router] DEEP LINK WITH EMAIL SIGN-IN DETECTED');
      debugPrint('[Router] ============================================');
      
      final email = state.uri.queryParameters['email'];
      final oobCode = state.uri.queryParameters['oobCode'];
      
      debugPrint('[Router] Email: $email');
      debugPrint('[Router] oobCode: $oobCode');
      debugPrint('[Router] Full URL: $fullUrl');
      
      if (email != null && oobCode != null) {
        try {
          debugPrint('[Router] Verifying email link validity...');
          
          if (FirebaseAuth.instance.isSignInWithEmailLink(fullUrl)) {
            debugPrint('[Router] ✓ Valid email link verified by Firebase');
            debugPrint('[Router] Attempting to sign in...');
            
            try {
              final credential = await authService.signInWithEmailLink(email, fullUrl);
              debugPrint('[Router] ✓✓✓ SIGN IN SUCCESS! User: ${credential.user?.email}');
              
              // Reset the flag to allow processing again next time
              _emailLinkProcessed = false;
              
              // Let normal auth state changes take over
              return null;
            } catch (signInError) {
              debugPrint('[Router] ✗ Sign-in failed: $signInError');
              _emailLinkProcessed = false;
              return '/login';
            }
          } else {
            debugPrint('[Router] ✗ Invalid email link - Firebase verification failed');
            debugPrint('[Router] This might mean:');
            debugPrint('[Router]   - URL format is incorrect');
            debugPrint('[Router]   - oobCode has expired');
            debugPrint('[Router]   - URL is not from Firebase Auth');
            _emailLinkProcessed = false;
          }
        } catch (e) {
          debugPrint('[Router] ✗ Exception processing email link: $e');
          _emailLinkProcessed = false;
        }
      } else {
        debugPrint('[Router] ✗ Missing email or oobCode');
        debugPrint('[Router] Email: $email, oobCode: $oobCode');
        _emailLinkProcessed = false;
      }
    }

    // 3. Auth State (normal flow)
    final loggedIn = userProvider.currentUser != null;
    final loggingIn = state.uri.toString() == '/login';
    final emailSent = state.uri.toString() == '/email_sent';

    if (!loggedIn && !loggingIn && !emailSent) {
      debugPrint('[Router] Redirecting to login - user not authenticated');
      return '/login';
    }
    
    if (loggedIn && (loggingIn || emailSent)) {
      debugPrint('[Router] Redirecting to dashboard - user authenticated');
      return '/';
    }

    return null;
  },
);
