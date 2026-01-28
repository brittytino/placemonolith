import 'package:flutter/material.dart';
import 'dart:io';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:file_picker/file_picker.dart';
import 'package:excel/excel.dart' hide Border;
import 'package:intl/intl.dart';
import '../../providers/user_provider.dart';
import '../../services/supabase_db_service.dart';
import '../../core/theme/app_dimens.dart';
import '../widgets/premium_card.dart';
import '../widgets/premium_empty_state.dart';

class TasksScreen extends StatelessWidget {
  const TasksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    // Determine if user has publish rights
    final canPublish = userProvider.isCoordinator || (userProvider.isActualPlacementRep && !userProvider.isSimulating);

    // Reps see the management interface, Students see the task list
    if (canPublish) {
        return const _RepTasksView();
    }
    return const _StudentTasksView();
  }
}

// ==========================================
// STUDENT VIEW
// ==========================================

class _StudentTasksView extends StatefulWidget {
  const _StudentTasksView();

  @override
  State<_StudentTasksView> createState() => _StudentTasksViewState();
}

class _StudentTasksViewState extends State<_StudentTasksView> {
  DateTime _selectedDate = DateTime.now();

  @override
  Widget build(BuildContext context) {
    final dbService = Provider.of<SupabaseDbService>(context, listen: false);
    final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            floating: true,
            title: const Text("Daily Roadmap"),
            centerTitle: false,
            actions: [
              IconButton(
                icon: const Icon(Icons.calendar_today_outlined),
                onPressed: _pickDate,
                tooltip: "Jump to Date",
              )
            ],
          ),
          
          // Date Navigator Sticky Header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding, vertical: AppSpacing.md),
              child: _DateNavigator(
                date: _selectedDate,
                onNext: () => setState(() => _selectedDate = _selectedDate.add(const Duration(days: 1))),
                onPrev: () => setState(() => _selectedDate = _selectedDate.subtract(const Duration(days: 1))),
              ),
            ),
          ),

          // Content Stream
          StreamBuilder<CompositeTask?>(
             stream: dbService.getDailyTask(dateStr),
             builder: (context, snapshot) {
               // 1. Loading
               if (snapshot.connectionState == ConnectionState.waiting) {
                 return const SliverFillRemaining(
                   child: Center(child: CircularProgressIndicator()),
                 );
               }
               
               final task = snapshot.data;
               
               // 2. Empty State
               if (task == null) {
                 return SliverFillRemaining(
                   hasScrollBody: false,
                   child: PremiumEmptyState(
                     icon: Icons.coffee_outlined,
                     message: "Rest Day",
                     subMessage: "No tasks assigned for ${DateFormat('MMMM d').format(_selectedDate)}",
                   ),
                 );
               }
               
               // 3. Tasks List
               return SliverPadding(
                 padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding),
                 sliver: SliverList(
                   delegate: SliverChildListDelegate([
                      if (task.leetcodeUrl.isNotEmpty) 
                        _TaskPremiumCard(
                          type: "LeetCode Challenge",
                          icon: Icons.code,
                          color: Colors.orange,
                          title: "Daily Coding Problem",
                          content: task.leetcodeUrl,
                          isLink: true 
                        ),
                      
                      const SizedBox(height: AppSpacing.md),
                      
                      if (task.csTopic.isNotEmpty)
                        _TaskPremiumCard(
                          type: "Core CS Concept",
                          icon: Icons.menu_book_outlined,
                          color: Theme.of(context).colorScheme.primary,
                          title: task.csTopic,
                          content: task.csTopicDescription,
                          isLink: false
                        ),

                      const SizedBox(height: AppSpacing.xxl),
                   ]),
                 ),
               );
             },
          ),
        ],
      ),
    );
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context, 
      initialDate: _selectedDate, 
      firstDate: DateTime(2025, 1, 1), 
      lastDate: DateTime(2027),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }
}

class _DateNavigator extends StatelessWidget {
  final DateTime date;
  final VoidCallback onPrev;
  final VoidCallback onNext;

  const _DateNavigator({required this.date, required this.onPrev, required this.onNext});

