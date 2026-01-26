import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/user_provider.dart';
import '../../services/supabase_db_service.dart';
import '../../models/app_user.dart';
import '../../core/theme/app_dimens.dart';
import '../widgets/premium_card.dart';
import '../widgets/premium_empty_state.dart';

class AttendanceScreen extends StatelessWidget {
  const AttendanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);

    if (userProvider.isTeamLeader) {
       return const _TeamAttendanceView();
    }
    return const _StudentAttendanceView();
  }
}

// ==========================================
// STUDENT VIEW
// ==========================================

class _StudentAttendanceView extends StatelessWidget {
  const _StudentAttendanceView();

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).currentUser;
    final db = Provider.of<SupabaseDbService>(context, listen: false);

    if (user == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          const SliverAppBar(
            title: Text("My Attendance"),
            floating: true,
            pinned: true,
          ),
          
          StreamBuilder<List<AttendanceRecord>>(
            stream: db.getStudentAttendance(user.uid),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const SliverFillRemaining(child: Center(child: CircularProgressIndicator()));
              }
              
              final records = snapshot.data ?? [];
              if (records.isEmpty) {
                 return const SliverFillRemaining(
                   hasScrollBody: false,
                   child: PremiumEmptyState(
                     icon: Icons.history_toggle_off, 
                     message: "No Records Yet",
                     subMessage: "Your attendance history will appear here once marked.",
                   )
                 );
              }

              // Calculate Stats
              final total = records.length;
              final present = records.where((r) => r.isPresent).length;
              final percent = total > 0 ? (present / total) : 0.0;

              return SliverPadding(
                padding: const EdgeInsets.all(AppSpacing.screenPadding),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    // Stats Card
                    PremiumCard(
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text("Overall Rate", style: Theme.of(context).textTheme.titleSmall),
                                const SizedBox(height: AppSpacing.xs),
                                Text(
                                  "${(percent * 100).toStringAsFixed(1)}%", 
                                  style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold)
                                ),
                                const SizedBox(height: AppSpacing.xs),
                                Text(
                                  "$present / $total sessions present",
                                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant),
                                ),
                              ],
                            ),
                          ),
                          SizedBox(
                            height: 60,
                            width: 60,
                            child: CircularProgressIndicator(
                              value: percent,
                              strokeWidth: 6,
                              backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
                              color: _getColorForPercent(percent),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    // Disclaimer
                    Row(
                      children: [
                        Icon(Icons.info_outline, size: 14, color: Theme.of(context).colorScheme.onSurfaceVariant),
                        const SizedBox(width: 4),
                        Text(
                          "Calculated excluding non-working days.",
                           style: Theme.of(context).textTheme.labelSmall?.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    Text(
                      "HISTORY", 
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                        color: Theme.of(context).colorScheme.primary,
                      )
                    ),
                    const SizedBox(height: AppSpacing.md),
                  ] + records.map((record) {
                    final dateStr = record.date is DateTime 
                        ? DateFormat('EEE, MMM d').format(record.date as DateTime) 
                        : record.date.toString();
                    
                    return Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                      child: PremiumCard(
                         padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.md),
                         child: Row(
                           children: [
                             _StatusIcon(isPresent: record.isPresent),
                             const SizedBox(width: AppSpacing.md),
                             Expanded(
                               child: Column(
                                 crossAxisAlignment: CrossAxisAlignment.start,
                                 children: [
                                   Text(dateStr, style: const TextStyle(fontWeight: FontWeight.w600)),
                                   Text(
                                     "Recorded: ${DateFormat('hh:mm a').format(record.timestamp)}",
                                     style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey),
                                   ),
                                 ],
                               ),
                             ),
                             _StatusChip(isPresent: record.isPresent),
                           ],
                         ),
                      ),
                    );
                  }).toList()),
                ),
              );
            }
          )
        ],
      ),
    );
  }
  
  Color _getColorForPercent(double p) {
    if (p >= 0.85) return Colors.green;
    if (p >= 0.75) return Colors.orange;
    return Colors.red;
  }
}

// ==========================================
// TEAM LEADER VIEW
// ==========================================

class _TeamAttendanceView extends StatefulWidget {
  const _TeamAttendanceView();

  @override
  State<_TeamAttendanceView> createState() => _TeamAttendanceViewState();
}

class _TeamAttendanceViewState extends State<_TeamAttendanceView> {
  final Set<String> _absentees = {}; 
  bool _isLoading = false;
  
  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    final user = userProvider.currentUser;
    final db = Provider.of<SupabaseDbService>(context, listen: false);
    
    // Fallback for simulation
    final String teamId = user?.teamId ?? (userProvider.isSimulating ? 'TEAM-SIM' : 'UNKNOWN');
    final todayStr = DateFormat('EEEE, MMM d').format(DateTime.now());
    
