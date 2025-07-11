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
import apiService from '../../services/api';
import type { User, Referral } from '../../types';

interface ReferralsData {
  referrals: Referral[];
  currentUser: User;
}

const ReferralsPage: React.FC = () => {
  const { toast } = useToast();
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
        title: "Error",
        description: "Failed to load referrals data. Please try again.",
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
        title: "Copied!",
        description: "Referral code copied to clipboard",
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
        title: "Copied!",
        description: "Referral link copied to clipboard",
        variant: "default"
      });
    }
  };

  const shareReferralLink = async () => {
    if (referralsData?.currentUser?.referralCode && navigator.share) {
      const link = `${window.location.origin}/register?ref=${referralsData.currentUser.referralCode}`;
      try {
        await navigator.share({
          title: 'Join PredictWin!',
          text: 'Join me on PredictWin and start earning points by making predictions!',
          url: link,
        });
        toast({
          title: "Shared!",
          description: "Referral link shared successfully",
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
            <p>Unable to load referral data. Please try again.</p>
            <Button onClick={loadReferralsData} className="mt-4">
              Retry
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
          Referral Program
        </h1>
        <p className="text-gray-600 mt-2">
          Invite friends to PredictWin and earn bonus points together!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.length}</div>
            <p className="text-xs text-gray-500">Friends invited</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedReferrals}</div>
            <p className="text-xs text-gray-500">Completed referrals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingReferrals}</div>
            <p className="text-xs text-gray-500">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
            <Target className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{pointsToNextMilestone}</div>
            <p className="text-xs text-gray-500">referrals to {nextMilestone}</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share your unique code or link with friends to start earning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Referral Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Referral Code</label>
            <div className="flex items-center gap-2">
              <Input
                value={currentUser.referralCode || 'Generating...'}
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
            <label className="text-sm font-medium">Referral Link</label>
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
                <p><strong>Earn 100 points</strong> for each friend who joins and checks in for 3 consecutive days.</p>
                <p><strong>Milestone Bonus:</strong> Get 500 extra points for every 10 successful referrals!</p>
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
              Milestone Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress to {nextMilestone} referrals</span>
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
                    {pointsToNextMilestone} more successful referral{pointsToNextMilestone > 1 ? 's' : ''} to earn <strong>500 bonus points!</strong>
                  </p>
                ) : (
                  <p className="text-sm text-green-600">
                    🎉 Milestone reached! You've earned bonus points!
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
            Your Referrals
          </CardTitle>
          <CardDescription>
            Track the status of friends you've invited
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
                          Joined {new Date(referral.referredUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                        {referral.status === 'completed' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                      {referral.status === 'completed' ? (
                        <p className="text-xs text-green-600 flex items-center">
                          <Coins className="h-3 w-3 mr-1" />
                          +100 points earned
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 flex items-center">
                          <Flame className="h-3 w-3 mr-1" />
                          Check-in: {referral.referredUser.consecutiveCheckIns || 0}/3 days
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
              <h3 className="font-medium mb-2">No referrals yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Start inviting friends to earn bonus points!
              </p>
              <Button onClick={shareReferralLink} disabled={!currentUser.referralCode}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Your Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Referrals Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium">For You (Referrer)</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Share your code</p>
                    <p className="text-sm text-gray-500">Send your referral link to friends</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">They join & stay active</p>
                    <p className="text-sm text-gray-500">Friend registers and checks in for 3 days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Earn rewards</p>
                    <p className="text-sm text-gray-500">Get 100 points + milestone bonuses</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">For Your Friends</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Register using your link</p>
                    <p className="text-sm text-gray-500">Get started with bonus welcome points</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Stay active for 3 days</p>
                    <p className="text-sm text-gray-500">Check in daily to maintain streak</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Both earn rewards!</p>
                    <p className="text-sm text-gray-500">Continue earning through predictions</p>
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