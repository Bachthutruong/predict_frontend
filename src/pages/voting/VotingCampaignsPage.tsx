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
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-regular tracking-tight text-gray-900 flex items-center justify-center gap-3">
          <Vote className="h-10 w-10 text-blue-600" />
          {t('voting.activeCampaigns')}
        </h1>
        <p className="text-gray-500 text-lg">
          {t('voting.participateDescription')}
          {!user && ` ${t('voting.signInToVote')}`}
        </p>
      </div>

      {/* Search */}
      <Card className="max-w-md mx-auto border-none shadow-google bg-white overflow-hidden">
        <CardContent className="p-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder={t('voting.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 border-none shadow-none focus-visible:ring-0 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16">
          <Vote className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">{t('voting.noActiveCampaigns')}</h3>
          <p className="text-gray-500">
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
                  className="hover:shadow-google-hover transition-all duration-300 cursor-pointer group border-none shadow-google bg-white overflow-hidden flex flex-col h-full"
                  onClick={() => navigate(`/voting/${campaign.id}`)}
                >
                  {campaign.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden relative">
                      <img
                        src={campaign.imageUrl}
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant={statusInfo.variant} className="shadow-sm">
                          {statusInfo.text}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    {!campaign.imageUrl && (
                      <div className="mb-2">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.text}
                        </Badge>
                      </div>
                    )}
                    <CardTitle className="text-xl text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                      {campaign.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-gray-500 mt-1">
                      {campaign.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-grow flex flex-col justify-end">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center py-4 border-t border-b border-gray-50">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{campaign.entryCount || 0}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">{t('voting.entries')}</div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Users className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{campaign.totalVotes || 0}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">{t('voting.votes')}</div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Vote className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{campaign.pointsPerVote}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">{t('voting.points')}</div>
                      </div>
                    </div>

                    {/* Time Info & Button */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-4">
                        {campaign.status === 'active' && campaign.remainingTime ? (
                          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                              {formatTimeRemaining(campaign.remainingTime)} {t('voting.remaining')}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(campaign.endDate)}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full bg-white text-blue-600 border border-gray-200 hover:bg-blue-50 shadow-none hover:text-blue-700 hover:border-blue-200"

                      >
                        {campaign.status === 'active' ? t('voting.voteNow') :
                          (campaign.status === 'closed' || campaign.status === 'completed') ? t('voting.viewResults') : t('voting.viewDetails')}
                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-full w-10 h-10 p-0"
              >
                &larr;
              </Button>

              <span className="text-sm text-gray-500 px-4 font-medium">
                {t('common.page')} {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full w-10 h-10 p-0"
              >
                &rarr;
              </Button>
            </div>
          )}
        </>
      )}

      {/* Call to Action for guests */}
      {!user && campaigns.length > 0 && (
        <Card className="border-none shadow-google bg-gradient-to-br from-blue-50 to-indigo-50 mt-12">
          <CardContent className="text-center py-10">
            <Vote className="h-12 w-12 mx-auto text-blue-600 mb-4" />
            <h3 className="text-2xl font-regular mb-2 text-gray-900">{t('voting.readyToVote')}</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {t('voting.signInToParticipate')}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={() => navigate('/login')} className="px-8 shadow-none bg-blue-600 hover:bg-blue-700 text-white border-none">
                {t('auth.signIn')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/register')} className="px-8 bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
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