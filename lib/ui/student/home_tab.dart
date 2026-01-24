import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../services/quote_service.dart';
import '../../services/supabase_db_service.dart';
import '../../core/theme/layout_tokens.dart';
import '../../ui/widgets/content_card.dart';
import '../../ui/widgets/loading_state.dart';
import '../../ui/widgets/empty_state.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({super.key});

  @override
  Widget build(BuildContext context) {
    final firestore = Provider.of<SupabaseDbService>(context);
    final quoteService = Provider.of<QuoteService>(context);
    final today = DateTime.now().toIso8601String().split('T')[0];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Motivation Card
          FutureBuilder<Map<String, String>>(
            future: quoteService.getDailyQuote(),
            builder: (context, snapshot) {
              if (!snapshot.hasData) return const SizedBox.shrink();
              final data = snapshot.data!;
              return Card(
                elevation: 0,
                color: Theme.of(context).colorScheme.tertiaryContainer,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Text(
                        '"${data['text']}"',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontStyle: FontStyle.italic,
                          color: Theme.of(context).colorScheme.onTertiaryContainer
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '- ${data['author']}',
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.onTertiaryContainer.withOpacity(0.8)
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 24),
          Text(
            "Today's Challenge", 
            style: Theme.of(context).textTheme.headlineSmall
          ),
          const SizedBox(height: 16),
          
          StreamBuilder<CompositeTask?>(
            stream: firestore.getDailyTask(today),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              final task = snapshot.data;
              if (task == null) {
                return Card(
                  elevation: 0,
                  color: Theme.of(context).colorScheme.surfaceContainer,
                  child: const Padding(
                    padding: EdgeInsets.all(32.0),
                    child: Column(
                      children: [
                        Icon(Icons.coffee, size: 48, color: Colors.grey),
                        SizedBox(height: 16),
                        Text("No tasks published yet today."),
                      ],
                    ),
                  ),
                );
              }

              return Column(
                children: [
                   Card(
                    elevation: 0,
                    color: Theme.of(context).colorScheme.surfaceContainerHighest,
                    clipBehavior: Clip.hardEdge,
                    child: InkWell(
                      onTap: () => launchUrl(Uri.parse(task.leetcodeUrl)),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Theme.of(context).colorScheme.primaryContainer,
                                borderRadius: BorderRadius.circular(12)
                              ),
                              child: Icon(Icons.code, color: Theme.of(context).colorScheme.onPrimaryContainer),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text("LeetCode Problem", style: Theme.of(context).textTheme.labelMedium),
                                  Text("Solve Challenge", style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                                ],
                              ) 
                            ),
                            const Icon(Icons.arrow_forward_ios, size: 16),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Card(
                    elevation: 0,
                    color: Theme.of(context).colorScheme.surfaceContainer,
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.menu_book, color: Theme.of(context).colorScheme.secondary),
                              const SizedBox(width: 12),
                              Expanded(child: Text(task.csTopic, style: Theme.of(context).textTheme.titleLarge)),
                            ],
                          ),
                          const Divider(height: 32),
                          Text(task.csTopicDescription, style: Theme.of(context).textTheme.bodyLarge),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}