  @override
  Widget build(BuildContext context) {
     return PremiumCard(
       padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
       child: Row(
         mainAxisAlignment: MainAxisAlignment.spaceBetween,
         children: [
           IconButton(
             onPressed: onPrev, 
             icon: const Icon(Icons.chevron_left),
             splashRadius: 24,
           ),
           Column(
             mainAxisSize: MainAxisSize.min,
             children: [
               Text(
                 DateFormat('EEEE').format(date).toUpperCase(),
                 style: Theme.of(context).textTheme.labelSmall?.copyWith(
                   color: Theme.of(context).colorScheme.onSurfaceVariant,
                   letterSpacing: 1.0,
                   fontWeight: FontWeight.bold
                 ),
               ),
               Text(
                 DateFormat('MMMM d, yyyy').format(date), 
                 style: Theme.of(context).textTheme.titleMedium?.copyWith(
                   fontWeight: FontWeight.bold
                 )
               ),
             ],
           ),
           IconButton(
             onPressed: onNext, 
             icon: const Icon(Icons.chevron_right),
             splashRadius: 24,
           ),
         ],
       ),
     );
  }
}

class _TaskPremiumCard extends StatelessWidget {
  final String type;
  final IconData icon;
  final Color color;
  final String title;
  final String content;
  final bool isLink;

  const _TaskPremiumCard({
    required this.type, 
    required this.icon,
    required this.color, 
    required this.title, 
    required this.content, 
    required this.isLink
  });

  @override
  Widget build(BuildContext context) {
    return PremiumCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
           // Header Tag
           Container(
             padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
             decoration: BoxDecoration(
               color: color.withValues(alpha: 0.1),
               borderRadius: BorderRadius.circular(AppRadius.sm),
               border: Border.all(color: color.withValues(alpha: 0.2)),
             ),
             child: Row(
               mainAxisSize: MainAxisSize.min,
               children: [
                 Icon(icon, size: 14, color: color),
                 const SizedBox(width: AppSpacing.xs),
                 Text(
                   type.toUpperCase(), 
                   style: TextStyle(
                     fontSize: 10, 
                     fontWeight: FontWeight.bold, 
                     color: color,
                     letterSpacing: 0.5
                   )
                 ),
               ],
             ),
           ),
           
           const SizedBox(height: AppSpacing.md),
           
           // Title
           Text(
             title, 
             style: Theme.of(context).textTheme.titleLarge?.copyWith(
               fontWeight: FontWeight.bold,
               color: Theme.of(context).colorScheme.onSurface,
             )
           ),
           
           const Padding(
             padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
             child: Divider(height: 1),
           ),
           
           // Content Area
           if (isLink)
              InkWell(
                onTap: () => launchUrl(Uri.parse(content)),
                borderRadius: BorderRadius.circular(AppRadius.sm),
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surfaceContainer,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                    border: Border.all(color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.link, color: Theme.of(context).colorScheme.primary),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Text(
                          content, 
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.primary, 
                            fontWeight: FontWeight.w500,
                            decoration: TextDecoration.underline,
                            decorationColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const Icon(Icons.open_in_new, size: 16, color: Colors.grey),
                    ],
                  ),
                ),
              )
           else
              Text(
                content, 
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  height: 1.6,
                  color: Theme.of(context).colorScheme.onSurfaceVariant
                )
              ),
        ],
      ),
    );
  }
}

// ==========================================
// REP/COORD VIEW
// ==========================================

class _RepTasksView extends StatelessWidget {
  const _RepTasksView();

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2, 
      child: Scaffold(
        body: NestedScrollView(
          headerSliverBuilder: (context, innerBoxIsScrolled) => [
            const SliverAppBar(
              title: Text("Manage Tasks"),
              pinned: true,
              floating: true,
              bottom: TabBar(
                tabs: [
                  Tab(text: "New Entry"),
                  Tab(text: "Bulk Upload"),
                ],
              ),
            ),
          ],
          body: const TabBarView(
            children: [
               _SingleEntryForm(),
               _BulkUploadForm(),
            ],
          ),
        ),
      )
    );
  }
}

class _SingleEntryForm extends StatefulWidget {
  const _SingleEntryForm();

  @override
  State<_SingleEntryForm> createState() => _SingleEntryFormState();
}

