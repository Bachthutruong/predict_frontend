import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { votingAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
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
  Loader2,
  Download,
  Eye
} from 'lucide-react';
import type { VotingCampaign, VoteEntry } from '../../types';
import * as XLSX from 'xlsx';

const AdminVotingStatistics: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [campaign, setCampaign] = useState<VotingCampaign | null>(null);
  const [entries, setEntries] = useState<VoteEntry[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    if (id) {
      loadStatistics();
    }
  }, [id, timeRange]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await votingAPI.admin.getCampaign(id!);
      
      if (response.success && response.data) {
        setCampaign(response.data.campaign);
        setEntries(response.data.entries || []);
        setStatistics(response.data.statistics);
      } else {
        toast({
          title: "Error",
          description: "Failed to load campaign statistics",
          variant: "destructive"
        });
        navigate('/admin/voting/campaigns');
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign statistics",
        variant: "destructive"
      });
      navigate('/admin/voting/campaigns');
    } finally {
      setIsLoading(false);
    }
  };

//   const exportData = () => {
//     if (!campaign || !entries) return;

//     const csvData = [
//       ['Entry Title', 'Description', 'Vote Count', 'Rank', 'Created At'],
//       ...entries
//         .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
//         .map((entry, index) => [
//           entry.title,
//           entry.description,
//           entry.voteCount || 0,
//           index + 1,
//           new Date(entry.createdAt).toLocaleDateString()
//         ])
//     ];

//     const csvContent = csvData.map(row => row.join(',')).join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `${campaign.title}-voting-results.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);

//     toast({
//       title: "Export Successful",
//       description: "Voting results have been exported to CSV",
//     });
//   };

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
        'Created At': new Date(entry.createdAt).toLocaleDateString()
      }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Voting Results');
    XLSX.writeFile(wb, `${campaign.title}-voting-results.xlsx`);
    toast({
      title: 'Export Successful',
      description: 'Voting results have been exported to Excel',
    });
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'upcoming': return 'Upcoming';
      case 'closed': return 'Closed';
      case 'draft': return 'Draft';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Campaign not found</p>
        </div>
      </div>
    );
  }

  const sortedEntries = [...entries].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 w-full">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/voting/campaigns')}
          className="flex items-center gap-2 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
            <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2 truncate break-words max-w-full">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="truncate break-words max-w-full">{campaign.title} - Statistics</span>
            </h1>
            <Badge variant={getStatusBadgeVariant(campaign.status)} className="text-xs px-2 py-1 max-w-full truncate">
              {getStatusLabel(campaign.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 truncate break-words max-w-full">{campaign.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button 
            variant="outline"
            onClick={exportExcel}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(`/admin/voting/campaigns/${id}`)}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <Eye className="h-4 w-4" />
            View Campaign
          </Button>
        </div>
      </div>

      {/* Campaign Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
            <p className="text-xs text-muted-foreground">
              Submitted for voting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalVotes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Voters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.uniqueVoters || 0}</div>
            <p className="text-xs text-muted-foreground">
              Participated in voting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Votes/Entry</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {entries.length > 0 ? Math.round((statistics?.totalVotes || 0) / entries.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Average votes per entry
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Campaign Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Start Date</h4>
              <p className="text-muted-foreground">{formatDate(campaign.startDate)}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">End Date</h4>
              <p className="text-muted-foreground">{formatDate(campaign.endDate)}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Points per Vote</h4>
              <p className="text-muted-foreground">{campaign.pointsPerVote} points</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Max Votes per User</h4>
              <p className="text-muted-foreground">{campaign.maxVotesPerUser} votes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voting Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Voting Results
            </CardTitle>
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>
            Final voting results ranked by vote count
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedEntries.length > 0 ? (
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[300px] md:min-w-0 w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Entry</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="text-right">Votes</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEntries.map((entry, index) => {
                    const percentage = statistics?.totalVotes > 0 
                      ? ((entry.voteCount || 0) / statistics.totalVotes * 100).toFixed(1)
                      : '0.0';
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Badge variant={index < 3 ? 'default' : 'outline'} className="text-xs px-2 py-1">#{index + 1}</Badge>
                          {index < 3 && (
                            <Trophy className="h-4 w-4 text-yellow-500 inline ml-1" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entry.imageUrl && (
                              <img 
                                src={entry.imageUrl} 
                                alt={entry.title}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium truncate max-w-[120px] md:max-w-none">{entry.title}</p>
                              <p className="text-xs text-muted-foreground hidden md:block">
                                {formatDate(entry.createdAt)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] hidden md:table-cell">
                          <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                            {entry.description}
                          </p>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {entry.voteCount || 0}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {percentage}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No entries found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVotingStatistics; 