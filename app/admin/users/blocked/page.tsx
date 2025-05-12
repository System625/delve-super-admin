'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { UserCheck, Eye, ShieldAlert, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface BlockedUser {
  id: string;
  email: string;
  name: string;
  account_type: 'free' | 'paid';
  isBlocked: boolean;
  dailyAICallCount: number;
  blockedAt: string;
  reason: string;
}

// Mock data of blocked users
const mockBlockedUsers: BlockedUser[] = [
  {
    id: '1',
    email: 'user1@example.com',
    name: 'Jane Smith',
    account_type: 'free',
    isBlocked: true,
    dailyAICallCount: 11,
    blockedAt: '2023-10-15T09:32:11.456Z',
    reason: 'Daily free limit exceeded (10 requests)'
  },
  {
    id: '2',
    email: 'user2@example.com',
    name: 'Bob Johnson',
    account_type: 'paid',
    isBlocked: true,
    dailyAICallCount: 52,
    blockedAt: '2023-10-14T15:45:22.789Z',
    reason: 'Daily paid limit exceeded (50 requests)'
  },
  {
    id: '3',
    email: 'user3@example.com',
    name: 'Alice Williams',
    account_type: 'free',
    isBlocked: true,
    dailyAICallCount: 10,
    blockedAt: '2023-10-13T11:23:45.123Z',
    reason: 'Daily free limit exceeded (10 requests)'
  },
  {
    id: '4',
    email: 'user4@example.com',
    name: 'Tom Davis',
    account_type: 'paid',
    isBlocked: true,
    dailyAICallCount: 100,
    blockedAt: '2023-10-12T08:15:33.456Z',
    reason: 'Daily paid limit exceeded (50 requests)'
  }
];

export default function BlockedUsersPage() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<BlockedUser | null>(null);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      setIsLoading(true);
      try {
        // Simulate API request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, this would make a fetch request
        // const token = localStorage.getItem('adminToken');
        // const response = await fetch('/api/admin/users?filter=blocked', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const data = await response.json();
        // setBlockedUsers(data.users);
        
        // For demo, use mock data
        setBlockedUsers(mockBlockedUsers);
      } catch (error) {
        console.error('Error fetching blocked users:', error);
        toast.error('Failed to fetch blocked users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlockedUsers();
  }, []);

  const handleUnblockUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // In a real app, this would make a fetch request
      // const token = localStorage.getItem('adminToken');
      // const response = await fetch(`/api/admin/users/${selectedUser.id}/reactivate`, {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();
      
      // For demo, update local state
      setBlockedUsers(prevUsers => 
        prevUsers.filter(user => user.id !== selectedUser.id)
      );
      
      toast.success(`User ${selectedUser.name} has been unblocked`);
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    } finally {
      setSelectedUser(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), 'MMM d, yyyy HH:mm');
  };

  const getAccountTypeBadge = (type: 'free' | 'paid') => {
    return type === 'paid' 
      ? <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Paid</Badge>
      : <Badge variant="outline">Free</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blocked Users</h1>
        <p className="text-muted-foreground">
          Users who have been automatically blocked due to exceeding AI usage limits
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blocked Users</CardTitle>
          <CardDescription>
            View and manage users who have exceeded their daily AI usage limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <div className="text-center">
                <Info className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No blocked users found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Users are automatically blocked when they exceed their daily AI usage limits
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Blocked Since</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <ShieldAlert className="h-5 w-5 text-amber-600" />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getAccountTypeBadge(user.account_type)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.dailyAICallCount} API calls
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(user.blockedAt)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{user.reason}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-green-600 hover:text-green-700"
                                title="Unblock User"
                                onClick={() => setSelectedUser(user)}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Unblock User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the block from this user and allow them to use AI features again. Their usage counter will be reset.
                                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                                    <strong>Warning:</strong> If they continue using the API today, they may get blocked again 
                                    once they exceed their daily limit.
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setSelectedUser(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={handleUnblockUser}>
                                  Unblock User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button
                            variant="outline"
                            size="icon"
                            title="View User Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">About Automated Blocking</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-3">
              Users are automatically blocked when they exceed their daily AI usage limits:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                <strong>Free users:</strong> Limited to {10} API calls per day
              </li>
              <li>
                <strong>Paid users:</strong> Limits are based on their subscription tier, calculated to ensure their daily usage potential aligns with approximately half of their monthly subscription cost
              </li>
            </ul>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
              <strong>Note:</strong> Usage counters are automatically reset daily at midnight UTC.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 