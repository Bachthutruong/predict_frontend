import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { contestAPI } from '../../services/api';
import type { UserContest } from '../../types';
import { useToast } from '../../hooks/use-toast';
import { format } from 'date-fns';
import { useLanguage } from '../../hooks/useLanguage';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';

const ContestHistoryPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<UserContest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchHistory();
  }, [currentPage, pageSize]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await contestAPI.getHistory(currentPage, pageSize);
      if (response && response.data) {
        setSubmissions(response.data.submissions);
        setTotalPages(response.data.totalPages);
      }
    } catch (error: any) {
      console.error('Error fetching contest history:', error);
      
      // Handle 401 unauthorized error by redirecting to login
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      
      toast({
        title: 'Error',
        description: 'Failed to fetch contest history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('contests.loadingContestHistory')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container bg-white rounded-lg shadow-md mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="outline" onClick={() => navigate('/contests')} className="mb-2">
            ← {t('contests.backToContests')}
          </Button>
          <h1 className="text-3xl font-bold">{t('contests.history')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('contests.yourParticipationHistory')}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">{t('contests.noContestHistoryFound')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('contests.contest')}</TableHead>
                  <TableHead>{t('contests.submittedOnShort')}</TableHead>
                  <TableHead>{t('contests.yourAnswer')}</TableHead>
                  <TableHead>{t('contests.correctness')}</TableHead>
                  <TableHead>{t('contests.pointsSpent')}</TableHead>
                  <TableHead>{t('contests.rewardEarned')}</TableHead>
                  <TableHead>{t('contests.image')}</TableHead>
                  {/* <TableHead>{t('contests.action')}</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{(submission as any).contest?.title || t('contests.contest')}</TableCell>
                    <TableCell>{format(new Date(submission.createdAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                    <TableCell className="font-mono">{submission.answer}</TableCell>
                    <TableCell>
                      {submission.isCorrect ? (
                        <Badge variant="default">{t('contests.correct')}</Badge>
                      ) : (
                        <Badge variant="secondary">{t('contests.incorrect')}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{submission.pointsSpent}</TableCell>
                    <TableCell>{submission.rewardPointsEarned > 0 ? (
                      <span className="text-green-600 font-semibold">+{submission.rewardPointsEarned}</span>
                    ) : '0'}</TableCell>
                    <TableCell>
                      {(submission as any).contest?.imageUrl && (
                        <img
                          src={(submission as any).contest.imageUrl}
                          alt={(submission as any).contest?.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                    </TableCell>
                    {/* <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/contests/${submission.contestId}`)}
                      >
                        {t('contests.viewContest')}
                      </Button>
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Pagination and page size selector */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-sm">{t('contests.pageSize')}:</label>
                <select
                  id="pageSize"
                  className="border rounded px-2 py-1"
                  value={pageSize}
                  onChange={e => {
                    setCurrentPage(1);
                    setPageSize(Number(e.target.value));
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
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  {t('contests.previous')}
                </Button>
                <span className="flex items-center px-3">
                  {t('contests.page')} {currentPage} {t('contests.of')} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  {t('contests.next')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestHistoryPage; 