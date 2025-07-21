import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { contestAPI } from '../../services/api';
import type { Contest } from '../../types';
import { useToast } from '../../hooks/use-toast';
// import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { useLanguage } from '../../hooks/useLanguage';

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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('contests.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('contests.participateDescription')}
          </p>
        </div>
        {/* Remove global history button */}
      </div>

      <div className="grid gap-4">
        {activeContests.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">{t('contests.noContestsFound')}</p>
            </CardContent>
          </Card>
        ) : (
          activeContests.map((contest) => (
            <Card key={contest.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {contest.title}
                      {getStatusBadge(contest)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {contest.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/contests/${contest.id}`)}
                    >
                      {t('contests.viewDetails')}
                    </Button>
                    {/* Chỉ cho phép bình chọn khi contest đang active và chưa công bố đáp án */}
                    {nowGMT7 >= new Date(contest.startDate) && nowGMT7 <= new Date(contest.endDate) && !contest.isAnswerPublished && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/contests/${contest.id}`)} 
                      >
                        {t('contests.participate')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">{t('contests.startDate')}</span>
                    <br />
                    <span className="text-muted-foreground">
                      {format(new Date(contest.startDate), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">{t('contests.endDate')}</span>
                    <br />
                    <span className="text-muted-foreground">
                      {format(new Date(contest.endDate), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">{t('contests.entryCost')}</span>
                    <br />
                    <span className="text-muted-foreground">{contest.pointsPerAnswer} {t('contests.points')}</span>
                  </div>
                  <div>
                    <span className="font-medium">{t('contests.reward')}</span>
                    <br />
                    <span className="text-muted-foreground">{contest.rewardPoints} {t('contests.points')}</span>
                  </div>
                </div>
                {contest.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={contest.imageUrl}
                      alt={contest.title}
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  </div>
                )}
                {contest.answer && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium mb-1">{t('contests.publishedAnswer')}</p>
                    <p className="text-sm font-mono">{contest.answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ContestsPage; 