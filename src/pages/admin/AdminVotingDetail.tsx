import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { votingAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
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

  useEffect(() => {
    if (id) {
      loadCampaignDetails();
    }
  }, [id]);

  const loadCampaignDetails = async () => {
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
          description: "Failed to load campaign details",
          variant: "destructive"
        });
        navigate('/admin/voting/campaigns');
      }
    } catch (error) {
      console.error('Failed to load campaign:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign details",
        variant: "destructive"
      });
      navigate('/admin/voting/campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!entryFormData.title.trim() || !entryFormData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and description are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await votingAPI.admin.addEntry(id!, entryFormData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Entry added successfully"
        });
        
        // Reset form and close dialog
        setEntryFormData({ title: '', description: '', imageUrl: '' });
        setIsAddingEntry(false);
        
        // Reload campaign details
        loadCampaignDetails();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add entry",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Failed to add entry:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add entry",
        variant: "destructive"
      });
    }
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry || !entryFormData.title.trim() || !entryFormData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and description are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await votingAPI.admin.updateEntry(editingEntry.id, entryFormData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Entry updated successfully"
        });
        
        // Reset form and close dialog
        setEntryFormData({ title: '', description: '', imageUrl: '' });
        setEditingEntry(null);
        
        // Reload campaign details
        loadCampaignDetails();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update entry",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Failed to update entry:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update entry",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const response = await votingAPI.admin.deleteEntry(entryId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Entry deleted successfully"
        });
        
        // Reload campaign details
        loadCampaignDetails();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete entry",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Failed to delete entry:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete entry",
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
          <h3 className="text-lg font-medium mb-2">Campaign not found</h3>
          <Button onClick={() => navigate('/admin/voting/campaigns')}>
            Back to Campaigns
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
          Back to Campaigns
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            <Badge variant={getStatusBadgeVariant(campaign.status)}>
              {campaign.status}
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
            Statistics
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate(`/admin/voting/campaigns/${id}/edit`)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Edit Campaign
          </Button>
        </div>
      </div>

      {/* Campaign Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalEntries || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalVotes || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Voters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.uniqueVoters || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points/Vote</CardTitle>
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
            Campaign Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Schedule</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Start:</strong> {formatDate(campaign.startDate)}</div>
                <div><strong>End:</strong> {formatDate(campaign.endDate)}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Voting Rules</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Max votes per user:</strong> {campaign.maxVotesPerUser}</div>
                <div><strong>Frequency:</strong> {campaign.votingFrequency === 'once' ? 'Once per campaign' : 'Once per day'}</div>
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
              <CardTitle>Entries ({entries.length})</CardTitle>
              <CardDescription>
                Manage entries that users can vote for
              </CardDescription>
            </div>
            
            <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Entry</DialogTitle>
                  <DialogDescription>
                    Create a new entry for users to vote on
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={entryFormData.title}
                      onChange={(e) => setEntryFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Entry title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={entryFormData.description}
                      onChange={(e) => setEntryFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Entry description"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="imageUrl">Image</Label>
                    <ImageUpload
                      value={entryFormData.imageUrl}
                      onChange={(url) => setEntryFormData(prev => ({ ...prev, imageUrl: url }))}
                      className="mt-2"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={closeEntryDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEntry}>
                    Add Entry
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
              <h3 className="text-lg font-medium mb-2">No entries yet</h3>
              <p className="text-muted-foreground mb-4">
                Add entries for users to vote on
              </p>
              <Button onClick={() => setIsAddingEntry(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Entry
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entry</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Votes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                              <DialogTitle>Edit Entry</DialogTitle>
                              <DialogDescription>
                                Update entry details
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-title">Title *</Label>
                                <Input
                                  id="edit-title"
                                  value={entryFormData.title}
                                  onChange={(e) => setEntryFormData(prev => ({ ...prev, title: e.target.value }))}
                                  placeholder="Entry title"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-description">Description *</Label>
                                <Textarea
                                  id="edit-description"
                                  value={entryFormData.description}
                                  onChange={(e) => setEntryFormData(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Entry description"
                                  rows={3}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-imageUrl">Image</Label>
                                <ImageUpload
                                  value={entryFormData.imageUrl}
                                  onChange={(url) => setEntryFormData(prev => ({ ...prev, imageUrl: url }))}
                                  className="mt-2"
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button variant="outline" onClick={closeEntryDialog}>
                                Cancel
                              </Button>
                              <Button onClick={handleUpdateEntry}>
                                Update Entry
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
                              <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{entry.title}"? 
                                This action cannot be undone and will remove all votes for this entry.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
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