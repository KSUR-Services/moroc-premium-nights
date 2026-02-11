'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  FolderOpen,
  Tags,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
} from 'lucide-react';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

// ──────────────────────────────────────────────
// Admin Layout Component
// ──────────────────────────────────────────────

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Navigation items
  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: `/${locale}/admin`,
      icon: LayoutDashboard,
    },
    {
      label: 'Venues',
      href: `/${locale}/admin/venues`,
      icon: MapPin,
    },
    {
      label: 'Collections',
      href: `/${locale}/admin/collections`,
      icon: FolderOpen,
    },
    {
      label: 'Tags',
      href: `/${locale}/admin/tags`,
      icon: Tags,
    },
    {
      label: 'Settings',
      href: `/${locale}/admin/settings`,
      icon: Settings,
    },
  ];

  // Check authentication
  useEffect(() => {
    // Skip auth check on the login page itself
    if (pathname?.includes('/admin/login')) {
      setIsAuthenticated(true); // Allow login page to render
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth', { method: 'GET' });
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push(`/${locale}/admin/login`);
        }
      } catch {
        setIsAuthenticated(false);
        router.push(`/${locale}/admin/login`);
      }
    };

    checkAuth();
  }, [pathname, router, locale]);

  // Logout handler
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push(`/${locale}/admin/login`);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [router, locale]);

  // Show nothing while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
          <p className="text-sm text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If on login page, render children directly (no sidebar)
  if (pathname?.includes('/admin/login')) {
    return (
      <div className="min-h-screen bg-gray-950">
        {children}
      </div>
    );
  }

  // If not authenticated and not on login, show nothing (redirect is happening)
  if (!isAuthenticated) {
    return null;
  }

  // Check if nav item is active
  const isActive = (href: string) => {
    if (href === `/${locale}/admin`) {
      return pathname === href;
    }
    return pathname?.startsWith(href) ?? false;
  };

  // Breadcrumb segments
  const breadcrumbSegments = pathname
    ?.replace(`/${locale}/`, '')
    .split('/')
    .filter(Boolean) || [];

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* ── Sidebar Overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 border-r border-gray-800
          transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          <Link
            href={`/${locale}/admin`}
            className="flex items-center gap-2 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
              <Shield className="h-4 w-4 text-[#D4AF37]" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                MorocNights
              </span>
              <span className="ml-1.5 inline-flex items-center rounded-full bg-[#D4AF37]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#D4AF37] border border-[#D4AF37]/20">
                ADMIN
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                      transition-all duration-150
                      ${
                        active
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'
                      }
                    `}
                  >
                    <Icon className={`h-4.5 w-4.5 ${active ? 'text-[#D4AF37]' : ''}`} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-800 p-3">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
              text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="h-4.5 w-4.5" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
              {breadcrumbSegments.map((segment, index) => (
                <React.Fragment key={segment + index}>
                  {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-600" />}
                  <span
                    className={
                      index === breadcrumbSegments.length - 1
                        ? 'text-gray-200 font-medium capitalize'
                        : 'capitalize hover:text-gray-300 transition-colors'
                    }
                  >
                    {segment.replace(/-/g, ' ')}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin badge */}
            <div className="flex items-center gap-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-[#D4AF37]">Admin Session</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
