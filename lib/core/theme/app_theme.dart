import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_dimens.dart';

class AppTheme {
  // --- Dark Theme Colors ---
  static const Color _darkBg = Color(0xFF0B0D10); // Deep Charcoal
  static const Color _darkSurface = Color(0xFF15181D); 
  static const Color _darkElevated = Color(0xFF1C2026);
  static const Color _darkBorder = Color(0xFF23262C);
  
  static const Color _darkTextPrimary = Color(0xFFF5F7FA);
  static const Color _darkTextSecondary = Color(0xFF9AA0A6);
  static const Color _darkTextMuted = Color(0xFF6B7078);

  // --- Light Theme Colors ---
  static const Color _lightBg = Color(0xFFF9FAFB); // Luxury Off-White
  static const Color _lightSurface = Color(0xFFFFFFFF);
  static const Color _lightElevated = Color(0xFFF1F3F5);
  static const Color _lightBorder = Color(0xFFE6E8EB);
  
  static const Color _lightTextPrimary = Color(0xFF111318);
  static const Color _lightTextSecondary = Color(0xFF5E6368);
  static const Color _lightTextMuted = Color(0xFF9AA0A6);

  // --- Brand Colors (Shared) ---
  static const Color primaryOrange = Color(0xFFFF8C1A);
  static const Color primaryActive = Color(0xFFE67600);
  
  static const Color _darkSoftOrange = Color(0xFFFFB36B);
  static const Color _lightSoftOrange = Color(0xFFFFD2A1);

  // --- Methods ---

  static ThemeData dark() {
    const colorScheme = ColorScheme.dark(
      primary: primaryOrange,
      onPrimary: _darkTextPrimary,
      secondary: _darkSoftOrange,
      onSecondary: _darkBg,
      surface: _darkSurface,
      onSurface: _darkTextPrimary, // Main text on surface
      surfaceContainerHighest: _darkElevated, // For cards/inputs
      error: Color(0xFFEF4743),
      onError: Colors.white,
      outline: _darkBorder,
    );

    return _buildTheme(
      brightness: Brightness.dark,
      colorScheme: colorScheme,
      scaffoldBg: _darkBg,
      surfaceColor: _darkSurface,
      elevatedColor: _darkElevated,
      borderColor: _darkBorder,
      textPrimary: _darkTextPrimary,
      textSecondary: _darkTextSecondary,
      textMuted: _darkTextMuted,
    );
  }

  static ThemeData light() {
    const colorScheme = ColorScheme.light(
      primary: primaryOrange,
      onPrimary: Colors.white, // Text on orange button
      secondary: _lightSoftOrange,
      onSecondary: Colors.black,
      surface: _lightSurface,
      onSurface: _lightTextPrimary,
      surfaceContainerHighest: _lightElevated,
      error: Color(0xFFDC2626),
      onError: Colors.white,
      outline: _lightBorder,
    );

    return _buildTheme(
      brightness: Brightness.light,
      colorScheme: colorScheme,
      scaffoldBg: _lightBg,
      surfaceColor: _lightSurface,
      elevatedColor: _lightElevated,
      borderColor: _lightBorder,
      textPrimary: _lightTextPrimary,
      textSecondary: _lightTextSecondary,
      textMuted: _lightTextMuted,
    );
  }

  static ThemeData _buildTheme({
    required Brightness brightness,
    required ColorScheme colorScheme,
    required Color scaffoldBg,
    required Color surfaceColor,
    required Color elevatedColor,
    required Color borderColor,
    required Color textPrimary,
    required Color textSecondary,
    required Color textMuted,
  }) {
    final isDark = brightness == Brightness.dark;

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: scaffoldBg,
      
      // Typography
      textTheme: GoogleFonts.outfitTextTheme(
        ThemeData(brightness: brightness).textTheme.apply(
          bodyColor: textPrimary,
          displayColor: textPrimary,
        ),
      ),
      
      // AppBar
      appBarTheme: AppBarTheme(
        backgroundColor: scaffoldBg,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.outfit(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        iconTheme: const IconThemeData(color: primaryOrange),
      ),
      
      // Card Theme
      cardTheme: CardThemeData(
        color: surfaceColor,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          side: BorderSide(color: borderColor, width: 1),
        ),
      ),

      // Input Decoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: elevatedColor,
        hintStyle: TextStyle(color: textMuted, fontSize: 14),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: borderColor, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: borderColor, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: primaryOrange, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: colorScheme.error, width: 1),
        ),
      ),
      
      // Buttons
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: primaryOrange,
          foregroundColor: Colors.white, // Always white on orange
          textStyle: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w600),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          elevation: 0,
        ).copyWith(
          overlayColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.pressed)) {
              return primaryActive.withValues(alpha: 0.2);
            }
            return null;
          }),
        ),
      ),
      
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryOrange,
          textStyle: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w600),
          side: const BorderSide(color: primaryOrange, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        ),
      ),
      
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryOrange,
          textStyle: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      
      // Bottom Navigation
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: surfaceColor,
        selectedItemColor: primaryOrange,
        unselectedItemColor: textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        showSelectedLabels: true,
        showUnselectedLabels: true,
        selectedLabelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
        unselectedLabelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
      ),
      
      // Divider
      dividerTheme: DividerThemeData(
        color: borderColor,
        thickness: 1,
        space: 1,
      ),

      // Icon Theme
      iconTheme: IconThemeData(
        color: isDark ? _darkSoftOrange : primaryOrange,
      ),
    );
  }
}

