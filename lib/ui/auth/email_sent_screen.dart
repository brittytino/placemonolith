import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class EmailSentScreen extends StatelessWidget {
  final String email;
  const EmailSentScreen({super.key, required this.email});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.mark_email_read_outlined, size: 80, color: Colors.green),
            const SizedBox(height: 24),
            const Text(
              'Check your Inbox',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Text(
              'We sent a sign-in link to $email.\nClick the link in the email to sign in.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 32),
            OutlinedButton(
              onPressed: () => context.go('/login'),
              child: const Text('Back to Login'),
            ),
          ],
        ),
      ),
    );
  }
}
