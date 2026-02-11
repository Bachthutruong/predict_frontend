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

  const activePredictions = predictions.filter((p: any) => p.isCurrentlyActive === true || (p.status === 'active' && p.isCurrentlyActive === undefined));
  const finishedPredictions = predictions.filter((p: any) => p.status === 'finished' || p.isCurrentlyActive === false);

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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flax-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-regular tracking-tight text-gray-900 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-blue-600" />
            {t('predictions.activePredictions')}
          </h1>
          <p className="text-gray-500 mt-2 text-base">
            {t('predictions.makePredictions')}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="rounded-full px-4 border-gray-200 text-gray-600 hover:bg-gray-50" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-google bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('predictions.predictionSystem')}</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light text-gray-900">{t('predictions.available')}</div>
            <p className="text-xs text-gray-500 mt-1">
              {t('predictions.multiplePredictions')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-google bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('predictions.rewardSystem')}</CardTitle>
            <Coins className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light text-gray-900">150%</div>
            <p className="text-xs text-gray-500 mt-1">
              {t('predictions.returnOnCorrect')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-google bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('predictions.howItWorks')}</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <p className="font-medium text-gray-700">{t('predictions.step1')}</p>
              <p className="text-gray-500">{t('predictions.step2')}</p>
              <div className="h-px bg-gray-100 my-2" />
              <p className="text-gray-500 text-xs">{t('predictions.step3')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Predictions */}
      {activePredictions.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-xl font-medium text-gray-800">{t('predictions.activePredictions')} <span className="text-gray-400 ml-1">({activePredictions.length})</span></h2>
            <Badge variant="default" className="flex items-center gap-1.5 bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
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
        <Card className="border-none shadow-google">
          <CardContent className="text-center py-16">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">{t('predictions.noActivePredictions')}</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {t('predictions.checkBackLater')}
            </p>
            <Button onClick={handleRefresh} variant="outline" className="rounded-full px-6 border-gray-200" disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {t('predictions.refreshNow')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Finished Predictions */}
      {finishedPredictions.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-gray-100">
          <h2 className="text-xl font-medium text-gray-800">{t('predictions.recentlyFinished')} <span className="text-gray-400 ml-1">({finishedPredictions.length})</span></h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {finishedPredictions.slice(0, 6).map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <Card className="border-none shadow-google bg-white overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-lg font-medium text-gray-900">{t('predictions.howPredictionsWork')}</CardTitle>
          <CardDescription>{t('predictions.understandingSystem')}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { i: 1, title: t('predictions.choosePrediction'), desc: t('predictions.browseAvailable'), color: 'bg-blue-600' },
              { i: 2, title: t('predictions.payEntryCost'), desc: t('predictions.requiresPoints'), color: 'bg-red-500' },
              { i: 3, title: t('predictions.makePrediction'), desc: t('predictions.submitAnswer'), color: 'bg-yellow-500' },
              { i: 4, title: t('predictions.waitForResult'), desc: t('predictions.correctAnswer'), color: 'bg-green-600' }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className={`w-10 h-10 ${step.color} text-white rounded-full flex items-center justify-center text-lg font-bold shadow-sm mb-4`}>
                  {step.i}
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-5 left-14 right-0 h-0.5 bg-gray-100" />
                )}
                <h4 className="font-medium text-gray-900 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionsPage; 