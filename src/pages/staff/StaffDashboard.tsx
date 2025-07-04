import React, { useState, useEffect } from 'react';
import { staffAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import { 
  Users, 
  Trophy,
  HelpCircle,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Shield,
  RefreshCw
} from 'lucide-react';

interface StaffStats {
  totalUsers: number;
  verifiedUsers: number;
  activePredictions: number;
  activeQuestions: number;
  pendingFeedback: number;
  thisMonthUsers: number;
  topUsers: Array<{
    id: string;
    name: string;
    email: string;
    points: number;
    consecutiveCheckIns: number;
  }>;
}

const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await staffAPI.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <p className="text-muted-foreground mt-2">Unable to load dashboard data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-primary flex-shrink-0" />
            <span className="truncate">Staff Dashboard</span>
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1 lg:mt-2">
            Monitor user activity, predictions, and system health
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm" className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.verifiedUsers} verified • {stats.totalUsers - stats.verifiedUsers} unverified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePredictions}</div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeQuestions}</div>
            <p className="text-xs text-muted-foreground">
              Daily check-in questions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthUsers}</div>
            <p className="text-xs text-muted-foreground">
              New user registrations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">User Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Verified Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.verifiedUsers}</span>
                  <Badge variant="outline" className="text-green-600">
                    {stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Pending Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.totalUsers - stats.verifiedUsers}</span>
                  <Badge variant="secondary">
                    {stats.totalUsers > 0 ? Math.round(((stats.totalUsers - stats.verifiedUsers) / stats.totalUsers) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="font-medium">Growth Trend</span>
                </div>
                <p className="text-muted-foreground">
                  {stats.thisMonthUsers} new users this month
                </p>
              </div>
              
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">Predictions</span>
                </div>
                <p className="text-muted-foreground">
                  {stats.activePredictions} active predictions
                </p>
              </div>
              
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <HelpCircle className="h-3 w-3 text-purple-500" />
                  <span className="font-medium">Questions</span>
                </div>
                <p className="text-muted-foreground">
                  {stats.activeQuestions} active questions available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/staff/users'}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/staff/predictions'}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Review Predictions
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/staff/questions'}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Manage Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users by Points */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users by Points</CardTitle>
          <CardDescription>Users with the highest point totals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topUsers && stats.topUsers.length > 0 ? (
              stats.topUsers.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-medium">{user.points} points</p>
                    <p className="text-xs text-muted-foreground">
                      {user.consecutiveCheckIns || 0} day streak
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No users found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard; 