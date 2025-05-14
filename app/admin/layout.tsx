'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, FileText, LogOut, BarChart3, AlertTriangle, Menu, X } from 'lucide-react';
import { toast } from 'sonner';

// Ensure Sonner toast provider is included
import { Toaster } from '@/components/ui/sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  account_type: string;
  role?: string;
  is_deactivated?: boolean;
  // Other fields omitted for brevity
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if this is the login page
    const isLoginPage = pathname === '/admin/login';
    
    // Check for token
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');
    
    if (!token || !userStr) {
      setIsAuthenticated(false);
      if (!isLoginPage) {
        router.push('/admin/login');
      }
    } else {
      try {
        // Parse user data
        const userData = JSON.parse(userStr) as UserData;
        
        // Check if user is deactivated
        if (userData.is_deactivated) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setIsAuthenticated(false);
          toast.error('Your account has been deactivated. Please contact support.');
          router.push('/admin/login');
          return;
        }
        
        // Check if user is a super admin - accept various formats of super admin type
        const isSuperAdmin = 
          (userData.role === 'super_admin') || 
          (userData.account_type === 'admin') ||
          (userData.account_type === 'super-admin') ||
          (userData.account_type === 'super_admin');
        
        if (!isSuperAdmin) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setIsAuthenticated(false);
          toast.error('Only super admins can access this area');
          router.push('/admin/login');
        } else {
          // Add/normalize role field if needed
          if (!userData.role) {
            userData.role = 'super_admin';
            localStorage.setItem('adminUser', JSON.stringify(userData));
          }
          setIsAuthenticated(true);
        }
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAuthenticated(false);
        toast.error('Authentication error. Please log in again.');
        router.push('/admin/login');
      }
    }
  }, [pathname, router]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  // If we're on the login page, render children directly
  if (pathname === '/admin/login') {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  // If not yet determined if authenticated, show loading spinner
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect handled by useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Define navigation items
  const navItems = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: <BarChart3 size={20} /> },
    { title: 'Users', href: '/admin/users', icon: <Users size={20} /> },
    { title: 'System Logs', href: '/admin/logs', icon: <FileText size={20} /> },
    { title: 'Blocked Users', href: '/admin/users/blocked', icon: <AlertTriangle size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-primary">Delve Super Admin</h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <div
                    className={`flex items-center rounded-md p-2 transition-colors hover:bg-sidebar-accent ${
                      pathname === item.href
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center w-full rounded-md p-2 transition-colors hover:bg-sidebar-accent"
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar - Collapsible */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileSidebarOpen(false)}>
          <div className="absolute top-0 left-0 w-64 h-full bg-sidebar text-sidebar-foreground" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-sidebar-border">
              <h1 className="text-xl font-bold text-sidebar-primary">Delve Super Admin</h1>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="text-sidebar-foreground">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <div
                        className={`flex items-center rounded-md p-2 transition-colors hover:bg-sidebar-accent ${
                          pathname === item.href
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground'
                        }`}
                      >
                        {item.icon}
                        <span className="ml-3">{item.title}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t border-sidebar-border">
              <button
                onClick={handleLogout}
                className="flex items-center w-full rounded-md p-2 transition-colors hover:bg-sidebar-accent"
              >
                <LogOut size={20} />
                <span className="ml-3">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header with menu toggle */}
        <header className="md:hidden bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)} 
              className="mr-3 p-1 rounded hover:bg-sidebar-accent"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-sidebar-primary">Delve Admin</h1>
          </div>
          <button onClick={handleLogout} className="p-2">
            <LogOut size={20} />
          </button>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
} 