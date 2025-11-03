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
  User as UserIcon,
  LogOut,
  LogIn,
  BarChart3,
  ClipboardList,
  FolderOpen,
  Wrench,
  ArrowRightLeft,
  Palette,
  Package,
  Bike,
  Car,
  MessageSquare,
  FileSpreadsheet,
  Moon,
  Sun
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { authClient, useSession } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useSidebar } from '@/contexts/SidebarContext';
import { useTheme } from '@/contexts/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Chat', href: '/chat', icon: MessageSquare, restrictedForViewer: true },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, restrictedForViewer: true },
  { name: 'Documentation', href: '/documentation', icon: FolderOpen, restrictedForViewer: true },
  { name: 'Assets', href: '/assets', icon: Package, roles: ['admin', 'manager', 'GA'], restrictedForViewer: true },
  {
    name: 'Tools',
    icon: Wrench,
    restrictedForViewer: true,
    submenus: [
      { name: 'Rate Conversion', href: '/tools/rate-conversion', icon: ArrowRightLeft },
      { name: 'Bike Simulation', href: '/tools/bike-simulation', icon: Bike },
      { name: 'Car Simulation', href: '/tools/car-simulation', icon: Car },
      { name: 'JF LHP', href: '/tools/jf-lhp', icon: FileSpreadsheet }
    ]
  },
  {
    name: 'Master',
    icon: Menu,
    adminOnly: true,
    restrictedForViewer: true,
    submenus: [
      { name: 'User', href: '/users', icon: Users },
      { name: 'Category', href: '/categories', icon: Tag },
      { name: 'Theme', href: '/theme', icon: Palette }
    ]
  },
  {
    name: 'Reports',
    icon: FileText,
    roles: ['admin', 'manager'],
    restrictedForViewer: true,
    submenus: [
      { name: 'Analytics', href: '/reports', icon: BarChart3 },
      { name: 'Comprehensive Report', href: '/reports/comprehensive', icon: ClipboardList }
    ]
  }
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const { isOpen: desktopSidebarOpen, toggle: toggleDesktopSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [masterMenuOpen, setMasterMenuOpen] = React.useState(false);
  const [reportsMenuOpen, setReportsMenuOpen] = React.useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [totalUnreadChats, setTotalUnreadChats] = React.useState(0);
  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Listen for storage events to detect login/logout in other tabs or after page reload
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bearer_token') {
        // Token changed, refetch session
        refetch();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refetch]);

  // Fetch current user from Master Users table by email
  React.useEffect(() => {
    if (session?.user?.email) {
      async function fetchCurrentUser() {
        try {
          const token = localStorage.getItem("bearer_token");
          const response = await fetch(`/api/users?search=${encodeURIComponent(session.user.email)}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            // Find exact email match
            const matchedUser = data.find((u: any) => u.email === session.user.email);
            if (matchedUser) {
              setCurrentUser(matchedUser);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      }
      fetchCurrentUser();
    } else {
      // Clear current user if no session
      setCurrentUser(null);
    }
  }, [session]);

  // Fetch unread chat counts
  const fetchUnreadChatCounts = React.useCallback(async () => {
    if (!session?.user) return;
    
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch('/api/chat/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) return;
      
      const data = await response.json();
      const rooms = data.rooms || [];
      
      // Calculate total unread by checking unreadCount from each room
      const total = rooms.reduce((sum: number, room: any) => {
        return sum + (room.unreadCount || 0);
      }, 0);
      
      setTotalUnreadChats(total);
    } catch (error) {
      console.error('Error fetching unread chat counts:', error);
    }
  }, [session]);

  // Fetch unread counts on mount and when session changes
  React.useEffect(() => {
    if (session?.user) {
      fetchUnreadChatCounts();
    } else {
      setTotalUnreadChats(0);
    }
  }, [session, fetchUnreadChatCounts]);

  // Poll for unread counts every 5 seconds
  React.useEffect(() => {
    if (session?.user) {
      pollingIntervalRef.current = setInterval(() => {
        fetchUnreadChatCounts();
      }, 5000);
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [session, fetchUnreadChatCounts]);

  const handleSignOut = async () => {
    setLoggingOut(true);
    const token = localStorage.getItem("bearer_token");

    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    if (error?.code) {
      toast.error(error.code);
      setLoggingOut(false);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  const userRole = currentUser?.role || 'member';
  const isAdmin = userRole === 'admin';
  const isViewer = userRole === 'viewer';

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-2 sm:top-3 left-2 sm:left-3 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="glass-card h-8 w-8 sm:h-9 sm:w-9">
          {mobileMenuOpen ?
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> :
          <Menu className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          }
        </Button>
      </div>

      {/* Desktop sidebar toggle button */}
      <div className="hidden lg:block fixed top-3 left-3 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDesktopSidebar}
          className="glass-card h-9 w-9">
          {desktopSidebarOpen ?
          <X className="h-4 w-4" /> :
          <Menu className="h-4 w-4" />
          }
        </Button>
      </div>

      {/* Theme Toggle Button - Top Right */}
      <div className="fixed top-2 sm:top-3 right-2 sm:right-3 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="glass-card h-8 w-8 sm:h-9 sm:w-9"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? 
            <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" /> :
            <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500" />
          }
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-56 sm:w-60 md:w-64 lg:w-72 transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          !desktopSidebarOpen && 'lg:-translate-x-full'
        )}>

        <GlassCard className="m-2 sm:m-3 md:m-4 flex flex-col h-[calc(100vh-1rem)] sm:h-[calc(100vh-1.5rem)] md:h-[calc(100vh-2rem)] w-52 sm:w-56 md:w-60 lg:!w-[290px]">
          <div className="p-3 sm:p-4 md:p-5 lg:p-6 border-b border-border">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Productivity
            </h1>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">Management System</p>
          </div>

          <nav className="flex-1 p-2 sm:p-2.5 md:p-3 lg:p-4 space-y-1 sm:space-y-1.5 overflow-y-auto scrollbar-thin">
            {navigation.map((item) => {
              // Only show Dashboard when not logged in
              if (!session && item.name !== 'Dashboard') {
                return null;
              }

              // Hide restricted items for viewers
              if (isViewer && item.restrictedForViewer) {
                return null;
              }

              // Hide Master menu for non-admin users
              if (item.adminOnly && !isAdmin) {
                return null;
              }

              // Check role-based access for regular menu items
              if (item.roles && !item.roles.includes(userRole)) {
                return null;
              }

              if (item.submenus) {
                // Determine which menu and its open state
                const isReportsMenu = item.name === 'Reports';
                const isToolsMenu = item.name === 'Tools';
                const menuOpen = isReportsMenu ? reportsMenuOpen : isToolsMenu ? toolsMenuOpen : masterMenuOpen;
                const toggleMenu = isReportsMenu ? setReportsMenuOpen : isToolsMenu ? setToolsMenuOpen : setMasterMenuOpen;

                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleMenu(!menuOpen)}
                      className="w-full flex items-center justify-between gap-2 sm:gap-2.5 md:gap-3 px-2 sm:px-2.5 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg sm:rounded-xl text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all duration-200">
                      <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                        <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
                        <span className="text-xs sm:text-sm md:text-base font-medium">{item.name}</span>
                      </div>
                      <ChevronDown className={cn(
                        "w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 transition-transform duration-200",
                        menuOpen && "rotate-180"
                      )} />
                    </button>
                    {menuOpen &&
                    <div className="ml-2 sm:ml-2.5 md:ml-3 lg:ml-4 mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1">
                        {item.submenus.map((submenu) => {
                        // Check role-based access for submenu items
                        if (submenu.roles && !submenu.roles.includes(userRole)) {
                          return null;
                        }

                        const isActive = pathname === submenu.href;
                        return (
                          <Link
                            key={submenu.name}
                            href={submenu.href}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              toggleMenu(false);
                            }}
                            className={cn(
                              'flex items-center gap-2 sm:gap-2.5 md:gap-3 px-2 sm:px-2.5 md:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-200',
                              isActive ?
                              'bg-primary text-primary-foreground shadow-lg' :
                              'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                            )}>
                              <submenu.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                              <span className="text-[10px] sm:text-xs md:text-sm font-medium">{submenu.name}</span>
                            </Link>);

                      })}
                      </div>
                    }
                  </div>);

              } else {
                // Regular menu item
                const isActive = pathname === item.href;
                const isChatMenu = item.name === 'Chat';
                const showBadge = isChatMenu && totalUnreadChats > 0;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2 sm:gap-2.5 md:gap-3 px-2 sm:px-2.5 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg sm:rounded-xl transition-all duration-200 relative',
                      isActive ?
                      'bg-primary text-primary-foreground shadow-lg' :
                      'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}>
                    <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
                    <span className="text-xs sm:text-sm md:text-base font-medium">{item.name}</span>
                    {showBadge && (
                      <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                        {totalUnreadChats}
                      </span>
                    )}
                  </Link>);

              }
            })}
          </nav>

          {/* Bottom Section - User Profile and Login/Logout Button */}
          <div className="border-t border-border">
            {/* User Profile Section - Moved to Bottom */}
            <div className="p-4 sm:p-5 md:p-6 border-b border-border">
              {isPending ?
              <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-muted animate-pulse" />
                  <div className="w-full space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse mx-auto w-3/4" />
                    <div className="h-3 bg-muted rounded animate-pulse mx-auto w-1/2" />
                  </div>
                </div> :
              session?.user ?
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center gap-3 sm:gap-4 p-2 rounded-xl hover:bg-accent/30 transition-all duration-200 group">
                  {currentUser?.avatarUrl ?
                <img
                  src={currentUser.avatarUrl}
                  alt={session.user.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-primary/30 shadow-xl group-hover:border-primary/50 group-hover:scale-105 transition-all duration-200" /> :


                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-white font-bold text-2xl sm:text-3xl md:text-4xl shadow-xl group-hover:scale-105 transition-all duration-200">
                      {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                }
                  <div className="text-center w-full">
                    <p className="text-sm sm:text-base md:text-lg font-bold text-foreground truncate px-2">
                      {session.user.name || 'User'}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground capitalize font-medium mt-1">
                      {userRole}
                    </p>
                  </div>
                </Link> :

              <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Not logged in</p>
                </div>
              }
            </div>

            <div className="p-2 sm:p-2.5 md:p-3 lg:p-4">
              {session?.user ?
              <Button
                onClick={handleSignOut}
                disabled={loggingOut}
                variant="outline"
                className="w-full justify-center gap-2 sm:gap-2.5 md:gap-3 glass-card h-10 sm:h-11 md:h-12"
                size="lg">
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base font-medium">
                    {loggingOut ? 'Logging out...' : 'Logout'}
                  </span>
                </Button> :

              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="w-full justify-center gap-2 sm:gap-2.5 md:gap-3 glass-card h-10 sm:h-11 md:h-12"
                size="lg">
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base font-medium">Login</span>
                </Button>
              }
            </div>
          </div>
        </GlassCard>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen &&
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
        onClick={() => setMobileMenuOpen(false)} />
      }
    </>);

}