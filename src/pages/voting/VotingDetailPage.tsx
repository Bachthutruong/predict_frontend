import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { votingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
import { AuthModal } from '../../components/auth/AuthModal';
import { 
  ArrowLeft, 
  Vote, 
  Heart,
  Users, 
  Trophy, 
  Calendar,
  Clock,
  Shuffle,
  Filter,
//   ChevronDown,
  Loader2,
  CheckCircle,
//   AlertCircle
} from 'lucide-react';
import type { VotingCampaignDetail } from '../../types';

const VotingDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [campaignData, setCampaignData] = useState<VotingCampaignDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [sortBy, setSortBy] = useState<'random' | 'votes' | 'newest' | 'oldest'>('random');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingVoteEntry, setPendingVoteEntry] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (id) {
      loadCampaignDetail();
    }
  }, [id, sortBy]);

  const loadCampaignDetail = async () => {
    try {
      setIsLoading(true);
      const response = await votingAPI.getCampaignDetail(id!, { sortBy });
      
      if (response.success && response.data) {
        setCampaignData(response.data);
      } else {
        toast({
          title: t('common.error'),
          description: t('voting.failedToLoadCampaignDetails'),
          variant: "destructive"
        });
        navigate('/voting');
      }
    } catch (error) {
      console.error('Failed to load campaign:', error);
      toast({
        title: t('common.error'),
        description: t('voting.failedToLoadCampaignDetails'),
        variant: "destructive"
      });
      navigate('/voting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (entryId: string) => {
    if (!user) {
      setPendingVoteEntry(entryId);
      setShowAuthModal(true);
      return;
    }

    try {
      setIsVoting(true);
      const response = await votingAPI.voteForEntry(id!, entryId);
      
      if (response.success) {
        toast({
          title: t('voting.voteSubmitted'),
          description: t('voting.earnedPoints', { points: response.data?.pointsEarned || 0 }),
        });
        
        // Refresh user data to update points
        await refreshUser();
        
        // Reload campaign data to update vote counts and user votes
        loadCampaignDetail();
      } else {
        toast({
          title: t('voting.voteFailed'),
          description: response.message || t('voting.failedToSubmitVote'),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Failed to vote:', error);
      toast({
        title: t('voting.voteFailed'),
        description: error.response?.data?.message || t('voting.failedToSubmitVote'),
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleRemoveVote = async (entryId: string) => {
    if (!user) return;

    try {
      setIsVoting(true);
      const response = await votingAPI.removeVote(id!, entryId);
      
      if (response.success) {
        toast({
          title: t('voting.voteRemoved'),
          description: t('voting.voteRemovedDescription'),
        });
        
        // Refresh user data to update points
        await refreshUser();
        
        // Reload campaign data
        loadCampaignDetail();
      } else {
        toast({
          title: t('voting.failedToRemoveVote'),
          description: response.message || t('voting.failedToRemoveVoteDescription'),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Failed to remove vote:', error);
      toast({
        title: t('voting.failedToRemoveVote'),
        description: error.response?.data?.message || t('voting.failedToRemoveVoteDescription'),
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  // Handle successful auth
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingVoteEntry) {
      handleVote(pendingVoteEntry);
      setPendingVoteEntry(undefined);
    }
  };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('vi-VN', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

  const formatTimeRemaining = (remainingTime: number) => {
    if (remainingTime <= 0) return t('voting.ended');
    
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusInfo = (campaign: any) => {
    switch (campaign.status) {
      case 'active':
        return { text: t('voting.status.active'), variant: 'default' as const, icon: Vote };
      case 'upcoming':
        return { text: t('voting.status.upcoming'), variant: 'secondary' as const, icon: Calendar };
      case 'closed':
        return { text: t('voting.status.closed'), variant: 'outline' as const, icon: Clock };
      case 'completed':
        return { text: t('voting.status.completed'), variant: 'outline' as const, icon: Trophy };
      case 'cancelled':
        return { text: t('voting.status.cancelled'), variant: 'destructive' as const, icon: Calendar };
      case 'draft':
        return { text: t('voting.status.draft'), variant: 'secondary' as const, icon: Calendar };
      default:
        return { text: campaign.status, variant: 'secondary' as const, icon: Calendar };
    }
  };

  const hasUserVoted = (entryId: string) => {
    return campaignData?.userVotes?.includes(entryId) || false;
  };

  const canUserVote = () => {
    if (!campaignData || campaignData.campaign.status !== 'active') return false;
    if (!user) return true; // Show vote button for guests (will prompt login)
    
    const userVoteCount = campaignData?.userVotes?.length || 0;
    return userVoteCount < campaignData.campaign.maxVotesPerUser;
  };

  const getUserVotesRemaining = () => {
    if (!user || !campaignData) return 0;
    const userVoteCount = campaignData.userVotes?.length || 0;
    return Math.max(0, campaignData.campaign.maxVotesPerUser - userVoteCount);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!campaignData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">{t('voting.campaignNotFound')}</h3>
          <Button onClick={() => navigate('/voting')}>
            {t('voting.backToCampaigns')}
          </Button>
        </div>
      </div>
    );
  }

  const { campaign, entries } = campaignData;
  const statusInfo = getStatusInfo(campaign);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/voting')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <StatusIcon className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            <Badge variant={statusInfo.variant}>
              {statusInfo.text}
            </Badge>
          </div>
          <p className="text-muted-foreground">{campaign.description}</p>
        </div>
      </div>

      {/* Campaign Image */}
      {campaign.imageUrl && (
        <div className="aspect-[2/1] w-full max-w-4xl mx-auto overflow-hidden rounded-lg">
          <img 
            src={campaign.imageUrl} 
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Campaign Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('voting.totalEntries')}</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('voting.totalVotes')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {entries.reduce((sum, entry) => sum + (entry.voteCount || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('voting.pointsPerVote')}</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.pointsPerVote}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('voting.time')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign.isVotingOpen && campaign.remainingTime ? 
                formatTimeRemaining(campaign.remainingTime) : 
                campaign.isVotingCompleted ? t('voting.ended') : t('voting.startsSoon')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Vote Status */}
      {user && campaign.status === 'active' && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Vote className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{t('voting.yourVotingStatus')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('voting.votesRemaining', { count: getUserVotesRemaining() })}
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                {campaignData.userVotes?.length || 0} / {campaign.maxVotesPerUser}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voting Info for Guests */}
      {!user && campaign.status === 'active' && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="text-center py-6">
            <Vote className="h-8 w-8 mx-auto text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">{t('voting.wantToVote')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('voting.signInToVoteAndEarn', { points: campaign.pointsPerVote })}
            </p>
            <Button onClick={() => setShowAuthModal(true)}>
              {t('voting.signInToVote')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sorting Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('voting.entries')} ({entries.length})</h2>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="random">
                <div className="flex items-center gap-2">
                  <Shuffle className="h-4 w-4" />
                  {t('voting.sort.random')}
                </div>
              </SelectItem>
              <SelectItem value="votes">{t('voting.sort.mostVotes')}</SelectItem>
              <SelectItem value="newest">{t('voting.sort.newestFirst')}</SelectItem>
              <SelectItem value="oldest">{t('voting.sort.oldestFirst')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Entries Grid */}
      {entries.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">{t('voting.noEntriesYet')}</h3>
          <p className="text-muted-foreground">
            {t('voting.noEntriesDescription')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <Card key={entry._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {entry.imageUrl && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={entry.imageUrl} 
                    alt={entry.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2">{entry.title}</CardTitle>
                  {hasUserVoted(entry._id) && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
                <CardDescription className="line-clamp-3">
                  {entry.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Vote Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{entry.voteCount || 0} {t('voting.votes')}</span>
                  </div>
                  
                  {campaign.isVotingCompleted && entry.voteCount > 0 && (
                    <Badge variant="outline">
                      #{entries
                        .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
                        .findIndex(e => e._id === entry._id) + 1}
                    </Badge>
                  )}
                </div>

                {/* Vote Button */}
                {campaign.status === 'active' ? (
                  hasUserVoted(entry._id) ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleRemoveVote(entry._id)}
                      disabled={isVoting}
                    >
                      {isVoting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {t('voting.voted')}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleVote(entry._id)}
                      disabled={isVoting || (user ? !canUserVote() : false)}
                    >
                      {isVoting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Vote className="h-4 w-4 mr-2" />
                      )}
                      {!user ? t('voting.vote') : !canUserVote() ? t('voting.maxVotesReached') : t('voting.vote')}
                    </Button>
                  )
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    {campaign.status === 'closed' || campaign.status === 'completed' ? t('voting.votingEnded') : t('voting.votingNotStarted')}
                  </Button>
                )}

                {/* Recent Voters (if any) */}
                {entry.votes && entry.votes.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">{t('voting.recentVoters')}:</p>
                    <div className="flex flex-wrap gap-1">
                      {entry.votes.slice(0, 3).map((vote, index) => (
                        <span key={index} className="bg-muted px-2 py-1 rounded">
                          {vote.userName}
                        </span>
                      ))}
                      {entry.votes.length > 3 && (
                        <span className="text-muted-foreground">
                          +{entry.votes.length - 3} {t('voting.more')}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={(open) => {
          setShowAuthModal(open);
          if (!open) {
            setPendingVoteEntry(undefined);
          }
        }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default VotingDetailPage; 