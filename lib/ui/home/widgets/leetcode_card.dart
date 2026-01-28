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
    final user = context.read<UserProvider>().currentUser;
    
    // 2. If no stats and loading, show loader
    if (stats == null && provider.isLoading) {
      return const SizedBox(
        height: 100, 
        child: Center(child: Text('Loading stats...', style: TextStyle(color: Colors.white54)))
      );
    }

    // 3. If stats available (even stale), show them
    if (stats != null) {
      final isDark = Theme.of(context).brightness == Brightness.dark;
      
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1A1A1A) : Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          children: [
            // Top section: Profile + Username + Ranking
            Row(
              children: [
                // Profile Picture (Perfect Circle)
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.grey[700]!,
                      width: 2,
                    ),
                  ),
                  child: ClipOval(
                    child: stats.profilePicture != null && stats.profilePicture!.isNotEmpty
                        ? Image.network(
                            stats.profilePicture!,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => _buildDefaultAvatar(user, isDark),
                          )
                        : _buildDefaultAvatar(user, isDark),
                  ),
                ),
                const SizedBox(width: 12),
                // Username and Name
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        username,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : const Color(0xFF111318),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (user?.name != null)
                        Text(
                          user!.name,
                          style: TextStyle(
                            fontSize: 14,
                            color: isDark ? Colors.grey[400] : Colors.grey[600],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                ),
                // Ranking Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.grey[800] : Colors.grey[200],
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '#${stats.ranking}',
                    style: TextStyle(
                      color: isDark ? Colors.white70 : Colors.black87,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
            // Main Content: Circle + Stats
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Circular Progress Ring with "Solved" text in center
                SizedBox(
                  width: 160,
                  height: 160,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Custom painted progress ring
                      CustomPaint(
                        size: const Size(160, 160),
                        painter: _CircularProgressPainter(
                          easy: stats.easySolved,
                          medium: stats.mediumSolved,
                          hard: stats.hardSolved,
                          total: stats.totalSolved,
                          isDark: isDark,
                        ),
                      ),
                      // Center text: Total Solved
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${stats.totalSolved}',
                            style: TextStyle(
                              fontSize: 48,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : const Color(0xFF111318),
                              height: 1.0,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Solved',
                            style: TextStyle(
                              fontSize: 14,
                              color: isDark ? Colors.grey[400] : Colors.grey[600],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(width: 32),
                
                // Stats Column (Easy, Medium, Hard)
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildStatRow('Easy', stats.easySolved.toString(), const Color(0xFF00B8A3), isDark),
                      const SizedBox(height: 16),
                      _buildStatRow('Medium', stats.mediumSolved.toString(), const Color(0xFFFFC01E), isDark),
                      const SizedBox(height: 16),
                      _buildStatRow('Hard', stats.hardSolved.toString(), const Color(0xFFEF4743), isDark),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
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



  Widget _buildStatRow(String label, String value, Color color, bool isDark) {
    return Row(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 15,
            color: isDark ? Colors.grey[400] : Colors.grey[600],
            fontWeight: FontWeight.w500,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }



  Widget _buildDefaultAvatar(user, bool isDark) {
    return Container(
      color: isDark ? Colors.grey[800] : Colors.grey[300],
      child: Center(
        child: Icon(
          Icons.person_rounded,
          size: 32,
          color: isDark ? Colors.grey[600] : Colors.grey[500],
        ),
      ),
    );
  }
}

class _CircularProgressPainter extends CustomPainter {
  final int easy;
  final int medium;
  final int hard;
  final int total;
  final bool isDark;

  _CircularProgressPainter({
    required this.easy,
    required this.medium,
    required this.hard,
    required this.total,
    required this.isDark,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width / 2) - 8;
    final strokeWidth = 12.0;

    // Background circle (dark gray)
    final bgPaint = Paint()
      ..color = const Color(0xFF2A2A2A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, bgPaint);

    // Calculate angles
    final totalSolved = easy + medium + hard;
    if (totalSolved == 0) return;

    final easyAngle = (easy / totalSolved) * 2 * 3.14159265359;
    final mediumAngle = (medium / totalSolved) * 2 * 3.14159265359;
    final hardAngle = (hard / totalSolved) * 2 * 3.14159265359;

    // Start from top (-π/2)
    var startAngle = -3.14159265359 / 2;

    // Draw Easy (Teal/Cyan)
    if (easy > 0) {
      final easyPaint = Paint()
        ..color = const Color(0xFF00B8A3)
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth
        ..strokeCap = StrokeCap.round;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        easyAngle,
        false,
        easyPaint,
      );
      startAngle += easyAngle;
    }

    // Draw Medium (Yellow/Orange)
    if (medium > 0) {
      final mediumPaint = Paint()
        ..color = const Color(0xFFFFC01E)
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth
        ..strokeCap = StrokeCap.round;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        mediumAngle,
        false,
        mediumPaint,
      );
      startAngle += mediumAngle;
    }

    // Draw Hard (Red/Pink)
    if (hard > 0) {
      final hardPaint = Paint()
        ..color = const Color(0xFFEF4743)
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth
        ..strokeCap = StrokeCap.round;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        hardAngle,
        false,
        hardPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _CircularProgressPainter oldDelegate) {
    return easy != oldDelegate.easy ||
        medium != oldDelegate.medium ||
        hard != oldDelegate.hard ||
        total != oldDelegate.total ||
        isDark != oldDelegate.isDark;
  }
}
