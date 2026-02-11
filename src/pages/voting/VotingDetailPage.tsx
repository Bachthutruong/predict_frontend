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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Loader2,
  CheckCircle,
  ImageIcon,
  Video,
  ChevronLeft,
  ChevronRight,
  Play
} from 'lucide-react';
import type { VotingCampaignDetail, VoteEntry } from '../../types';

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
  
  // Entry detail dialog state
  const [selectedEntry, setSelectedEntry] = useState<VoteEntry | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
        
        await refreshUser();
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
        
        await refreshUser();
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

  // Helper to extract YouTube video ID
  const getYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  // Get all images for an entry (combining imageUrl and imageUrls)
  const getEntryImages = (entry: VoteEntry): string[] => {
    const images: string[] = [];
    if (entry.imageUrls && entry.imageUrls.length > 0) {
      images.push(...entry.imageUrls);
    } else if (entry.imageUrl) {
      images.push(entry.imageUrl);
    }
    return images;
  };

  // Open entry detail dialog
  const openEntryDetail = (entry: VoteEntry) => {
    setSelectedEntry(entry);
    setSelectedImageIndex(0);
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
          {entries.map((entry) => {
            const entryImages = getEntryImages(entry);
            const thumbnailUrl = entryImages.length > 0 ? entryImages[0] : null;
            
            return (
              <Card 
                key={entry._id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-gray-200"
                onClick={() => openEntryDetail(entry)}
              >
                {/* Image/Video Thumbnail */}
                <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 relative">
                  {thumbnailUrl ? (
                    <img 
                      src={thumbnailUrl} 
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon className="h-16 w-16" />
                    </div>
                  )}
                  
                  {/* Overlay indicators */}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    {entryImages.length > 1 && (
                      <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                        <ImageIcon className="h-3 w-3" />
                        {entryImages.length}
                      </span>
                    )}
                    {entry.videoUrl && (
                      <span className="bg-red-600/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                        <Play className="h-3 w-3" />
                        Video
                      </span>
                    )}
                  </div>

                  {/* Voted checkmark overlay */}
                  {hasUserVoted(entry._id) && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-500 text-white p-1.5 rounded-full flex items-center justify-center shadow-md">
                        <CheckCircle className="h-4 w-4" />
                      </span>
                    </div>
                  )}

                  {/* Click to view detail overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm">
                      {t('voting.viewDetail')}
                    </span>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-base">{entry.title}</CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2 text-sm">
                    {entry.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3 pt-0">
                  {/* Vote Count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className={`h-4 w-4 ${hasUserVoted(entry._id) ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
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
                  <div onClick={(e) => e.stopPropagation()}>
                    {campaign.status === 'active' ? (
                      hasUserVoted(entry._id) ? (
                        <Button 
                          variant="outline" 
                          className="w-full border-green-200 text-green-700 hover:bg-green-50"
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
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
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
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* =================== ENTRY DETAIL DIALOG =================== */}
      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {selectedEntry && (() => {
            const images = getEntryImages(selectedEntry);
            const youtubeId = selectedEntry.videoUrl ? getYouTubeId(selectedEntry.videoUrl) : null;
            
            return (
              <>
                {/* Image Gallery */}
                {images.length > 0 && (
                  <div className="relative">
                    {/* Main Image */}
                    <div className="aspect-[16/10] w-full bg-gray-900 relative overflow-hidden">
                      <img
                        src={images[selectedImageIndex]}
                        alt={`${selectedEntry.title} - ${selectedImageIndex + 1}`}
                        className="w-full h-full object-contain"
                      />
                      
                      {/* Navigation arrows */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}

                      {/* Image counter */}
                      {images.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                          {selectedImageIndex + 1} / {images.length}
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Strip */}
                    {images.length > 1 && (
                      <div className="flex gap-2 p-3 bg-gray-50 overflow-x-auto">
                        {images.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImageIndex === index 
                                ? 'border-blue-500 shadow-md scale-105' 
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Video Player */}
                {selectedEntry.videoUrl && (
                  <div className="px-6 pt-4">
                    <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-3">
                      <Video className="h-4 w-4" />
                      {t('voting.entryVideo')}
                    </h4>
                    {youtubeId ? (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          title={selectedEntry.title}
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <video
                          src={selectedEntry.videoUrl}
                          controls
                          className="w-full h-full"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Entry Info */}
                <div className="p-6 space-y-5">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">
                      {selectedEntry.title}
                    </DialogTitle>
                  </DialogHeader>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                      <Heart className={`h-4 w-4 ${hasUserVoted(selectedEntry._id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                      <span className="font-semibold text-gray-700">{selectedEntry.voteCount || 0}</span>
                      <span className="text-gray-500 text-sm">{t('voting.votes')}</span>
                    </div>
                    
                    {images.length > 0 && (
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500 text-sm">{images.length} {t('voting.photos')}</span>
                      </div>
                    )}
                    
                    {selectedEntry.videoUrl && (
                      <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                        <Video className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 text-sm">{t('voting.hasVideo')}</span>
                      </div>
                    )}

                    {hasUserVoted(selectedEntry._id) && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('voting.voted')}
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('voting.entryDescription')}</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedEntry.description}
                    </p>
                  </div>

                  {/* Vote Button in Detail */}
                  <div className="pt-2 border-t border-gray-100">
                    {campaign.status === 'active' ? (
                      hasUserVoted(selectedEntry._id) ? (
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="w-full border-green-200 text-green-700 hover:bg-green-50"
                          onClick={() => handleRemoveVote(selectedEntry._id)}
                          disabled={isVoting}
                        >
                          {isVoting ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="h-5 w-5 mr-2" />
                          )}
                          {t('voting.voted')}
                        </Button>
                      ) : (
                        <Button 
                          size="lg"
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg text-base"
                          onClick={() => handleVote(selectedEntry._id)}
                          disabled={isVoting || (user ? !canUserVote() : false)}
                        >
                          {isVoting ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          ) : (
                            <Vote className="h-5 w-5 mr-2" />
                          )}
                          {!user ? t('voting.vote') : !canUserVote() ? t('voting.maxVotesReached') : t('voting.voteForEntry')}
                        </Button>
                      )
                    ) : (
                      <Button variant="outline" size="lg" className="w-full" disabled>
                        {campaign.status === 'closed' || campaign.status === 'completed' ? t('voting.votingEnded') : t('voting.votingNotStarted')}
                      </Button>
                    )}
                  </div>

                  {/* Recent Voters */}
                  {selectedEntry.votes && selectedEntry.votes.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('voting.recentVoters')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.votes.slice(0, 10).map((vote, index) => (
                          <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm">
                            {vote.userName}
                          </span>
                        ))}
                        {selectedEntry.votes.length > 10 && (
                          <span className="text-muted-foreground text-sm py-1.5">
                            +{selectedEntry.votes.length - 10} {t('voting.more')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

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