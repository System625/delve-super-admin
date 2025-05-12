'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShieldAlert, UserX, Activity, Zap, BrainCircuit, MessagesSquare, Clock } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for the dashboard since we're using local storage for auth
const mockStatistics = {
  totalUsers: 245,
  activeUsers: 198,
  blockedUsers: 32,
  deactivatedUsers: 15,
  totalAIRequests: 12468,
  dailyActiveUsers: 87,
  averageRequestsPerUser: 51,
  averageTokensPerRequest: 850
};

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

  // In a real app, this would fetch data from the API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call with a timeout
        await new Promise(resolve => setTimeout(resolve, 800));

        // In a real app, this would be an API call
        // const token = localStorage.getItem('adminToken');
        // const response = await fetch('/api/admin/dashboard', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const data = await response.json();

        // For now, use mock data
        const stats: Statistic[] = [
          {
            title: 'Total Users',
            value: mockStatistics.totalUsers,
            description: 'Registered users in the system',
            icon: <Users className="h-5 w-5" />,
            color: 'from-primary to-primary/70'
          },
          {
            title: 'Active Users',
            value: mockStatistics.activeUsers,
            description: 'Users who can access the system',
            icon: <Activity className="h-5 w-5" />,
            color: 'from-chart-3 to-chart-3/70'
          },
          {
            title: 'Blocked Users',
            value: mockStatistics.blockedUsers,
            description: 'Users blocked due to AI usage limits',
            icon: <ShieldAlert className="h-5 w-5" />,
            color: 'from-chart-5 to-chart-5/70'
          },
          {
            title: 'Deactivated Users',
            value: mockStatistics.deactivatedUsers,
            description: 'Manually deactivated user accounts',
            icon: <UserX className="h-5 w-5" />,
            color: 'from-destructive to-destructive/70'
          },
          {
            title: 'Total AI Requests',
            value: mockStatistics.totalAIRequests.toLocaleString(),
            description: 'Processed AI requests',
            icon: <BrainCircuit className="h-5 w-5" />,
            color: 'from-chart-2 to-chart-2/70'
          },
          {
            title: 'Daily Active Users',
            value: mockStatistics.dailyActiveUsers,
            description: 'Users active in the last 24 hours',
            icon: <Clock className="h-5 w-5" />,
            color: 'from-primary to-primary/70'
          },
          {
            title: 'Avg. Requests Per User',
            value: mockStatistics.averageRequestsPerUser,
            description: 'Average number of AI requests per user',
            icon: <MessagesSquare className="h-5 w-5" />,
            color: 'from-chart-4 to-chart-4/70'
          },
          {
            title: 'Avg. Tokens Per Request',
            value: mockStatistics.averageTokensPerRequest,
            description: 'Average token usage per AI request',
            icon: <Zap className="h-5 w-5" />,
            color: 'from-chart-2 to-chart-2/70'
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

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-chart-2">Note About This Demo</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-2">
              This dashboard currently displays mock data for demonstration purposes. In a production environment, it would fetch real-time statistics from the API endpoints.
            </p>
            <p className="text-muted-foreground">
              The Super Admin dashboard allows you to manage users, monitor AI usage, view system logs, and enforce usage limits. Use the navigation menu to explore different sections.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}