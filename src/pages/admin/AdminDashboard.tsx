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
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
            <Shield className="h-8 w-8 text-blue-600" />
            {t('admin.title')}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {t('admin.manageAllAspects')}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing} className="bg-white hover:bg-gray-50 border-gray-200">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Stats Grid - Replaced Badges with Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border border-gray-100 shadow-google hover:shadow-google-hover transition-all duration-200 bg-white">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats?.totalUsers || 0}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{t('admin.users')}</div>
            <div className="text-xs text-green-600 flex items-center mt-1 font-medium bg-green-50 px-2 py-0.5 rounded-full">
              +{stats?.thisMonthUsers || 0} {t('admin.thisMonth')}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-google hover:shadow-google-hover transition-all duration-200 bg-white">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
              <Trophy className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats?.totalPredictions || 0}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{t('admin.predictions')}</div>
            <div className="text-xs text-indigo-600 flex items-center mt-1 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
              {stats?.activePredictions || 0} {t('admin.active')}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-google hover:shadow-google-hover transition-all duration-200 bg-white">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center mb-3">
              <Coins className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{(stats?.totalPoints || 0).toLocaleString()}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{t('admin.points')}</div>
            <div className="text-xs text-gray-400 mt-1 font-medium">
              Total Points
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-google hover:shadow-google-hover transition-all duration-200 bg-white">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center mb-3">
              <MessageSquare className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats?.pendingFeedback || 0}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{t('admin.pendingReviews')}</div>
            <div className="text-xs text-orange-600 flex items-center mt-1 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
              Needs Action
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-google hover:shadow-google-hover transition-all duration-200 bg-white">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center mb-3">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats?.totalStaff || 0}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{t('admin.staffMembers')}</div>
            <div className="text-xs text-purple-600 flex items-center mt-1 font-medium bg-purple-50 px-2 py-0.5 rounded-full">
              System Admin
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Predictions - Takes up 2 columns */}
        <Card className="lg:col-span-2 border-0 shadow-google bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-50 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-800">{t('admin.recentPredictions')}</CardTitle>
                <CardDescription className="text-gray-500 mt-1">{t('admin.latestPredictions')}</CardDescription>
              </div>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium" asChild>
                <Link to="/admin/predictions">{t('admin.viewAll')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {stats?.recentPredictions && stats.recentPredictions.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {stats.recentPredictions.slice(0, 5).map((prediction: any) => (
                  <div key={prediction.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{prediction.title}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                          {t('admin.created')} {new Date(prediction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={prediction.status === 'active' ? 'default' : 'secondary'} className={`rounded-full px-3 py-1 ${prediction.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'}`}>
                      {prediction.status === 'active' ? t('admin.active') : t('admin.finished')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                <Package className="h-12 w-12 text-gray-300 mb-3" />
                <p>{t('admin.noPredictionsYet')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - Takes up 1 column */}
        <Card className="border-0 shadow-google bg-white rounded-xl overflow-hidden h-fit">
          <CardHeader className="bg-white border-b border-gray-50 pb-4">
            <CardTitle className="text-xl text-gray-800">{t('admin.quickActions')}</CardTitle>
            <CardDescription className="text-gray-500 mt-1">{t('admin.commonTasks')}</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Link
                to="/admin/predictions"
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-100"
              >
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 group-hover:text-blue-700">{t('admin.managePredictions')}</h4>
                  <p className="text-xs text-gray-500">{t('admin.createEditPredictions')}</p>
                </div>
              </Link>

              <Link
                to="/admin/users"
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-green-50 transition-colors group border border-transparent hover:border-green-100"
              >
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-200 transition-colors">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 group-hover:text-green-700">{t('admin.userManagement')}</h4>
                  <p className="text-xs text-gray-500">{t('admin.viewManageUsers')}</p>
                </div>
              </Link>

              <Link
                to="/admin/feedback"
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-orange-50 transition-colors group border border-transparent hover:border-orange-100"
              >
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-200 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 group-hover:text-orange-700">{t('admin.reviewFeedback')}</h4>
                  <p className="text-xs text-gray-500">{t('admin.approveUserFeedback')}</p>
                </div>
              </Link>

              <Link
                to="/admin/grant-points"
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-yellow-50 transition-colors group border border-transparent hover:border-yellow-100"
              >
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 group-hover:bg-yellow-200 transition-colors">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 group-hover:text-yellow-700">{t('admin.grantPoints')}</h4>
                  <p className="text-xs text-gray-500">{t('admin.awardPointsToUsers')}</p>
                </div>
              </Link>

              <Link
                to="/admin/voting/campaigns"
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-purple-50 transition-colors group border border-transparent hover:border-purple-100"
              >
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors">
                  <Vote className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 group-hover:text-purple-700">{t('admin.manageVoting')}</h4>
                  <p className="text-xs text-gray-500">{t('admin.createVotingCampaigns')}</p>
                </div>
              </Link>

              <Link
                to="/admin/orders"
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-indigo-50 transition-colors group border border-transparent hover:border-indigo-100"
              >
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 group-hover:text-indigo-700">{t('admin.orderManagement')}</h4>
                  <p className="text-xs text-gray-500">{t('admin.processOrders')}</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard; 