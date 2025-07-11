import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { votingAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '../../components/ui/image-upload';
import { ArrowLeft, Save, Loader2, Calendar, Settings, Image } from 'lucide-react';
import type { CreateVotingCampaignData } from '../../types';

const AdminVotingForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const isEditing = Boolean(id);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CreateVotingCampaignData>({
    title: '',
    description: '',
    imageUrl: '',
    startDate: '',
    endDate: '',
    pointsPerVote: 10,
    maxVotesPerUser: 1,
    votingFrequency: 'once',
  } as CreateVotingCampaignData);

  useEffect(() => {
    if (isEditing && id) {
      loadCampaign();
    }
  }, [isEditing, id]);

  const loadCampaign = async () => {
    try {
      setIsLoading(true);
      const response = await votingAPI.admin.getCampaign(id!);
      
      if (response.success && response.data?.campaign) {
        const campaign = response.data.campaign;
        
        // Convert dates for datetime-local input
        const formatDateForInput = (dateString: string) => {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16); // Remove seconds and timezone
        };

        setFormData({
          title: campaign.title,
          description: campaign.description,
          imageUrl: campaign.imageUrl || '',
          startDate: formatDateForInput(campaign.startDate),
          endDate: formatDateForInput(campaign.endDate),
          pointsPerVote: campaign.pointsPerVote,
          maxVotesPerUser: campaign.maxVotesPerUser,
          votingFrequency: campaign.votingFrequency,
        } as CreateVotingCampaignData);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Start and end dates are required",
        variant: "destructive"
      });
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive"
      });
      return;
    }

    if (!isEditing && startDate <= new Date()) {
      toast({
        title: "Validation Error",
        description: "Start date must be in the future",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const submitData = {
        ...formData,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      const response = isEditing 
        ? await votingAPI.admin.updateCampaign(id!, submitData)
        : await votingAPI.admin.createCampaign(submitData);

      if (response.success) {
        toast({
          title: "Success",
          description: `Campaign ${isEditing ? 'updated' : 'created'} successfully`
        });
        
        navigate('/admin/voting/campaigns');
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to ${isEditing ? 'update' : 'create'} campaign`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Failed to save campaign:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} campaign`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof CreateVotingCampaignData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/voting/campaigns')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Campaign' : 'Create New Campaign'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update campaign details and settings' : 'Set up a new voting campaign'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Campaign title, description, and featured image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Campaign Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter campaign title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the voting campaign"
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Featured Image</Label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => handleInputChange('imageUrl', url)}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </CardTitle>
            <CardDescription>
              Set when the voting campaign starts and ends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date & Time *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date & Time *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voting Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Voting Settings
            </CardTitle>
            <CardDescription>
              Configure voting rules and point rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pointsPerVote">Points per Vote</Label>
                <Input
                  id="pointsPerVote"
                  type="number"
                  min="0"
                  max="1000"
                  value={formData.pointsPerVote}
                  onChange={(e) => handleInputChange('pointsPerVote', parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Points awarded to users for each vote
                </p>
              </div>

              <div>
                <Label htmlFor="maxVotesPerUser">Max Votes per User</Label>
                <Input
                  id="maxVotesPerUser"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxVotesPerUser}
                  onChange={(e) => handleInputChange('maxVotesPerUser', parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum entries each user can vote for
                </p>
              </div>

              <div>
                <Label htmlFor="votingFrequency">Voting Frequency</Label>
                <Select
                  value={formData.votingFrequency}
                  onValueChange={(value) => handleInputChange('votingFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once per campaign</SelectItem>
                    <SelectItem value="daily">Once per day</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  How often users can vote
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : (isEditing ? 'Update Campaign' : 'Create Campaign')}
          </Button>
          
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/admin/voting/campaigns')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminVotingForm; 