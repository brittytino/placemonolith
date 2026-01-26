import 'dart:async';
import 'package:flutter/foundation.dart';
import '../providers/leetcode_provider.dart';
import '../services/supabase_service.dart';

/// Daily Auto-Refresh Service for LeetCode Stats
/// This runs in the background and automatically refreshes stats once per day
class LeetCodeAutoRefreshService {
  final LeetCodeProvider _leetCodeProvider;
  final SupabaseService _supabaseService;
  Timer? _dailyTimer;
  
  LeetCodeAutoRefreshService(this._leetCodeProvider, this._supabaseService);
  
  /// Start the daily auto-refresh timer
  void start() {
    // Cancel existing timer if any
    _dailyTimer?.cancel();
    
    // Check immediately if refresh is needed
    _checkAndRefreshIfNeeded();
    
    // Set up daily timer (every 24 hours)
    _dailyTimer = Timer.periodic(const Duration(hours: 24), (_) {
      _checkAndRefreshIfNeeded();
    });
    
    debugPrint('[AutoRefresh] Daily LeetCode refresh service started');
  }
  
  /// Stop the auto-refresh timer
  void stop() {
    _dailyTimer?.cancel();
    _dailyTimer = null;
    debugPrint('[AutoRefresh] Daily refresh service stopped');
  }
  
  /// Check if refresh is needed and execute
  Future<void> _checkAndRefreshIfNeeded() async {
    try {
      // Get last refresh timestamp from database or shared preferences
      final lastRefresh = await _getLastRefreshTimestamp();
      
      final now = DateTime.now();
      if (lastRefresh == null || now.difference(lastRefresh).inHours >= 24) {
        debugPrint('[AutoRefresh] 24 hours passed, starting auto-refresh...');
        await _performAutoRefresh();
      } else {
        debugPrint('[AutoRefresh] Refresh not needed yet. Last refresh: $lastRefresh');
      }
    } catch (e) {
      debugPrint('[AutoRefresh] Error checking refresh: $e');
    }
  }
  
  /// Perform the actual refresh
  Future<void> _performAutoRefresh() async {
    try {
      debugPrint('[AutoRefresh] Starting background refresh of all students...');
      
      // Use the provider's API refresh method
      await _leetCodeProvider.refreshAllUsersFromAPI();
      
      // Save the refresh timestamp
      await _saveLastRefreshTimestamp(DateTime.now());
      
      debugPrint('[AutoRefresh] Auto-refresh completed successfully');
    } catch (e) {
      debugPrint('[AutoRefresh] Error during auto-refresh: $e');
    }
  }
  
  /// Get last refresh timestamp from database
  Future<DateTime?> _getLastRefreshTimestamp() async {
    try {
      // Try to get from a settings/metadata table
      final result = await _supabaseService.client
          .from('app_settings')
          .select('value')
          .eq('key', 'leetcode_last_refresh')
          .maybeSingle();
      
      if (result != null) {
        return DateTime.parse(result['value'] as String);
      }
    } catch (e) {
      debugPrint('[AutoRefresh] Could not get last refresh timestamp: $e');
    }
    return null;
  }
  
  /// Save last refresh timestamp to database
  Future<void> _saveLastRefreshTimestamp(DateTime timestamp) async {
    try {
      await _supabaseService.client.from('app_settings').upsert({
        'key': 'leetcode_last_refresh',
        'value': timestamp.toIso8601String(),
      });
    } catch (e) {
      debugPrint('[AutoRefresh] Could not save last refresh timestamp: $e');
      // Not critical if this fails
    }
  }
  
  /// Dispose resources
  void dispose() {
    stop();
  }
}
