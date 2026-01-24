import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/user_provider.dart';
import '../../services/supabase_db_service.dart';

class RepOverrideView extends StatefulWidget {
  const RepOverrideView({super.key});

  @override
  State<RepOverrideView> createState() => _RepOverrideViewState();
}

class _RepOverrideViewState extends State<RepOverrideView> {
  final _regNoCtrl = TextEditingController();
  final _reasonCtrl = TextEditingController();
  DateTime _selectedDate = DateTime.now();
  bool _isLoading = false;

  Future<void> _submit() async {
    final regNo = _regNoCtrl.text.trim();
    final reason = _reasonCtrl.text.trim();
    if (regNo.isEmpty || reason.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Reg No and Reason required'),
          backgroundColor: Theme.of(context).colorScheme.error,
        )
      );
      return;
    }

    setState(() => _isLoading = true);
    final user = Provider.of<UserProvider>(context, listen: false).currentUser;
    final firestore = Provider.of<SupabaseDbService>(context, listen: false);
    final dateStr = _selectedDate.toIso8601String().split('T')[0];

    try {
      bool? newStatus = await showDialog<bool>(
        context: context, 
        builder: (c) => AlertDialog(
          icon: const Icon(Icons.edit_note, size: 32),
          title: const Text("Set New Status"),
          content: Text("Override attendance for $regNo on $dateStr?"),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(c, false), 
              style: TextButton.styleFrom(foregroundColor: Colors.red),
              child: const Text("MARK ABSENT")
            ),
            FilledButton(
              onPressed: () => Navigator.pop(c, true), 
              child: const Text("MARK PRESENT")
            ),
          ],
        )
      );

      if (newStatus == null) {
        setState(() => _isLoading = false);
        return;
      }

      await firestore.overrideAttendance(regNo, dateStr, newStatus, user!.uid, reason);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Override Logged Successfully'),
            behavior: SnackBarBehavior.floating,
            backgroundColor: Theme.of(context).colorScheme.primary,
          )
        );
        _regNoCtrl.clear();
        _reasonCtrl.clear();
      }

    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Theme.of(context).colorScheme.error
          )
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final dateFormat = DateFormat('yyyy-MM-dd');

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: colorScheme.errorContainer,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: colorScheme.error)
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning_amber_rounded, color: colorScheme.onErrorContainer, size: 32),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("Override Mode", style: TextStyle(color: colorScheme.onErrorContainer, fontWeight: FontWeight.bold, fontSize: 16)),
                          Text("Actions are logged in audit trail.", style: TextStyle(color: colorScheme.onErrorContainer)),
                        ],
                      ),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 24),
              Card(
                elevation: 0,
                color: colorScheme.surfaceContainerHighest.withOpacity(0.5),
                child: ListTile(
                  leading: const Icon(Icons.event),
                  title: const Text("Target Date"),
                  subtitle: Text(dateFormat.format(_selectedDate)),
                  trailing: TextButton(
                    child: const Text("Change"),
                    onPressed: () async {
                      final d = await showDatePicker(
                         context: context, 
                         firstDate: DateTime(2025), 
                         lastDate: DateTime(2030), 
                         initialDate: _selectedDate
                      );
                      if (d != null) setState(() => _selectedDate = d);
                    },
                  ),
                ),
              ),
               const SizedBox(height: 16),
              TextField(
                controller: _regNoCtrl,
                decoration: InputDecoration(
                  labelText: 'Student Reg No', 
                  hintText: 'e.g. 25MX123',
                  border: const OutlineInputBorder(),
                  prefixIcon: const Icon(Icons.person_search),
                  filled: true,
                  fillColor: colorScheme.surface,
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _reasonCtrl,
                decoration: InputDecoration(
                  labelText: 'Reason for Override', 
                  hintText: 'Required for audit logs',
                  border: const OutlineInputBorder(),
                  prefixIcon: const Icon(Icons.comment),
                  filled: true,
                  fillColor: colorScheme.surface,
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 32),
               SizedBox(
                   width: double.infinity,
                   height: 56,
                   child: FilledButton.icon(
                     style: FilledButton.styleFrom(
                       backgroundColor: colorScheme.error,
                       foregroundColor: colorScheme.onError,
                     ),
                     onPressed: _isLoading ? null : _submit,
                     icon: _isLoading ? const SizedBox.shrink() : const Icon(Icons.save_as),
                     label: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text("UPDATE ATTENDANCE"),
                   ),
                 )
            ],
          ),
        ),
      ),
    );
  }
}
