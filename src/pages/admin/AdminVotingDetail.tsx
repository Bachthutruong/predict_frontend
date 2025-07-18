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
  Loader2,
  Settings
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
  
  // Form state for adding/editing entries
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
        
        // Reset form and close dialog
        setEntryFormData({ title: '', description: '', imageUrl: '' });
        setIsAddingEntry(false);
        
        // Reload campaign details
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
        
        // Reset form and close dialog
        setEntryFormData({ title: '', description: '', imageUrl: '' });
        setEditingEntry(null);
        
        // Reload campaign details
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
        
        // Reload campaign details
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
      case 'active':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
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

  if (!campaign) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">{t('voting.campaignNotFound')}</h3>
          <Button onClick={() => navigate('/admin/voting/campaigns')}>
            {t('adminVoting.backToCampaigns')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/voting/campaigns')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('adminVoting.backToCampaigns')}
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            <Badge variant={getStatusBadgeVariant(campaign.status)}>
              {t(`voting.status.${campaign.status}`)}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{campaign.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/admin/voting/campaigns/${id}/statistics`)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {t('adminVoting.statistics')}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate(`/admin/voting/campaigns/${id}/edit`)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {t('adminVoting.editCampaign')}
          </Button>
        </div>
      </div>

      {/* Campaign Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminVoting.totalEntries')}</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalEntries || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminVoting.totalVotes')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalVotes || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminVoting.uniqueVoters')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.uniqueVoters || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminVoting.pointsPerVote')}</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.pointsPerVote}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('adminVoting.campaignDetails')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">{t('adminVoting.schedule')}</h4>
              <div className="space-y-1 text-sm">
                <div><strong>{t('adminVoting.start')}:</strong> {formatDate(campaign.startDate)}</div>
                <div><strong>{t('adminVoting.end')}:</strong> {formatDate(campaign.endDate)}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">{t('adminVoting.votingRules')}</h4>
              <div className="space-y-1 text-sm">
                <div><strong>{t('adminVoting.maxVotesPerUser')}:</strong> {campaign.maxVotesPerUser}</div>
                <div><strong>{t('adminVoting.frequency')}:</strong> {campaign.votingFrequency === 'once' ? t('adminVoting.oncePerCampaign') : t('adminVoting.oncePerDay')}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('adminVoting.entries')} ({entries.length})</CardTitle>
              <CardDescription>
                {t('adminVoting.manageEntries')}
              </CardDescription>
            </div>
            
            <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t('adminVoting.addEntry')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('adminVoting.addNewEntry')}</DialogTitle>
                  <DialogDescription>
                    {t('adminVoting.createNewEntry')}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">{t('adminVoting.entryTitle')} *</Label>
                    <Input
                      id="title"
                      value={entryFormData.title}
                      onChange={(e) => setEntryFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('adminVoting.entryTitle')}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">{t('adminVoting.entryDescription')} *</Label>
                    <Textarea
                      id="description"
                      value={entryFormData.description}
                      onChange={(e) => setEntryFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('adminVoting.entryDescription')}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="imageUrl">{t('adminVoting.entryImage')}</Label>
                    <ImageUpload
                      value={entryFormData.imageUrl}
                      onChange={(url) => setEntryFormData(prev => ({ ...prev, imageUrl: url }))}
                      className="mt-2"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={closeEntryDialog}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleAddEntry}>
                    {t('adminVoting.addEntry')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('adminVoting.noEntriesYet')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('adminVoting.addEntriesForVoting')}
              </p>
              <Button onClick={() => setIsAddingEntry(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('adminVoting.addFirstEntry')}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('adminVoting.entry')}</TableHead>
                  <TableHead>{t('adminVoting.submittedBy')}</TableHead>
                  <TableHead>{t('adminVoting.voteCount')}</TableHead>
                  <TableHead>{t('adminVoting.entryStatus')}</TableHead>
                  <TableHead>{t('adminVoting.created')}</TableHead>
                  <TableHead className="text-right">{t('adminVoting.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {entry.imageUrl && (
                          <img 
                            src={entry.imageUrl} 
                            alt={entry.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{entry.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {entry.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {typeof entry.submittedBy === 'object' && entry.submittedBy 
                        ? entry.submittedBy.name 
                        : 'Admin'}
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-medium">{entry.voteCount}</div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={entry.status === 'approved' ? 'default' : 'secondary'}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {formatDate(entry.createdAt)}
                    </TableCell>
                    
                    <TableCell className="text-right">
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
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('adminVoting.editEntry')}</DialogTitle>
                              <DialogDescription>
                                {t('adminVoting.updateEntryDetails')}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-title">{t('adminVoting.entryTitle')} *</Label>
                                <Input
                                  id="edit-title"
                                  value={entryFormData.title}
                                  onChange={(e) => setEntryFormData(prev => ({ ...prev, title: e.target.value }))}
                                  placeholder={t('adminVoting.entryTitle')}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-description">{t('adminVoting.entryDescription')} *</Label>
                                <Textarea
                                  id="edit-description"
                                  value={entryFormData.description}
                                  onChange={(e) => setEntryFormData(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder={t('adminVoting.entryDescription')}
                                  rows={3}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-imageUrl">{t('adminVoting.entryImage')}</Label>
                                <ImageUpload
                                  value={entryFormData.imageUrl}
                                  onChange={(url) => setEntryFormData(prev => ({ ...prev, imageUrl: url }))}
                                  className="mt-2"
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button variant="outline" onClick={closeEntryDialog}>
                                {t('common.cancel')}
                              </Button>
                              <Button onClick={handleUpdateEntry}>
                                {t('common.save')}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVotingDetail; 