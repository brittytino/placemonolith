import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/leetcode_provider.dart';
import '../../services/supabase_service.dart';
import '../../core/commands/fetch_all_leetcode_stats_command.dart';

class AdminLeetCodeFetchScreen extends StatefulWidget {
  const AdminLeetCodeFetchScreen({super.key});

  @override
  State<AdminLeetCodeFetchScreen> createState() => _AdminLeetCodeFetchScreenState();
}

class _AdminLeetCodeFetchScreenState extends State<AdminLeetCodeFetchScreen> {
  bool _isFetching = false;
  String _statusMessage = 'Ready to fetch real LeetCode stats for all 123 students';

  Future<void> _startFetch() async {
    setState(() {
      _isFetching = true;
      _statusMessage = 'Starting fetch...';
    });

    try {
      final supabaseService = SupabaseService();
      final leetCodeProvider = context.read<LeetCodeProvider>();
      final command = FetchAllLeetCodeStatsCommand(supabaseService, leetCodeProvider);

      // Execute the fetch
      await command.execute();

      setState(() {
        _statusMessage = '✅ Fetch complete! Check the leaderboard.';
        _isFetching = false;
      });

      // Show success dialog
      if (mounted) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('✅ Success'),
            content: const Text(
              'Real LeetCode stats have been fetched for all students!\n\n'
              'Go to the home screen to see the updated leaderboard.',
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  Navigator.pop(context); // Go back to previous screen
                },
                child: const Text('View Leaderboard'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      setState(() {
        _statusMessage = '❌ Error: $e';
        _isFetching = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fetch Real LeetCode Stats'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            const Icon(
              Icons.cloud_download,
              size: 80,
              color: Colors.blue,
            ),
            const SizedBox(height: 24),
            
            const Text(
              'Fetch Real LeetCode Data',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            
            Text(
              _statusMessage,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            
            // Instructions
            if (!_isFetching) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.blue.withValues(alpha: 20/255),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blue.withValues(alpha: 60/255)),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '📋 What this does:',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text('1. Deletes fake/dummy data'),
                    Text('2. Fetches real stats from LeetCode API'),
                    Text('3. Stores data for all 123 students'),
                    Text('4. Takes ~1-2 minutes to complete'),
                    SizedBox(height: 12),
                    Text(
                      '⚠️ Run this only once!',
                      style: TextStyle(
                        color: Colors.orange,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              
              // Fetch Button
              ElevatedButton.icon(
                onPressed: _startFetch,
                icon: const Icon(Icons.download, size: 24),
                label: const Text(
                  'Fetch Real Data Now',
                  style: TextStyle(fontSize: 18),
                ),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
            
            // Loading Indicator
            if (_isFetching) ...[
              const SizedBox(height: 32),
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              const Text(
                'Fetching data...\nThis may take 1-2 minutes',
                style: TextStyle(fontSize: 14),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              const Text(
                '☕ Grab a coffee while we fetch real stats!',
                style: TextStyle(
                  fontSize: 12,
                  fontStyle: FontStyle.italic,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
