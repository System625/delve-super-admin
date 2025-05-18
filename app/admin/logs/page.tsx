'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { AlertTriangle, ShieldAlert, FileText, Clock, Info, Search, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface SystemLog {
  id: string;
  type: 'blocked' | 'deactivation';
  userId: string;
  userEmail: string;
  userName: string;
  reason?: string;
  action?: 'deactivate' | 'reactivate';
  adminId?: string;
  adminEmail?: string;
  adminName?: string;
  timestamp: string;
}

// Define an interface for the API log data
interface ApiLogData {
  id: string;
  user?: {
    id?: string;
    email?: string;
    name?: string;
    is_deactivated?: boolean;
  };
  request?: string;
  response?: string;
  model?: string;
  created_at?: string;
}

// Transform API log data to match our SystemLog interface
const transformLogData = (apiLog: ApiLogData): SystemLog => {
  // Extract user info from the API response
  const user = apiLog.user || {};
  
  // Process the API data into our SystemLog format
  return {
    id: apiLog.id,
    // Determine the log type based on the data
    type: apiLog.request && apiLog.response ? 'blocked' : 'deactivation',
    userId: user.id || '',
    userEmail: user.email || '',
    userName: user.name || 'Unknown User',
    // For blocked logs, we use the model and response information
    reason: apiLog.request ? `API request using ${apiLog.model || 'unknown model'}` : undefined,
    // For deactivation logs, we include action info
    action: user.is_deactivated ? 'deactivate' : 'reactivate',
    // Admin info would be included in a full implementation
    adminId: undefined,
    adminEmail: undefined,
    adminName: undefined,
    timestamp: apiLog.created_at || new Date().toISOString(),
  };
};

