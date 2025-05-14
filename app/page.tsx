'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();

  // Automatically redirect after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/admin/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center max-w-[600px] mx-auto">
        <div className="mb-8 flex justify-center">
          {/* Replace with your actual logo */}
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
            D
          </div>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Delve Admin Portal
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Welcome to the Super Admin dashboard for managing users and AI resources
        </p>
        
        <div className="space-y-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/admin/login">
              Go to Admin Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <div className="mt-4">
            <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
              <Link href="/auth/create-super-admin">
                Create Super Admin Account
                <UserPlus className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              First time setup? Create a super admin account to get started.
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6">
            Redirecting automatically in a few seconds...
          </p>
        </div>
      </div>
      
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>Delve Super Admin &copy; {new Date().getFullYear()}</p>
        <p className="mt-1">
          Secure access to AI user management and resource control
        </p>
      </footer>
    </div>
  );
}
