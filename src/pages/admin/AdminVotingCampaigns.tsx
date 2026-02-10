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
import { formatDateTime } from '../../lib/utils';
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
  // Loader2,
  ListFilter,
  // ArrowRight,
  Filter
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
      case 'active': return 'default';
      case 'upcoming': return 'secondary';
      case 'draft': return 'secondary';
      case 'completed': return 'outline';
      case 'closed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`voting.status.${status}`) || status;
  };

  const formatDate = (dateString: string) => formatDateTime(dateString);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  if (isLoading && campaigns.length === 0) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-lg text-gray-600">{t('adminVoting.loadingCampaigns')}</div>
      </div>
    );
  }

  return (
    <div className=" mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Vote className="h-8 w-8 text-blue-600" />
            {t('adminVoting.title')}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            {t('adminVoting.manageVotingCampaigns')}
          </p>
        </div>

        <Button onClick={() => navigate('/admin/voting/campaigns/new')} className="gap-2 shadow-md bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 h-11">
          <Plus className="h-5 w-5" />
          <span className="font-medium">{t('adminVoting.createCampaign')}</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('adminVoting.searchCampaigns')}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-11 border-gray-200 focus:border-blue-500 rounded-lg"
              />
            </div>

            <div className="w-full sm:w-[240px]">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="h-11 border-gray-200 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder={t('adminVoting.filterByStatus')} />
                  </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
        <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6 sm:px-8">
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-gray-500" />
            {t('adminVoting.campaigns')} <span className="text-gray-400 text-sm font-normal">({campaigns.length})</span>
          </CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            {t('adminVoting.overviewOfAllVoting')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Vote className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('adminVoting.noCampaignsFound')}</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? t('adminVoting.noCampaignsMatchCriteria')
                  : t('adminVoting.getStartedCreatingFirst')}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => navigate('/admin/voting/campaigns/new')} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('adminVoting.createFirstCampaign')}
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('adminVoting.title')}</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('adminVoting.status')}</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {t('adminVoting.duration')}
                        </div>
                      </TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {t('adminVoting.entries')}
                        </div>
                      </TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-3 w-3" />
                          {t('adminVoting.votes')}
                        </div>
                      </TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">{t('adminVoting.pointsPerVote')}</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('adminVoting.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100">
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign._id} className="hover:bg-gray-50/80 transition-colors">
                        <TableCell className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{campaign.title}</div>
                            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {campaign.description}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4">
                          <Badge variant={getStatusBadgeVariant(campaign.status)} className="capitalize font-normal shadow-sm">
                            {getStatusLabel(campaign.status)}
                          </Badge>
                        </TableCell>

                        <TableCell className="px-6 py-4">
                          <div className="text-sm text-gray-600 flex flex-col gap-0.5">
                            <span className="flex items-center gap-1 text-xs"><span className="w-10 text-gray-400">Start:</span> {formatDate(campaign.startDate)}</span>
                            <span className="flex items-center gap-1 text-xs"><span className="w-10 text-gray-400">End:</span> {formatDate(campaign.endDate)}</span>
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center bg-gray-100 text-gray-600 rounded-full h-6 w-6 text-xs font-medium">
                            {campaign.entryCount || 0}
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center bg-blue-50 text-blue-600 rounded-full h-6 min-w-[1.5rem] px-1.5 text-xs font-medium">
                            {campaign.totalVotes || 0}
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4 text-center">
                          <span className="font-medium text-gray-700">{campaign.pointsPerVote}</span>
                        </TableCell>

                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/voting/campaigns/${campaign._id}/statistics`)}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/voting/campaigns/${campaign._id}`)}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/voting/campaigns/${campaign._id}/edit`)}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                  <Trash2 className="h-4 w-4" />
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
                                    className="bg-red-600 text-white hover:bg-red-700"
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
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-100 bg-gray-50/50 p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    {t('adminVoting.previous')}
                  </Button>

                  <span className="text-sm text-gray-600">
                    {t('adminVoting.pageOf', { current: currentPage, total: totalPages })}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
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