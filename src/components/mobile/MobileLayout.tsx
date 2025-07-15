import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Trophy, Users, BarChart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  tournamentSlug?: string;
}

export function MobileLayout({ children, showBottomNav = true, tournamentSlug }: MobileLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detect if device is mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const touch = 'ontouchstart' in window;
      setIsMobile(width <= 768 || touch);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const bottomNavItems = [
    {
      icon: Home,
      label: 'Home',
      path: tournamentSlug ? `/dashboard/${tournamentSlug}` : '/',
    },
    {
      icon: Trophy,
      label: 'Leaderboard',
      path: tournamentSlug ? `/leaderboard/${tournamentSlug}` : '/',
    },
    {
      icon: Users,
      label: 'Teams',
      path: tournamentSlug ? `/dashboard/${tournamentSlug}#teams` : '/',
    },
    {
      icon: BarChart,
      label: 'Stats',
      path: tournamentSlug ? `/dashboard/${tournamentSlug}#stats` : '/',
    },
  ];

  const isActive = (path: string) => {
    if (path.includes('#')) {
      const [basePath, hash] = path.split('#');
      return location.pathname === basePath && location.hash === `#${hash}`;
    }
    return location.pathname === path;
  };

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-layout min-h-screen pb-16">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-semibold truncate">Beer Olympics</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -mr-2 touch-target"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 h-full w-72 bg-background shadow-lg z-50"
            >
              <div className="p-4">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mb-4 p-2 -ml-2 touch-target"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
                <nav className="space-y-2">
                  <a
                    href="#notifications"
                    className="block p-3 rounded-lg hover:bg-accent touch-target"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Notifications
                  </a>
                  <a
                    href="#settings"
                    className="block p-3 rounded-lg hover:bg-accent touch-target"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </a>
                  <a
                    href="#help"
                    className="block p-3 rounded-lg hover:bg-accent touch-target"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Help
                  </a>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="mobile-content">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-30">
          <div className="flex justify-around items-center h-16 px-2">
            {bottomNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full touch-target",
                  "text-xs transition-colors",
                  isActive(item.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon 
                  size={20} 
                  className={cn(
                    "mb-1",
                    isActive(item.path) && "stroke-[2.5]"
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      <style>{`
        /* Ensure touch targets meet minimum size requirements */
        .touch-target {
          min-width: 48px;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Optimize scrolling performance */
        .mobile-content {
          -webkit-overflow-scrolling: touch;
          overflow-y: auto;
        }

        /* Prevent text selection on interactive elements */
        .mobile-layout button,
        .mobile-layout a {
          -webkit-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* Safe area insets for modern devices */
        @supports (padding: env(safe-area-inset-bottom)) {
          .mobile-layout {
            padding-bottom: calc(4rem + env(safe-area-inset-bottom));
          }
          
          nav:last-child {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </div>
  );
}