'use client';

import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { AlertTriangle, ShieldAlert, FileText, Clock, Info } from 'lucide-react';
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

// Mock log data
const mockLogs: SystemLog[] = [
  {
    id: '1',
    type: 'blocked',
    userId: '101',
    userEmail: 'john.smith@example.com',
    userName: 'John Smith',
    reason: 'Daily free limit exceeded (10 requests)',
    timestamp: '2023-10-15T09:32:11.456Z'
  },
  {
    id: '2',
    type: 'deactivation',
    action: 'deactivate',
    userId: '102',
    userEmail: 'emma.wilson@example.com',
    userName: 'Emma Wilson',
    adminId: '1',
    adminEmail: 'admin@example.com',
    adminName: 'Admin User',
    timestamp: '2023-10-14T14:22:45.123Z'
  },
  {
    id: '3',
    type: 'deactivation',
    action: 'reactivate',
    userId: '103',
    userEmail: 'david.jones@example.com',
    userName: 'David Jones',
    adminId: '1',
    adminEmail: 'admin@example.com',
    adminName: 'Admin User',
    timestamp: '2023-10-13T16:45:30.789Z'
  },
  {
    id: '4',
    type: 'blocked',
    userId: '104',
    userEmail: 'sarah.parker@example.com',
    userName: 'Sarah Parker',
    reason: 'Daily paid limit exceeded (50 requests)',
    timestamp: '2023-10-12T10:15:22.345Z'
  },
  {
    id: '5',
    type: 'blocked',
    userId: '105',
    userEmail: 'michael.brown@example.com',
    userName: 'Michael Brown',
    reason: 'Daily free limit exceeded (10 requests)',
    timestamp: '2023-10-11T08:30:15.222Z'
  },
  {
    id: '6',
    type: 'deactivation',
    action: 'deactivate',
    userId: '106',
    userEmail: 'olivia.taylor@example.com',
    userName: 'Olivia Taylor',
    adminId: '1',
    adminEmail: 'admin@example.com',
    adminName: 'Admin User',
    timestamp: '2023-10-10T13:20:45.567Z'
  }
];

export default function LogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logTypeFilter, setLogTypeFilter] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        // Simulate API request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, this would make a fetch request
        // const token = localStorage.getItem('adminToken');
        // const response = await fetch(`/api/admin/logs?type=${logTypeFilter}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const data = await response.json();
        // setLogs(data.logs);
        
        // For demo, use mock data
        setLogs(mockLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
        toast.error('Failed to fetch system logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [logTypeFilter]);

  useEffect(() => {
    // Filter logs based on type
    if (logTypeFilter === 'blocked') {
      setFilteredLogs(logs.filter(log => log.type === 'blocked'));
    } else if (logTypeFilter === 'deactivation') {
      setFilteredLogs(logs.filter(log => log.type === 'deactivation'));
    } else {
      setFilteredLogs(logs);
    }
  }, [logs, logTypeFilter]);

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
        </CardHeader>
        <CardContent>
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
                  {filteredLogs.map((log) => (
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
                            <span className="font-medium">{log.adminName}</span>
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
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Note About This Demo</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-2">
              This log viewer currently displays mock data for demonstration purposes. In a production environment, it would fetch real-time logs from the API endpoints.
            </p>
            <p className="text-muted-foreground">
              The system tracks two main types of events:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li><strong>Blocked Users</strong> - When users exceed their daily AI usage limits based on their account type</li>
              <li><strong>Account Changes</strong> - When admin users manually deactivate or reactivate user accounts</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 