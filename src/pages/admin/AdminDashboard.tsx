import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Trophy, 
  Users, 
  Coins, 
  MessageSquare, 
  Shield, 
  Calendar,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import apiService from '../../services/api';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  totalPredictions: number;
  activePredictions: number;
  totalPoints: number;
  pendingFeedback: number;
  totalStaff: number;
  thisMonthUsers: number;
  thisMonthPredictions: number;
  recentPredictions: any[];
}

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get('/admin/dashboard-stats');
      // Handle API response structure: { success: true, data: {...} }
      const statsData = response.data?.data || response.data || {};
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setStats(null); // Set null on error
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardStats();
    setRefreshing(false);
    toast({
      title: "Dashboard Updated",
      description: "Statistics have been refreshed successfully.",
      variant: "default"
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all aspects of PredictWin
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-gray-500">
              +{stats?.thisMonthUsers || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Trophy className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPredictions || 0}</div>
            <p className="text-xs text-gray-500">
              {stats?.activePredictions || 0} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Coins className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.totalPoints || 0).toLocaleString()}</div>
            <p className="text-xs text-gray-500">
              Points awarded by all users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pendingFeedback || 0}</div>
            <p className="text-xs text-gray-500">
              Feedback awaiting review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.activePredictions || 0}</div>
            <p className="text-xs text-gray-500">Available to predict</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
            <Shield className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.totalStaff || 0}</div>
            <p className="text-xs text-gray-500">Active staff accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.thisMonthPredictions || 0}</div>
            <p className="text-xs text-gray-500">New predictions created</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Predictions</CardTitle>
              <CardDescription>Latest predictions created on the platform</CardDescription>
            </div>
            <Link 
              to="/admin/predictions"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats?.recentPredictions && stats.recentPredictions.length > 0 ? (
            <div className="space-y-4">
              {stats.recentPredictions.map((prediction) => (
                <div key={prediction._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {prediction.imageUrl && (
                      <img 
                        src={prediction.imageUrl} 
                        alt={prediction.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-medium">{prediction.title}</h4>
                      <p className="text-sm text-gray-500">
                        Created {new Date(prediction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={prediction.status === 'active' ? 'default' : 'secondary'}>
                      {prediction.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Coins className="h-3 w-3" />
                      {prediction.pointsCost}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No predictions created yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common admin tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link 
              to="/admin/predictions"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Trophy className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium">Manage Predictions</h4>
                <p className="text-sm text-gray-500">Create and edit predictions</p>
              </div>
            </Link>

            <Link 
              to="/admin/users"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium">User Management</h4>
                <p className="text-sm text-gray-500">View and manage users</p>
              </div>
            </Link>

            <Link 
              to="/admin/feedback"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="h-8 w-8 text-orange-600" />
              <div>
                <h4 className="font-medium">Review Feedback</h4>
                <p className="text-sm text-gray-500">Approve user feedback</p>
              </div>
            </Link>

            <Link 
              to="/admin/grant-points"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Coins className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium">Grant Points</h4>
                <p className="text-sm text-gray-500">Award points to users</p>
              </div>
            </Link>

            <Link 
              to="/admin/staff"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="h-8 w-8 text-indigo-600" />
              <div>
                <h4 className="font-medium">Staff Management</h4>
                <p className="text-sm text-gray-500">Manage staff accounts</p>
              </div>
            </Link>

            <Link 
              to="/admin/questions"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-8 w-8 text-red-600" />
              <div>
                <h4 className="font-medium">Questions</h4>
                <p className="text-sm text-gray-500">Manage daily questions</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard; 