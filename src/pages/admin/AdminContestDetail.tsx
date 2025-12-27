import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
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
import { ArrowLeft, Edit, Calendar, Coins, Users, CheckCircle, Trophy, BarChart3, Target } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
// import { Separator } from '../../components/ui/separator';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

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
      return <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">{t('contests.answerPublished')}</Badge>;
    }
    if (nowGMT7 < start) {
      return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">{t('contests.upcoming')}</Badge>;
    } else if (nowGMT7 >= start && nowGMT7 <= end) {
      return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200">{t('contests.active')}</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">{t('contests.ended')}</Badge>;
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
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-lg text-gray-600">{t('contests.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/contests')}
          className="mb-4 pl-0 hover:pl-2 transition-all gap-2 text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('contests.backToContests')}
        </Button>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{contest.title || t('contests.noTitle')}</h1>
            <div className="flex items-center gap-3">
              {getStatusBadge(contest)}
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatUTC(contest.startDate)} - {formatUTC(contest.endDate)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2 bg-white" onClick={() => {
              if (id) {
                navigate(`/admin/contests/${id}/edit`);
              }
            }}>
              <Edit className="h-4 w-4" />
              {t('contests.edit')}
            </Button>

            {!contest.isAnswerPublished && (
              <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                    <CheckCircle className="h-4 w-4" />
                    {t('contests.publishAnswer')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('contests.publishAnswer')}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="answer" className="mb-2 block">{t('contests.correctAnswer')}</Label>
                      <Input
                        id="answer"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={t('contests.enterCorrectAnswer')}
                        className="focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2 text-sm text-gray-500 bg-yellow-50 p-3 rounded-md border border-yellow-100">
                      <p>⚠️ {t('contests.publishWarning') || "Publishing the answer will calculate rewards and cannot be undone."}</p>
                    </div>
                    <div className="flex justify-end gap-3 mt-2">
                      <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>{t('common.cancel')}</Button>
                      <Button onClick={handlePublishAnswer} className="bg-blue-600">{t('contests.publishAnswer')}</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Contest Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-google bg-white h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Trophy className="h-24 w-24 text-blue-600" />
            </div>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                {t('contests.information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t('contests.description')}</h3>
                <p className="text-gray-700 leading-relaxed text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {contest.description || t('contests.noDescription')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('contests.pointsPerAnswer')}</h3>
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="text-lg font-semibold text-gray-900">{contest.pointsPerAnswer}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('contests.rewardPoints')}</h3>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-purple-500" />
                    <span className="text-lg font-semibold text-gray-900">{contest.rewardPoints}</span>
                  </div>
                </div>
              </div>

              {contest.answer && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('contests.publishedAnswer')}</h3>
                  <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-mono font-medium">{contest.answer}</span>
                  </div>
                </div>
              )}

              {contest.imageUrl && (
                <div className="pt-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{t('contests.contestImage')}</h3>
                  <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 max-w-[200px]">
                    <img
                      src={contest.imageUrl}
                      alt={contest.title}
                      className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics Grid */}
          <div className="space-y-6">
            {statistics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                <Card className="border-0 shadow-google bg-white">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{statistics.totalSubmissions}</div>
                    <div className="text-sm text-gray-500 font-medium">{t('contests.totalSubmissions')}</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-google bg-white">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                    <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{statistics.correctSubmissions}</div>
                    <div className="text-sm text-gray-500 font-medium">{t('contests.correctAnswers')}</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-google bg-white">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                    <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3">
                      <Target className="h-5 w-5" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{statistics.accuracyRate}%</div>
                    <div className="text-sm text-gray-500 font-medium">{t('contests.accuracyRate')}</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-google bg-white">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                    <div className="h-10 w-10 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mb-3">
                      <Coins className="h-5 w-5" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{statistics.totalRewardPointsAwarded}</div>
                    <div className="text-sm text-gray-500 font-medium">{t('contests.totalRewardsGiven')}</div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-0 shadow-google bg-white h-full flex items-center justify-center">
                <CardContent className="text-center p-8">
                  <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">{t('contests.loadingStats') || "Loading statistics..."}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Submissions */}
        <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
          <CardHeader className="border-b border-gray-100 bg-white pb-6">
            <CardTitle className="text-xl text-gray-800">{t('contests.submissions')}</CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              {t('contests.totalSubmissions')}: {submissions.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">{t('contests.noSubmissionsFound')}</p>
                <p className="text-sm text-gray-400 mt-1">Wait for users to participate.</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[200px]">{t('contests.user')}</TableHead>
                        <TableHead>{t('contests.yourAnswer')}</TableHead>
                        <TableHead>{t('contests.submittedOnShort')}</TableHead>
                        <TableHead className="text-center">{t('contests.correctness')}</TableHead>
                        <TableHead className="text-right">{t('contests.pointsSpent')}</TableHead>
                        <TableHead className="text-right">{t('contests.rewardEarned')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border border-gray-100 hidden sm:block">
                                <AvatarImage src={submission.user?.avatarUrl} />
                                <AvatarFallback className="bg-blue-50 text-blue-600 text-xs font-medium">
                                  {getInitials(submission.user?.name || 'User')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium text-gray-900 truncate max-w-[120px] sm:max-w-xs">
                                {submission.user && submission.user.name ? submission.user.name : t('contests.user')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-gray-700">{submission.answer}</TableCell>
                          <TableCell className="text-sm text-gray-500">{formatUTC(submission.createdAt)}</TableCell>
                          <TableCell className="text-center">
                            {submission.isCorrect ? (
                              <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                {t('contests.correct')}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200">
                                {t('contests.incorrect')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 font-medium text-gray-900">
                              {submission.pointsSpent}
                              <Coins className="h-3.5 w-3.5 text-yellow-500" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {submission.rewardPointsEarned > 0 ? (
                              <div className="flex items-center justify-end gap-1 font-bold text-green-600">
                                +{submission.rewardPointsEarned}
                                <Trophy className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <label htmlFor="submissionsPageSize" className="text-sm text-gray-600">{t('contests.pageSize')}:</label>
                    <select
                      id="submissionsPageSize"
                      className="border border-gray-200 rounded-md px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none"
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
                        className="h-8 bg-white"
                      >
                        {t('common.previous')}
                      </Button>
                      <span className="flex items-center px-3 text-sm font-medium text-gray-600">
                        {t('common.pageOf', { current: currentPage, total: totalPages })}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="h-8 bg-white"
                      >
                        {t('common.next')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminContestDetail; 