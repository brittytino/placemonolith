import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTypography {
  static TextTheme getTextTheme(bool isDark) {
    ThemeData base = isDark ? ThemeData.dark() : ThemeData.light();
    return GoogleFonts.interTextTheme(base.textTheme).copyWith(
      displayLarge: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 32),
      displayMedium: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 28),
      displaySmall: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 24),
      headlineMedium: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 20),
      titleLarge: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 18),
      bodyLarge: GoogleFonts.inter(fontSize: 16),
      bodyMedium: GoogleFonts.inter(fontSize: 14),
      labelSmall: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w500, letterSpacing: 0.5),
    );
  }
}
