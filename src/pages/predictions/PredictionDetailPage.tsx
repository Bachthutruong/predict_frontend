import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import {
  Trophy,
  Users,
  // Target, 
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  // RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';
import type { Prediction, UserPrediction, User } from '../../types';
import { AuthModal } from '../../components/auth/AuthModal';

interface PredictionDetailsResponse {
  prediction: Prediction;
  userPredictions: (UserPrediction & { user: User })[];
  currentUserPrediction?: UserPrediction;
  currentUserId?: string;
  totalPages: number;
}

const PredictionDetailPage: React.FC = () => {
  const { id: predictionId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  // const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const page = parseInt(searchParams.get('page') || '1');

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [userPredictions, setUserPredictions] = useState<(UserPrediction & { user: User })[]>([]);
  const [currentUserPrediction, setCurrentUserPrediction] = useState<UserPrediction | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  console.log('totalPages', totalPages);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guess, setGuess] = useState('');
  // const [refreshing, setRefreshing] = useState(false);
  // console.log('refreshing', refreshing);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (predictionId) {
      loadPredictionData();
    }
  }, [predictionId, page]);

  const loadPredictionData = async () => {
    if (!predictionId) return;

    setIsLoading(true);
    try {
      const response = await apiService.get(`/predictions/${predictionId}?page=${page}`);
      // Handle API response structure
      const data: PredictionDetailsResponse = response.data?.data || response.data;

      setPrediction(data.prediction);
      setUserPredictions(data.userPredictions || []);
      setCurrentUserPrediction(data.currentUserPrediction || null);
      setTotalPages(data.totalPages || 1);

      // Debug logging
      console.log('Current user:', user);
      console.log('Current user ID:', user?.id);
      console.log('User predictions:', data.userPredictions);
      console.log('First prediction user ID:', data.userPredictions?.[0]?.user?.id);
      console.log('First prediction userId:', data.userPredictions?.[0]?.userId);
      console.log('First prediction userId._id:', (data.userPredictions?.[0]?.userId as any)?._id);
      console.log('ID comparison (old):', user?.id === data.userPredictions?.[0]?.userId);
      console.log('ID comparison (new):', user?.id === getUserId(data.userPredictions?.[0]?.userId));
      console.log('ID types:', typeof user?.id, typeof data.userPredictions?.[0]?.userId);
    } catch (error) {
      console.error('Failed to load prediction:', error);
      setPrediction(null);
      setUserPredictions([]);
      setCurrentUserPrediction(null);
      setTotalPages(0);
      toast({
        title: "Error",
        description: "Failed to load prediction details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!guess.trim() || !predictionId) {
      toast({
        title: "Invalid Input",
        description: "Please enter your prediction before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.post(`/predictions/${predictionId}/submit`, {
        guess: guess.trim()
      });

      // Handle API response structure
      const result = response.data?.data || response.data;

      if (result.isCorrect) {
        toast({
          title: "Correct Prediction! 🎉",
          description: `Congratulations! You earned ${result.bonusPoints || 0} bonus points for the correct answer.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Prediction Submitted!",
          description: "Your prediction has been recorded. Good luck!",
          variant: "default"
        });
      }

      setGuess('');
      await refreshUser(); // Update user points
      loadPredictionData(); // Refresh data
    } catch (error: any) {
      console.error('Submit prediction error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit prediction';
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handlePageChange = (newPage: number) => {
  //   navigate(`/predictions/${predictionId}?page=${newPage}`);
  // };

  // const handleRefresh = async () => {
  //   setRefreshing(true);
  //   await loadPredictionData();
  //   setRefreshing(false);
  // };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserId = (userIdField: string | any) => {
    return typeof userIdField === 'object' ? userIdField._id : userIdField;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-100 rounded w-1/3"></div>
          <div className="h-64 bg-gray-100 rounded-xl"></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-32 bg-gray-100 rounded-xl"></div>
            <div className="h-32 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="h-10 w-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-regular mb-2 text-gray-900">Prediction Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The prediction you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild className="rounded-full px-6">
          <Link to="/predictions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Predictions
          </Link>
        </Button>
      </div>
    );
  }

  const isActive = prediction.status === 'active';

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={loadPredictionData} />

      {/* Navigation */}
      <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-blue-600 transition-colors">
        <Link to="/predictions" className="flex items-center gap-2 text-gray-500 font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to Predictions
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-google bg-white overflow-hidden">
            {prediction.imageUrl && (
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                <img
                  src={prediction.imageUrl}
                  alt={prediction.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex gap-2 mb-3">
                {prediction.status === 'active' ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none font-medium">Active</Badge>
                ) : (
                  <Badge variant="secondary" className="font-medium">Combined</Badge>
                )}
              </div>
              <CardTitle className="text-3xl font-regular text-gray-900 leading-tight">
                {prediction.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
                {prediction.description}
              </div>

              <div className="flex flex-wrap gap-4 text-sm border-t border-gray-50 pt-6">
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                  <span className="text-gray-400">Created:</span>
                  <span className="font-medium">{new Date(prediction.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User's Previous Prediction */}
          {user && currentUserPrediction && (
            <Card className={`border-l-4 ${currentUserPrediction.isCorrect ? 'border-l-green-500' : 'border-l-gray-300'} shadow-google border-none bg-white`}>
              <CardContent className="p-6 flex items-start gap-4">
                <div className={`p-2 rounded-full ${currentUserPrediction.isCorrect ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {currentUserPrediction.isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Your Prediction</h3>
                  <p className="text-gray-600 text-lg mb-2">"{currentUserPrediction.guess}"</p>
                  {currentUserPrediction.isCorrect ? (
                    <p className="text-green-600 font-medium text-sm">
                      Winner! You earned {prediction.rewardPoints || Math.round(prediction.pointsCost * 1.5)} bonus points.
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Submitted on {new Date(currentUserPrediction.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Predictions moved here - Refined List */}
          {userPredictions.length > 0 && (
            <Card className="border-none shadow-google bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-regular">
                  <Users className="h-5 w-5 text-gray-500" />
                  Recent Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userPredictions.map((userPrediction) => (
                    <div key={userPrediction.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src={userPrediction.user?.avatarUrl || ''} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                          {userPrediction.user?.name ? getInitials(userPrediction.user.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {userPrediction.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-gray-600 text-sm truncate mt-0.5">
                          "{userPrediction.guess}"
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(userPrediction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Action */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-google bg-white sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-gray-900">Prediction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-red-50 text-center space-y-1">
                  <div className="text-xs text-red-600 uppercase font-medium tracking-wide">Cost</div>
                  <div className="text-2xl font-bold text-red-700">{prediction.pointsCost}</div>
                  <div className="text-xs text-red-400">Points</div>
                </div>
                <div className="p-4 rounded-xl bg-green-50 text-center space-y-1">
                  <div className="text-xs text-green-600 uppercase font-medium tracking-wide">Reward</div>
                  <div className="text-2xl font-bold text-green-700">{prediction.rewardPoints || Math.round(prediction.pointsCost * 1.5)}</div>
                  <div className="text-xs text-green-400">Points</div>
                </div>
              </div>

              <Separator />

              {isActive && !currentUserPrediction?.isCorrect ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Your Prediction
                    </label>
                    <Input
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="Type your answer..."
                      disabled={isSubmitting}
                      className="w-full bg-white border-gray-200 focus-visible:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Make as many attempts as you like. Each attempt costs {prediction.pointsCost} points.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !guess.trim()}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Prediction
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl">
                  <p className="text-gray-500 font-medium">
                    {!isActive ? "This prediction is closed." : "You've already won!"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PredictionDetailPage; 