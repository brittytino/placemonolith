import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../services/supabase_db_service.dart';

class PublishTaskView extends StatefulWidget {
  const PublishTaskView({super.key});

  @override
  State<PublishTaskView> createState() => _PublishTaskViewState();
}

class _PublishTaskViewState extends State<PublishTaskView> {
  final _formKey = GlobalKey<FormState>();
  final _leetcodeCtrl = TextEditingController();
  final _topicCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  DateTime _selectedDate = DateTime.now();

  bool _isLoading = false;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    
    final dateStr = _selectedDate.toIso8601String().split('T')[0];
    
    final task = CompositeTask(
      date: dateStr,
      leetcodeUrl: _leetcodeCtrl.text.trim(),
      csTopic: _topicCtrl.text.trim(),
      csTopicDescription: _descCtrl.text.trim(),
      motivationQuote: "Auto-generated",
    );

    try {
      await Provider.of<SupabaseDbService>(context, listen: false).publishDailyTask(task);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Task Published for $dateStr!'),
            behavior: SnackBarBehavior.floating,
            backgroundColor: Theme.of(context).colorScheme.primary,
          )
        );
        _leetcodeCtrl.clear();
        _topicCtrl.clear();
        _descCtrl.clear();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Theme.of(context).colorScheme.error,
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
    final dateFormat = DateFormat('EEE, MMM d, y');

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Card(
                  elevation: 0,
                  color: colorScheme.secondaryContainer.withOpacity(0.3),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      children: [
                        Icon(Icons.calendar_today, color: colorScheme.onSecondaryContainer),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text("Target Date", style: Theme.of(context).textTheme.labelMedium),
                              Text(dateFormat.format(_selectedDate), style: Theme.of(context).textTheme.titleLarge),
                            ],
                          ),
                        ),
                        FilledButton.tonal(
                          onPressed: () async {
                            final d = await showDatePicker(
                              context: context, 
                              firstDate: DateTime(2025), 
                              lastDate: DateTime(2030), 
                              initialDate: _selectedDate
                            );
                            if (d != null) setState(() => _selectedDate = d);
                          }, 
                          child: const Text("Change")
                        )
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Text("LeetCode Challenge", style: Theme.of(context).textTheme.titleMedium?.copyWith(color: colorScheme.primary)),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _leetcodeCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Problem URL', 
                    border: OutlineInputBorder(),
                    helperText: 'Paste the full LeetCode URL',
                    prefixIcon: Icon(Icons.link)
                  ),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 24),
                Text("Core Subject Topic", style: Theme.of(context).textTheme.titleMedium?.copyWith(color: colorScheme.secondary)),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _topicCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Topic Title', 
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.subject),
                  ),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _descCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Description / Resources', 
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.description),
                  ),
                  maxLines: 4,
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 32),
                SizedBox(
                  height: 56,
                  child: FilledButton.icon(
                    onPressed: _isLoading ? null : _submit,
                    icon: _isLoading ? const SizedBox.shrink() : const Icon(Icons.publish),
                    label: _isLoading 
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) 
                      : const Text("Publish Daily Task"),
                  ),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
