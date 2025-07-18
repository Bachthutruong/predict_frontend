import React, { useEffect, useState } from 'react';
import { predictionsAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { PredictionCard } from '../../components/PredictionCard';
import { Trophy, Target, Coins, Activity, RefreshCw } from 'lucide-react';
import type { Prediction } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

const PredictionsPage: React.FC = () => {
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
        setPredictions(response.data);
      } else {
        toast({
          title: t('common.error'),
          description: t('predictions.loadError'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
      toast({
        title: t('common.error'),
        description: t('predictions.loadError'),
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
      title: t('predictions.updated'),
      description: t('predictions.refreshed'),
      variant: "default"
    });
  };

  const activePredictions = predictions.filter(p => p.status === 'active');
  const finishedPredictions = predictions.filter(p => p.status === 'finished');

  // Skeleton loading component
  const SkeletonCard = () => (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            {t('predictions.activePredictions')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('predictions.loading')}</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            {t('predictions.activePredictions')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('predictions.makePredictions')}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('predictions.predictionSystem')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t('predictions.available')}</div>
            <p className="text-xs text-muted-foreground">
              {t('predictions.multiplePredictions')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('predictions.rewardSystem')}</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150%</div>
            <p className="text-xs text-muted-foreground">
              {t('predictions.returnOnCorrect')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('predictions.howItWorks')}</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="font-medium">{t('predictions.step1')}</p>
              <p className="text-muted-foreground">{t('predictions.step2')}</p>
              <p className="text-muted-foreground">{t('predictions.step3')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Predictions */}
      {activePredictions.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t('predictions.activePredictions')} ({activePredictions.length})</h2>
            <Badge variant="default" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {t('predictions.live')}
            </Badge>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activePredictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-16">
            <Activity className="h-16 w-16 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">{t('predictions.noActivePredictions')}</h3>
            <p className="text-muted-foreground mb-6">
              {t('predictions.checkBackLater')}
            </p>
            <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {t('predictions.refreshNow')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Finished Predictions */}
      {finishedPredictions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('predictions.recentlyFinished')} ({finishedPredictions.length})</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {finishedPredictions.slice(0, 6).map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>{t('predictions.howPredictionsWork')}</CardTitle>
          <CardDescription>{t('predictions.understandingSystem')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium">{t('predictions.choosePrediction')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('predictions.browseAvailable')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium">{t('predictions.payEntryCost')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('predictions.requiresPoints')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium">{t('predictions.makePrediction')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('predictions.submitAnswer')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h4 className="font-medium">{t('predictions.waitForResult')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('predictions.correctAnswer')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionsPage; 