import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { votingAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { ImageUpload } from '../../components/ui/image-upload';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Users,
  Trophy,
  Calendar,
  BarChart3,
  // Loader2,
  Settings,
  Target,
  FileText,
  ImageIcon,
  User,
  Vote
} from 'lucide-react';
import type { VotingCampaign, VoteEntry, CreateVoteEntryData } from '../../types';

const AdminVotingDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [campaign, setCampaign] = useState<VotingCampaign | null>(null);
  const [entries, setEntries] = useState<VoteEntry[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<VoteEntry | null>(null);

  const [entryFormData, setEntryFormData] = useState<CreateVoteEntryData>({
    title: '',
    description: '',
    imageUrl: ''
  });

  const loadCampaignDetails = async () => {
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
      console.error('Failed to load campaign:', error);
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
    loadCampaignDetails();
  }, [id]);

  const handleAddEntry = async () => {
    if (!entryFormData.title.trim() || !entryFormData.description.trim()) {
      toast({
        title: t('adminVoting.validationError'),
        description: t('adminVoting.titleRequired'),
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await votingAPI.admin.addEntry(id!, entryFormData);

      if (response.success) {
        toast({
          title: t('common.success'),
          description: t('adminVoting.entryAddedSuccessfully')
        });

        setEntryFormData({ title: '', description: '', imageUrl: '' });
        setIsAddingEntry(false);
        loadCampaignDetails();
      } else {
        toast({
          title: t('common.error'),
          description: response.message || t('adminVoting.failedToAddEntry'),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Failed to add entry:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('adminVoting.failedToAddEntry'),
        variant: "destructive"
      });
    }
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry || !entryFormData.title.trim() || !entryFormData.description.trim()) {
      toast({
        title: t('adminVoting.validationError'),
        description: t('adminVoting.titleRequired'),
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await votingAPI.admin.updateEntry(editingEntry.id, entryFormData);

      if (response.success) {
        toast({
          title: t('common.success'),
          description: t('adminVoting.entryUpdatedSuccessfully')
        });

        setEntryFormData({ title: '', description: '', imageUrl: '' });
        setEditingEntry(null);
        loadCampaignDetails();
      } else {
        toast({
          title: t('common.error'),
          description: response.message || t('adminVoting.failedToUpdateEntry'),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Failed to update entry:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('adminVoting.failedToUpdateEntry'),
        variant: "destructive"
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const response = await votingAPI.admin.deleteEntry(entryId);

      if (response.success) {
        toast({
          title: t('common.success'),
          description: t('adminVoting.entryDeletedSuccessfully')
        });
        loadCampaignDetails();
      } else {
        toast({
          title: t('common.error'),
          description: response.message || t('adminVoting.failedToDeleteEntry'),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Failed to delete entry:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('adminVoting.failedToDeleteEntry'),
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (entry: VoteEntry) => {
    setEditingEntry(entry);
    setEntryFormData({
      title: entry.title,
      description: entry.description,
      imageUrl: entry.imageUrl || ''
    });
  };

  const closeEntryDialog = () => {
    setIsAddingEntry(false);
    setEditingEntry(null);
    setEntryFormData({ title: '', description: '', imageUrl: '' });
  };

  const formatDate = (dateString: string) => formatDateTime(dateString);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
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
      <div className="container mx-auto p-6 sm:p-8 max-w-5xl text-center">
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

  return (
    <div className="container mx-auto max-w-full space-y-8 pb-10">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-4">
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
                <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
                <Badge variant={getStatusBadgeVariant(campaign.status)} className="w-fit text-sm py-1 px-3">
                  {t(`voting.status.${campaign.status}`)}
                </Badge>
              </div>
              <p className="text-gray-500 text-lg max-w-2xl mt-2">{campaign.description}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4 sm:pt-0">
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/voting/campaigns/${id}/statistics`)}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {t('adminVoting.statistics')}
            </Button>

            <Button
              onClick={() => navigate(`/admin/voting/campaigns/${id}/edit`)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            >
              <Settings className="h-4 w-4" />
              {t('adminVoting.editCampaign')}
            </Button>
          </div>
        </div>
      </div>

      {/* Campaign Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{statistics?.totalEntries || 0}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('adminVoting.totalEntries')}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
              <Vote className="h-5 w-5" />
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
              <Target className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{campaign.pointsPerVote}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('adminVoting.pointsPerVote')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details */}
      <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
        <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6 sm:px-8">
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            {t('adminVoting.campaignDetails')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">{t('adminVoting.schedule')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1">{t('adminVoting.start')}</div>
                  <div className="font-medium text-gray-900">{formatDate(campaign.startDate)}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1">{t('adminVoting.end')}</div>
                  <div className="font-medium text-gray-900">{formatDate(campaign.endDate)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">{t('adminVoting.votingRules')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1">{t('adminVoting.maxVotesPerUser')}</div>
                  <div className="font-medium text-gray-900">{campaign.maxVotesPerUser}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1">{t('adminVoting.frequency')}</div>
                  <div className="font-medium text-gray-900">{campaign.votingFrequency === 'once' ? t('adminVoting.oncePerCampaign') : t('adminVoting.oncePerDay')}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries */}
      <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
        <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl text-gray-800">{t('adminVoting.entries')} ({entries.length})</CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              {t('adminVoting.manageEntries')}
            </CardDescription>
          </div>

          <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                <Plus className="h-4 w-4" />
                {t('adminVoting.addEntry')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{t('adminVoting.addNewEntry')}</DialogTitle>
                <DialogDescription>
                  {t('adminVoting.createNewEntry')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 flex items-center gap-2"><FileText className="h-4 w-4 text-gray-500" /> {t('adminVoting.entryTitle')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    value={entryFormData.title}
                    onChange={(e) => setEntryFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={t('adminVoting.entryTitle')}
                    className="h-11 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">{t('adminVoting.entryDescription')} <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    value={entryFormData.description}
                    onChange={(e) => setEntryFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('adminVoting.entryDescription')}
                    rows={4}
                    className="resize-none border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-sm font-medium text-gray-700 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-gray-500" /> {t('adminVoting.entryImage')}</Label>
                  <ImageUpload
                    value={entryFormData.imageUrl}
                    onChange={(url) => setEntryFormData(prev => ({ ...prev, imageUrl: url }))}
                    className="w-full"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={closeEntryDialog}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleAddEntry} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {t('adminVoting.addEntry')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('adminVoting.noEntriesYet')}</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                {t('adminVoting.addEntriesForVoting')}
              </p>
              <Button onClick={() => setIsAddingEntry(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {t('adminVoting.addFirstEntry')}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('adminVoting.entry')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('adminVoting.submittedBy')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">{t('adminVoting.voteCount')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">{t('adminVoting.entryStatus')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('adminVoting.created')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('adminVoting.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                  {entries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-gray-50/80 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                            {entry.imageUrl ? (
                              <img
                                src={entry.imageUrl}
                                alt={entry.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{entry.title}</div>
                            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {entry.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-400" />
                          {typeof entry.submittedBy === 'object' && entry.submittedBy
                            ? entry.submittedBy.name
                            : 'Admin'}
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center bg-blue-50 text-blue-600 rounded-full h-6 min-w-[1.5rem] px-1.5 text-xs font-medium">
                          {entry.voteCount}
                        </span>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-center">
                        <Badge variant={entry.status === 'approved' ? 'default' : 'secondary'} className="font-normal capitalize shadow-sm">
                          {entry.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-gray-500 text-sm">
                        {formatDate(entry.createdAt)}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Dialog
                            open={editingEntry?.id === entry.id}
                            onOpenChange={(open) => !open && setEditingEntry(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(entry)}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl">
                              <DialogHeader>
                                <DialogTitle>{t('adminVoting.editEntry')}</DialogTitle>
                                <DialogDescription>
                                  {t('adminVoting.updateEntryDetails')}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-6 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700 flex items-center gap-2"><FileText className="h-4 w-4 text-gray-500" /> {t('adminVoting.entryTitle')} <span className="text-red-500">*</span></Label>
                                  <Input
                                    id="edit-title"
                                    value={entryFormData.title}
                                    onChange={(e) => setEntryFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder={t('adminVoting.entryTitle')}
                                    className="h-11 border-gray-200"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">{t('adminVoting.entryDescription')} <span className="text-red-500">*</span></Label>
                                  <Textarea
                                    id="edit-description"
                                    value={entryFormData.description}
                                    onChange={(e) => setEntryFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder={t('adminVoting.entryDescription')}
                                    rows={4}
                                    className="resize-none border-gray-200"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="edit-imageUrl" className="text-sm font-medium text-gray-700 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-gray-500" /> {t('adminVoting.entryImage')}</Label>
                                  <ImageUpload
                                    value={entryFormData.imageUrl}
                                    onChange={(url) => setEntryFormData(prev => ({ ...prev, imageUrl: url }))}
                                    className="w-full"
                                  />
                                </div>
                              </div>

                              <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={closeEntryDialog}>
                                  {t('common.cancel')}
                                </Button>
                                <Button onClick={handleUpdateEntry} className="bg-blue-600 hover:bg-blue-700 text-white">
                                  {t('common.save')}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('adminVoting.deleteEntry')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('adminVoting.deleteEntryDescription', { title: entry.title })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteEntry(entry.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVotingDetail;