import React, { useState, useEffect, useMemo } from 'react';
import { feedbackAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { MessageSquare, Loader2, Send, CheckCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import type { Feedback } from '../../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/auth/AuthModal';
import { useLanguage } from '../../hooks/useLanguage';
import { formatDate } from '../../lib/utils';

const FeedbackPage: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userFeedbacks, setUserFeedbacks] = useState<Feedback[]>([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchUserFeedbacks = async () => {
    setIsLoadingFeedbacks(true);
    try {
      const response = await feedbackAPI.getMy();
      if (response.success && Array.isArray(response.data)) {
        setUserFeedbacks(response.data);
      } else {
        toast({ title: t('common.error'), description: t('feedback.fetchHistoryError'), variant: "destructive" });
      }
    } catch (error) {
      toast({ title: t('common.error'), description: t('feedback.fetchHistoryError'), variant: "destructive" });
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserFeedbacks();
    } else {
      setIsLoadingFeedbacks(false);
      setUserFeedbacks([]);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (feedback.trim().length < 10) {
      toast({
        title: t('feedback.tooShort'),
        description: t('feedback.provideMoreDetail'),
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await feedbackAPI.submit(feedback.trim());
      
      if (response.success) {
        setFeedback('');
        toast({
          title: t('feedback.submitted'),
          description: t('feedback.thankYou'),
        });
        // Refresh feedback list after submission
        fetchUserFeedbacks(); 
      } else {
        toast({
          title: t('common.error'),
          description: response.message || t('feedback.submitError'),
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Feedback submission error:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('feedback.submitError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const approvedFeedbacks = useMemo(() => 
    userFeedbacks.filter(fb => fb.status === 'approved'), 
    [userFeedbacks]
  );
  
  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return approvedFeedbacks.slice(startIndex, startIndex + rowsPerPage);
  }, [approvedFeedbacks, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(approvedFeedbacks.length / rowsPerPage);

  return (
    <div className="space-y-8">
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={fetchUserFeedbacks} />
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          {t('feedback.title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('feedback.shareIdeas')}
        </p>
      </div>

      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('feedback.submitFeedback')}</CardTitle>
          <CardDescription>
            {t('feedback.helpUsImprove')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder={t('feedback.describeIdea')}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              disabled={isLoading}
              className="resize-none"
            />
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {feedback.length}/500 {t('feedback.characters')} ({t('feedback.minimum10')})
              </p>
              
              <Button 
                type="submit" 
                disabled={isLoading || feedback.trim().length < 10}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('feedback.submitting')}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {t('feedback.submitIdea')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Approved Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('feedback.yourApprovedFeedback')}</CardTitle>
          <CardDescription>
            {t('feedback.approvedSuggestions')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!user ? (
             <div className="text-center py-8">
                <p className="text-muted-foreground">{t('feedback.loginToSeeHistory')}</p>
                <Button onClick={() => setShowAuthModal(true)} className="mt-4">{t('auth.login')}</Button>
            </div>
          ) : isLoadingFeedbacks ? (
            <p>{t('feedback.loadingHistory')}</p>
          ) : approvedFeedbacks.length > 0 ? (
            <div className="space-y-4 max-w-[300px] overflow-x-auto md:max-w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('feedback.feedback')}</TableHead>
                    <TableHead className="w-[150px] text-center">{t('feedback.status')}</TableHead>
                    <TableHead className="w-[150px] text-center">{t('feedback.pointsAwarded')}</TableHead>
                    <TableHead className="w-[180px] text-right">{t('feedback.date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFeedbacks.map(fb => (
                    <TableRow key={fb.id}>
                      <TableCell className="max-w-[400px] truncate">{fb.feedbackText}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t('feedback.approved')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-center">{fb.awardedPoints || 0}</TableCell>
                      <TableCell className="text-right">{formatDate(fb.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t('feedback.rowsPerPage')}:</span>
                  <Select value={String(rowsPerPage)} onValueChange={value => setRowsPerPage(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20].map(val => (
                        <SelectItem key={val} value={String(val)}>{val}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {t('feedback.page')} {currentPage} {t('feedback.of')} {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      {t('common.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('feedback.noApprovedFeedback')}</p>
              <p className="text-sm text-gray-400">{t('feedback.submitFirstFeedback')}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('feedback.whatLookingFor')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• {t('feedback.newCategories')}</li>
              <li>• {t('feedback.userInterface')}</li>
              <li>• {t('feedback.newFeatures')}</li>
              <li>• {t('feedback.bugReports')}</li>
              <li>• {t('feedback.anyOtherSuggestions')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('feedback.whatHappensNext')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• {t('feedback.teamReviews')}</li>
              <li>• {t('feedback.mayReachOut')}</li>
              <li>• {t('feedback.goodSuggestions')}</li>
              <li>• {t('feedback.implementedFeatures')}</li>
              <li>• {t('feedback.yourFeedback')}</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>{t('feedback.feedbackGuidelines')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground mb-4">
              {t('feedback.helpUsProcess')}
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-green-600 mb-2">{t('feedback.do')}</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>{t('feedback.beSpecific')}</li>
                  <li>{t('feedback.explainProblem')}</li>
                  <li>{t('feedback.suggestSolutions')}</li>
                  <li>{t('feedback.beConstructive')}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-red-600 mb-2">{t('feedback.dont')}</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>{t('feedback.submitSpam')}</li>
                  <li>{t('feedback.useOffensive')}</li>
                  <li>{t('feedback.submitSameFeedback')}</li>
                  <li>{t('feedback.requestAccountChanges')}</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackPage; 