class _SingleEntryFormState extends State<_SingleEntryForm> {
  final _formKey = GlobalKey<FormState>();
  DateTime _date = DateTime.now();
  final _leetCtrl = TextEditingController();
  final _topicCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.screenPadding),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
             PremiumCard(
               child: Column(
                 crossAxisAlignment: CrossAxisAlignment.start,
                 children: [
                   const _FormSectionHeader(title: "Target Date"),
                   InkWell(
                     onTap: () async {
                       final d = await showDatePicker(context: context, initialDate: _date, firstDate: DateTime.now(), lastDate: DateTime(2027));
                       if (d != null) setState(() => _date = d);
                     },
                     borderRadius: BorderRadius.circular(AppRadius.md),
                     child: Container(
                       padding: const EdgeInsets.all(AppSpacing.md),
                       decoration: BoxDecoration(
                         border: Border.all(color: Theme.of(context).colorScheme.outline),
                         borderRadius: BorderRadius.circular(AppRadius.md),
                       ),
                       child: Row(
                         children: [
                           const Icon(Icons.calendar_today, size: 20),
                           const SizedBox(width: AppSpacing.md),
                           Text(DateFormat('yyyy-MM-dd').format(_date), style: const TextStyle(fontWeight: FontWeight.bold)),
                           const Spacer(),
                           const Icon(Icons.edit, size: 16, color: Colors.grey),
                         ],
                       ),
                     ),
                   ),
                 ],
               ),
             ),
             
             const SizedBox(height: AppSpacing.md),
             
             PremiumCard(
               child: Column(
                 crossAxisAlignment: CrossAxisAlignment.start,
                 children: [
                   const _FormSectionHeader(title: "LeetCode Challenge"),
                   TextFormField(
                     controller: _leetCtrl,
                     decoration: const InputDecoration(labelText: "Challenge URL", hintText: "https://leetcode.com/problems/..."),
                     keyboardType: TextInputType.url,
                   ),
                 ],
               ),
             ),

             const SizedBox(height: AppSpacing.md),

             PremiumCard(
               child: Column(
                 crossAxisAlignment: CrossAxisAlignment.start,
                 children: [
                   const _FormSectionHeader(title: "Core CS Topic"),
                   TextFormField(
                     controller: _topicCtrl,
                     decoration: const InputDecoration(labelText: "Topic Title", hintText: "e.g. Operating Systems"),
                   ),
                   const SizedBox(height: AppSpacing.md),
                   TextFormField(
                     controller: _descCtrl,
                     decoration: const InputDecoration(labelText: "Description / Instructions", alignLabelWithHint: true),
                     maxLines: 4,
                   ),
                 ],
               ),
             ),
             
             const SizedBox(height: AppSpacing.xl),
             
             SizedBox(
               width: double.infinity,
               child: FilledButton.icon(
                 onPressed: _isLoading ? null : _submit,
                 style: FilledButton.styleFrom(
                   padding: const EdgeInsets.all(AppSpacing.lg),
                 ),
                 icon: _isLoading 
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.send_rounded),
                 label: const Text("PUBLISH TASK"),
               ),
             )
          ],
        )
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    
    try {
      final task = CompositeTask(
        date: DateFormat('yyyy-MM-dd').format(_date),
        leetcodeUrl: _leetCtrl.text.trim(),
        csTopic: _topicCtrl.text.trim(),
        csTopicDescription: _descCtrl.text.trim(),
        motivationQuote: '', 
      );
      
      await Provider.of<SupabaseDbService>(context, listen: false).publishDailyTask(task);
      if (mounted) {
         ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Task published successfully!")));
         _leetCtrl.clear();
         _topicCtrl.clear();
         _descCtrl.clear();
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
    } finally {
      setState(() => _isLoading = false);
    }
  }
}

class _FormSectionHeader extends StatelessWidget {
  final String title;
  const _FormSectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Text(
        title.toUpperCase(), 
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          fontWeight: FontWeight.bold, 
          color: Theme.of(context).colorScheme.primary,
          letterSpacing: 1.0,
        )
      ),
    );
  }
}

class _BulkUploadForm extends StatefulWidget {
  const _BulkUploadForm();

  @override
  State<_BulkUploadForm> createState() => _BulkUploadFormState();
}

class _BulkUploadFormState extends State<_BulkUploadForm> {
  bool _isLoading = false;
  String? _statusMessage;
  bool _isError = false;
  String _uploadType = 'mixed'; // 'leetcode', 'core', 'mixed'

