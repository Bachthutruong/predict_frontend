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
  RefreshCw,
  Package,
  Vote
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
      <div className="space-y-3">
        {/* Main Stats Row - Badges */}
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-white border-gray-200">
            <Users className="h-3 w-3 text-gray-500" />
            <span className="text-sm font-medium">{stats?.totalUsers || 0} Users</span>
            <span className="text-xs text-gray-400">+{stats?.thisMonthUsers || 0} this month</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700">
            <Trophy className="h-3 w-3" />
            <span className="text-sm font-medium">{stats?.totalPredictions || 0} Predictions</span>
            <span className="text-xs text-blue-400">{stats?.activePredictions || 0} active</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-green-50 border-green-200 text-green-700">
            <Coins className="h-3 w-3" />
            <span className="text-sm font-medium">{(stats?.totalPoints || 0).toLocaleString()} Points</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-orange-50 border-orange-200 text-orange-700">
            <MessageSquare className="h-3 w-3" />
            <span className="text-sm font-medium">{stats?.pendingFeedback || 0} Pending Reviews</span>
          </Badge>
        </div>

        {/* Secondary Stats Row - Badges */}
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-emerald-50 border-emerald-200 text-emerald-700">
            <TrendingUp className="h-3 w-3" />
            <span className="text-sm font-medium">{stats?.activePredictions || 0} Active Predictions</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-indigo-50 border-indigo-200 text-indigo-700">
            <Shield className="h-3 w-3" />
            <span className="text-sm font-medium">{stats?.totalStaff || 0} Staff Members</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-purple-50 border-purple-200 text-purple-700">
            <Calendar className="h-3 w-3" />
            <span className="text-sm font-medium">{stats?.thisMonthPredictions || 0} This Month</span>
          </Badge>
        </div>
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

            <Link 
              to="/admin/voting/campaigns"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Vote className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium">Voting Campaigns</h4>
                <p className="text-sm text-gray-500">Manage voting campaigns</p>
              </div>
            </Link>

            <Link 
              to="/admin/orders"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="h-8 w-8 text-emerald-600" />
              <div>
                <h4 className="font-medium">Order Management</h4>
                <p className="text-sm text-gray-500">Manage WooCommerce orders</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard; 