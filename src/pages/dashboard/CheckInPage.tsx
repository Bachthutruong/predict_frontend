import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { checkInAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import type { Question } from '../../types';
import { AuthModal } from '@/components/auth/AuthModal';
import { useLanguage } from '../../hooks/useLanguage';

const CheckInPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    pointsEarned?: number;
    isCorrect?: boolean;
    correctAnswer?: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      checkTodayStatus();
    } else {
      // For guests, just fetch a question without checking their status
      fetchQuestion(true);
    }
  }, [user]);

  const checkTodayStatus = async () => {
    setIsLoading(true);
    try {
      // First check if user has already checked in today
      const statusResponse = await checkInAPI.getStatus();
      
      if (statusResponse.success && statusResponse.data?.hasCheckedIn) {
        setHasCheckedInToday(true);
        setResult({
          success: true,
          isCorrect: statusResponse.data?.isCorrect,
          pointsEarned: statusResponse.data?.pointsEarned
        });
        setIsLoading(false);
        return;
      }

      // If not checked in, fetch question
      await fetchQuestion();
    } catch (error) {
      console.error('Failed to check today status:', error);
      setIsLoading(false);
    }
  };

  const fetchQuestion = async (isPublic = false) => {
    try {
      const response = await checkInAPI.getQuestion(isPublic);
      if (response.success && response.data) {
        setQuestion(response.data);
      } else {
        setQuestion(null);
        // Check if it's because user already checked in
        if (response.message?.includes('Already checked in')) {
          setHasCheckedInToday(true);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch question:', error);
      setQuestion(null);
      // Check if error is about already checked in
      if (error.response?.data?.message?.includes('Already checked in')) {
        setHasCheckedInToday(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !answer.trim()) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    console.log('Submitting answer:', answer.trim());
    console.log('Question ID:', question.id);

    setIsSubmitting(true);
    try {
      const response = await checkInAPI.submit({
        questionId: question.id,
        answer: answer.trim()
      });
      
      console.log('Check-in response:', response);
      
      if (response.success) {
        // Only set check-in complete for correct answers
        setResult({
          success: true,
          ...response.data
        });
        setHasCheckedInToday(true);
        
        // Refresh user data to update points and streak
        await refreshUser();
        
        console.log('Check-in result:', {
          isCorrect: response.data?.isCorrect,
          pointsEarned: response.data?.pointsEarned,
          correctAnswer: response.data?.correctAnswer
        });
        
        toast({
          title: t('checkIn.correctAnswer'),
          description: t('checkIn.greatJob', { points: response.data?.pointsEarned }),
          variant: "default"
        });
      } else {
        // Don't set hasCheckedInToday for incorrect answers
        setResult({
          success: false,
          message: response.message || t('checkIn.failedToSubmit')
        });
        
        toast({
          title: t('checkIn.incorrectAnswer'),
          description: response.message || t('checkIn.failedToSubmit'),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Check-in error:', error);
      const errorMessage = error.response?.data?.message || t('checkIn.errorOccurred');

      
      if (errorMessage.includes('Already checked in')) {
        setHasCheckedInToday(true);
        setResult({
          success: false,
          message: t('checkIn.alreadyCheckedIn')
        });
      } else if (errorMessage.includes('Incorrect answer')) {
        // Handle incorrect answer - don't set hasCheckedInToday
        setResult({
          success: false,
          message: errorMessage,
          isCorrect: false
        });
        
        toast({
          title: t('checkIn.incorrectAnswer'),
          description: t('checkIn.tryAgain'),
          variant: "destructive"
        });
        
        // Clear the input for next attempt
        setAnswer('');
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          setResult(null);
        }, 5000);
      } else {
        setResult({
          success: false,
          message: errorMessage
        });
        
        toast({
          title: t('common.error'),
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            {t('checkIn.title')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('checkIn.loadingQuestion')}</p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already checked in today (only for logged-in users)
  if (user && (hasCheckedInToday || (result && result.success))) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            {t('checkIn.title')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('checkIn.completedToday')}</p>
        </div>

        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('checkIn.complete')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('checkIn.comeBackTomorrow')}
            </p>
            <Badge variant="outline" className="text-green-600">
              {t('checkIn.streak')}: {user?.consecutiveCheckIns || 0} {t('checkIn.days')}
            </Badge>
            
            {result && result.pointsEarned !== undefined && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{t('checkIn.pointsEarnedToday')}</p>
                <p className={`text-2xl font-bold ${result.pointsEarned > 0 ? 'text-primary' : 'text-gray-400'}`}>
                  +{result.pointsEarned}
                </p>
                {result.isCorrect !== undefined && (
                  <Badge variant={result.isCorrect ? "default" : "destructive"} className="mt-2">
                    {result.isCorrect ? t('checkIn.correctAnswer') : t('checkIn.incorrectAnswer')}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={checkTodayStatus} />
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          {t('checkIn.title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('checkIn.answerQuestion')}
        </p>
      </div>

      {/* Current Streak (or login prompt for guests) */}
      <Card>
        <CardContent className="p-6">
          {user ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t('checkIn.currentStreak')}</h3>
                <p className="text-2xl font-bold text-primary">{user.consecutiveCheckIns || 0} {t('checkIn.days')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t('checkIn.keepItUp')}</p>
                <p className="text-sm text-muted-foreground">{t('checkIn.nextMilestone')}</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="font-semibold">{t('checkIn.wantToTrack')}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-3">{t('checkIn.loginToSave')}</p>
              <Button onClick={() => setShowAuthModal(true)}>{t('checkIn.loginOrSignUp')}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Alert */}
      {user && result && !result.success && (
        <Alert variant="destructive">
          <AlertDescription>
            {result.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Question */}
      {question && (
        <Card>
          <CardHeader>
            <CardTitle>{t('checkIn.todaysQuestion')}</CardTitle>
            <CardDescription>
              {t('checkIn.answerCorrectly')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                {question.imageUrl && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={question.imageUrl} 
                      alt="Question image"
                      className="w-full max-h-64 object-cover"
                    />
                  </div>
                )}
                
                <div className="text-lg font-medium leading-relaxed">
                  {question.questionText}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">{t('checkIn.yourAnswer')}</Label>
                <Input
                  id="answer"
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={t('checkIn.enterAnswer')}
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !answer.trim()}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('checkIn.submitting')}
                  </>
                ) : (
                  t('checkIn.submitAnswer')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* No question available */}
      {!question && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('checkIn.noQuestion')}</h3>
            <p className="text-muted-foreground">{t('checkIn.tryAgainLater')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CheckInPage; 