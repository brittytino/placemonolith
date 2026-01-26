import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../widgets/premium_card.dart';
import '../../../../providers/leetcode_provider.dart';
import '../../../../providers/user_provider.dart';
import '../../../../core/theme/app_dimens.dart';

class LeetCodeCard extends StatefulWidget {
  const LeetCodeCard({super.key});

  @override
  State<LeetCodeCard> createState() => _LeetCodeCardState();
}

class _LeetCodeCardState extends State<LeetCodeCard> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _loadData();
    });
  }

  Future<void> _loadData() async {
    if (!mounted) return;
    try {
      final userProvider = Provider.of<UserProvider>(context, listen: false);
      final leetCodeProvider = Provider.of<LeetCodeProvider>(context, listen: false);
      
      final username = userProvider.currentUser?.leetcodeUsername;
      if (username != null && username.isNotEmpty) {
        await leetCodeProvider.fetchStats(username);
      }
    } catch (e) {
      // Silent fail - card will show cached or empty state
      debugPrint('[LeetCodeCard] Init error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    final leetCodeProvider = Provider.of<LeetCodeProvider>(context);
    final user = userProvider.currentUser;
    
    if (user == null) return const SizedBox.shrink();

    final hasUsername = user.leetcodeUsername != null && user.leetcodeUsername!.isNotEmpty;

    return PremiumCard(
      color: const Color(0xFF262626), 
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.code, color: Colors.orangeAccent),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'LeetCode Challenge',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const Spacer(),
              if (leetCodeProvider.isLoading)
                const SizedBox(
                  width: 16, height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.orangeAccent),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          
          if (!hasUsername)
            _buildConnectView(context)
          else
             _buildStatsView(context, leetCodeProvider, user.leetcodeUsername!),
        ],
      ),
    );
  }

  Widget _buildConnectView(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Connect your LeetCode account to join the leaderboard and track progress.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white70),
        ),
        const SizedBox(height: AppSpacing.md),
        SizedBox(
          width: double.infinity,
          child: FilledButton.tonal(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Go to Profile to add LeetCode username')),
              );
            },
            style: FilledButton.styleFrom(
              backgroundColor: Colors.orangeAccent,
              foregroundColor: Colors.black,
            ),
            child: const Text('Connect Account'),
          ),
        ),
      ],
    );
  }

  Widget _buildStatsView(BuildContext context, LeetCodeProvider provider, String username) {
    // 1. Check for cached stats
    final stats = provider.getCachedStats(username);
    
    // 2. If no stats and loading, show loader
    if (stats == null && provider.isLoading) {
      return const SizedBox(
        height: 100, 
        child: Center(child: Text('Loading stats...', style: TextStyle(color: Colors.white54)))
      );
    }

    // 3. If stats available (even stale), show them
    if (stats != null) {
      return Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatItem('Total', stats.totalSolved.toString(), Colors.white),
              _buildStatItem('Easy', stats.easySolved.toString(), Colors.greenAccent),
              _buildStatItem('Medium', stats.mediumSolved.toString(), Colors.orangeAccent),
              _buildStatItem('Hard', stats.hardSolved.toString(), Colors.redAccent),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          const Divider(color: Colors.white12),
          const SizedBox(height: AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Global Ranking',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white70),
              ),
              Text(
                '#${stats.ranking}',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white, fontWeight: FontWeight.bold
                ),
              ),
            ],
          ),
        ],
      );
    }

    // 4. Fallback if error or no data yet
    return SizedBox(
      height: 100,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('No stats available', style: TextStyle(color: Colors.white54)),
            const SizedBox(height: 8),
            TextButton.icon(
              onPressed: () => provider.fetchStats(username),
              icon: const Icon(Icons.refresh, size: 16, color: Colors.orangeAccent),
              label: const Text("Retry", style: TextStyle(color: Colors.orangeAccent)),
              style: TextButton.styleFrom(padding: EdgeInsets.zero, visualDensity: VisualDensity.compact),
            )
          ],
        )
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white54,
            fontSize: 10,
          ),
        ),
      ],
    );
  }
}
