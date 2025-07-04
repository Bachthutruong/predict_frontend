import React, { useEffect, useState } from 'react';
import { predictionsAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { PredictionCard } from '../../components/PredictionCard';
import { Trophy, Target, Coins, Activity, RefreshCw } from 'lucide-react';
import type { Prediction } from '../../types';

const PredictionsPage: React.FC = () => {
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
        setPredictions(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load predictions. Please try again.",
          variant: "destructive"
        });
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
      title: "Predictions Updated",
      description: "The predictions list has been refreshed.",
      variant: "default"
    });
  };

  const activePredictions = predictions.filter(p => p.status === 'active');
  const finishedPredictions = predictions.filter(p => p.status === 'finished');

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Active Predictions
          </h1>
          <p className="text-muted-foreground mt-2">Loading predictions...</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
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
            Active Predictions
          </h1>
          <p className="text-muted-foreground mt-2">
            Make your predictions and win points! You can predict multiple times if you have enough points.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediction System</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Available</div>
            <p className="text-xs text-muted-foreground">
              Multiple predictions to choose from
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reward System</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150%</div>
            <p className="text-xs text-muted-foreground">
              Return on correct predictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">How It Works</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="font-medium">1. Pay entry cost</p>
              <p className="text-muted-foreground">2. Make prediction</p>
              <p className="text-muted-foreground">3. Win 150% if correct!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Predictions */}
      {activePredictions.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Active Predictions ({activePredictions.length})</h2>
            <Badge variant="default" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Live
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
            <h3 className="text-xl font-medium mb-2">No Active Predictions</h3>
            <p className="text-muted-foreground mb-6">
              There are no active predictions right now. Check back later for new challenges!
            </p>
            <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Finished Predictions */}
      {finishedPredictions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Recently Finished ({finishedPredictions.length})</h2>
          
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
          <CardTitle>How Predictions Work</CardTitle>
          <CardDescription>Understanding the prediction system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Choose a Prediction</h4>
                  <p className="text-sm text-muted-foreground">
                    Browse available predictions and select one that interests you
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Pay Entry Cost</h4>
                  <p className="text-sm text-muted-foreground">
                    Each prediction requires a certain number of points to participate
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
                  <h4 className="font-medium">Make Your Prediction</h4>
                  <p className="text-sm text-muted-foreground">
                    Submit your answer - you can predict multiple times if you have enough points
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Win Rewards</h4>
                  <p className="text-sm text-muted-foreground">
                    Correct predictions earn 150% of the entry cost in points! Others can still participate even after someone wins.
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