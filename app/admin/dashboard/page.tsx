'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShieldAlert, UserX, Activity, BrainCircuit, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ApiResponse {
  success: boolean;
  status_code: number;
  data: DashboardStats;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  deactivatedUsers: number;
  totalAIRequests: number;
  dailyActiveUsers: number;
}

interface Statistic {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistic[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const apiResponse: ApiResponse = await response.json();
        const data = apiResponse.data;

        const stats: Statistic[] = [
          {
            title: 'Total Users',
            value: data.totalUsers,
            description: 'Registered users in the system',
            icon: <Users className="h-5 w-5" />,
            color: 'from-primary to-primary/70'
          },
          {
            title: 'Active Users',
            value: data.activeUsers,
            description: 'Users who can access the system',
            icon: <Activity className="h-5 w-5" />,
            color: 'from-chart-3 to-chart-3/70'
          },
          {
            title: 'Blocked Users',
            value: data.blockedUsers,
            description: 'Users blocked due to AI usage limits',
            icon: <ShieldAlert className="h-5 w-5" />,
            color: 'from-chart-5 to-chart-5/70'
          },
          {
            title: 'Deactivated Users',
            value: data.deactivatedUsers,
            description: 'Manually deactivated user accounts',
            icon: <UserX className="h-5 w-5" />,
            color: 'from-destructive to-destructive/70'
          },
          {
            title: 'Total AI Requests',
            value: data.totalAIRequests.toLocaleString(),
            description: 'Processed AI requests',
            icon: <BrainCircuit className="h-5 w-5" />,
            color: 'from-chart-2 to-chart-2/70'
          },
          {
            title: 'Daily Active Users',
            value: data.dailyActiveUsers,
            description: 'Users active in the last 24 hours',
            icon: <Clock className="h-5 w-5" />,
            color: 'from-primary to-primary/70'
          }
        ];

        setStatistics(stats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-chart-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of system usage and user statistics
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse dark:border-sidebar-border hover:border-primary/50 transition-all">
              <CardHeader className="h-20 bg-muted/20"></CardHeader>
              <CardContent className="h-20 bg-muted/10"></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statistics.map((stat, index) => (
            <Card 
              key={index} 
              className="dark:border-sidebar-border hover:delve-purple-glow hover:border-primary/50 transition-all duration-300"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full bg-gradient-to-br ${stat.color} text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <CardDescription>{stat.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}     
    </div>
  );
}