export default function LogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams?.get('page') || '1');
  
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [displayedLogs, setDisplayedLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logTypeFilter, setLogTypeFilter] = useState('all');
  const [userIdFilter, setUserIdFilter] = useState<string>('');
  const [isUserLogsDialogOpen, setIsUserLogsDialogOpen] = useState(false);
  const [userLogsInput, setUserLogsInput] = useState('');
  const [isUserLogsLoading, setIsUserLogsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: currentPage,
    per_page: 8,
    total_pages: 0,
  });

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Make a real API request to our endpoint
      const response = await fetch('/api/admin/logs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to fetch logs');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch logs');
      }
      
      // Transform the API response data to match our SystemLog format
      const transformedLogs = Object.values(data.data).map((logItem) => 
        transformLogData(logItem as ApiLogData)
      );
      
      setLogs(transformedLogs);
      
      // Update pagination data
      const totalItems = transformedLogs.length;
      setPagination({
        total: totalItems,
        page: currentPage,
        per_page: 8,
        total_pages: Math.ceil(totalItems / 8)
      });
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch system logs');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  const fetchUserLogs = useCallback(async (userId: string) => {
    setIsUserLogsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Make a real API request to our endpoint for user logs
      const response = await fetch(`/api/admin/logs/user?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to fetch user logs');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch user logs');
      }
      
      // Transform the API response data to match our SystemLog format
      const transformedLogs = Object.values(data.data).map((logItem) => 
        transformLogData(logItem as ApiLogData)
      );
      
      setLogs(transformedLogs);
      
      // Update pagination for user logs
      const totalItems = transformedLogs.length;
      setPagination({
        total: totalItems,
        page: 1, // Reset to first page when viewing user logs
        per_page: 8,
        total_pages: Math.ceil(totalItems / 8)
      });
      
      setUserIdFilter(userId);
      setIsUserLogsDialogOpen(false);
      toast.success(`Showing logs for user ID: ${userId}`);
      
      // Reset URL to first page
      router.push('/admin/logs?page=1');
    } catch (error) {
      console.error('Error fetching user logs:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch user logs');
    } finally {
      setIsUserLogsLoading(false);
    }
  }, [router]);

  const handleSearchUserLogs = () => {
    if (userLogsInput.trim()) {
      fetchUserLogs(userLogsInput.trim());
    }
  };

  const clearUserFilter = () => {
    setUserIdFilter('');
    fetchLogs();
    router.push('/admin/logs?page=1');
  };
  
  const navigateToPage = (page: number) => {
    router.push(`/admin/logs?page=${page}`);
  };

  useEffect(() => {
    if (!userIdFilter) {
      fetchLogs();
    }
  }, [fetchLogs, userIdFilter]);

  useEffect(() => {
    // Filter logs based on type
    if (logTypeFilter === 'blocked') {
      setFilteredLogs(logs.filter(log => log.type === 'blocked'));
    } else if (logTypeFilter === 'deactivation') {
      setFilteredLogs(logs.filter(log => log.type === 'deactivation'));
    } else {
      setFilteredLogs(logs);
    }
    
    // Update pagination for filtered logs
    const totalFilteredItems = filteredLogs.length;
    setPagination(prev => ({
      ...prev,
      total: totalFilteredItems,
      total_pages: Math.ceil(totalFilteredItems / prev.per_page)
    }));
  }, [logs, logTypeFilter, filteredLogs.length]);
  
  // Calculate the logs to display based on pagination
  useEffect(() => {
    const startIndex = (pagination.page - 1) * pagination.per_page;
    const endIndex = startIndex + pagination.per_page;
    setDisplayedLogs(filteredLogs.slice(startIndex, endIndex));
  }, [filteredLogs, pagination.page, pagination.per_page, filteredLogs.length]);

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, yyyy HH:mm');
  };

  const getLogIcon = (log: SystemLog) => {
    if (log.type === 'blocked') {
      return <ShieldAlert className="h-5 w-5 text-amber-600" />;
    }
    
    if (log.type === 'deactivation') {
      if (log.action === 'deactivate') {
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      }
      return <Info className="h-5 w-5 text-green-600" />;
    }
    
    return <FileText className="h-5 w-5" />;
  };

  const getLogTypeBadge = (log: SystemLog) => {
    if (log.type === 'blocked') {
      return <Badge variant="outline" className="bg-amber-100 text-amber-700">Blocked</Badge>;
    }
    
    if (log.type === 'deactivation') {
      if (log.action === 'deactivate') {
        return <Badge variant="outline" className="bg-red-100 text-red-700">Deactivated</Badge>;
      }
      return <Badge variant="outline" className="bg-green-100 text-green-700">Reactivated</Badge>;
    }
    
    return <Badge variant="outline">Unknown</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
        <p className="text-muted-foreground">
          View logs of system events, user blocks, and account deactivations
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Event Logs</CardTitle>
              <CardDescription>
                System events related to user access and AI usage
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {userIdFilter && (
                <Button 
                  variant="outline" 
                  onClick={clearUserFilter}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear User Filter
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => setIsUserLogsDialogOpen(true)}
              >
                <Search className="h-4 w-4 mr-2" />
                User Logs
              </Button>
              <Select 
                value={logTypeFilter} 
                onValueChange={setLogTypeFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter logs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Logs</SelectItem>
                  <SelectItem value="blocked">Blocked Users</SelectItem>
                  <SelectItem value="deactivation">Account Changes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {userIdFilter && (
            <div className="mb-4 p-2 bg-muted rounded-md flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Filtered by User ID: </span>
                <span className="text-sm">{userIdFilter}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearUserFilter}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <div className="text-center">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No logs found</p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        Timestamp
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {getLogIcon(log)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getLogTypeBadge(log)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.userName}</div>
                          <div className="text-sm text-muted-foreground">{log.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.type === 'blocked' && (
                          <div className="text-sm">{log.reason}</div>
                        )}
                        {log.type === 'deactivation' && (
                          <div className="text-sm">
                            {log.action === 'deactivate' 
                              ? 'Account deactivated by admin' 
                              : 'Account reactivated by admin'
                            }:&nbsp;
                            <span className="font-medium">{log.adminName || 'System'}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatTimestamp(log.timestamp)}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && pagination.total_pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing page {pagination.page} of {pagination.total_pages} ({pagination.total} total logs)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.total_pages}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Logs Dialog */}
      <Dialog open={isUserLogsDialogOpen} onOpenChange={setIsUserLogsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search User Logs</DialogTitle>
            <DialogDescription>
              Enter a user ID to view logs for a specific user.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-end gap-2">
            <div className="grid gap-2 flex-1">
              <label htmlFor="user-id" className="text-sm">
                User ID
              </label>
              <Input
                id="user-id"
                value={userLogsInput}
                onChange={(e) => setUserLogsInput(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>
            <Button 
              onClick={handleSearchUserLogs} 
              disabled={!userLogsInput.trim() || isUserLogsLoading}
            >
              {isUserLogsLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 