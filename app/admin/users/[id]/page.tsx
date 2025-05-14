'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Trash2,
  User,
  Mail,
  CalendarDays,
  CreditCard,
  Zap,
  AlertTriangle,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { UserResponse } from '@/app/api/admin/users/[id]/route';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  account_type: string;
  created_at: string;
  image_url: string | null;
  is_verified: boolean;
  is_deactivated: boolean;
  total_tokens_used?: number;
  total_cost?: number;
  primary_language?: string | null;
  target_language?: string | null;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  // Fix for 'params' is possibly 'null' error
  // Check if params exists and has an id property
  const userId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
  
  // If no userId, redirect back to users list
  useEffect(() => {
    if (!userId) {
      toast.error('No user ID provided');
      router.push('/admin/users');
    }
  }, [userId, router]);

  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUserDetails = useCallback(async () => {
    // Don't fetch if userId is empty
    if (!userId) {
      setError('No user ID provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user details');
      }

      const data: UserResponse = await response.json();
      
      if (data.data?.user) {
        setUser(data.data.user as UserDetails);
      } else {
        throw new Error('User data not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching user details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleDeleteUser = async () => {
    if (!user || !userId) return;
    
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      toast.success(`User ${user.email} has been deleted`);
      
      // Redirect back to users list
      router.push('/admin/users');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the user';
      toast.error(errorMessage);
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return 'Invalid date';
    }
  };

  // Format currency to USD
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId, fetchUserDetails]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-40" /> : user?.name || user?.email || 'User Details'}
          </h1>
          {/* Display status of user account (if there's an error or user is loaded) */}
          {error && (
            <Badge variant="destructive" className="ml-2">Error</Badge>
          )}
        </div>
        
        {!isLoading && user && user.account_type !== 'super-admin' && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          <AlertTriangle className="h-5 w-5 mb-2" />
          <h3 className="font-medium">Error</h3>
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => router.push('/admin/users')}
          >
            Return to Users List
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : user && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Basic account details and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{user.name || 'No name provided'}</p>
                  <p className="text-sm text-muted-foreground">Name</p>
                </div>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground">Email</p>
                </div>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Badge variant={user.account_type === 'super-admin' ? 'default' : 'secondary'}>
                    {user.account_type}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">Account Type</p>
                </div>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatDate(user.created_at)}</p>
                  <p className="text-sm text-muted-foreground">Account Created</p>
                </div>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Badge variant={user.is_deactivated ? 'destructive' : 'outline'}>
                    {user.is_deactivated ? 'Deactivated' : 'Active'}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">Account Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Usage Information</CardTitle>
              <CardDescription>AI usage statistics and language settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{user.total_tokens_used?.toLocaleString() || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">Total Tokens Used</p>
                </div>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatCurrency(user.total_cost)}</p>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                </div>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{user.primary_language || 'Not set'}</p>
                  <p className="text-sm text-muted-foreground">Primary Language</p>
                </div>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{user.target_language || 'Not set'}</p>
                  <p className="text-sm text-muted-foreground">Target Language</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                >
                  <Link href={`/admin/ai/logs/${user.id}`}>
                    View AI Usage Logs
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user and all associated data.
              {user && (
                <div className="mt-2 p-2 bg-muted rounded-md">
                  <p className="font-medium">{user.name || user.email}</p>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 