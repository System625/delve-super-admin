'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
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
import { toast } from 'sonner';
import { ArrowLeft, Clock, User, FileText, Activity, AlertTriangle, BadgeInfo } from 'lucide-react';

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

interface AILog {
  id: string;
  timestamp: string;
  tokensUsed: number;
  cost: number;
  requestType: string;
}

// Mock user data
const mockUser: User = {
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
};

// Mock AI usage logs
const mockAILogs: AILog[] = [
  {
    id: '101',
    timestamp: '2023-10-15T14:32:45.123Z',
    tokensUsed: 1250,
    cost: 0.0025,
    requestType: 'general'
  },
  {
    id: '102',
    timestamp: '2023-10-15T14:25:12.456Z',
    tokensUsed: 850,
    cost: 0.0017,
    requestType: 'general'
  },
  {
    id: '103',
    timestamp: '2023-10-15T13:45:33.789Z',
    tokensUsed: 1500,
    cost: 0.003,
    requestType: 'code'
  },
  {
    id: '104',
    timestamp: '2023-10-15T12:30:22.345Z',
    tokensUsed: 750,
    cost: 0.0015,
    requestType: 'general'
  },
  {
    id: '105',
    timestamp: '2023-10-15T11:22:11.678Z',
    tokensUsed: 1100,
    cost: 0.0022,
    requestType: 'general'
  },
  {
    id: '106',
    timestamp: '2023-10-15T10:15:55.901Z',
    tokensUsed: 950,
    cost: 0.0019,
    requestType: 'image'
  },
  {
    id: '107',
    timestamp: '2023-10-14T16:40:12.234Z',
    tokensUsed: 1300,
    cost: 0.0026,
    requestType: 'code'
  },
  {
    id: '108',
    timestamp: '2023-10-14T15:33:23.456Z',
    tokensUsed: 880,
    cost: 0.00176,
    requestType: 'general'
  }
];

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const userId = params.id;
  
  const [user, setUser] = useState<User | null>(null);
  const [aiLogs, setAILogs] = useState<AILog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Simulate API request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, these would be fetch requests
        // const token = localStorage.getItem('adminToken');
        // const userResponse = await fetch(`/api/admin/users/${userId}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const userData = await userResponse.json();
        // 
        // const logsResponse = await fetch(`/api/admin/ai/logs/${userId}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const logsData = await logsResponse.json();
        // 
        // setUser(userData.user);
        // setAILogs(logsData.logs);
        
        // For demo, use mock data
        // In a real app, we'd check if the ID matches
        setUser(mockUser);
        setAILogs(mockAILogs);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);
  
  const formatTimestamp = (timestamp: string) => {
    return format(parseISO(timestamp), 'MMM d, yyyy HH:mm');
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
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
          <p className="text-muted-foreground">
            View user information and AI usage logs
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : !user ? (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">User Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested user could not be found or you don&apos;t have permission to view it.
            </p>
            <Button onClick={() => router.push('/admin/users')}>
              Back to Users
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                User Profile
              </CardTitle>
              <CardDescription>Basic user information and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                    <p className="text-base font-medium">{user.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p className="text-base">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                    <p className="text-base capitalize">{user.role}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                    <p className="text-base">{formatTimestamp(user.created_at)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Account Type</h3>
                    <div className="pt-1">{getAccountTypeBadge(user.account_type)}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="pt-1">{getUserStatusBadge(user)}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Daily AI Usage</h3>
                    <p className="text-base">{user.dailyAICallCount} requests today</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Usage</h3>
                    <p className="text-base">{(user.total_tokens_used / 1000).toFixed(1)}k tokens (${user.total_cost.toFixed(2)})</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                AI Usage History
              </CardTitle>
              <CardDescription>Recent AI API calls made by this user</CardDescription>
            </CardHeader>
            <CardContent>
              {aiLogs.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No AI usage records found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            Timestamp
                          </div>
                        </TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Tokens Used</TableHead>
                        <TableHead>Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aiLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {log.requestType}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.tokensUsed.toLocaleString()}</TableCell>
                          <TableCell>${log.cost.toFixed(4)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="mt-4 flex items-center p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
                <BadgeInfo className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">
                  This shows the most recent AI requests. The daily counter resets at midnight UTC.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 