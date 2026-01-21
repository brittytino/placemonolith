import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/user_provider.dart';
import 'home_tab.dart';
import 'my_attendance_tab.dart';
import '../leader/team_attendance_tab.dart';
import '../coordinator/management_tab.dart';
import '../widgets/adaptive_scaffold.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    final user = userProvider.currentUser;
    if (user == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    final bool showTeamTab = user.isTeamLeader || user.isPlacementRep || user.isCoordinator;
    final bool showAdminTab = user.isCoordinator || user.isPlacementRep;

    // Define tabs dynamically
    // 0: Home (Always)
    // 1: My Attendance (Always)
    // 2: Team (Conditional)
    // 3: Admin (Conditional)
    
    final List<Widget> pages = [
      const HomeTab(),
      const MyAttendanceTab(),
    ];
    
    final List<NavigationDestination> destinations = [
      const NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Daily'),
      const NavigationDestination(icon: Icon(Icons.calendar_month_outlined), selectedIcon: Icon(Icons.calendar_month), label: 'My Log'),
    ];

    if (showTeamTab) {
      pages.add(const TeamAttendanceTab());
      destinations.add(const NavigationDestination(icon: Icon(Icons.groups_outlined), selectedIcon: Icon(Icons.groups), label: 'Team'));
    }

    if (showAdminTab) {
      pages.add(const ManagementTab());
      destinations.add(const NavigationDestination(icon: Icon(Icons.admin_panel_settings_outlined), selectedIcon: Icon(Icons.admin_panel_settings), label: 'Admin'));
    }

    // Safety check for index
    if(_selectedIndex >= pages.length) _selectedIndex = 0;

    return AdaptiveNavigationScaffold(
      title: 'PSG MCA Prep',
      userProfile: AppUserDisplay(
        name: user.name, 
        initials: user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
      ),
      action: IconButton(
        icon: const Icon(Icons.logout),
        tooltip: "Logout",
        onPressed: () => userProvider.signOut(),
      ),
      destinations: destinations,
      selectedIndex: _selectedIndex,
      onDestinationSelected: (index) {
        setState(() {
          _selectedIndex = index;
        });
      },
      body: pages[_selectedIndex],
    );
  }
}
