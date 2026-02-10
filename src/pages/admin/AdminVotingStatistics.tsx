import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { votingAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
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
  ArrowLeft,
  BarChart3,
  Users,
  Trophy,
  Calendar,
  TrendingUp,
  // Loader2,
  Download,
  Eye,
  PieChart,
  Target
} from 'lucide-react';
import type { VotingCampaign, VoteEntry } from '../../types';
import * as XLSX from 'xlsx';

const AdminVotingStatistics: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [campaign, setCampaign] = useState<VotingCampaign | null>(null);
  const [entries, setEntries] = useState<VoteEntry[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const loadStatistics = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const response = await votingAPI.admin.getCampaign(id);

      if (response.success && response.data) {
        setCampaign(response.data.campaign);
        setEntries(response.data.entries || []);
        setStatistics(response.data.statistics);
      } else {
        toast({
          title: t('common.error'),
          description: t('voting.failedToLoadCampaignDetails'),
          variant: "destructive"
        });
        navigate('/admin/voting/campaigns');
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
      toast({
        title: t('common.error'),
        description: t('voting.failedToLoadCampaignDetails'),
        variant: "destructive"
      });
      navigate('/admin/voting/campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [id, timeRange]);

  const exportExcel = () => {
    if (!campaign || !entries) return;
    const data = entries
      .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
      .map((entry, index) => ({
        Rank: index + 1,
        Title: entry.title,
        Description: entry.description,
        'Vote Count': entry.voteCount || 0,
        Percentage: statistics?.totalVotes > 0 ? ((entry.voteCount || 0) / statistics.totalVotes * 100).toFixed(1) + '%' : '0.0%',
        'Created At': formatDateTime(entry.createdAt)
      }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Voting Results');
    XLSX.writeFile(wb, `${campaign.title}-voting-results.xlsx`);
    toast({
      title: t('common.success'),
      description: t('adminVoting.votingResultsExported'),
    });
  };

  const formatDate = (dateString: string) => formatDateTime(dateString);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'upcoming': return 'secondary';
      case 'closed': return 'outline';
      case 'draft': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-lg text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto max-w-full text-center">
        <div className="bg-white rounded-xl shadow-sm p-12 space-y-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('voting.campaignNotFound')}</h1>
          <Button asChild variant="outline">
            <div onClick={() => navigate('/admin/voting/campaigns')} className="cursor-pointer flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('adminVoting.backToCampaigns')}
            </div>
          </Button>
        </div>
      </div>
    );
  }

  const sortedEntries = [...entries].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

  return (
    <div className="container mx-auto max-w-full space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/voting/campaigns')}
            className="pl-0 gap-2 text-gray-500 hover:text-gray-900 hover:bg-transparent transition-colors -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('adminVoting.backToCampaigns')}
          </Button>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                {campaign.title}
              </h1>
              <Badge variant={getStatusBadgeVariant(campaign.status)} className="w-fit text-sm py-1 px-3">
                {t(`voting.status.${campaign.status}`)}
              </Badge>
            </div>
            <p className="text-gray-500 text-lg mt-2 line-clamp-2">{campaign.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-4 md:pt-12">
          <Button
            variant="outline"
            onClick={exportExcel}
            className="gap-2 bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm"
          >
            <Download className="h-4 w-4" />
            {t('adminVoting.exportExcel')}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/voting/campaigns/${id}`)}
            className="gap-2 bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm"
          >
            <Eye className="h-4 w-4" />
            {t('adminVoting.viewCampaign')}
          </Button>
        </div>
      </div>

      {/* Campaign Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{entries.length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('adminVoting.totalEntries')}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{statistics?.totalVotes || 0}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('adminVoting.totalVotes')}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-2">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{statistics?.uniqueVoters || 0}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('adminVoting.uniqueVoters')}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-2">
              <PieChart className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {entries.length > 0 ? Math.round((statistics?.totalVotes || 0) / entries.length) : 0}
            </div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('adminVoting.averageVotesPerEntry')}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaign Timeline */}
        <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl lg:col-span-1 h-fit">
          <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              {t('adminVoting.campaignTimeline')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">{t('adminVoting.start')}</span>
              <span className="font-medium text-gray-900 text-sm">{formatDate(campaign.startDate)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">{t('adminVoting.end')}</span>
              <span className="font-medium text-gray-900 text-sm">{formatDate(campaign.endDate)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">{t('adminVoting.pointsPerVote')}</span>
              <span className="font-medium text-gray-900 text-sm flex items-center gap-1"><Target className="h-3 w-3 text-orange-500" /> {campaign.pointsPerVote}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">{t('adminVoting.maxVotesPerUser')}</span>
              <span className="font-medium text-gray-900 text-sm">{campaign.maxVotesPerUser}</span>
            </div>
          </CardContent>
        </Card>

        {/* Voting Results */}
        <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl lg:col-span-2">
          <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-gray-500" />
                {t('adminVoting.finalVotingResults')}
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                {t('adminVoting.rankedByVotes')}
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
              <SelectTrigger className="w-[140px] h-9 text-xs border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            {sortedEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('adminVoting.rank')}</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('adminVoting.entry')}</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('adminVoting.votes')}</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('adminVoting.percentage')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100">
                    {sortedEntries.map((entry, index) => {
                      const percentage = statistics?.totalVotes > 0
                        ? ((entry.voteCount || 0) / statistics.totalVotes * 100).toFixed(1)
                        : '0.0';
                      return (
                        <TableRow key={entry.id} className="hover:bg-gray-50/50">
                          <TableCell className="px-6 py-4">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                  'bg-transparent text-gray-500'
                              }`}>
                              {index + 1}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                {entry.imageUrl ? (
                                  <img
                                    src={entry.imageUrl}
                                    alt={entry.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Trophy className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                              <div className="max-w-[180px] sm:max-w-xs">
                                <p className="font-medium text-gray-900 truncate">{entry.title}</p>
                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                  {entry.description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <span className="font-bold text-gray-900">{entry.voteCount || 0}</span>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-9">{percentage}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">{t('adminVoting.noEntriesFound')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminVotingStatistics;