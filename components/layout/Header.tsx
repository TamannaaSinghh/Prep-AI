'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Brain, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
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

export function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-6">
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="md:hidden flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <span className="font-bold">PrepAI</span>
        </div>
        <div className="flex-1" />
        {session?.user && (
          <div className="flex items-center gap-3">
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? ''}
                className="h-8 w-8 rounded-full"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="hidden sm:inline text-sm font-medium">
              {session.user.name}
            </span>
            <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: '/login' })}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-card p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-8">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">PrepAI</span>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
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
        </div>
      )}
    </>
  );
}
