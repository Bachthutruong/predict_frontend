import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Shield, 
  Users, 
  Trophy, 
  MessageSquare, 
  // Calendar,
  // TrendingUp,
  RefreshCw,
  // Coins,
  Activity,
  // CheckCircle
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import apiService from '../../services/api';
import { Link } from 'react-router-dom';

interface StaffStats {
  totalUsers: number;
  totalPredictions: number;
  activePredictions: number;
  pendingFeedback: number;
  thisMonthUsers: number;
  thisMonthPredictions: number;
  recentActivity: any[];
}

const StaffDashboard: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStaffStats();
  }, []);

  const loadStaffStats = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get('/staff/dashboard-stats');
      const statsData = response.data?.data || response.data || {};
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load staff stats:', error);
      setStats(null);
      toast({
        title: t('common.error'),
        description: t('staff.failedToLoadStats'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStaffStats();
    setRefreshing(false);
    toast({
      title: t('staff.dashboardUpdated'),
      description: t('staff.statsRefreshed'),
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
            {t('staff.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('staff.manageUserInteractions')}
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
            <span className="text-sm font-medium">{stats?.totalUsers || 0} {t('staff.users')}</span>
            <span className="text-xs text-gray-400">+{stats?.thisMonthUsers || 0} {t('staff.thisMonth')}</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700">
            <Trophy className="h-3 w-3" />
            <span className="text-sm font-medium">{stats?.totalPredictions || 0} {t('staff.predictions')}</span>
            <span className="text-xs text-blue-400">{stats?.activePredictions || 0} {t('staff.active')}</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-orange-50 border-orange-200 text-orange-700">
            <MessageSquare className="h-3 w-3" />
            <span className="text-sm font-medium">{stats?.pendingFeedback || 0} {t('staff.pendingReviews')}</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-green-50 border-green-200 text-green-700">
            <Activity className="h-3 w-3" />
            <span className="text-sm font-medium">{stats?.recentActivity?.length || 0} {t('staff.recentActivity')}</span>
          </Badge>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t('staff.recentActivity')}</CardTitle>
          <CardDescription>{t('staff.latestUserActivity')}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{activity.description}</h4>
                      <p className="text-sm text-gray-500">
                        {t('staff.by')} {activity.userName} • {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={activity.type === 'prediction' ? 'default' : 'secondary'}>
                    {t(`staff.${activity.type}`)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('staff.noRecentActivity')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('staff.quickActions')}</CardTitle>
          <CardDescription>{t('staff.commonTasks')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link 
              to="/staff/users"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium">{t('staff.manageUsers')}</h4>
                <p className="text-sm text-gray-500">{t('staff.viewUserProfiles')}</p>
              </div>
            </Link>

            <Link 
              to="/staff/predictions"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Trophy className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium">{t('staff.viewPredictions')}</h4>
                <p className="text-sm text-gray-500">{t('staff.monitorUserPredictions')}</p>
              </div>
            </Link>

            <Link 
              to="/staff/questions"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="h-8 w-8 text-orange-600" />
              <div>
                <h4 className="font-medium">{t('staff.answerQuestions')}</h4>
                <p className="text-sm text-gray-500">{t('staff.helpUserQuestions')}</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard; 