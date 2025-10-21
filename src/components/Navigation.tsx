"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Menu,
  X,
  ChevronDown,
  Users,
  Tag,
  PanelLeftClose,
  PanelLeftOpen,
  User as UserIcon,
  LogOut,
  LogIn
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { authClient, useSession } from '@/lib/auth-client';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  {
    name: 'Master',
    icon: Menu,
    adminOnly: true,
    submenus: [
      { name: 'User', href: '/users', icon: Users },
      { name: 'Task Category', href: '/categories', icon: Tag }
    ]
  },
  { name: 'Reports', href: '/reports', icon: FileText }
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = React.useState(true);
  const [masterMenuOpen, setMasterMenuOpen] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [loggingOut, setLoggingOut] = React.useState(false);

  // Fetch current user from API endpoint
  const fetchCurrentUser = React.useCallback(async () => {
    if (!session?.user) {
      setCurrentUser(null);
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        setCurrentUser(null);
        return;
      }

      const response = await fetch('/api/auth/current-user', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      } else {
        console.error('Failed to fetch current user');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setCurrentUser(null);
    }
  }, [session?.user]);

  // Refetch user whenever session changes
  React.useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Listen for bearer token changes (when user logs in)
  React.useEffect(() => {
    const handleTokenChange = () => {
      fetchCurrentUser();
    };

    window.addEventListener('bearer_token_changed', handleTokenChange);
    return () => window.removeEventListener('bearer_token_changed', handleTokenChange);
  }, [fetchCurrentUser]);

  // Also refetch when window regains focus (user comes back after login)
  React.useEffect(() => {
    const handleFocus = () => {
      if (session?.user) {
        fetchCurrentUser();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [session?.user, fetchCurrentUser]);

  const handleSignOut = async () => {
    setLoggingOut(true);
    const token = localStorage.getItem("bearer_token");

    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    if (error?.code) {
      toast.error(error.code);
      setLoggingOut(false);
    } else {
      localStorage.removeItem("bearer_token");
      setCurrentUser(null);
      refetch();
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  const userRole = currentUser?.role || 'member';
  const isAdmin = userRole === 'admin';

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="glass-card">
          {mobileMenuOpen ?
            <X className="h-5 w-5" /> :
            <Menu className="h-5 w-5" />
          }
        </Button>
      </div>

      {/* Desktop sidebar toggle button */}
      <div className="hidden lg:block fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
          className="glass-card">
          {desktopSidebarOpen ?
            <PanelLeftClose className="h-5 w-5" /> :
            <PanelLeftOpen className="h-5 w-5" />
          }
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out',
          // Mobile behavior
          'lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop behavior
          !desktopSidebarOpen && 'lg:-translate-x-full'
        )}
      >
        <GlassCard className="m-4 flex flex-col !w-[262px] !h-full">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent !w-[121%] !h-[38px]">
              Productivity
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Management System</p>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
            {navigation.map((item) => {
              // Hide Master menu for non-admin users
              if (item.adminOnly && !isAdmin) {
                return null;
              }

              if (item.submenus) {
                // Master menu with submenus
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setMasterMenuOpen(!masterMenuOpen)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        masterMenuOpen && "rotate-180"
                      )} />
                    </button>
                    {masterMenuOpen &&
                      <div className="ml-4 mt-1 space-y-1">
                        {item.submenus.map((submenu) => {
                          const isActive = pathname === submenu.href;
                          return (
                            <Link
                              key={submenu.name}
                              href={submenu.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                'flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200',
                                isActive ?
                                  'bg-primary text-primary-foreground shadow-lg' :
                                  'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                              )}>
                              <submenu.icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{submenu.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    }
                  </div>
                );
              } else {
                // Regular menu item
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                      isActive ?
                        'bg-primary text-primary-foreground shadow-lg' :
                        'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              }
            })}
          </nav>

          <div className="p-4 border-t border-border">
            {isPending ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                </div>
              </div>
            ) : session?.user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                  {currentUser?.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt={session.user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                      {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.user.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                  </div>
                </div>
                <Button
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  variant="outline"
                  className="w-full justify-start gap-3 glass-card"
                  size="sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="w-full justify-start gap-3 glass-card"
                size="sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Button>
            )}
          </div>
        </GlassCard>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen &&
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)} />
      }
    </>
  );
}