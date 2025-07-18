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
  const { t } = useLanguage();
  
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

  const loadCampaign = async () => {
    if (!isEditing || !id) return;
    
    try {
      setIsLoading(true);
      const response = await votingAPI.admin.getCampaign(id);
      
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
    loadCampaign();
  }, [isEditing, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: t('adminVoting.validationError'),
        description: t('adminVoting.titleRequired'),
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: t('adminVoting.validationError'),
        description: t('adminVoting.descriptionRequired'),
        variant: "destructive"
      });
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: t('adminVoting.validationError'),
        description: t('adminVoting.startDateMustBeInFuture'),
        variant: "destructive"
      });
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      toast({
        title: t('adminVoting.validationError'),
        description: t('adminVoting.endDateMustBeAfterStart'),
        variant: "destructive"
      });
      return;
    }

    if (!isEditing && startDate <= new Date()) {
      toast({
        title: t('adminVoting.validationError'),
        description: t('adminVoting.startDateMustBeInFuture'),
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
          title: t('common.success'),
          description: isEditing ? t('adminVoting.campaignUpdatedSuccessfully') : t('adminVoting.campaignCreatedSuccessfully')
        });
        
        navigate('/admin/voting/campaigns');
      } else {
        toast({
          title: t('common.error'),
          description: response.message || (isEditing ? t('adminVoting.failedToUpdateCampaign') : t('adminVoting.failedToCreateCampaign')),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Failed to save campaign:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || (isEditing ? t('adminVoting.failedToUpdateCampaign') : t('adminVoting.failedToCreateCampaign')),
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
          {t('adminVoting.backToCampaigns')}
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? t('adminVoting.editCampaign') : t('adminVoting.createCampaign')}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? t('adminVoting.updatePredictionInfo') : t('adminVoting.setVotingSchedule')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              {t('adminVoting.basicInformation')}
            </CardTitle>
            <CardDescription>
              {t('adminVoting.campaignTitleDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">{t('adminVoting.entryTitle')} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={t('adminVoting.enterCampaignTitle')}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">{t('adminVoting.entryDescription')} *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('adminVoting.describeVotingCampaign')}
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">{t('adminVoting.featuredImage')}</Label>
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
              {t('adminVoting.schedule')}
            </CardTitle>
            <CardDescription>
              {t('adminVoting.setVotingSchedule')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">{t('adminVoting.startDateTime')} *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">{t('adminVoting.endDateTime')} *</Label>
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
              {t('adminVoting.votingSettings')}
            </CardTitle>
            <CardDescription>
              {t('adminVoting.configureVotingRules')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pointsPerVote">{t('adminVoting.pointsPerVote')}</Label>
                <Input
                  id="pointsPerVote"
                  type="number"
                  min="0"
                  max="1000"
                  value={formData.pointsPerVote}
                  onChange={(e) => handleInputChange('pointsPerVote', parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('adminVoting.pointsAwardedPerVote')}
                </p>
              </div>

              <div>
                <Label htmlFor="maxVotesPerUser">{t('adminVoting.maxVotesPerUser')}</Label>
                <Input
                  id="maxVotesPerUser"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxVotesPerUser}
                  onChange={(e) => handleInputChange('maxVotesPerUser', parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('adminVoting.maximumEntriesPerUser')}
                </p>
              </div>

              <div>
                <Label htmlFor="votingFrequency">{t('adminVoting.frequency')}</Label>
                <Select
                  value={formData.votingFrequency}
                  onValueChange={(value) => handleInputChange('votingFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">{t('adminVoting.oncePerCampaign')}</SelectItem>
                    <SelectItem value="daily">{t('adminVoting.oncePerDay')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('adminVoting.howOftenUsersCanVote')}
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
            {isSaving ? t('common.saving') : (isEditing ? t('common.save') : t('adminVoting.createCampaign'))}
          </Button>
          
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/admin/voting/campaigns')}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminVotingForm; 