import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/user_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  bool _isLoading = false;
  String? _error;

  Future<void> _handleLogin() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final email = _emailController.text.trim();
    if (email.isEmpty || !email.endsWith('@psgtech.ac.in')) {
      setState(() {
        _isLoading = false;
        _error = 'Please enter a valid @psgtech.ac.in email.';
      });
      return;
    }

    try {
      await Provider.of<UserProvider>(context, listen: false).sendLoginLink(email);
      if (mounted) {
        context.go('/email_sent', extra: email);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 400),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.school, size: 60, color: Colors.blueAccent),
              const SizedBox(height: 24),
              const Text(
                'PSG Technology\nMCA Placement Check',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Sign in to access your daily tasks and attendance.',
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 32),
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'College Email',
                  hintText: 'ex: 25mx123@psgtech.ac.in',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.email_outlined),
                  helperText: 'Only @psgtech.ac.in domains are allowed',
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Text(
                    _error!,
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
                  ),
                ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: FilledButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  child: _isLoading
                      ? const CircularProgressIndicator()
                      : const Text('Send Magic Link'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
