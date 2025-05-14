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
import { z } from 'zod';

// Zod schema for login form validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Type for the sign-in API response
interface SignInResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      is_verified: boolean;
      image_url: string | null;
      primary_language: string | null;
      target_language: string | null;
      target_language_proficiency: string | null;
      account_type: string;
      resetToken: string | null;
      resetTokenExpires: string | null;
      is_deactivated: boolean;
      // Other fields may be present
    }
  };
  access_token: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): z.SafeParseReturnType<{
    email: string;
    password: string;
  }, {
    email: string;
    password: string;
  }> => {
    return loginSchema.safeParse({ email, password });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form input
    const validationResult = validateForm();
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0]?.message || 'Invalid form data';
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
      // Get API URL from environment variables
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL is not configured');
      }

      // Make API request to sign in
      const response = await fetch(`${apiUrl}/auth/sign_in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign in');
      }

      // Type assertion to help TypeScript understand the response shape
      const apiResponse = data as SignInResponse;

      // Extract user data from the response
      const userData = apiResponse.data.user;
      
      // Add role field to user data based on account_type
      const userDataWithRole = {
        ...userData,
        role: userData.account_type === 'super-admin' ? 'super_admin' : userData.account_type
      };

      // Store token and processed user data in localStorage
      localStorage.setItem('adminToken', apiResponse.access_token);
      localStorage.setItem('adminUser', JSON.stringify(userDataWithRole));

      // Show success message
      toast.success(apiResponse.message || 'Login successful');
      
      // Add a small delay before redirecting
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1000);
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
                  placeholder="your@email.com"
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
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Link href="/auth/create-super-admin" className="text-sm text-muted-foreground hover:text-primary">
              Need to create a super admin account?
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              Return to Home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 