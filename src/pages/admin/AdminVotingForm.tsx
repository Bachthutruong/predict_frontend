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
import {
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
  Settings,
  Image as ImageIcon,
  Vote,
  FileText
} from 'lucide-react';
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

        const formatDateForInput = (dateString: string) => {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
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
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-lg text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-5xl space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/voting/campaigns')}
            className="pl-0 gap-2 text-gray-500 hover:text-gray-900 hover:bg-transparent transition-colors -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('adminVoting.backToCampaigns')}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Vote className="h-8 w-8 text-blue-600" />
            {isEditing ? t('adminVoting.editCampaign') : t('adminVoting.createCampaign')}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            {isEditing ? t('adminVoting.updatePredictionInfo') : t('adminVoting.setVotingSchedule')}
          </p>
        </div>

        <div className="flex gap-3 pt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/voting/campaigns')}
            className="h-11 px-6 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('common.saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? t('common.save') : t('adminVoting.createCampaign')}
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
          <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6 sm:px-8">
            <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              {t('adminVoting.basicInformation')}
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              {t('adminVoting.campaignTitleDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700">{t('adminVoting.entryTitle')} <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={t('adminVoting.enterCampaignTitle')}
                required
                className="h-12 text-lg px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-100 transition-all rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">{t('adminVoting.entryDescription')} <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('adminVoting.describeVotingCampaign')}
                rows={4}
                required
                className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-100 transition-all rounded-lg p-4"
              />
            </div>

            <div className="space-y-3 p-6 bg-gray-50/50 rounded-xl border border-gray-100">
              <Label htmlFor="imageUrl" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-gray-500" />
                {t('adminVoting.featuredImage')}
              </Label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => handleInputChange('imageUrl', url)}
                className="w-full bg-white border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Schedule */}
          <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl h-full">
            <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6 sm:px-8">
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                {t('adminVoting.schedule')}
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                {t('adminVoting.setVotingSchedule')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">{t('adminVoting.startDateTime')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                    className="h-11 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700">{t('adminVoting.endDateTime')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                    className="h-11 border-gray-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voting Settings */}
          <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl h-full">
            <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6 sm:px-8">
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                {t('adminVoting.votingSettings')}
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                {t('adminVoting.configureVotingRules')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pointsPerVote" className="text-sm font-semibold text-gray-700">{t('adminVoting.pointsPerVote')}</Label>
                  <Input
                    id="pointsPerVote"
                    type="number"
                    min="0"
                    max="1000"
                    value={formData.pointsPerVote}
                    onChange={(e) => handleInputChange('pointsPerVote', parseInt(e.target.value) || 0)}
                    className="h-11 border-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('adminVoting.pointsAwardedPerVote')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxVotesPerUser" className="text-sm font-semibold text-gray-700">{t('adminVoting.maxVotesPerUser')}</Label>
                  <Input
                    id="maxVotesPerUser"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxVotesPerUser}
                    onChange={(e) => handleInputChange('maxVotesPerUser', parseInt(e.target.value) || 1)}
                    className="h-11 border-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('adminVoting.maximumEntriesPerUser')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="votingFrequency" className="text-sm font-semibold text-gray-700">{t('adminVoting.frequency')}</Label>
                  <Select
                    value={formData.votingFrequency}
                    onValueChange={(value) => handleInputChange('votingFrequency', value)}
                  >
                    <SelectTrigger className="h-11 border-gray-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">{t('adminVoting.oncePerCampaign')}</SelectItem>
                      <SelectItem value="daily">{t('adminVoting.oncePerDay')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('adminVoting.howOftenUsersCanVote')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default AdminVotingForm;