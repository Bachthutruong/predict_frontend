import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
// import { Separator } from '../../components/ui/separator';
import { 
  History,
  Users,
  Gift,
  Copy,
  Share,
  Check,
  TrendingUp,
  Coins,
  User,
  Trophy,
  Activity
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import type { PointTransaction, Referral } from '../../types';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedReferralCode, setCopiedReferralCode] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [transactionsResponse, referralsResponse] = await Promise.all([
        userAPI.getTransactions(),
        userAPI.getReferrals()
      ]);

      if (transactionsResponse.success && transactionsResponse.data) {
        const transactionData = Array.isArray(transactionsResponse.data) 
          ? transactionsResponse.data 
          : [];
        setTransactions(transactionData);
      }

      if (referralsResponse.success && referralsResponse.data) {
        const referralData = Array.isArray(referralsResponse.data) 
          ? referralsResponse.data 
          : [];
        setReferrals(referralData);
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      // Ensure arrays are set even on error
      setTransactions([]);
      setReferrals([]);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (user?.referralCode) {
      const referralUrl = `${window.location.origin}/register?ref=${user.referralCode}`;
      await navigator.clipboard.writeText(referralUrl);
      setCopiedReferralCode(true);
      setTimeout(() => setCopiedReferralCode(false), 2000);
      
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard"
      });
    }
  };

  const shareReferralLink = async () => {
    if (user?.referralCode && navigator.share) {
      const referralUrl = `${window.location.origin}/register?ref=${user.referralCode}`;
      try {
        await navigator.share({
          title: 'Join PredictWin!',
          text: 'I found this awesome prediction game. Join me and let\'s win together!',
          url: referralUrl,
        });
      } catch (error) {
        copyReferralCode();
      }
    } else {
      copyReferralCode();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  // Safe array operations with fallback
  const completedReferrals = Array.isArray(referrals) ? referrals.filter(r => r.status === 'completed').length : 0;
  const pendingReferrals = Array.isArray(referrals) ? referrals.filter(r => r.status === 'pending').length : 0;

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          Profile
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Manage your account, view your progress, and track your referrals
        </p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto sm:mx-0">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-base sm:text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold">{user.name}</h2>
              <p className="text-sm sm:text-base text-muted-foreground">{user.email}</p>
              <Badge variant="outline" className="mt-2">
                {user.role}
              </Badge>
            </div>

            <div className="text-center sm:text-right space-y-2">
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="text-xl sm:text-2xl font-bold text-primary">{user.points}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Points</p>
              
              <div className="flex items-center justify-center sm:justify-end gap-2 mt-4">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span className="text-xs sm:text-sm text-green-600 font-medium">
                  {user.consecutiveCheckIns || 0} day streak
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{Array.isArray(referrals) ? referrals.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              {completedReferrals} completed, {pendingReferrals} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Recent Transactions</CardTitle>
            <History className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{Array.isArray(transactions) ? transactions.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              Point transactions this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Account Status</CardTitle>
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-10 sm:h-12">
          <TabsTrigger value="transactions" className="text-xs sm:text-sm">Point History</TabsTrigger>
          <TabsTrigger value="referrals" className="text-xs sm:text-sm">Referrals</TabsTrigger>
        </TabsList>

        {/* Transaction History Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-5 w-5" />
                <CardTitle>Transaction History</CardTitle>
              </div>
              <CardDescription>
                Your recent point transactions and earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isLoading && Array.isArray(transactions) && transactions.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {transaction.amount > 0 ? (
                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          ) : (
                            <Coins className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium capitalize truncate">{transaction.reason}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                          {transaction.notes && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {transaction.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right mt-2 sm:mt-0">
                        <p className={`text-sm sm:text-base font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No transactions yet</p>
                  <p className="text-sm text-muted-foreground">Start by checking in daily or making predictions!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals">
          <div className="space-y-6">
            {/* Referral Code Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  <CardTitle>Your Referral Code</CardTitle>
                </div>
                <CardDescription>
                  Share your code and earn bonus points when friends join!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Referral Code</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={user.referralCode || ''} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyReferralCode}
                      className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                    >
                      {copiedReferralCode ? (
                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                      ) : (
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Referral Link</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={`${window.location.origin}/register?ref=${user.referralCode}`}
                      readOnly 
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyReferralCode}
                      className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                    >
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={shareReferralLink}
                      className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                    >
                      <Share className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-muted p-3 sm:p-4 rounded-lg">
                  <h3 className="text-sm sm:text-base font-medium mb-2">How it works:</h3>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    <li>• Share your referral code with friends</li>
                    <li>• They sign up and check in for 3 consecutive days</li>
                    <li>• You both earn bonus points!</li>
                    <li>• Get milestone bonuses every 10 successful referrals</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Milestone Progress */}
            {completedReferrals > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    <CardTitle>Milestone Progress</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {(() => {
                      const nextMilestone = Math.ceil(completedReferrals / 10) * 10;
                      const pointsToNextMilestone = nextMilestone - completedReferrals;
                      const progressPercentage = (completedReferrals % 10) * 10;
                      
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-medium">Progress to {nextMilestone} referrals</span>
                            <span className="text-xs sm:text-sm text-muted-foreground">{completedReferrals}/{nextMilestone}</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <div className="text-center">
                            {pointsToNextMilestone > 0 ? (
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {pointsToNextMilestone} more successful referral{pointsToNextMilestone > 1 ? 's' : ''} to earn <strong>500 bonus points!</strong>
                              </p>
                            ) : (
                              <p className="text-xs sm:text-sm text-green-600">
                                🎉 Milestone reached! You've earned bonus points!
                              </p>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Referrals List */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <CardTitle>Your Referrals ({Array.isArray(referrals) ? referrals.length : 0})</CardTitle>
                </div>
                <CardDescription>
                  Track your invited friends and their progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isLoading && Array.isArray(referrals) && referrals.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                            <AvatarImage 
                              src={referral.referredUser?.avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(referral.referredUser?.name || 'Unknown')}`} 
                              alt={referral.referredUser?.name} 
                            />
                            <AvatarFallback>
                              {getInitials(referral.referredUser?.name || 'Unknown')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium truncate">{referral.referredUser?.name || 'User'}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Joined {new Date(referral.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {referral.status}
                          </Badge>
                          {referral.status === 'pending' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {(referral.referredUser?.consecutiveCheckIns || 0)}/3 check-ins
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No referrals yet</p>
                    <p className="text-sm text-muted-foreground">Share your code to start earning bonus points!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage; 