import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/user_provider.dart';
import '../../services/supabase_db_service.dart';

class MyAttendanceTab extends StatelessWidget {
  const MyAttendanceTab({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).currentUser;
    final firestore = Provider.of<SupabaseDbService>(context);

    if (user == null) return const SizedBox.shrink();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(24.0),
          child: StreamBuilder<List<AttendanceRecord>>(
            stream: firestore.getStudentAttendance(user.uid),
            builder: (context, snapshot) {
              if (!snapshot.hasData) return const SizedBox.shrink();
              final records = snapshot.data!;
              final presentCount = records.where((r) => r.isPresent).length;
              final total = records.length;
              final percentage = total == 0 ? "0.0" : (presentCount / total * 100).toStringAsFixed(1);

              return Card(
                elevation: 0,
                color: Theme.of(context).colorScheme.primaryContainer,
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _StatItem("Present", "$presentCount", Theme.of(context).colorScheme.onPrimaryContainer),
                      Container(width: 1, height: 40, color: Theme.of(context).colorScheme.outlineVariant),
                      _StatItem("Total Days", "$total", Theme.of(context).colorScheme.onPrimaryContainer),
                      Container(width: 1, height: 40, color: Theme.of(context).colorScheme.outlineVariant),
                      _StatItem("Score", "$percentage%", Theme.of(context).colorScheme.primary),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        Expanded(
          child: StreamBuilder<List<AttendanceRecord>>(
            stream: firestore.getStudentAttendance(user.uid),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              final records = snapshot.data ?? [];
              if (records.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.event_busy, size: 48, color: Theme.of(context).colorScheme.outline),
                      const SizedBox(height: 16),
                      const Text("No attendance records found yet."),
                    ],
                  )
                );
              }
              
              return ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: records.length,
                separatorBuilder: (c, i) => const Divider(height: 1, indent: 56),
                itemBuilder: (context, index) {
                  final record = records[index];
                  final DateTime date = DateTime.parse(record.date);
                  final formattedDate = DateFormat('MMM dd, yyyy').format(date);
                  final day = DateFormat('EEEE').format(date);
                  
                  return ListTile(
                    contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                    leading: CircleAvatar(
                      backgroundColor: record.isPresent 
                        ? Colors.green.shade100 
                        : Colors.red.shade100,
                      child: Icon(
                        record.isPresent ? Icons.check : Icons.close,
                        color: record.isPresent ? Colors.green.shade800 : Colors.red.shade800,
                      ),
                    ),
                    title: Text(formattedDate, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text(day),
                    trailing: Chip(
                       label: Text(record.isPresent ? 'Present' : 'Absent'),
                       backgroundColor: record.isPresent ? Colors.green.shade50 : Colors.red.shade50,
                       labelStyle: TextStyle(
                         color: record.isPresent ? Colors.green.shade800 : Colors.red.shade800,
                         fontWeight: FontWeight.bold
                       ),
                       side: BorderSide.none,
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _StatItem(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: color)),
        Text(label, style: TextStyle(fontSize: 12, color: color.withOpacity(0.8))),
      ],
    );
  }
}
