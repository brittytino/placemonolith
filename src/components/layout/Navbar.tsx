'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { gsap } from 'gsap';
import {
  Home,
  Users,
  Building2,
  Briefcase,
  ShieldCheck,
  Lightbulb,
  TrendingUp,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      const ctx = gsap.context(() => {
        gsap.from(navRef.current, {
          y: -100,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out'
        });

        gsap.from(logoRef.current, {
          scale: 0,
          rotation: -360,
          duration: 1.2,
          ease: 'elastic.out(1, 0.5)',
          delay: 0.2
        });

        if (linksRef.current) {
          gsap.from(linksRef.current.children, {
            y: -20,
            opacity: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.out',
            delay: 0.4
          });
        }
      }, navRef);

      return () => ctx.revert();
    }
  }, [status]);

  // Don't render if not authenticated or still loading
  if (status === 'loading' || !session?.user) return null;

  const isAdmin = session.user.role === 'SUPER_ADMIN' || session.user.role === 'PLACEMENT_REP';

  // Secure obfuscated admin routes
  const adminLinks = [
    { href: '/portal/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/portal/users', icon: Users, label: 'Students' },
    { href: '/portal/organizations', icon: Building2, label: 'Companies' },
    { href: '/portal/campaigns', icon: Briefcase, label: 'Drives' },
    { href: '/portal/verify', icon: ShieldCheck, label: 'Verify' },
    { href: '/portal/metrics', icon: TrendingUp, label: 'Analytics' },
    { href: '/insights', icon: Lightbulb, label: 'Insights' },
  ];

  const studentLinks = [
    { href: '/student-dashboard', icon: Home, label: 'Dashboard' },
    { href: '/insights', icon: Lightbulb, label: 'Insights' },
    { href: '/student-profile', icon: User, label: 'Profile' },
  ];

  const navLinks = isAdmin ? adminLinks : studentLinks;

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        ref={navRef}
        className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-2xl border-b border-white/5"
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={isAdmin ? '/portal/dashboard' : '/student-dashboard'} className="flex items-center gap-3 group">
              <div
                ref={logoRef}
                className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/70 transition-shadow"
              >
                <Sparkles className="w-5 h-5 text-white" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              </div>
              <span className="text-xl font-bold text-gradient">
                SkillSphere
              </span>
            </Link>

            {/* Navigation Links */}
            <div ref={linksRef} className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 group ${isActive
                        ? 'text-purple-400 bg-purple-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <link.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{link.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Profile Section */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-white">{session.user.name}</div>
                  <div className="text-xs text-gray-500">{session.user.role}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 glass rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-white/5">
                    <div className="text-sm font-medium text-white">{session.user.email}</div>
                    <div className="text-xs text-gray-500 mt-1">{session.user.role}</div>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/98 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href={isAdmin ? '/portal/dashboard' : '/student-dashboard'} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">SkillSphere</span>
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
          >
            {mobileOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="absolute top-16 left-0 right-0 bg-black/98 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
            <div className="p-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}

              <div className="pt-4 mt-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{session.user.name}</div>
                    <div className="text-xs text-gray-500">{session.user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-3 px-4 py-3 mt-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
