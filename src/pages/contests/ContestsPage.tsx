import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { contestAPI } from '../../services/api';
import type { Contest } from '../../types';
import { useToast } from '../../hooks/use-toast';
// import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { useLanguage } from '../../hooks/useLanguage';
import { Trophy } from 'lucide-react';

const ContestsPage: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  // const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await contestAPI.getActiveContests();
      if (response) {
        setContests(response.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching contests:', error);

      // Handle 401 unauthorized error gracefully (should not happen for public endpoint)
      if (error.response?.status === 401) {
        console.warn('Unexpected 401 error for public contests endpoint');
      }

      toast({
        title: 'Error',
        description: 'Failed to fetch contests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  // const isContestActive = (contest: Contest) => {
  //   const now = new Date();
  //   const startDate = new Date(contest.startDate);
  //   const endDate = new Date(contest.endDate);
  //   return now >= startDate && now <= endDate && !contest.isAnswerPublished;
  // };

  // Filter contests active ở FE
  const now = new Date();
  const nowGMT7 = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const activeContests = contests.filter(contest => {
    const start = new Date(contest.startDate);
    const end = new Date(contest.endDate);
    return nowGMT7 >= start && nowGMT7 <= end && !contest.isAnswerPublished;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('contests.loadingContests')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-regular tracking-tight text-gray-900">{t('contests.title')}</h1>
          <p className="text-gray-500 mt-2 text-base">
            {t('contests.participateDescription')}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {activeContests.length === 0 ? (
          <Card className="border-none shadow-google bg-white">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-10 w-10 text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-900">{t('contests.noContestsFound')}</p>
              <p className="text-gray-500 mt-1">{t('contests.checkBackLater')}</p>
            </CardContent>
          </Card>
        ) : (
          activeContests.map((contest) => (
            <Card key={contest.id} className="border-none shadow-google hover:shadow-google-hover transition-all duration-200 bg-white overflow-hidden group">
              <div className="flex flex-col md:flex-row">
                {contest.imageUrl && (
                  <div className="md:w-64 h-48 md:h-auto overflow-hidden relative">
                    <img
                      src={contest.imageUrl}
                      alt={contest.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(contest)}
                    </div>
                  </div>
                )}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <CardTitle className="text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {contest.title}
                        </CardTitle>
                        {!contest.imageUrl && <div className="mb-2">{getStatusBadge(contest)}</div>}
                        <p className="text-gray-500 line-clamp-2 mb-4">
                          {contest.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mt-2">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('contests.startDate')}</span>
                        <p className="text-gray-700 mt-1 font-medium">
                          {format(new Date(contest.startDate), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('contests.endDate')}</span>
                        <p className="text-gray-700 mt-1 font-medium">
                          {format(new Date(contest.endDate), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('contests.entryCost')}</span>
                        <p className="text-red-600 mt-1 font-medium bg-red-50 px-2 py-0.5 rounded-md inline-block">-{contest.pointsPerAnswer} pts</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('contests.reward')}</span>
                        <p className="text-green-600 mt-1 font-medium bg-green-50 px-2 py-0.5 rounded-md inline-block">+{contest.rewardPoints} pts</p>
                      </div>
                    </div>

                    {contest.answer && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">{t('contests.publishedAnswer')}</p>
                        <p className="text-sm font-mono text-blue-900">{contest.answer}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => navigate(`/contests/${contest.id}`)}
                    >
                      {t('contests.viewDetails')}
                    </Button>
                    {/* Chỉ cho phép bình chọn khi contest đang active và chưa công bố đáp án */}
                    {nowGMT7 >= new Date(contest.startDate) && nowGMT7 <= new Date(contest.endDate) && !contest.isAnswerPublished && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-none px-6"
                        onClick={() => navigate(`/contests/${contest.id}`)}
                      >
                        {t('contests.participate')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ContestsPage; 