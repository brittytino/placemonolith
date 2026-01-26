// ========================================
// ADMIN COMMAND: Fetch Real LeetCode Stats
// ========================================
// Add this to your app as an admin function
// Run it once to populate the database with real data
// ========================================

import 'package:flutter/material.dart';
import '../../services/supabase_service.dart';
import '../../providers/leetcode_provider.dart';

class FetchAllLeetCodeStatsCommand {
  final SupabaseService _supabaseService;
  final LeetCodeProvider _leetCodeProvider;
  
  FetchAllLeetCodeStatsCommand(this._supabaseService, this._leetCodeProvider);
  
  /// Run this to fetch all 123 students' real LeetCode stats
  Future<void> execute() async {
    debugPrint('🚀 Starting bulk LeetCode fetch for all students...\n');
    
    try {
      // Step 1: Clean up fake data
      debugPrint('🧹 Cleaning up fake data...');
      
      // Delete dummy entries one by one
      final fakeUsernames = [
        'dummy.coordinator@psgtech.ac.in',
        'dummy.leader@psgtech.ac.in',
        'dummy.student@psgtech.ac.in',
        'tinobritty'
      ];
      
      for (var username in fakeUsernames) {
        await _supabaseService.client
            .from('leetcode_stats')
            .delete()
            .eq('username', username);
      }
      
      // Also delete any email-based entries
      await _supabaseService.client
          .from('leetcode_stats')
          .delete()
          .like('username', '%@psgtech.ac.in%');
      
      debugPrint('✅ Fake data cleaned\n');
      
      // Step 2: Get all students with LeetCode usernames
      debugPrint('📊 Fetching student list...');
      final response = await _supabaseService.client
          .from('users')
          .select('leetcode_username, email, name, reg_no')
          .not('leetcode_username', 'is', null)
          .order('reg_no');
      
      final students = response as List;
      debugPrint('✅ Found ${students.length} students\n');
      
      if (students.isEmpty) {
        debugPrint('❌ No students found. Run 02_insert_data.sql first.');
        return;
      }
      
      // Step 3: Fetch each student's stats
      int successCount = 0;
      int failCount = 0;
      
      for (var i = 0; i < students.length; i++) {
        final student = students[i];
        final username = (student['leetcode_username'] as String?)?.trim();
        final name = student['name'] as String;
        final regNo = student['reg_no'] as String;
        
        if (username == null || username.isEmpty || username == 'NULL') {
          debugPrint('[${ i + 1}/${students.length}] ⏭️  Skip: $regNo - $name (no username)');
          failCount++;
          continue;
        }
        
        debugPrint('[${ i + 1}/${students.length}] 🔄 Fetching: $username ($name)');
        
        try {
          // Use the existing provider's fetch method
          final stats = await _leetCodeProvider.fetchStats(username);
          
          if (stats != null) {
            successCount++;
            debugPrint('   ✅ ${stats.totalSolved} problems (W:${stats.weeklyScore})');
          } else {
            failCount++;
            debugPrint('   ❌ No data returned for $username');
          }
          
          // Rate limiting: 600ms between requests
          await Future.delayed(const Duration(milliseconds: 600));
          
        } catch (e) {
          failCount++;
          debugPrint('   ❌ Error: $e');
        }
      }
      
      // Summary
      debugPrint('\n========================================');
      debugPrint('📊 FETCH SUMMARY');
      debugPrint('========================================');
      debugPrint('✅ Success: $successCount students');
      debugPrint('❌ Failed: $failCount students');
      debugPrint('📈 Total: ${students.length} students');
      debugPrint('========================================\n');
      
    } catch (e) {
      debugPrint('❌ Fatal Error: $e');
    }
  }
}
