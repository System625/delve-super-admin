'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Demo credentials - in a real app this would validate against the API
      if (email === 'admin@example.com' && password === 'admin123') {
        // Create mock token and user data
        const mockToken = 'demo-jwt-token-for-super-admin';
        const mockUser = {
          id: '3',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'super_admin'
        };

        // Save mock data to localStorage
        localStorage.setItem('adminToken', mockToken);
        localStorage.setItem('adminUser', JSON.stringify(mockUser));

        // Show success message
        toast.success('Login successful');
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 500);
      } else {
        // Simulate invalid credentials response
        throw new Error('Invalid email or password');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-4">
        <Card className="border-2 border-primary/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-primary">
              Super Admin Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the super admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-destructive bg-destructive/10 text-destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
              <strong>Demo Credentials:</strong><br />
              Email: admin@example.com<br />
              Password: admin123
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              Return to Home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 