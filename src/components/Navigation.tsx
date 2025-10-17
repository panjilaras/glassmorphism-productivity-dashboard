"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText,
  Menu,
  X,
  ChevronDown,
  Users,
  Tag
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { 
    name: 'Master', 
    icon: Menu,
    submenus: [
      { name: 'User', href: '/users', icon: Users },
      { name: 'Task Category', href: '/categories', icon: Tag },
    ]
  },
  { name: 'Reports', href: '/reports', icon: FileText },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [masterMenuOpen, setMasterMenuOpen] = React.useState(true);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="glass-card"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <GlassCard className="h-full m-4 flex flex-col">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Productivity
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Management System</p>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
            {navigation.map((item) => {
              if (item.submenus) {
                // Master menu with submenus
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setMasterMenuOpen(!masterMenuOpen)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        masterMenuOpen && "rotate-180"
                      )} />
                    </button>
                    {masterMenuOpen && (
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
                                isActive
                                  ? 'bg-primary text-primary-foreground shadow-lg'
                                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                              )}
                            >
                              <submenu.icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{submenu.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
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
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              }
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                JD
              </div>
              <div>
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}