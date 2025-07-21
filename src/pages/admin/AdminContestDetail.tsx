import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { adminContestAPI } from '../../services/api';
import type { Contest, UserContest } from '../../types';
import { useToast } from '../../hooks/use-toast';
// import { format } from 'date-fns';
import { useLanguage } from '../../hooks/useLanguage';

const AdminContestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [contest, setContest] = useState<Contest | null>(null);
  const [submissions, setSubmissions] = useState<UserContest[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // const [filter, setFilter] = useState<string>('all');
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [submissionsPageSize, setSubmissionsPageSize] = useState(10);
  console.log('contest:', contest);

  useEffect(() => {
    if (id) {
      fetchContestDetails();
      fetchStatistics();
    }
  }, [id, currentPage, submissionsPageSize]);

  const fetchContestDetails = async () => {
    try {
      const response = await adminContestAPI.getContestById(id!, currentPage, submissionsPageSize);
      // const data = (response.data a;
      // @ts-ignore
      if (response?.data?.contest) {
        // @ts-ignore
        setContest(response.data.contest);
        // @ts-ignore
        setSubmissions(response.data.submissions || []);
        // @ts-ignore
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching contest details:', error);
      toast({
        title: t('common.error'),
        description: t('contests.failedToFetchDetails'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await adminContestAPI.getStatistics(id!);
      if (response.success && response.data) {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handlePublishAnswer = async () => {
    if (!answer.trim()) {
      toast({
        title: t('common.error'),
        description: t('contests.pleaseEnterAnswer'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await adminContestAPI.publishAnswer(id!, answer);
      if (response && response.data) {
        toast({
          title: t('common.success'),
          description: `${t('contests.answerPublished')} ${response.data.correctSubmissions} ${t('contests.correctSubmissionsOutOf')} ${response.data.totalSubmissions} ${t('contests.totalSubmissions')}.`,
        });
        setIsPublishDialogOpen(false);
        setAnswer('');
        fetchContestDetails();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error publishing answer:', error);
      toast({
        title: t('common.error'),
        description: t('contests.failedToPublishAnswer'),
        variant: 'destructive',
      });
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

  // Thay thế hàm formatLocalDatetime bằng formatUTC
  const formatUTC = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} ${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
  };

  if (loading || !contest) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('contests.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="outline" onClick={() => navigate('/admin/contests')} className="mb-2">
            {t('contests.backToContests')}
          </Button>
          <h1 className="text-3xl font-bold">{contest.title || t('contests.noTitle')}</h1>
        </div>
        <div className="flex gap-2">
          {!contest.isAnswerPublished && (
            <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">{t('contests.publishAnswer')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('contests.publishAnswer')}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="answer">{t('contests.correctAnswer')}</Label>
                    <Input
                      id="answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder={t('contests.enterCorrectAnswer')}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>{t('common.cancel')}</Button>
                    <Button onClick={handlePublishAnswer}>{t('contests.publishAnswer')}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline" onClick={() => {
            if (id) {
              navigate(`/admin/contests/${id}/edit`);
            } else {
              toast({
                title: t('common.error'),
                description: 'Contest ID not found',
                variant: 'destructive',
              });
            }
          }}>{t('contests.edit')}</Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Contest Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {t('contests.information')}
              {getStatusBadge(contest)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">{t('contests.description')}</h3>
                <p className="text-muted-foreground">{contest.description || t('contests.noDescription')}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">{t('contests.timeline')}</h3>
                <p className="text-sm">
                  <span className="font-medium">{t('contests.startDate')}:</span> {formatUTC(contest.startDate)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{t('contests.endDate')}:</span> {formatUTC(contest.endDate)}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">{t('contests.points')}</h3>
                <p className="text-sm">
                  <span className="font-medium">{t('contests.pointsPerAnswer')}:</span> {contest.pointsPerAnswer}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{t('contests.rewardPoints')}:</span> {contest.rewardPoints}
                </p>
              </div>
              {contest.answer && (
                <div>
                  <h3 className="font-medium mb-2">{t('contests.publishedAnswer')}</h3>
                  <p className="text-sm font-mono bg-muted p-2 rounded">{contest.answer || t('contests.noAnswer')}</p>
                </div>
              )}
            </div>
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

        {/* Statistics */}
        {statistics && (
          <Card>
            <CardHeader>
              <CardTitle>{t('contests.statistics')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{statistics.totalSubmissions}</div>
                  <div className="text-sm text-muted-foreground">{t('contests.totalSubmissions')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{statistics.correctSubmissions}</div>
                  <div className="text-sm text-muted-foreground">{t('contests.correctAnswers')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{statistics.participantCount}</div>
                  <div className="text-sm text-muted-foreground">{t('contests.uniqueParticipants')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{statistics.accuracyRate}%</div>
                  <div className="text-sm text-muted-foreground">{t('contests.accuracyRate')}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{statistics.totalPointsSpent}</div>
                  <div className="text-sm text-muted-foreground">{t('contests.totalPointsSpent')}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{statistics.totalRewardPointsAwarded}</div>
                  <div className="text-sm text-muted-foreground">{t('contests.totalRewardsGiven')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('contests.submissions')}</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{t('contests.noSubmissionsFound')}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('contests.user')}</TableHead>
                      <TableHead>{t('contests.yourAnswer')}</TableHead>
                      <TableHead>{t('contests.submittedOnShort')}</TableHead>
                      <TableHead>{t('contests.correctness')}</TableHead>
                      <TableHead>{t('contests.pointsSpent')}</TableHead>
                      <TableHead>{t('contests.rewardEarned')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>{submission.user && submission.user.name ? submission.user.name : t('contests.user')}</TableCell>
                        <TableCell className="font-mono">{submission.answer}</TableCell>
                        <TableCell>{formatUTC(submission.createdAt)}</TableCell>
                        <TableCell>
                          {submission.isCorrect ? (
                            <Badge variant="default">{t('contests.correct')}</Badge>
                          ) : (
                            <Badge variant="secondary">{t('contests.incorrect')}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{submission.pointsSpent}</TableCell>
                        <TableCell>{submission.rewardPointsEarned > 0 ? (
                          <span className="text-green-600 font-bold">+{submission.rewardPointsEarned}</span>
                        ) : 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {/* Pagination and page size selector */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-2">
                <label htmlFor="submissionsPageSize" className="text-sm">{t('contests.pageSize')}:</label>
                <select
                  id="submissionsPageSize"
                  className="border rounded px-2 py-1"
                  value={submissionsPageSize}
                  onChange={e => {
                    setCurrentPage(1);
                    setSubmissionsPageSize(Number(e.target.value));
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    {t('common.previous')}
                  </Button>
                  <span className="flex items-center px-3">
                    {t('common.pageOf', { current: currentPage, total: totalPages })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminContestDetail; 