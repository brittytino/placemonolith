'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  GraduationCap,
  FileText,
  UsersRound,
  FolderKanban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin-dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN'] },
  { label: 'Dashboard', href: '/class-rep-dashboard', icon: LayoutDashboard, roles: ['CLASS_REP'] },
  { label: 'Dashboard', href: '/student-dashboard', icon: LayoutDashboard, roles: ['STUDENT'] },
  { label: 'Students', href: '/admin-students', icon: Users, roles: ['SUPER_ADMIN'] },
  { label: 'Announcements', href: '/announcements', icon: Bell, roles: ['SUPER_ADMIN', 'CLASS_REP', 'STUDENT'] },
  { label: 'Groups', href: '/groups', icon: UsersRound, roles: ['SUPER_ADMIN', 'CLASS_REP', 'STUDENT'] },
  { label: 'Projects', href: '/projects', icon: FolderKanban, roles: ['SUPER_ADMIN', 'CLASS_REP', 'STUDENT'] },
  { label: 'Documents', href: '/documents', icon: FileText, roles: ['SUPER_ADMIN', 'CLASS_REP', 'STUDENT'] },
  { label: 'Settings', href: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'CLASS_REP', 'STUDENT'] },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Don't show navbar on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/forgot-password') || pathname?.startsWith('/setup')) {
    return null;
  }

  const userNavItems = navItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const isActive = (href: string) => pathname === href;

  if (!user) return null;

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:block bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl group-hover:scale-105 transition-transform shadow-md">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="hidden lg:block">
                <h1 className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  PSG Placement
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">MCA Portal</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center gap-1">
              {userNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 text-indigo-600 dark:text-indigo-400 font-medium shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'scale-110' : ''}`} />
                    <span className="hidden lg:inline text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user.fullName || user.registerNumber}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                  {user.role.replace('_', ' ').toLowerCase()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 rounded-lg shadow-md">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PSG Placement
              </h1>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="transition-transform"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {user.fullName || user.registerNumber}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                {user.role.replace('_', ' ').toLowerCase()}
              </p>
            </div>
            <div className="py-2">
              {userNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      active
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 text-indigo-600 dark:text-indigo-400 font-medium border-l-4 border-indigo-600'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 shadow-lg safe-area-inset-bottom">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {userNavItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all duration-200 relative ${
                  active
                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 text-indigo-600 dark:text-indigo-400 scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'scale-110' : ''}`} />
                <span className={`text-[10px] font-medium truncate w-full text-center ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom padding for mobile nav */}
      <div className="md:hidden h-16" />
    </>
  );
}
