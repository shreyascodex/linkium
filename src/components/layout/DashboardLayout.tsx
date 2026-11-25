import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  Compass,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';
import { BrandMark } from '@/src/components/navigation/BrandMark';
import { UserAvatar } from '@/src/components/profile/UserAvatar';
import { cn } from '@/src/lib/cn';

const SIDEBAR_ITEMS = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Discover Opportunities', to: '/opportunities', icon: Compass },
  { label: 'My Profile', to: '/profile', icon: User },
  { label: 'Connections', to: '/connections', icon: Users },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Messages', to: '/messages', icon: MessageSquare },
  { label: 'Settings', to: '/settings', icon: Settings },
] as const;

export interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSidebarOpen(false);
    setNotifOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setNotifOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const displayName =
    profile?.displayName ?? profile?.username ?? user?.email ?? 'Member';
  const secondaryLabel = profile?.username
    ? `@${profile.username}`
    : profile?.identityMode === 'PSEUDONYMOUS'
    ? 'Pseudonymous mode'
    : user?.email ?? '';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navContent = (
    <nav aria-label="Workspace navigation" className="flex flex-col gap-1 px-3 py-4">
      {SIDEBAR_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#EEF2FF] text-[#4F46E5]'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#4F46E5] focus:text-white focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-[#FFFFFF] border-r border-[#E2E8F0]">
        <div className="h-16 px-5 border-b border-[#E2E8F0] flex items-center">
          <BrandMark />
        </div>
        <div className="flex-1 overflow-y-auto">{navContent}</div>
        <div className="p-4 border-t border-[#E2E8F0]">
          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3">
            <UserAvatar
              name={displayName}
              avatarUrl={profile?.avatarUrl}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#0F172A] truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-[#64748B] truncate">{secondaryLabel}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#0F172A]/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#FFFFFF] h-full flex flex-col border-r border-[#E2E8F0] z-10">
            <div className="h-16 px-5 border-b border-[#E2E8F0] flex items-center justify-between">
              <BrandMark />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation"
                className="p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{navContent}</div>
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-[#FFFFFF]/95 backdrop-blur-sm border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-[#0F172A] truncate">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notifications placeholder */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label="Notifications"
                aria-expanded={notifOpen}
                className="p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-md p-4 text-xs">
                  <p className="font-semibold text-[#0F172A] mb-1">Notifications</p>
                  <p className="text-[#64748B] leading-relaxed">
                    You have no new notifications. Opportunity updates and collaboration
                    alerts will appear here as workflows go live.
                  </p>
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                <UserAvatar
                  name={displayName}
                  avatarUrl={profile?.avatarUrl}
                  size="sm"
                />
                <span className="hidden sm:inline text-xs font-medium text-[#0F172A] max-w-[140px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" aria-hidden="true" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-md py-1.5 text-sm">
                  <div className="px-3.5 py-2 border-b border-[#F1F5F9]">
                    <p className="text-xs font-semibold text-[#0F172A] truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {secondaryLabel}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                  >
                    <User className="w-3.5 h-3.5" aria-hidden="true" />
                    My Profile
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                  >
                    <Settings className="w-3.5 h-3.5" aria-hidden="true" />
                    Settings
                  </Link>

                  <div className="my-1 border-t border-[#F1F5F9]" />

                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl w-full mx-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