    return Scaffold(
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            title: const Text("Mark Attendance"),
            pinned: true,
            floating: true,
            actions: [
              TextButton(
                 onPressed: _isLoading ? null : () => _submit(db, teamId, user!.uid),
                 child: _isLoading 
                   ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)) 
                   : const Text("SUBMIT", style: TextStyle(fontWeight: FontWeight.bold)),
              )
            ],
          ),
        ],
        body: Column(
          children: [
            // Info Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.screenPadding),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                border: Border(bottom: BorderSide(color: Theme.of(context).dividerColor)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Team $teamId", style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.bold
                      )),
                      Text(todayStr, style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant)),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    "Select absentees", 
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "Tap on student to toggle status. Default is PRESENT.", 
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant)
                  ),
                ],
              ),
            ),
            
            // Member List
            Expanded(
              child: FutureBuilder<List<AppUser>>(
                future: db.getTeamMembers(teamId),
                builder: (context, snapshot) {
                   if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
                   if (snapshot.hasError) return Center(child: Text("Error: ${snapshot.error}"));
                   
                   final members = snapshot.data ?? [];
                   if (members.isEmpty) {
                     return const PremiumEmptyState(
                       icon: Icons.groups_outlined,
                       message: "Empty Team",
                       subMessage: "No students mapped to this ID.",
                     );
                   }
        
                   return ListView.separated(
                     padding: const EdgeInsets.all(AppSpacing.screenPadding),
                     itemCount: members.length,
                     separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
                     itemBuilder: (context, index) {
                        final member = members[index]; 
                        final isPresent = !_absentees.contains(member.uid);
                        
                        return PremiumCard(
                          // On tap toggle
                          onTap: () {
                              setState(() {
                                 if (isPresent) {
                                   _absentees.add(member.uid);
                                 } else {
                                   _absentees.remove(member.uid);
                                 }
                              });
                          },
                          // Color hint
                          backgroundColor: isPresent ? null : Theme.of(context).colorScheme.errorContainer.withValues(alpha: 0.2),
                          child: Row(
                            children: [
                              // Avatar
                              CircleAvatar(
                                radius: 20,
                                backgroundColor: isPresent 
                                   ? Theme.of(context).colorScheme.primaryContainer 
                                   : Theme.of(context).colorScheme.errorContainer,
                                child: Text(
                                  member.name.isNotEmpty ? member.name[0] : '?', 
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: isPresent 
                                       ? Theme.of(context).colorScheme.onPrimaryContainer
                                       : Theme.of(context).colorScheme.onErrorContainer
                                  )
                                )
                              ),
                              const SizedBox(width: AppSpacing.md),
                              
                              // Info
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      member.name, 
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                        color: isPresent ? null : Theme.of(context).colorScheme.error
                                      )
                                    ),
                                    Text(member.regNo, style: Theme.of(context).textTheme.bodySmall),
                                  ],
                                ),
                              ),
                              
                              // Status Chip
                              AnimatedContainer(
                                duration: AppDurations.fast,
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: isPresent ? Colors.green.withValues(alpha: 0.1) : Colors.red.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(AppRadius.pill),
                                  border: Border.all(
                                    color: isPresent ? Colors.green.withValues(alpha: 0.3) : Colors.red.withValues(alpha: 0.3)
                                  ),
                                ),
                                child: Text(
                                  isPresent ? "PRESENT" : "ABSENT",
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: isPresent ? Colors.green.shade700 : Colors.red.shade700
                                  ),
                                ),
                              )
                            ],
                          ),
                        );
                     }
                   );
                }
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: FilledButton.icon(
            onPressed: _isLoading ? null : () => _submit(db, teamId, user!.uid), 
            label: _isLoading ? const Text("Processing...") : const Text("CONFIRM ATTENDANCE"),
            icon: _isLoading ? const SizedBox.shrink() : const Icon(Icons.cloud_upload),
            style: FilledButton.styleFrom(
              minimumSize: const Size.fromHeight(56),
              elevation: 4,
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _submit(SupabaseDbService db, String teamId, String uid) async {
      setState(() => _isLoading = true);
      try {
         final members = await db.getTeamMembers(teamId);
         final records = <AttendanceRecord>[];
         final dateStr = DateFormat('yyyy-MM-dd').format(DateTime.now());
         final now = DateTime.now();

         for (var m in members) {
             final isAbsent = _absentees.contains(m.uid);
             records.add(AttendanceRecord(
               id: '', 
               date: dateStr, 
               studentUid: m.uid, 
               regNo: m.regNo, 
               teamId: teamId, 
               isPresent: !isAbsent, 
               timestamp: now, 
               markedBy: uid
             ));
         }

         await db.submitTeamAttendance(teamId, dateStr, uid, records);
         if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text("Attendance synced successfully!"),
                behavior: SnackBarBehavior.floating,
                backgroundColor: Colors.green.shade800,
              )
            );
         }
         
      } catch (e) {
         if (mounted) {
           ScaffoldMessenger.of(context).showSnackBar(
             SnackBar(content: Text("Submission Error: $e"), backgroundColor: Colors.red)
           );
         }
      } finally {
         setState(() => _isLoading = false);
      }
  }
}

// ==========================================
// SHARED WIDGETS
// ==========================================

class _StatusIcon extends StatelessWidget {
  final bool isPresent;
  const _StatusIcon({required this.isPresent});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36, height: 36,
      decoration: BoxDecoration(
        color: isPresent ? Colors.green.withValues(alpha: 0.1) : Colors.red.withValues(alpha: 0.1),
        shape: BoxShape.circle,
      ),
      child: Icon(
        isPresent ? Icons.check : Icons.close, 
        color: isPresent ? Colors.green : Colors.red,
        size: 18
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final bool isPresent;
  const _StatusChip({required this.isPresent});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isPresent ? Colors.green.withValues(alpha: 0.1) : Colors.red.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Text(
        isPresent ? "P" : "A",
        style: TextStyle(
          fontSize: 12, 
          fontWeight: FontWeight.bold,
          color: isPresent ? Colors.green.shade700 : Colors.red.shade700
        ),
      ),
    );
  }
}
