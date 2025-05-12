'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Eye, Ban, UserCheck, Trash2, Search, Info } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  account_type: 'free' | 'paid';
  role: 'user' | 'admin' | 'super_admin';
  isBlocked: boolean;
  isDeactivated: boolean;
  dailyAICallCount: number;
  total_tokens_used: number;
  total_cost: number;
  created_at: string;
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    account_type: 'free',
    role: 'user',
    isBlocked: false,
    isDeactivated: false,
    dailyAICallCount: 7,
    total_tokens_used: 45000,
    total_cost: 0.09,
    created_at: '2023-10-12T14:23:45.678Z'
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    account_type: 'paid',
    role: 'user',
    isBlocked: true,
    isDeactivated: false,
    dailyAICallCount: 25,
    total_tokens_used: 120000,
    total_cost: 0.24,
    created_at: '2023-09-15T09:12:33.456Z'
  },
  {
    id: '3',
    email: 'admin@example.com',
    name: 'Admin User',
    account_type: 'paid',
    role: 'super_admin',
    isBlocked: false,
    isDeactivated: false,
    dailyAICallCount: 12,
    total_tokens_used: 75000,
    total_cost: 0.15,
    created_at: '2023-08-01T08:30:22.123Z'
  },
  {
    id: '4',
    email: 'deactivated@example.com',
    name: 'Deactivated User',
    account_type: 'free',
    role: 'user',
    isBlocked: false,
    isDeactivated: true,
    dailyAICallCount: 0,
    total_tokens_used: 10000,
    total_cost: 0.02,
    created_at: '2023-07-20T16:45:12.789Z'
  },
  {
    id: '5',
    email: 'heavy.user@example.com',
    name: 'Heavy User',
    account_type: 'paid',
    role: 'user',
    isBlocked: false,
    isDeactivated: false,
    dailyAICallCount: 18,
    total_tokens_used: 890000,
    total_cost: 1.78,
    created_at: '2023-05-05T11:22:33.444Z'
  }
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'deactivate' | 'reactivate' | 'delete' | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Simulate API request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, this would make a fetch request
        // const token = localStorage.getItem('adminToken');
        // const response = await fetch(`/api/admin/users?filter=${filterStatus}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const data = await response.json();
        // setUsers(data.users);
        
        // For demo, use mock data
        setUsers(mockUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [filterStatus]);

  useEffect(() => {
    // Filter users based on search query and status filter
    let results = [...users];
    
    // Apply status filter
    if (filterStatus === 'active') {
      results = results.filter(user => !user.isBlocked && !user.isDeactivated);
    } else if (filterStatus === 'blocked') {
      results = results.filter(user => user.isBlocked);
    } else if (filterStatus === 'deactivated') {
      results = results.filter(user => user.isDeactivated);
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        user => 
          user.name.toLowerCase().includes(query) || 
          user.email.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(results);
  }, [users, searchQuery, filterStatus]);

  const handleViewUser = (user: User) => {
    router.push(`/admin/users/${user.id}`);
  };

  const handleDeactivateUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // In a real app, this would make a fetch request
      // const token = localStorage.getItem('adminToken');
      // const response = await fetch(`/api/admin/users/${selectedUser.id}/deactivate`, {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();
      
      // For demo, update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? { ...user, isDeactivated: true } 
            : user
        )
      );
      
      toast.success(`User ${selectedUser.name} has been deactivated`);
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Failed to deactivate user');
    } finally {
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const handleReactivateUser = async () => {
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
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? { ...user, isDeactivated: false, isBlocked: false } 
            : user
        )
      );
      
      toast.success(`User ${selectedUser.name} has been reactivated`);
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast.error('Failed to reactivate user');
    } finally {
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // In a real app, this would make a fetch request
      // const token = localStorage.getItem('adminToken');
      // const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
      //   method: 'DELETE',
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();
      
      // For demo, update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      
      toast.success(`User ${selectedUser.name} has been permanently deleted`);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const confirmAction = () => {
    switch (actionType) {
      case 'deactivate':
        return handleDeactivateUser();
      case 'reactivate':
        return handleReactivateUser();
      case 'delete':
        return handleDeleteUser();
      default:
        setSelectedUser(null);
        setActionType(null);
    }
  };

  const getUserStatusBadge = (user: User) => {
    if (user.isDeactivated) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-500">Deactivated</Badge>;
    }
    if (user.isBlocked) {
      return <Badge variant="outline" className="bg-amber-100 text-amber-700">Blocked</Badge>;
    }
    return <Badge variant="outline" className="bg-green-100 text-green-700">Active</Badge>;
  };

  const getAccountTypeBadge = (type: 'free' | 'paid') => {
    return type === 'paid' 
      ? <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Paid</Badge>
      : <Badge variant="outline">Free</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          View and manage user accounts and access
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage users, their status, and AI usage limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 w-full">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select 
              value={filterStatus} 
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active Users</SelectItem>
                <SelectItem value="blocked">Blocked Users</SelectItem>
                <SelectItem value="deactivated">Deactivated Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <div className="text-center">
                <Info className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No users found matching your criteria</p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>AI Usage</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getAccountTypeBadge(user.account_type)}
                        {user.role === 'super_admin' && (
                          <Badge className="ml-2 bg-sidebar text-sidebar-foreground">Admin</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getUserStatusBadge(user)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Daily: {user.dailyAICallCount} calls</div>
                          <div>Total: {(user.total_tokens_used / 1000).toFixed(1)}k tokens</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        ${user.total_cost.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewUser(user)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user.role !== 'super_admin' && (
                            <>
                              {!user.isDeactivated ? (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="text-amber-600 hover:text-amber-700"
                                      title="Deactivate User"
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setActionType('deactivate');
                                      }}
                                    >
                                      <Ban className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Deactivate User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to deactivate this user? They will no longer be able to access the system.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => {
                                        setSelectedUser(null);
                                        setActionType(null);
                                      }}>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction onClick={confirmAction}>
                                        Deactivate
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              ) : (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="text-green-600 hover:text-green-700"
                                      title="Reactivate User"
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setActionType('reactivate');
                                      }}
                                    >
                                      <UserCheck className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Reactivate User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will reactivate the user account and restore their access to the system.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => {
                                        setSelectedUser(null);
                                        setActionType(null);
                                      }}>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction onClick={confirmAction}>
                                        Reactivate
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-destructive hover:text-destructive/80"
                                    title="Delete User"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setActionType('delete');
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. It will permanently delete the user account and all associated data.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => {
                                      setSelectedUser(null);
                                      setActionType(null);
                                    }}>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={confirmAction}
                                    >
                                      Delete Permanently
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
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
    </div>
  );
} 