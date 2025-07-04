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

const CheckInPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    pointsEarned?: number;
    isCorrect?: boolean;
    correctAnswer?: string;
  } | null>(null);

  useEffect(() => {
    fetchQuestion();
  }, []);

  const fetchQuestion = async () => {
    try {
      const response = await checkInAPI.getQuestion();
      if (response.success && response.data) {
        setQuestion(response.data);
      } else {
        setQuestion(null);
      }
    } catch (error) {
      console.error('Failed to fetch question:', error);
      setQuestion(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !answer.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await checkInAPI.submit({
        questionId: question.id,
        answer: answer.trim()
      });
      
      if (response.success) {
        setResult({
          success: true,
          ...response.data
        });
        setHasCheckedInToday(true);
        
        // Refresh user data to update points and streak
        await refreshUser();
        
        toast({
          title: response.data?.isCorrect ? "Correct Answer! 🎉" : "Answer Submitted",
          description: response.data?.isCorrect 
            ? `Great job! You earned ${response.data.pointsEarned} points!`
            : `You earned ${response.data?.pointsEarned} points. The correct answer was: ${response.data?.correctAnswer}`
        });
      } else {
        setResult({
          success: false,
          message: response.message || 'Failed to submit answer'
        });
        
        toast({
          title: "Error",
          description: response.message || 'Failed to submit answer',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Check-in error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      
      if (errorMessage.includes('Already checked in')) {
        setHasCheckedInToday(true);
        setResult({
          success: false,
          message: "You've already checked in today!"
        });
      } else {
        setResult({
          success: false,
          message: errorMessage
        });
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
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
            Daily Check-in
          </h1>
          <p className="text-muted-foreground mt-2">Loading today's question...</p>
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

  // Already checked in today
  if (hasCheckedInToday || (result && result.success)) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            Daily Check-in
          </h1>
          <p className="text-muted-foreground mt-2">You've completed today's check-in!</p>
        </div>

        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Check-in Complete!</h2>
            <p className="text-muted-foreground mb-4">
              You've already checked in today. Come back tomorrow to continue your streak!
            </p>
            <Badge variant="outline" className="text-green-600">
              Streak: {user?.consecutiveCheckIns || 0} days
            </Badge>
            
            {result && result.pointsEarned && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Points earned today</p>
                <p className="text-2xl font-bold text-primary">+{result.pointsEarned}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          Daily Check-in
        </h1>
        <p className="text-muted-foreground mt-2">
          Answer today's question to earn points and maintain your streak!
        </p>
      </div>

      {/* Current Streak */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Current Streak</h3>
              <p className="text-2xl font-bold text-primary">{user?.consecutiveCheckIns || 0} days</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Keep it up!</p>
              <p className="text-sm text-muted-foreground">Next milestone at 7 days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Alert */}
      {result && !result.success && (
        <Alert variant="destructive">
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      {/* Question */}
      {question ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Question
            </CardTitle>
            <CardDescription>
              Answer correctly to earn {question.points} points
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
                <Label htmlFor="answer">Your Answer</Label>
                <Input
                  id="answer"
                  type="text"
                  placeholder="Enter your answer..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  💡 <strong>Tip:</strong> Take your time and think carefully!
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !answer.trim()}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Answer'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-10">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">No Question Available</h2>
            <p className="text-muted-foreground">
              There's no question available for today. Please check back later!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CheckInPage; 