import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../services/supabase_db_service.dart';
import '../../core/theme/app_dimens.dart';
import '../widgets/premium_card.dart';
import '../widgets/premium_empty_state.dart';

class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final db = Provider.of<SupabaseDbService>(context, listen: false);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          const SliverAppBar(
            title: Text("Analytics & Reports"),
            pinned: true,
            floating: true,
          ),
          
          SliverPadding(
             padding: const EdgeInsets.all(AppSpacing.screenPadding),
             sliver: SliverToBoxAdapter(
               child: FutureBuilder<Map<String, dynamic>>(
                  future: db.getPlacementStats(),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                       return const Center(child: Padding(
                         padding: EdgeInsets.all(AppSpacing.xl),
                         child: CircularProgressIndicator(),
                       ));
                    }
                    if (snapshot.hasError) {
                       return PremiumEmptyState(
                         icon: Icons.error_outline, 
                         message: "Data Error",
                         subMessage: snapshot.error.toString()
                       );
                    }
                    
                    final data = snapshot.data!;
                    final total = data['total_students'] as int;
                    final present = data['today_present'] as int;
                    final percent = total > 0 ? (present / total) : 0.0;
                    
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                         // Summary Section
                         _SummaryPremiumCard(total: total, present: present, percent: percent),
                         
                         const SizedBox(height: AppSpacing.xxl),
                         
                         // Actions Section
                         Text(
                           "DATA EXPORT", 
                           style: Theme.of(context).textTheme.labelSmall?.copyWith(
                             fontWeight: FontWeight.bold,
                             color: Theme.of(context).colorScheme.primary,
                             letterSpacing: 1.2
                           )
                         ),
                         const SizedBox(height: AppSpacing.md),
                         
                         PremiumCard(
                           padding: EdgeInsets.zero,
                           child: Column(
                             children: [
                               _ActionListTile(
                                 icon: Icons.table_chart_outlined,
                                 title: "Attendance Report",
                                 subtitle: "View detailed summary",
                                 onTap: () => _viewAttendanceReport(context),
                               ),

                             ],
                           ),
                         )
                      ],
                    );
                  }
                ),
             ),
          )
        ],
      ),
    );
  }
}

Future<void> _viewAttendanceReport(BuildContext context) async {
  showDialog(context: context, barrierDismissible: false, builder: (_) => const Center(child: CircularProgressIndicator()));
  
  try {
    final supabase = Supabase.instance.client;
    final res = await supabase.from('student_attendance_summary').select();
    final data = res as List<dynamic>; // Ensure cast

    if (!context.mounted) return;
    Navigator.pop(context); 
    
    if (data.isEmpty) {
       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("No records found.")));
       return;
    }

    const csvHeader = "Name,Register No,Batch,Present,Absent,Total Working,Percentage\n";
    final csvRows = data.map((e) => "${e['name']},${e['reg_no']},${e['batch']},${e['present_count']},${e['absent_count']},${(e['present_count'] ?? 0) + (e['absent_count'] ?? 0)},${e['attendance_percentage']}%").join("\n");
    final csvContent = "$csvHeader$csvRows";

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Attendance Summary"),
        content: SizedBox(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: SelectableText(csvContent, style: const TextStyle(fontFamily: 'monospace', fontSize: 10)),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Close")),
        ],
      )
    );
  } catch (e) {
    if (context.mounted) Navigator.pop(context);
    if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
  }
}

class _SummaryPremiumCard extends StatelessWidget {
  final int total;
  final int present;
  final double percent;

  const _SummaryPremiumCard({required this.total, required this.present, required this.percent});

  @override
  Widget build(BuildContext context) {
     return PremiumCard(
       color: Theme.of(context).colorScheme.primary, // Dark blue background
       padding: const EdgeInsets.all(AppSpacing.lg),
       child: Column(
         crossAxisAlignment: CrossAxisAlignment.start,
         children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(AppSpacing.xs),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(AppRadius.sm)
                  ),
                  child: const Icon(Icons.bar_chart, color: Colors.white, size: 16),
                ),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  "Today's Overview", 
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.9), 
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                    letterSpacing: 0.5
                  )
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xl),
            
            // Metrics Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                 Expanded(child: _Metric(label: "Total Students", value: total.toString())),
                 Container(height: 40, width: 1, color: Colors.white.withValues(alpha: 0.2)),
                 Expanded(child: _Metric(label: "Present", value: present.toString())),
                 Container(height: 40, width: 1, color: Colors.white.withValues(alpha: 0.2)),
                 Expanded(child: _Metric(label: "Attendance", value: "${(percent * 100).toStringAsFixed(0)}%")),
              ],
            ),
            
            const SizedBox(height: AppSpacing.lg),
            
            // Progress Bar
            ClipRRect(
              borderRadius: BorderRadius.circular(AppRadius.pill),
              child: LinearProgressIndicator(
                value: percent,
                minHeight: 6,
                backgroundColor: Colors.white.withValues(alpha: 0.2),
                color: Colors.white,
              ),
            )
         ],
       ),
     );
  }
}

class _Metric extends StatelessWidget {
  final String label;
  final String value;
  const _Metric({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
     return Column(
       children: [
          Text(
            value, 
            style: const TextStyle(
              fontSize: 22, 
              fontWeight: FontWeight.bold, 
              color: Colors.white
            )
          ),
          const SizedBox(height: 4),
          Text(
            label, 
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 10, 
              color: Colors.white.withValues(alpha: 0.7)
            )
          ),
       ],
     );
  }
}

class _ActionListTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ActionListTile({required this.icon, required this.title, required this.subtitle, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(AppSpacing.sm),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainer,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Icon(icon, color: Theme.of(context).colorScheme.primary, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
      trailing: Icon(Icons.download, size: 20, color: Theme.of(context).colorScheme.outline),
      onTap: onTap,
    );
  }
}
