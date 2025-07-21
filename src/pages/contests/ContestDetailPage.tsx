import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { contestAPI } from '../../services/api';
import type { Contest, UserContest } from '../../types';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../../components/auth/AuthModal';
import { format } from 'date-fns';
import { useLanguage } from '../../hooks/useLanguage';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';

const ContestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  
  const [contest, setContest] = useState<Contest | null>(null);
  const [userSubmission, setUserSubmission] = useState<UserContest | null>(null);
  const [userSubmissions, setUserSubmissions] = useState<UserContest[]>([]);
  const [submissions, setSubmissions] = useState<UserContest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  console.log(setCurrentPage);
  const [totalPages, setTotalPages] = useState(1);
  console.log(totalPages);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  // const [limit, setLimit] = useState(10); // New state for page size
  // const [userSubmissionsPage, setUserSubmissionsPage] = useState(1);
  // const [userSubmissionsPageSize, setUserSubmissionsPageSize] = useState(10);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [submissionsPageSize, setSubmissionsPageSize] = useState(10);

  useEffect(() => {
    if (id) {
      fetchContestDetails();
    }
  }, [id]);

  useEffect(() => {
    if (id && contest?.isAnswerPublished) {
      fetchSubmissions();
    }
  }, [id, currentPage, contest?.isAnswerPublished]);

  // Fallback: fetch user history if userSubmissions is empty
  useEffect(() => {
    if (id && userSubmissions.length === 0 && user) {
      (async () => {
        try {
          const response = await contestAPI.getHistory(1, 100);
          if (response && response.data && Array.isArray(response.data.submissions)) {
            const filtered = response.data.submissions.filter((sub: any) => sub.contest?._id === id || sub?.contestId?._id === id);
            if (filtered.length > 0) {
              setUserSubmissions(filtered);
            }
          }
        } catch (e) { /* ignore */ }
      })();
    }
  }, [id, userSubmissions.length, user]);

  const fetchContestDetails = async () => {
    try {
      const response = await contestAPI.getContestDetails(id!, currentPage);
      if (response && response.data) {
        setContest(response.data.contest);
        setUserSubmission(response.data.userSubmission); // keep for backward compatibility
        // Fix: only access userSubmissions if it exists
        if ('userSubmissions' in response.data && Array.isArray((response.data as any).userSubmissions)) {
          setUserSubmissions((response.data as any).userSubmissions);
        } else if (response.data.userSubmission) {
          setUserSubmissions([response.data.userSubmission]);
        } else {
          setUserSubmissions([]);
        }
        setSubmissions(response.data.submissions);
        setTotalPages(response.data.totalPages);
      }
    } catch (error: any) {
      console.error('Error fetching contest details:', error);
      
      // Handle 401 unauthorized error gracefully (should not happen for public endpoint)
      if (error.response?.status === 401) {
        console.warn('Unexpected 401 error for public contest details endpoint');
      }
      
      toast({
        title: 'Error',
        description: 'Failed to fetch contest details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await contestAPI.getContestDetails(id!, currentPage);
      if (response && response.data) {
        setSubmissions(response.data.submissions);
        setTotalPages(response.data.totalPages);
        // Do not set userSubmissions here
      }
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      
      // Handle 401 unauthorized error gracefully (should not happen for public endpoint)
      if (error.response?.status === 401) {
        console.warn('Unexpected 401 error for public contest details endpoint');
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!answer.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an answer',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await contestAPI.submitAnswer(id!, answer.trim());
      if (response && response.data) {
        toast({
          title: 'Success',
          description: 'Answer submitted successfully!',
        });
        setIsSubmitDialogOpen(false);
        setAnswer('');
        // Update user points in context if possible
        if (refreshUser) {
          await refreshUser();
        }
        // Refetch contest details to update history and points
        fetchContestDetails();
      }
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      
      // Handle 401 unauthorized error
      if (error.response?.status === 401) {
        setShowAuthModal(true);
        setIsSubmitDialogOpen(false);
        return;
      }
      
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit answer',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (contest: Contest) => {
    // Lấy giờ hiện tại ở GMT+7
    const now = new Date();
    const nowGMT7 = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const start = new Date(contest.startDate);
    const end = new Date(contest.endDate);
    if (contest.isAnswerPublished) {
      return <Badge variant="secondary">{t('contests.answerPublished')}</Badge>;
    }
    if (nowGMT7 < start) {
      return <Badge variant="outline">{t('contests.upcoming')}</Badge>;
    } else if (nowGMT7 >= start && nowGMT7 <= end) {
      return <Badge variant="default">{t('contests.active')}</Badge>;
    } else {
      return <Badge variant="secondary">{t('contests.ended')}</Badge>;
    }
  };

  const isContestActive = (contest: Contest) => {
    const now = new Date();
    const nowGMT7 = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const startDate = new Date(contest.startDate);
    const endDate = new Date(contest.endDate);
    return nowGMT7 >= startDate && nowGMT7 <= endDate && !contest.isAnswerPublished;
  };
  const canParticipate = (contest: Contest) => {
    return isContestActive(contest) && !userSubmission;
  };

  // Paginated all submissions (for this contest)
  const paginatedSubmissions = submissions.slice(
    (submissionsPage - 1) * submissionsPageSize,
    submissionsPage * submissionsPageSize
  );
  const submissionsTotalPages = Math.ceil(submissions.length / submissionsPageSize) || 1;

  if (loading || !contest) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('contests.loadingContestDetails')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={fetchContestDetails} />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="outline" onClick={() => navigate('/contests')} className="mb-2">
            ← {t('contests.backToContests')}
          </Button>
          <h1 className="text-3xl font-bold">{contest.title}</h1>
        </div>
        <div className="flex gap-2">
          {canParticipate(contest) && (
            <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  {user ? `${contest.pointsPerAnswer} ${t('contests.points')}` : t('contests.loginToParticipate')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('contests.submitYourAnswer')}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="answer">{t('contests.yourAnswer')}</Label>
                    <Input
                      id="answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder={t('contests.enterYourAnswer')}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{t('contests.entryCost')}: {contest.pointsPerAnswer} {t('contests.points')}</p>
                    <p>{t('contests.reward')}: {contest.rewardPoints} {t('contests.points')}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSubmitAnswer} disabled={submitting}>
                      {submitting ? t('contests.submitting') : t('contests.submitAnswer')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Contest Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {t('contests.contestInformation')}
              {getStatusBadge(contest)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">{t('contests.description')}</h3>
                <p className="text-muted-foreground">{contest.description}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">{t('contests.timeline')}</h3>
                <p className="text-sm">
                  <span className="font-medium">{t('contests.startDate')}:</span> {format(new Date(contest.startDate), 'MMM dd, yyyy HH:mm')}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{t('contests.endDate')}:</span> {format(new Date(contest.endDate), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">{t('contests.points')}</h3>
                <p className="text-sm">
                  <span className="font-medium">{t('contests.entryCost')}:</span> {contest.pointsPerAnswer} {t('contests.points')}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{t('contests.reward')}:</span> {contest.rewardPoints} {t('contests.points')}
                </p>
              </div>
              {contest.answer && (
                <div>
                  <h3 className="font-medium mb-2">{t('contests.publishedAnswer')}</h3>
                  <p className="text-sm font-mono bg-muted p-2 rounded">{contest.answer}</p>
                </div>
              )}
            </div>
            {/* Inline answer input for participation */}
            {canParticipate(contest) && (
              <div className="mt-6 flex flex-col md:flex-row items-start md:items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="answer">{t('contests.yourAnswer')}</Label>
                  <Input
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder={t('contests.enterYourAnswer')}
                    disabled={submitting}
                  />
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Button onClick={handleSubmitAnswer} disabled={submitting}>
                    {submitting ? t('contests.submitting') : t('contests.submitAnswer')}
                  </Button>
                </div>
              </div>
            )}
            {contest.imageUrl && (
              <div className="mt-4">
                <img
                  src={contest.imageUrl}
                  alt={contest.title}
                  className="w-48 h-48 object-cover rounded-md"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Submissions (show for all contests, not just when answer is published) */}
        {submissions && submissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('contests.allSubmissions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('contests.yourAnswer')}</TableHead>
                      <TableHead>{t('contests.submittedOnShort')}</TableHead>
                      <TableHead>{t('contests.user')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-mono">{submission.answer}</TableCell>
                        <TableCell>{format(new Date(submission.createdAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                        <TableCell>{
                          (submission.user && typeof submission.user === 'object' && submission.user !== null && 'name' in submission.user)
                            ? (submission.user as any).name
                            : (submission.userId && typeof submission.userId === 'object' && submission.userId !== null && 'name' in submission.userId
                              ? (submission.userId as any).name
                              : t('contests.user'))
                        }</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination and page size selector */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <label htmlFor="submissionsPageSize" className="text-sm">{t('contests.pageSize')}:</label>
                  <select
                    id="submissionsPageSize"
                    className="border rounded px-2 py-1"
                    value={submissionsPageSize}
                    onChange={e => {
                      setSubmissionsPage(1);
                      setSubmissionsPageSize(Number(e.target.value));
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={submissionsPage === 1}
                    onClick={() => setSubmissionsPage(submissionsPage - 1)}
                  >
                    {t('contests.previous')}
                  </Button>
                  <span className="flex items-center px-3">
                    {t('contests.page')} {submissionsPage} {t('contests.of')} {submissionsTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={submissionsPage === submissionsTotalPages}
                    onClick={() => setSubmissionsPage(submissionsPage + 1)}
                  >
                    {t('contests.next')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContestDetailPage; 