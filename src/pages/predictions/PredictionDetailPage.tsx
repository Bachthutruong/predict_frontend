import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { 
  Trophy, 
  Coins, 
  Users, 
  // Target, 
  CheckCircle,
  XCircle,
  ArrowLeft,
  Send,
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          {/* Main content skeleton */}
          <div className="h-64 bg-gray-200 rounded"></div>
          
          {/* Stats skeleton */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          
          {/* Form skeleton */}
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Prediction Not Found</h1>
        <p className="text-gray-600 mb-6">
          The prediction you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/predictions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Predictions
          </Link>
        </Button>
      </div>
    );
  }

  const isActive = prediction.status === 'active';
  // const hasWinner = !!prediction.winnerId;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={loadPredictionData} />

      {/* Main Content */}
      <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                  {prediction.title}
                </CardTitle>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  {prediction.pointsCost} points
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image */}
              {prediction.imageUrl && (
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  <img 
                    src={prediction.imageUrl} 
                    alt={prediction.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {prediction.description}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <div className="font-medium">
                    {new Date(prediction.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Entry Cost:</span>
                  <div className="font-medium">{prediction.pointsCost} points</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Prediction Form */}
          {isActive && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Make Your Prediction
                </CardTitle>
                <CardDescription>
                  Submit your answer for a chance to win points! You can predict multiple times.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="Enter your prediction..."
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Cost: {prediction.pointsCost} points • Win: {Math.round(prediction.pointsCost * 1.5)} points
                    </div>
                    <Button type="submit" disabled={isSubmitting || !guess.trim()}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Prediction
                        </>
                      )}
                    </Button>
                  </div>
                </form>
                
                {/* All Predictions moved here */}
                {userPredictions.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                       <h3 className="font-medium flex items-center gap-2">
                         <Users className="h-5 w-5" />
                         All Predictions ({userPredictions.length})
                       </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userPredictions.map((userPrediction) => (
                          <div key={userPrediction.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={userPrediction.user?.avatarUrl || ''} />
                              <AvatarFallback className="text-xs">
                                {userPrediction.user?.name ? getInitials(userPrediction.user.name) : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{userPrediction.user?.name || 'Unknown User'}</p>
                              <p className="text-sm text-gray-700 my-1">
                                "{userPrediction.guess}"
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(userPrediction.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* User's Previous Prediction */}
          {user && currentUserPrediction && (
            <Alert>
              <div className="flex items-center gap-2">
                {currentUserPrediction.isCorrect ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>
                  <strong>Your prediction:</strong> "{currentUserPrediction.guess}"
                  {currentUserPrediction.isCorrect ? (
                    <span className="text-green-700 ml-2">✓ Correct! You won points.</span>
                  ) : (
                    <span className="text-gray-500 ml-2">
                      Keep trying if you have enough points!
                    </span>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>

    </div>
  );
};

export default PredictionDetailPage; 