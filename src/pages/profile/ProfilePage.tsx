import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import ProfileEditForm from '../../components/forms/ProfileEditForm';
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
import { 
  History,
  Users,
  Gift,
  Copy,
  Share,
  Check,
  // TrendingUp,
  Coins,
  User,
  Trophy,
  Activity,
  Settings
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import type { PointTransaction, Referral } from '../../types';
import apiService from '../../services/api';
import { useLanguage } from '../../hooks/useLanguage';

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedReferralCode, setCopiedReferralCode] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [isSettingReferral, setIsSettingReferral] = useState(false);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchProfileData();
    // Refresh user data when component mounts
    refreshUser();
  }, []);

  // Clear input when user already has referral code
  useEffect(() => {
    if (user?.referralCode) {
      setReferralCodeInput('');
    }
  }, [user?.referralCode]);

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
        title: t('common.error'),
        description: t('profile.loadDataError'),
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
        title: t('profile.copied'),
        description: t('profile.referralLinkCopied')
      });
    }
  };

  const shareReferralLink = async () => {
    if (user?.referralCode && navigator.share) {
      const referralUrl = `${window.location.origin}/register?ref=${user.referralCode}`;
      try {
        await navigator.share({
          title: t('profile.joinPredictWin'),
          text: t('profile.shareMessage'),
          url: referralUrl,
        });
      } catch (error) {
        copyReferralCode();
      }
    } else {
      copyReferralCode();
    }
  };

  // Handler to set referral code
  const handleSetReferralCode = async () => {
    if (!referralCodeInput.trim() || referralCodeInput.trim().length < 4) {
      toast({ title: t('common.error'), description: t('profile.referralCodeMinLength'), variant: 'destructive' });
      return;
    }
    setIsSettingReferral(true);
    try {
      console.log('Setting referral code:', referralCodeInput.trim());
      const response = await apiService.post('/users/set-referral-code', { referralCode: referralCodeInput.trim() });
      console.log('Set referral response:', response.data);
      
      if (response.data?.success) {
        await refreshUser(); // Cập nhật lại user context
        setReferralCodeInput(''); // Clear input after success
        toast({ title: t('common.success'), description: t('profile.referralCodeSetSuccess') });
        console.log('User context after refresh:', user);
      } else {
        toast({ title: t('common.error'), description: response.data?.message || t('profile.setReferralCodeError'), variant: 'destructive' });
      }
    } catch (error: any) {
      console.error('Set referral code error:', error);
      toast({ title: t('common.error'), description: error.response?.data?.message || t('profile.setReferralCodeError'), variant: 'destructive' });
    } finally {
      setIsSettingReferral(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  // Safe array operations with fallback
  const completedReferrals = Array.isArray(referrals) ? referrals.filter(r => r.status === 'completed').length : 0;
  const pendingReferrals = Array.isArray(referrals) ? referrals.filter(r => r.status === 'pending').length : 0;
  
  const paginatedTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    const startIndex = (currentPage - 1) * rowsPerPage;
    return transactions.slice(startIndex, startIndex + rowsPerPage);
  }, [transactions, currentPage, rowsPerPage]);

  const totalPages = Array.isArray(transactions) ? Math.ceil(transactions.length / rowsPerPage) : 1;


  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('profile.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">{t('profile.loadingProfile')}</p>
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
          {t('profile.title')}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          {t('profile.manageAccount')}
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
              <p className="text-xs sm:text-sm text-muted-foreground">{t('profile.totalPoints')}</p>
              
              <div className="flex items-center justify-center sm:justify-end gap-2 mt-4">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span className="text-xs sm:text-sm text-green-600 font-medium">
                  {user.consecutiveCheckIns || 0} {t('profile.dayStreak')}
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
            <CardTitle className="text-xs sm:text-sm font-medium">{t('profile.totalReferrals')}</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{Array.isArray(referrals) ? referrals.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              {completedReferrals} {t('profile.completed')}, {pendingReferrals} {t('profile.pending')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('profile.recentTransactions')}</CardTitle>
            <History className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{Array.isArray(transactions) ? transactions.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('profile.pointTransactionsThisMonth')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('profile.accountStatus')}</CardTitle>
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">{t('profile.active')}</div>
            <p className="text-xs text-muted-foreground">
              {t('profile.memberSince')} {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-10 sm:h-12">
          <TabsTrigger value="transactions" className="text-xs sm:text-sm">{t('profile.pointHistory')}</TabsTrigger>
          <TabsTrigger value="referrals" className="text-xs sm:text-sm">{t('profile.referrals')}</TabsTrigger>
          <TabsTrigger value="edit" className="text-xs sm:text-sm">{t('profile.editProfile')}</TabsTrigger>
        </TabsList>

        {/* Transaction History Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-5 w-5" />
                <CardTitle>{t('profile.transactionHistory')}</CardTitle>
              </div>
              <CardDescription>
                {t('profile.recentPointTransactions')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p>{t('profile.loadingTransactions')}</p>
                </div>
              ) : (
                transactions.length > 0 ? (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('profile.reason')}</TableHead>
                          <TableHead>{t('profile.notes')}</TableHead>
                          <TableHead className="text-right">{t('profile.amount')}</TableHead>
                          <TableHead className="text-right">{t('profile.date')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium capitalize">
                              {transaction.reason.replace(/-/g, ' ')}
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-[300px] truncate">
                              {transaction.notes || '-'}
                            </TableCell>
                            <TableCell className={`text-right font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{t('profile.rowsPerPage')}:</span>
                          <Select value={String(rowsPerPage)} onValueChange={value => { setRowsPerPage(Number(value)); setCurrentPage(1); }}>
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[5, 10, 20, 50].map(val => (
                                <SelectItem key={val} value={String(val)}>{val}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {t('profile.page')} {currentPage} {t('profile.of')} {totalPages}
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
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">{t('profile.noTransactionsYet')}</p>
                    <p className="text-sm text-muted-foreground">{t('profile.startByCheckingIn')}</p>
                  </div>
                )
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
                  <CardTitle>{t('profile.yourReferralCode')}</CardTitle>
                </div>
                <CardDescription>
                  {t('profile.shareCodeEarnBonus')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('profile.referralCode')}</label>
                  <div className="flex items-center gap-2">
                    {user?.referralCode ? (
                      <Input 
                        value={user.referralCode} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                    ) : (
                      <>
                        <Input
                          value={referralCodeInput}
                          onChange={e => setReferralCodeInput(e.target.value)}
                          placeholder={t('profile.enterReferralCode')}
                          maxLength={16}
                          className="font-mono text-sm"
                          disabled={isSettingReferral}
                        />
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSetReferralCode}
                          disabled={isSettingReferral || !referralCodeInput.trim() || referralCodeInput.trim().length < 4}
                        >
                          {isSettingReferral ? t('profile.saving') : t('profile.setCode')}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyReferralCode}
                      className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                      disabled={!user?.referralCode}
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
                  <label className="text-sm font-medium">{t('profile.referralLink')}</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={
                        user.referralCode
                          ? `${window.location.origin}/register?ref=${user.referralCode}`
                          : referralCodeInput
                            ? `${window.location.origin}/register?ref=${referralCodeInput.trim().toUpperCase()}`
                            : ''
                      }
                      readOnly 
                      className="text-xs"
                      placeholder={t('profile.setReferralCodeFirst')}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyReferralCode}
                      className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                      disabled={!(user.referralCode || referralCodeInput)}
                    >
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={shareReferralLink}
                      className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                      disabled={!(user.referralCode || referralCodeInput)}
                    >
                      <Share className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-muted p-3 sm:p-4 rounded-lg">
                  <h3 className="text-sm sm:text-base font-medium mb-2">{t('profile.howItWorks')}:</h3>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    <li>• {t('profile.shareReferralCode')}</li>
                    <li>• {t('profile.theySignUpCheckIn')}</li>
                    <li>• {t('profile.youBothEarnBonus')}</li>
                    <li>• {t('profile.getMilestoneBonuses')}</li>
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
                    <CardTitle>{t('profile.milestoneProgress')}</CardTitle>
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
                            <span className="text-xs sm:text-sm font-medium">{t('profile.progressToReferrals', { count: nextMilestone })}</span>
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
                                {t('profile.moreSuccessfulReferrals', { count: pointsToNextMilestone, points: 500 })}
                              </p>
                            ) : (
                              <p className="text-xs sm:text-sm text-green-600">
                                🎉 {t('profile.milestoneReached')}
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
                  <CardTitle>{t('profile.yourReferrals')} ({Array.isArray(referrals) ? referrals.length : 0})</CardTitle>
                </div>
                <CardDescription>
                  {t('profile.trackInvitedFriends')}
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
                            <p className="text-sm sm:text-base font-medium truncate">{referral.referredUser?.name || t('profile.user')}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {t('profile.joined')} {new Date(referral.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {t(`profile.${referral.status}`)}
                          </Badge>
                          {referral.status === 'pending' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {(referral.referredUser?.consecutiveCheckIns || 0)}/3 {t('profile.checkIns')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">{t('profile.noReferralsYet')}</p>
                    <p className="text-sm text-muted-foreground">{t('profile.shareCodeToStart')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Edit Profile Tab */}
        <TabsContent value="edit">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5" />
              <h2 className="text-xl font-semibold">{t('profile.editProfile')}</h2>
            </div>
            <ProfileEditForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage; 