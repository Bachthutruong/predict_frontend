import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Trophy, Clock, CheckCircle, Coins, Image as ImageIcon, Shield } from 'lucide-react';
import apiService from '../../services/api';
import type { Prediction } from '../../types';

interface StaffPredictionCardProps {
  prediction: Prediction;
}

const StaffPredictions: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get('/staff/predictions');
      // Handle API response structure
      const predictionsData = response.data?.data?.predictions || response.data?.predictions || response.data?.data || response.data || [];
      setPredictions(Array.isArray(predictionsData) ? predictionsData : []);
    } catch (error) {
      console.error('Failed to load predictions:', error);
      setPredictions([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activePredictions = predictions.filter(p => p.status === 'active');
  const finishedPredictions = predictions.filter(p => p.status === 'finished');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Staff: View Predictions
          </h1>
          <p className="text-gray-600 mt-2">
            View and monitor all predictions (read-only access)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Trophy className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-xs text-gray-500">All time created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activePredictions.length}</div>
            <p className="text-xs text-gray-500">Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{finishedPredictions.length}</div>
            <p className="text-xs text-gray-500">Finished predictions</p>
          </CardContent>
        </Card>
      </div>

      {/* Predictions List */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active ({activePredictions.length})</TabsTrigger>
          <TabsTrigger value="finished">Finished ({finishedPredictions.length})</TabsTrigger>
          <TabsTrigger value="all">All ({predictions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Predictions</CardTitle>
              <CardDescription>
                Predictions that users can currently participate in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activePredictions.length > 0 ? (
                <div className="space-y-4">
                  {activePredictions.map((prediction) => (
                    <StaffPredictionCard key={prediction.id} prediction={prediction} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No active predictions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finished">
          <Card>
            <CardHeader>
              <CardTitle>Finished Predictions</CardTitle>
              <CardDescription>
                Predictions that have been completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {finishedPredictions.length > 0 ? (
                <div className="space-y-4">
                  {finishedPredictions.map((prediction) => (
                    <StaffPredictionCard key={prediction.id} prediction={prediction} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No finished predictions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Predictions</CardTitle>
              <CardDescription>
                Complete list of all predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictions.length > 0 ? (
                <div className="space-y-4">
                  {predictions.map((prediction) => (
                    <StaffPredictionCard key={prediction.id} prediction={prediction} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No predictions created yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StaffPredictionCard: React.FC<StaffPredictionCardProps> = ({ prediction }) => {
  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg">
      {/* Image */}
      {prediction.imageUrl ? (
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={prediction.imageUrl} 
            alt={prediction.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium line-clamp-1">{prediction.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{prediction.description}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge variant={prediction.status === 'active' ? 'default' : 'secondary'}>
              {prediction.status === 'active' ? (
                <Clock className="h-3 w-3 mr-1" />
              ) : (
                <CheckCircle className="h-3 w-3 mr-1" />
              )}
              {prediction.status}
            </Badge>
            <Badge variant="outline">
              <Coins className="h-3 w-3 mr-1" />
              {prediction.pointsCost}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Created {new Date(prediction.createdAt).toLocaleDateString()}</span>
          <div className="flex items-center gap-4">
            {/* Staff cannot see the answer */}
            <span className="text-gray-500">Answer: Hidden for staff</span>
            {prediction.winnerId && (
              <span className="text-green-600">Winner found!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPredictions; 