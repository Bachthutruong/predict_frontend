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
  // Calendar,
  // TrendingUp,
  RefreshCw,
  Package,
  Vote
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
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
  const { t } = useLanguage();
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
        title: t('common.error'),
        description: t('admin.loadStatsError'),
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
      title: t('admin.dashboardUpdated'),
      description: t('admin.statsRefreshed'),
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
            {t('admin.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('admin.manageAllAspects')}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        {/* Main Stats Row - Badges */}
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-white border-gray-200">
            <Users className="h-3 w-3 text-gray-500" />
            <span className="text-sm font-medium">{stats?.totalUsers || 0} {t('admin.users')}</span>
            <span className="text-xs text-gray-400">+{stats?.thisMonthUsers || 0} {t('admin.thisMonth')}</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700">
            <Trophy className="h-3 w-3" />
            <span className="text-sm font-medium">{stats?.totalPredictions || 0} {t('admin.predictions')}</span>
            <span className="text-xs text-blue-400">{stats?.activePredictions || 0} {t('admin.active')}</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-green-50 border-green-200 text-green-700">
            <Coins className="h-3 w-3" />
            <span className="text-sm font-medium">{(stats?.totalPoints || 0).toLocaleString()} {t('admin.points')}</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-orange-50 border-orange-200 text-orange-700">
            <MessageSquare className="h-3 w-3" />
            <span className="text-sm font-medium">{stats?.pendingFeedback || 0} {t('admin.pendingReviews')}</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-purple-50 border-purple-200 text-purple-700">
            <Shield className="h-3 w-3" />
            <span className="text-sm font-medium">{stats?.totalStaff || 0} {t('admin.staffMembers')}</span>
          </Badge>
        </div>
      </div>

      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.recentPredictions')}</CardTitle>
          <CardDescription>{t('admin.latestPredictions')}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentPredictions && stats.recentPredictions.length > 0 ? (
            <div className="space-y-4">
              {stats.recentPredictions.slice(0, 5).map((prediction: any) => (
                <div key={prediction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{prediction.title}</h4>
                      <p className="text-sm text-gray-500">
                        {t('admin.created')} {new Date(prediction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={prediction.status === 'active' ? 'default' : 'secondary'}>
                    {prediction.status === 'active' ? t('admin.active') : t('admin.finished')}
                  </Badge>
                </div>
              ))}
              <div className="text-center pt-2">
                <Link to="/admin/predictions" className="text-blue-600 hover:underline">
                  {t('admin.viewAll')}
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('admin.noPredictionsYet')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.quickActions')}</CardTitle>
          <CardDescription>{t('admin.commonTasks')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link 
              to="/admin/predictions"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Trophy className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium">{t('admin.managePredictions')}</h4>
                <p className="text-sm text-gray-500">{t('admin.createEditPredictions')}</p>
              </div>
            </Link>

            <Link 
              to="/admin/users"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium">{t('admin.userManagement')}</h4>
                <p className="text-sm text-gray-500">{t('admin.viewManageUsers')}</p>
              </div>
            </Link>

            <Link 
              to="/admin/feedback"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="h-8 w-8 text-orange-600" />
              <div>
                <h4 className="font-medium">{t('admin.reviewFeedback')}</h4>
                <p className="text-sm text-gray-500">{t('admin.approveUserFeedback')}</p>
              </div>
            </Link>

            <Link 
              to="/admin/grant-points"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Coins className="h-8 w-8 text-yellow-600" />
              <div>
                <h4 className="font-medium">{t('admin.grantPoints')}</h4>
                <p className="text-sm text-gray-500">{t('admin.awardPointsToUsers')}</p>
              </div>
            </Link>

            <Link 
              to="/admin/voting/campaigns"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Vote className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium">{t('admin.manageVoting')}</h4>
                <p className="text-sm text-gray-500">{t('admin.createVotingCampaigns')}</p>
              </div>
            </Link>

            <Link 
              to="/admin/orders"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="h-8 w-8 text-indigo-600" />
              <div>
                <h4 className="font-medium">{t('admin.orderManagement')}</h4>
                <p className="text-sm text-gray-500">{t('admin.processOrders')}</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard; 