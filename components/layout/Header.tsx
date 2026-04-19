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
  FileText,
  AudioLines,
  History,
  Bookmark,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/prepare',   label: 'Prepare',         icon: BookOpen },
  { href: '/voice',     label: 'Voice Interview', icon: AudioLines },
  { href: '/mock',      label: 'Mock Interview',  icon: FileText },
  { href: '/history',   label: 'History',         icon: History },
  { href: '/bookmarks', label: 'Bookmarks',       icon: Bookmark },
];

export function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-xl px-4 md:px-6">
        <button
          className="md:hidden h-10 w-10 rounded-xl hover:bg-accent flex items-center justify-center transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/dashboard" className="md:hidden flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold">PrepAI</span>
        </Link>
        <div className="flex-1" />
        {session?.user && (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex items-center gap-2.5 rounded-full bg-accent/60 pl-1 pr-4 py-1 transition-colors hover:bg-accent">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? ''}
                  className="h-8 w-8 rounded-full ring-2 ring-card"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                  {session.user.name?.charAt(0) ?? 'U'}
                </div>
              )}
              <span className="text-sm font-medium">{session.user.name}</span>
            </div>
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? ''}
                className="md:hidden h-8 w-8 rounded-full ring-2 ring-card"
                referrerPolicy="no-referrer"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-card p-6 shadow-soft-lg">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-pill">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">PrepAI</span>
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
                      'relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ease-soft',
                      isActive
                        ? 'bg-accent text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
                    )}
                    <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
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
