import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { votingAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Vote, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  BarChart3,
  Trophy,
  Loader2
} from 'lucide-react';
import type { VotingCampaign } from '../../types';

const AdminVotingCampaigns: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [campaigns, setCampaigns] = useState<VotingCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const limit = 10;

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const response = await votingAPI.admin.getCampaigns({
        page: currentPage,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined
      });

      if (response.success && response.data) {
        setCampaigns(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
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

  useEffect(() => {
    fetchCampaigns();
  }, [currentPage, statusFilter, searchTerm]);

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      const response = await votingAPI.admin.deleteCampaign(campaignId);
      
      if (response.success) {
        toast({
          title: t('common.success'),
          description: t('adminVoting.campaignDeletedSuccessfully')
        });
        
        // Refresh campaigns list
        fetchCampaigns();
      } else {
        toast({
          title: t('common.error'),
          description: response.message || t('adminVoting.failedToDeleteCampaign'),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Failed to delete campaign:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('adminVoting.failedToDeleteCampaign'),
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'upcoming':
        return 'secondary';
      case 'draft':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'closed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`voting.status.${status}`) || status;
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

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Vote className="h-8 w-8 text-primary" />
            {t('adminVoting.title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('adminVoting.manageVotingCampaigns')}
          </p>
        </div>
        
        <Button onClick={() => navigate('/admin/voting/campaigns/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('adminVoting.createCampaign')}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('adminVoting.searchCampaigns')}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={t('adminVoting.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('adminVoting.allStatus')}</SelectItem>
                <SelectItem value="draft">{t('adminVoting.draft')}</SelectItem>
                <SelectItem value="active">{t('voting.status.active')}</SelectItem>
                <SelectItem value="completed">{t('adminVoting.completed')}</SelectItem>
                <SelectItem value="cancelled">{t('voting.status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('adminVoting.campaigns')} ({campaigns.length})</CardTitle>
          <CardDescription>
            {t('adminVoting.overviewOfAllVoting')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8">
              <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('adminVoting.noCampaignsFound')}</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? t('adminVoting.noCampaignsMatchCriteria')
                  : t('adminVoting.getStartedCreatingFirst')}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => navigate('/admin/voting/campaigns/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('adminVoting.createFirstCampaign')}
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('adminVoting.title')}</TableHead>
                    <TableHead>{t('adminVoting.status')}</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {t('adminVoting.duration')}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {t('adminVoting.entries')}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {t('adminVoting.votes')}
                      </div>
                    </TableHead>
                    <TableHead>{t('adminVoting.pointsPerVote')}</TableHead>
                    <TableHead className="text-right">{t('adminVoting.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {campaign.description}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(campaign.status)}>
                          {getStatusLabel(campaign.status)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(campaign.startDate)}</div>
                          <div className="text-muted-foreground">to</div>
                          <div>{formatDate(campaign.endDate)}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">{campaign.entryCount || 0}</div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">{campaign.totalVotes || 0}</div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">{campaign.pointsPerVote}</div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/voting/campaigns/${campaign._id}/statistics`)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/voting/campaigns/${campaign._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/voting/campaigns/${campaign._id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('adminVoting.deleteCampaign')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('adminVoting.deleteCampaignDescription', { title: campaign.title })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCampaign(campaign._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {t('common.delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    {t('adminVoting.previous')}
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    {t('adminVoting.pageOf', { current: currentPage, total: totalPages })}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    {t('adminVoting.next')}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVotingCampaigns; 