'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Home, UserCircle, Lightbulb, TrendingUp, Users, Building2, Briefcase, ShieldCheck } from 'lucide-react';

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { data: session } = useSession();

    if (!session) return null;

    const isStudent = session.user.role === 'STUDENT' || session.user.role === 'CLASS_REP';
    const isAdmin = session.user.role === 'SUPER_ADMIN' || session.user.role === 'PLACEMENT_REP';

    const studentNav = [
        { href: '/student-dashboard', icon: Home, label: 'Home' },
        { href: '/student-profile', icon: UserCircle, label: 'Profile' },
        { href: '/insights', icon: Lightbulb, label: 'Insights' },
    ];

    const adminNav = [
        { href: '/portal/dashboard', icon: Home, label: 'Home' },
        { href: '/portal/metrics', icon: TrendingUp, label: 'Analytics' },
        { href: '/portal/verify', icon: ShieldCheck, label: 'Verify' },
    ];

    const navItems = isStudent ? studentNav : isAdmin ? adminNav : [];

    if (navItems.length === 0) return null;

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/5 z-50">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive
                                    ? 'text-purple-400'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="text-xs mt-1">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
