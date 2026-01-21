import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/user_provider.dart';
import 'publish_task_view.dart';
import '../rep/rep_override_view.dart';

class ManagementTab extends StatelessWidget {
  const ManagementTab({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).currentUser;
    if (user == null) return const SizedBox.shrink();

    // Determine available tabs
    final bool isCoord = user.isCoordinator;
    final bool isRep = user.isPlacementRep;

    // We can use a DefaultTabController
    List<Widget> tabs = [];
    List<Widget> views = [];

    if (isCoord) {
      tabs.add(const Tab(text: 'Publish Task', icon: Icon(Icons.edit_note)));
      views.add(const PublishTaskView());
    }

    if (isRep) {
       tabs.add(const Tab(text: 'Rep Override', icon: Icon(Icons.warning_amber_rounded)));
       views.add(const RepOverrideView());
    }
    
    // Fallback or multiple tabs
    if (tabs.isEmpty) return const Center(child: Text("Access Denied"));

    return DefaultTabController(
      length: tabs.length,
      child: Column(
        children: [
          TabBar(
            tabs: tabs,
            labelColor: Theme.of(context).primaryColor,
            unselectedLabelColor: Colors.grey,
          ),
          Expanded(
            child: TabBarView(children: views),
          ),
        ],
      ),
    );
  }
}
