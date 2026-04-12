'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Mic,
  AudioLines,
  History,
  Bookmark,
  BarChart3,
  Brain,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/prepare',   label: 'Prepare',         icon: BookOpen },
  { href: '/mock',      label: 'Mock Interview',  icon: Mic },
  { href: '/voice',     label: 'Voice Interview', icon: AudioLines },
  { href: '/history',   label: 'History',         icon: History },
  { href: '/bookmarks', label: 'Bookmarks',       icon: Bookmark },
  { href: '/progress',  label: 'Progress',        icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
      <div className="flex flex-col flex-grow border-r bg-card pt-5 overflow-y-auto">
        <div className="flex items-center gap-2 px-6 mb-8">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">PrepAI</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
