import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { predictionsAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Trophy, Target, Coins, Calendar, Users, RefreshCw } from 'lucide-react';
import type { Prediction } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await predictionsAPI.getAll();
      if (response.success && response.data) {
        setPredictions(response.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
      toast({
        title: t('common.error'),
        description: t('dashboard.loadPredictionsError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPredictions();
    setRefreshing(false);
    toast({
      title: t('dashboard.updated'),
      description: t('dashboard.refreshed'),
      variant: 'default',
    });
  };

  const stats = [
    {
      title: t('dashboard.yourPoints'),
      value: user?.points || 0,
      icon: Coins,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: t('dashboard.checkInStreak'),
      value: user?.consecutiveCheckIns || 0,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: t('dashboard.totalReferrals'),
      value: user?.totalSuccessfulReferrals || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: t('dashboard.activePredictions'),
      value: predictions.length,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-regular text-gray-800 tracking-tight">
            {t('dashboard.welcomeBack', { name: user?.name?.split(' ')[0] })}
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {t('dashboard.happeningToday')}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="rounded-full px-4 border-gray-200 text-gray-600 hover:bg-gray-50" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-none shadow-google hover:shadow-google-hover transition-all duration-200 bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-2xl font-light text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-full bg-gray-50 border border-gray-100`}>
                  <Icon className={`h-5 w-5 text-gray-700`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-google">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-gray-800">
              <Calendar className="h-5 w-5 text-blue-600" />
              {t('dashboard.dailyCheckIn')}
            </CardTitle>
            <CardDescription className="text-gray-500">
              {t('dashboard.checkInDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium h-10">
              <Link to="/check-in">
                {t('dashboard.completeCheckIn')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-google">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-gray-800">
              <Target className="h-5 w-5 text-blue-600" />
              {t('dashboard.activePredictions')}
            </CardTitle>
            <CardDescription className="text-gray-500">
              {t('dashboard.activePredictionsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full border-gray-200 text-blue-600 hover:bg-blue-50 rounded-lg h-10 font-medium">
              <Link to="/predictions">
                {t('dashboard.viewAllPredictions')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-google overflow-hidden">
        <CardHeader className="border-b border-gray-50 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-gray-800">
                <Trophy className="h-5 w-5 text-blue-600" />
                {t('dashboard.recentPredictions')}
              </CardTitle>
              <CardDescription className="mt-1 text-gray-500">
                {t('dashboard.latestPredictionChallenges')}
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-medium">
              <Link to="/predictions">
                {t('dashboard.viewAll')}
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-400 mt-4 text-sm">{t('dashboard.loadingPredictions')}</p>
            </div>
          ) : predictions.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {predictions.map((prediction) => (
                <div
                  key={prediction.id}
                  className="flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    {prediction.imageUrl ? (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                        <img
                          src={prediction.imageUrl}
                          alt={prediction.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-lg">
                        {prediction.title.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{prediction.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                        {prediction.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600 hover:bg-gray-200">
                          {prediction.pointsCost} {t('dashboard.points')}
                        </Badge>
                        <Badge
                          variant={prediction.status === 'active' ? 'default' : 'secondary'}
                          className={`text-xs font-normal ${prediction.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {t(`predictions.${prediction.status}`)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="text-gray-400 group-hover:text-blue-600">
                    <Link to={`/predictions/${prediction.id}`}>
                      {t('dashboard.viewDetails')} &rarr;
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-900 font-medium">{t('dashboard.noPredictions')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('dashboard.checkBackLater')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage; 