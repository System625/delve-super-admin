'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  Users, 
  ShieldAlert, 
  UserX, 
  Activity, 
  BrainCircuit, 
  Clock, 
  Mail, 
  MessageSquare, 
  ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

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
  totalNewsletterSubscribers?: number;
  totalContactMessages?: number;
}

interface Statistic {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  is_subscribed: boolean;
  created_at: string;
}

interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  message: string;
  created_at: string;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [isNewsletterDialogOpen, setIsNewsletterDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          toast.error('Authentication token not found');
          return;
        }

        // Fetch main dashboard stats
        const statsResponse = await fetch('/api/admin/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const apiResponse: ApiResponse = await statsResponse.json();
        let data = apiResponse.data;

        // Fetch newsletter subscribers
        let newsletterSubscribersData: NewsletterSubscriber[] = [];
        try {
          const newsletterResponse = await fetch('/api/v1/newsletter', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (newsletterResponse.ok) {
            const newsletterData = await newsletterResponse.json();
            if (newsletterData.success) {
              newsletterSubscribersData = Object.values(newsletterData.data) as NewsletterSubscriber[];
              setNewsletterSubscribers(newsletterSubscribersData);
            }
          }
        } catch (error) {
          console.error('Error fetching newsletter subscribers:', error);
        }

        // Fetch contact messages
        let contactMessagesData: ContactMessage[] = [];
        try {
          const contactResponse = await fetch('/api/v1/contact/all', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (contactResponse.ok) {
            const contactData = await contactResponse.json();
            if (contactData.success) {
              contactMessagesData = Object.values(contactData.data) as ContactMessage[];
              setContactMessages(contactMessagesData);
            }
          }
        } catch (error) {
          console.error('Error fetching contact messages:', error);
        }

        // Add the new data to our stats object
        data = {
          ...data,
          totalNewsletterSubscribers: newsletterSubscribersData.length || 0,
          totalContactMessages: contactMessagesData.length || 0
        };

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
          },
          {
            title: 'Newsletter Subscribers',
            value: data.totalNewsletterSubscribers || 0,
            description: 'Total newsletter subscribers',
            icon: <Mail className="h-5 w-5" />,
            color: 'from-chart-4 to-chart-4/70'
          },
          {
            title: 'Contact Messages',
            value: data.totalContactMessages || 0,
            description: 'Total contact form submissions',
            icon: <MessageSquare className="h-5 w-5" />,
            color: 'from-chart-6 to-chart-6/70'
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

  // Format timestamps
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy HH:mm');
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-chart-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of system usage and user statistics
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse dark:border-sidebar-border hover:border-primary/50 transition-all">
              <CardHeader className="h-20 bg-muted/20"></CardHeader>
              <CardContent className="h-20 bg-muted/10"></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              {(stat.title === 'Newsletter Subscribers' || stat.title === 'Contact Messages') && (
                <CardFooter className="pt-0 pb-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (stat.title === 'Newsletter Subscribers') {
                        setIsNewsletterDialogOpen(true);
                      } else {
                        setIsContactDialogOpen(true);
                      }
                    }}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Newsletter Subscribers Dialog */}
      <Dialog open={isNewsletterDialogOpen} onOpenChange={setIsNewsletterDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Newsletter Subscribers</DialogTitle>
            <DialogDescription>
              Complete list of all newsletter subscribers
            </DialogDescription>
          </DialogHeader>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newsletterSubscribers.length > 0 ? (
                newsletterSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      {subscriber.is_subscribed ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Subscribed
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          Unsubscribed
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(subscriber.created_at)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No subscribers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <div className="mt-4 flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Messages Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Form Messages</DialogTitle>
            <DialogDescription>
              Complete list of all contact form submissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {contactMessages.length > 0 ? (
              contactMessages.map((message) => (
                <Card key={message.id} className="mb-4">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-base">{message.first_name} {message.last_name}</CardTitle>
                        <CardDescription>{message.email}</CardDescription>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(message.created_at)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{message.message}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No contact messages found
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}