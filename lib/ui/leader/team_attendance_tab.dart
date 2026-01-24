import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/user_provider.dart';
import '../../models/app_user.dart';
import '../../services/supabase_db_service.dart';

class TeamAttendanceTab extends StatefulWidget {
  const TeamAttendanceTab({super.key});

  @override
  State<TeamAttendanceTab> createState() => _TeamAttendanceTabState();
}

class _TeamAttendanceTabState extends State<TeamAttendanceTab> {
  bool _isLoading = true;
  bool _isSubmitted = false;
  List<AppUser> _members = [];
  final Map<String, bool> _attendanceMap = {}; // uid -> isPresent

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final user = Provider.of<UserProvider>(context, listen: false).currentUser;
    final firestore = Provider.of<SupabaseDbService>(context, listen: false);
    
    if (user?.teamId == null) {
      if (mounted) setState(() => _isLoading = false);
      return;
    }

    final today = DateTime.now().toIso8601String().split('T')[0];
    
    // Check if locked time passed (8 PM IST)
    // IST is +5:30. 20:00.
    final now = DateTime.now().toUtc().add(const Duration(hours: 5, minutes: 30));
    final lockTime = DateTime(now.year, now.month, now.day, 20, 0);
    
    final alreadySubmitted = await firestore.isAttendanceSubmitted(user!.teamId!, today);

    if (now.isAfter(lockTime) || alreadySubmitted) {
      if (mounted) {
        setState(() {
          _isSubmitted = true;
          _isLoading = false;
        });
      }
      return;
    }

    final members = await firestore.getTeamMembers(user.teamId!);
    if (mounted) {
      setState(() {
        _members = members;
        for (var m in members) {
          _attendanceMap[m.uid] = true; // Default to present
        }
        _isLoading = false;
      });
    }
  }

  Future<void> _submit() async {
    final user = Provider.of<UserProvider>(context, listen: false).currentUser;
    final firestore = Provider.of<SupabaseDbService>(context, listen: false);
    final today = DateTime.now().toIso8601String().split('T')[0];

    try {
      setState(() => _isLoading = true);

      // Construct records
      List<AttendanceRecord> records = _members.map((m) {
        return AttendanceRecord(
          id: 'temp', 
          date: today,
          studentUid: m.uid,
          regNo: m.regNo,
          teamId: user!.teamId!,
          isPresent: _attendanceMap[m.uid] ?? false,
          timestamp: DateTime.now(),
          markedBy: user.uid,
        );
      }).toList();

      await firestore.submitTeamAttendance(user!.teamId!, today, user.uid, records);
      
      if (mounted) {
        setState(() {
           _isSubmitted = true;
           _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Attendance Submitted!')));
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    
    final user = Provider.of<UserProvider>(context).currentUser;
    if (user?.teamId == null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.group_off, size: 64, color: Theme.of(context).colorScheme.outline),
            const SizedBox(height: 16),
            const Text("You are not assigned to a team."),
          ],
        )
      );
    }

    if (_isSubmitted) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.lock_clock, size: 64, color: Theme.of(context).colorScheme.tertiary),
            const SizedBox(height: 16),
            Text(
              "Attendance Locked", 
              style: Theme.of(context).textTheme.headlineSmall
            ),
            const SizedBox(height: 8),
            const Text("You have already submitted attendance for today."),
          ],
        ),
      );
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Icon(Icons.diversity_3, color: Theme.of(context).colorScheme.primary),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Team ${user!.teamId} Members", style: Theme.of(context).textTheme.titleLarge),
                  Text("Mark absent students clearly", style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _members.length,
            separatorBuilder: (c, i) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final member = _members[index];
              final isPresent = _attendanceMap[member.uid] ?? false;
              
              return Card(
                elevation: 0,
                color: isPresent 
                  ? Theme.of(context).colorScheme.surfaceContainerHighest
                  : Theme.of(context).colorScheme.errorContainer.withOpacity(0.3),
                child: SwitchListTile(
                  title: Text(member.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(member.regNo),
                  value: isPresent,
                  activeColor: Colors.green, // Explicit green for clarity
                  inactiveThumbColor: Colors.red,
                  inactiveTrackColor: Colors.red.withOpacity(0.2),
                  secondary: CircleAvatar(
                    backgroundColor: isPresent ? Colors.green.shade100 : Colors.red.shade100,
                    child: Text(
                       member.name[0],
                       style: TextStyle(color: isPresent ? Colors.green.shade800 : Colors.red.shade800)
                    ),
                  ),
                  onChanged: (val) {
                    setState(() {
                      _attendanceMap[member.uid] = val;
                    });
                  },
                ),
              );
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.all(24.0),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, -5)
              )
            ]
          ),
          child: Column(
            children: [
              SizedBox(
                width: double.infinity,
                height: 56,
                child: FilledButton.icon(
                  onPressed: _submit,
                  icon: const Icon(Icons.check_circle_outline),
                  label: const Text("SUBMIT ATTENDANCE"),
                  style: FilledButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Theme.of(context).colorScheme.onPrimary,
                  ),
                ),
              ),
              const SizedBox(height: 12),
               Text(
                "Action is final cannot be undone by Team Leader.", 
                style: TextStyle(
                  color: Theme.of(context).colorScheme.error, 
                  fontSize: 12, 
                  fontWeight: FontWeight.bold
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
