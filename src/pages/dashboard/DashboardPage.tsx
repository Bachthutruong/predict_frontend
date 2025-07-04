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

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
        title: "Error",
        description: "Failed to load predictions. Please try again.",
        variant: "destructive"
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
      title: "Dashboard Updated",
      description: "Your dashboard has been refreshed successfully.",
      variant: "default"
    });
  };

  const stats = [
    {
      title: 'Your Points',
      value: user?.points || 0,
      icon: Coins,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Check-in Streak',
      value: user?.consecutiveCheckIns || 0,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Referrals',
      value: user?.totalSuccessfulReferrals || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Predictions',
      value: predictions.length,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your predictions today.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Check-in
            </CardTitle>
            <CardDescription>
              Complete your daily check-in to earn points and maintain your streak!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/check-in">
                Complete Check-in
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Predictions
            </CardTitle>
            <CardDescription>
              Explore and participate in the latest prediction challenges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/predictions">
                View All Predictions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Predictions
              </CardTitle>
              <CardDescription>
                Latest prediction challenges available
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/predictions">
                View All
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading predictions...</p>
            </div>
          ) : predictions.length > 0 ? (
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <div
                  key={prediction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {prediction.imageUrl && (
                      <img
                        src={prediction.imageUrl}
                        alt={prediction.title}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{prediction.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {prediction.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {prediction.pointsCost} points
                        </Badge>
                        <Badge 
                          variant={prediction.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {prediction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button asChild size="sm">
                    <Link to={`/predictions/${prediction.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No predictions available right now.</p>
              <p className="text-sm text-gray-400">Check back later for new challenges!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage; 