  Future<void> _downloadTemplate() async {
     try {
       // Create Excel
       final excel = Excel.createExcel();
       // Remove default sheet if possible or just use it
       
       final sheet = excel['Sheet1'];
       
       List<String> headers = [];
       List<String> sampleRow = [];
       
       String tomorrow = DateFormat('yyyy-MM-dd').format(DateTime.now().add(const Duration(days: 1)));

       if (_uploadType == 'leetcode') {
          headers = ['Date', 'LeetCode URL'];
          sampleRow = [tomorrow, 'https://leetcode.com/problems/two-sum'];
       } else if (_uploadType == 'core') {
          headers = ['Date', 'CS Topic', 'Description'];
          sampleRow = [tomorrow, 'Arrays', 'Learn array traversal'];
       } else {
          headers = ['Date', 'LeetCode URL', 'CS Topic', 'Description'];
          sampleRow = [tomorrow, 'https://leetcode.com/problems/two-sum', 'Arrays', 'Learn array traversal'];
       }

       // Clear existing rows (Sheet1 usually comes with empty rows or just fresh)
       // excel package sheet logic varies, but appendRow is safe.
       
       sheet.appendRow(headers.map((e) => TextCellValue(e)).toList());
       sheet.appendRow(sampleRow.map((e) => TextCellValue(e)).toList());

       // Save
       final fileBytes = excel.save();
       if (fileBytes == null) throw Exception("Failed to generate Excel file");

       final String fileName = 'bulk_upload_template_$_uploadType.xlsx';
       
       final String? outputFile = await FilePicker.platform.saveFile(
         dialogTitle: 'Save Template',
         fileName: fileName,
         type: FileType.custom,
         allowedExtensions: ['xlsx'],
       );

       if (outputFile != null) {
          final file = File(outputFile);
          await file.writeAsBytes(fileBytes);
          if (mounted) {
             ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Template saved to $outputFile')));
          }
       }

     } catch (e) {
        if (mounted) setState(() { _statusMessage = "Template Error: $e"; _isError = true; });
     }
  }

