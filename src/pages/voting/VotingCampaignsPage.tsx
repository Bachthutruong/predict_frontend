import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { votingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Vote, 
  Search, 
  Calendar,
  Users,
  Trophy,
  Clock,
  ChevronRight,
  Loader2
} from 'lucide-react';
import type { VotingCampaign } from '../../types';

const VotingCampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [campaigns, setCampaigns] = useState<VotingCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const limit = 12;

  useEffect(() => {
    fetchCampaigns();
  }, [currentPage, searchTerm]);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const response = await votingAPI.getCampaigns({
        page: currentPage,
        limit,
        search: searchTerm || undefined
      });

      if (response.success && response.data) {
        // API trả về data trực tiếp trong response.data array
        const allCampaigns = Array.isArray(response.data) ? response.data : [];
        
        // Chỉ lấy những campaign có status "active"
        const activeCampaigns = allCampaigns.filter(campaign => campaign.status === 'active');
        
        setCampaigns(activeCampaigns);
        // Pagination nằm ở cùng cấp với data trong response
        setTotalPages((response as any).pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      toast({
        title: t('common.error'),
        description: t('voting.failedToLoadCampaigns'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getStatusInfo = (campaign: VotingCampaign) => {
    switch (campaign.status) {
      case 'active':
        return { text: t('voting.status.active'), variant: 'default' as const };
      case 'upcoming':
        return { text: t('voting.status.upcoming'), variant: 'secondary' as const };
      case 'closed':
        return { text: t('voting.status.closed'), variant: 'outline' as const };
      case 'completed':
        return { text: t('voting.status.completed'), variant: 'outline' as const };
      case 'cancelled':
        return { text: t('voting.status.cancelled'), variant: 'destructive' as const };
      case 'draft':
        return { text: t('voting.status.draft'), variant: 'secondary' as const };
      default:
        return { text: campaign.status, variant: 'secondary' as const };
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Vote className="h-8 w-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold">{t('voting.activeCampaigns')}</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {t('voting.participateDescription')}
          {!user && ` ${t('voting.signInToVote')}`}
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('voting.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12">
          <Vote className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">{t('voting.noActiveCampaigns')}</h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? t('voting.noMatchingCampaigns')
              : t('voting.noCampaignsAvailable')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const statusInfo = getStatusInfo(campaign);
              
              return (
                <Card 
                  key={campaign.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/voting/${campaign.id}`)}
                >
                  {campaign.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img 
                        src={campaign.imageUrl} 
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {campaign.title}
                      </CardTitle>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.text}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-3">
                      {campaign.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-sm font-medium">{campaign.entryCount || 0}</div>
                        <div className="text-xs text-muted-foreground">{t('voting.entries')}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-sm font-medium">{campaign.totalVotes || 0}</div>
                        <div className="text-xs text-muted-foreground">{t('voting.votes')}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Vote className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-sm font-medium">{campaign.pointsPerVote}</div>
                        <div className="text-xs text-muted-foreground">{t('voting.points')}</div>
                      </div>
                    </div>

                    {/* Time Info */}
                    <div className="space-y-2">
                      {campaign.status === 'active' && campaign.remainingTime ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-primary font-medium">
                            {formatTimeRemaining(campaign.remainingTime)} {t('voting.remaining')}
                          </span>
                        </div>
                      ) : campaign.status === 'closed' || campaign.status === 'completed' ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{t('voting.ended')} {formatDate(campaign.endDate)}</span>
                        </div>
                      ) : campaign.status === 'upcoming' ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{t('voting.starts')} {formatDate(campaign.startDate)}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      variant="outline"
                    >
                      {campaign.status === 'active' ? t('voting.voteNow') :
                       (campaign.status === 'closed' || campaign.status === 'completed') ? t('voting.viewResults') : t('voting.viewDetails')}
                      <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                {t('common.previous')}
              </Button>
              
              <span className="text-sm text-muted-foreground px-4">
                {t('common.page')} {currentPage} {t('common.of')} {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Call to Action for guests */}
      {!user && campaigns.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="text-center py-8">
            <Vote className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('voting.readyToVote')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('voting.signInToParticipate')}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={() => navigate('/login')}>
                {t('auth.signIn')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/register')}>
                {t('auth.createAccount')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VotingCampaignsPage; 