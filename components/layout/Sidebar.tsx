'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  AudioLines,
  History,
  Bookmark,
  Brain,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/prepare',   label: 'Prepare',         icon: BookOpen },
  { href: '/mock',      label: 'Mock Interview',  icon: FileText },
  { href: '/voice',     label: 'Voice Interview', icon: AudioLines },
  { href: '/history',   label: 'History',         icon: History },
  { href: '/bookmarks', label: 'Bookmarks',       icon: Bookmark },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
      <div className="flex flex-col flex-grow border-r bg-card pt-6 overflow-y-auto">
        <div className="flex items-center gap-2.5 px-6 mb-8">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-[#9F7AEA] flex items-center justify-center shadow-pill">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">PrepAI</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ease-soft',
                  isActive
                    ? 'bg-accent text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
                )}
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-transform',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:scale-110'
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 pb-6 pt-4 mt-auto">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent to-primary/5 p-4 border border-primary/10">
            <p className="text-xs font-semibold text-primary mb-1">Keep going ✨</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Daily practice compounds — one session a day beats cramming.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