  Future<void> _pickAndUpload() async {
     setState(() { _isLoading = true; _statusMessage = null; });
     try {
       final result = await FilePicker.platform.pickFiles(
         type: FileType.custom,
         allowedExtensions: ['xlsx', 'xls'],
         withData: true,
       );
       
       if (result == null) {
          setState(() { _isLoading = false; });
          return;
       }

       final bytes = result.files.first.bytes;
       if (bytes == null) throw Exception("Could not read file data.");

       final excel = Excel.decodeBytes(bytes);
       final tasks = <CompositeTask>[];

       for (var table in excel.tables.keys) {
          final sheet = excel.tables[table];
          if (sheet == null) continue;
          
          for (int i = 1; i < sheet.maxRows; i++) {
             final row = sheet.row(i);
             if (row.isEmpty) continue;
             
             // Check if row has any data
             bool hasData = false;
             for (var cell in row) {
               if (cell?.value != null) hasData = true;
             }
             if (!hasData) continue;
             
             try {
                final dateValRaw = row[0]?.value;
                if (dateValRaw == null) continue;
                
                String dateStr;
                if (dateValRaw is DateCellValue) {
                   dateStr = DateFormat('yyyy-MM-dd').format(dateValRaw.asDateTimeLocal());
                } else if (dateValRaw is TextCellValue) {
                   dateStr = dateValRaw.value.toString().split('T')[0];
                } else {
                   dateStr = dateValRaw.toString().split('T')[0];
                }

                String leet = "";
                String topic = "";
                String desc = "";

                if (_uploadType == 'leetcode') {
                    // Col 1: URL
                    if (row.length > 1) {
                        final val = row[1]?.value;
                        leet = val?.toString() ?? ""; 
                        if (val is TextCellValue) leet = val.value.toString();
                    }
                } else if (_uploadType == 'core') {
                    // Col 1: Topic, Col 2: Desc
                   if (row.length > 1) {
                      final val = row[1]?.value;
                      topic = val?.toString() ?? "";
                      if (val is TextCellValue) topic = val.value.toString();
                   }
                   if (row.length > 2) {
                      final val = row[2]?.value;
                      desc = val?.toString() ?? "";
                      if (val is TextCellValue) desc = val.value.toString();
                   }
                } else {
                   // Mixed
                   if (row.length > 1) {
                      final val = row[1]?.value;
                      leet = val?.toString() ?? "";
                      if (val is TextCellValue) leet = val.value.toString();
                   }
                   if (row.length > 2) {
                       final val = row[2]?.value;
                       topic = val?.toString() ?? "";
                       if (val is TextCellValue) topic = val.value.toString();
                   }
                   if (row.length > 3) {
                       final val = row[3]?.value;
                       desc = val?.toString() ?? "";
                       if (val is TextCellValue) desc = val.value.toString();
                   }
                }

                tasks.add(CompositeTask(
                  date: dateStr, 
                  leetcodeUrl: leet, 
                  csTopic: topic, 
                  csTopicDescription: desc, 
                  motivationQuote: ''
                ));
             } catch (e) {
                // Ignore malformed rows
             }
          }
       }

       if (tasks.isEmpty) throw Exception("No valid rows found for type '$_uploadType'.");
       
        final taskMap = <String, CompositeTask>{};
        for (final task in tasks) {
          taskMap[task.date] = task; 
        }
        final deduplicatedTasks = taskMap.values.toList();
        
       if (!mounted) return;
       final dbService = Provider.of<SupabaseDbService>(context, listen: false);
       await dbService.bulkPublishTasks(deduplicatedTasks);
       
       if (mounted) {
          setState(() { 
            _statusMessage = "Success! ${deduplicatedTasks.length} unique tasks scheduled."; 
            _isError = false; 
          });
       }

     } catch (e) {
       if (mounted) {
         setState(() { _statusMessage = "Upload Failed: $e"; _isError = true; });
       }
     } finally {
       if (mounted) {
         setState(() => _isLoading = false);
       }
     }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xxl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          PremiumCard(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(AppSpacing.xl),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.3),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.upload_file, size: 48, color: Theme.of(context).colorScheme.primary),
                ),
                const SizedBox(height: AppSpacing.lg),
                Text("Bulk Task Upload", style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: AppSpacing.md),
                
                // Upload Type Selector
                DropdownButtonFormField<String>(
                  key: ValueKey(_uploadType),
                  initialValue: _uploadType,
                  decoration: const InputDecoration(
                    labelText: "Upload Type",
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'mixed', child: Text("Mixed (LeetCode + Core)")),
                    DropdownMenuItem(value: 'leetcode', child: Text("LeetCode Only")),
                    DropdownMenuItem(value: 'core', child: Text("Core CS Topic Only")),
                  ], 
                  onChanged: (val) {
                    if (val != null) setState(() => _uploadType = val);
                  }
                ),
                const SizedBox(height: AppSpacing.md),

                Text(
                  _uploadType == 'mixed' 
                     ? "Format: Date | LeetCode URL | Topic | Description"
                     : _uploadType == 'leetcode'
                       ? "Format: Date | LeetCode URL"
                       : "Format: Date | Topic | Description",
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant),
                ),
                const SizedBox(height: AppSpacing.sm),
                
                TextButton.icon(
                  onPressed: _downloadTemplate,
                  icon: const Icon(Icons.download),
                  label: const Text("Download Template"),
                ),

                const SizedBox(height: AppSpacing.xl),
                
                if (_isLoading)
                  const CircularProgressIndicator()
                else
                  FilledButton.icon(
                    onPressed: _pickAndUpload, 
                    icon: const Icon(Icons.folder_open), 
                    label: const Text("Select Excel File"),
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl, vertical: AppSpacing.md)
                    ),
                  ),
              ],
            ),
          ),
          
          if (_statusMessage != null) ...[
             const SizedBox(height: AppSpacing.lg),
             AnimatedOpacity(
               opacity: 1.0,
               duration: AppDurations.slow,
               child: Container(
                 padding: const EdgeInsets.all(AppSpacing.md),
                 decoration: BoxDecoration(
                   color: _isError ? Colors.red.shade50 : Colors.green.shade50,
                   borderRadius: BorderRadius.circular(AppRadius.md),
                   border: Border.all(color: _isError ? Colors.red.shade200 : Colors.green.shade200),
                 ),
                 child: Row(
                   children: [
                     Icon(_isError ? Icons.error_outline : Icons.check_circle_outline, color: _isError ? Colors.red : Colors.green),
                     const SizedBox(width: AppSpacing.md),
                     Expanded(
                       child: Text(
                         _statusMessage!, 
                         style: TextStyle(color: _isError ? Colors.red.shade900 : Colors.green.shade900, fontWeight: FontWeight.w500),
                       ),
                     ),
                   ],
                 ),
               ),
             )
          ]
        ],
      ),
    );
  }
}
