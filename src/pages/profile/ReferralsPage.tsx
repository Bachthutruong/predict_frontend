import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { 
  Gift, 
  Copy, 
  CheckCircle, 
  Clock, 
  Share2, 
  Users, 
  Trophy, 
  Coins,
  Target,
  Flame
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import apiService from '../../services/api';
import type { User, Referral } from '../../types';

interface ReferralsData {
  referrals: Referral[];
  currentUser: User;
}

const ReferralsPage: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [referralsData, setReferralsData] = useState<ReferralsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    loadReferralsData();
  }, []);

  const loadReferralsData = async () => {
    try {
      const response = await apiService.get('/users/referrals');
      // Handle API response structure
      const data = response.data?.data || response.data;
      setReferralsData(data);
    } catch (error) {
      console.error('Failed to load referrals data:', error);
      setReferralsData(null);
      toast({
        title: t('common.error'),
        description: t('referrals.failedToLoadData'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (referralsData?.currentUser?.referralCode) {
      await navigator.clipboard.writeText(referralsData.currentUser.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast({
        title: t('referrals.copied'),
        description: t('referrals.referralCodeCopied'),
        variant: "default"
      });
    }
  };

  const copyReferralLink = async () => {
    if (referralsData?.currentUser?.referralCode) {
      const link = `${window.location.origin}/register?ref=${referralsData.currentUser.referralCode}`;
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({
        title: t('referrals.copied'),
        description: t('referrals.referralLinkCopied'),
        variant: "default"
      });
    }
  };

  const shareReferralLink = async () => {
    if (referralsData?.currentUser?.referralCode && navigator.share) {
      const link = `${window.location.origin}/register?ref=${referralsData.currentUser.referralCode}`;
      try {
        await navigator.share({
          title: t('referrals.joinPredictWin'),
          text: t('referrals.shareMessage'),
          url: link,
        });
        toast({
          title: t('referrals.shared'),
          description: t('referrals.referralLinkShared'),
          variant: "default"
        });
              } catch (error: any) {
          if (error.name !== 'AbortError') {
            copyReferralLink();
          }
        }
    } else {
      copyReferralLink();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!referralsData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-10">
            <p>{t('referrals.unableToLoadData')}</p>
            <Button onClick={loadReferralsData} className="mt-4">
              {t('common.retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { referrals, currentUser } = referralsData;
  const completedReferrals = referrals.filter(r => r.status === 'completed').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
  const nextMilestone = Math.ceil(completedReferrals / 10) * 10;
  const pointsToNextMilestone = nextMilestone - completedReferrals;

  return (
    <div className="max-w-full mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Gift className="h-8 w-8 text-blue-600" />
          {t('referrals.referralProgram')}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('referrals.inviteFriendsDescription')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('referrals.totalReferrals')}</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.length}</div>
            <p className="text-xs text-gray-500">{t('referrals.friendsInvited')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('referrals.successful')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedReferrals}</div>
            <p className="text-xs text-gray-500">{t('referrals.completedReferrals')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('referrals.pending')}</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingReferrals}</div>
            <p className="text-xs text-gray-500">{t('referrals.awaitingCompletion')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('referrals.nextMilestone')}</CardTitle>
            <Target className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{pointsToNextMilestone}</div>
            <p className="text-xs text-gray-500">{t('referrals.referralsTo', { count: nextMilestone })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            {t('referrals.yourReferralCode')}
          </CardTitle>
          <CardDescription>
            {t('referrals.shareCodeToStartEarning')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Referral Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('referrals.referralCode')}</label>
            <div className="flex items-center gap-2">
              <Input
                value={currentUser.referralCode || t('referrals.generating')}
                readOnly
                className="font-mono"
              />
              <Button
                onClick={copyReferralCode}
                size="sm"
                variant="outline"
                disabled={!currentUser.referralCode}
              >
                {copiedCode ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Referral Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('referrals.referralLink')}</label>
            <div className="flex items-center gap-2">
              <Input
                value={`${window.location.origin}/register?ref=${currentUser.referralCode}`}
                readOnly
                className="text-sm"
              />
              <Button
                onClick={copyReferralLink}
                size="sm"
                variant="outline"
                disabled={!currentUser.referralCode}
              >
                {copiedLink ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={shareReferralLink}
                size="sm"
                disabled={!currentUser.referralCode}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Rewards Info */}
          <Alert>
            <Gift className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p><strong>{t('referrals.earn100Points')}</strong> {t('referrals.forEachFriendJoins')}</p>
                <p><strong>{t('referrals.milestoneBonus')}</strong> {t('referrals.get500ExtraPoints')}</p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Milestone Progress */}
      {completedReferrals > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {t('referrals.milestoneProgress')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('referrals.progressToReferrals', { count: nextMilestone })}</span>
                <span className="text-sm text-gray-500">{completedReferrals}/{nextMilestone}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedReferrals % 10) * 10}%` }}
                />
              </div>
              <div className="text-center">
                {pointsToNextMilestone > 0 ? (
                  <p className="text-sm text-gray-500">
                    {t('referrals.moreSuccessfulReferrals', { count: pointsToNextMilestone })} {t('referrals.toEarnBonusPoints')}
                  </p>
                ) : (
                  <p className="text-sm text-green-600">
                    🎉 {t('referrals.milestoneReached')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('referrals.yourReferrals')}
          </CardTitle>
          <CardDescription>
            {t('referrals.trackInvitedFriends')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length > 0 ? (
            <div className="space-y-4">
              {referrals.map((referral) => {
                if (!referral.referredUser) return null;
                
                return (
                  <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(referral.referredUser.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{referral.referredUser.name}</p>
                        <p className="text-sm text-gray-500">
                          {t('referrals.joined')} {new Date(referral.referredUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                        {referral.status === 'completed' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t('referrals.completed')}
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            {t('referrals.pending')}
                          </>
                        )}
                      </Badge>
                      {referral.status === 'completed' ? (
                        <p className="text-xs text-green-600 flex items-center">
                          <Coins className="h-3 w-3 mr-1" />
                          {t('referrals.plus100PointsEarned')}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 flex items-center">
                          <Flame className="h-3 w-3 mr-1" />
                          {t('referrals.checkInProgress', { count: referral.referredUser.consecutiveCheckIns || 0 })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="font-medium mb-2">{t('referrals.noReferralsYet')}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {t('referrals.startInvitingFriends')}
              </p>
              <Button onClick={shareReferralLink} disabled={!currentUser.referralCode}>
                <Share2 className="h-4 w-4 mr-2" />
                {t('referrals.shareYourLink')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>{t('referrals.howReferralsWork')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium">{t('referrals.forYou')}</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">{t('referrals.shareYourCode')}</p>
                    <p className="text-sm text-gray-500">{t('referrals.sendReferralLink')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">{t('referrals.theyJoinStayActive')}</p>
                    <p className="text-sm text-gray-500">{t('referrals.friendRegistersChecksIn')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">{t('referrals.earnRewards')}</p>
                    <p className="text-sm text-gray-500">{t('referrals.get100PointsMilestoneBonuses')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">{t('referrals.forYourFriends')}</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">{t('referrals.registerUsingLink')}</p>
                    <p className="text-sm text-gray-500">{t('referrals.getStartedBonusWelcome')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">{t('referrals.stayActive3Days')}</p>
                    <p className="text-sm text-gray-500">{t('referrals.checkInDailyMaintainStreak')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">{t('referrals.bothEarnRewards')}</p>
                    <p className="text-sm text-gray-500">{t('referrals.continueEarningPredictions')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralsPage; 