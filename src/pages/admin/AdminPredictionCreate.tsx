import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ImageUpload } from '../../components/ui/image-upload';
import {
  ArrowLeft,
  Save,
  Loader2,
  Target,
  Coins,
  FileText,
  Key,
  ShieldCheck,
  ImageIcon
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import apiService from '../../services/api';

const AdminPredictionCreate: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pointsCost: 10,
    rewardPoints: 15, // Default to 1.5x pointsCost
    status: 'active',
    answer: '',
    imageUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: t('common.error'),
        description: t('admin.fillAllFields'),
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiService.post('/admin/predictions', {
        title: formData.title,
        description: formData.description,
        pointsCost: formData.pointsCost,
        rewardPoints: formData.rewardPoints,
        status: formData.status,
        correctAnswer: formData.answer,
        imageUrl: formData.imageUrl
      });

      if (response.data?.success) {
        toast({
          title: t('common.success'),
          description: t('admin.predictionCreatedSuccessfully'),
          variant: 'default',
        });
        navigate('/admin/predictions');
      } else {
        toast({
          title: t('common.error'),
          description: t('admin.failedToCreatePrediction'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to create prediction:', error);
      toast({
        title: t('common.error'),
        description: t('admin.failedToCreatePrediction'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      } as any;
      // Only auto-calc on create if rewardPoints has not been manually edited
      if (field === 'pointsCost' && (!prev.rewardPoints || prev.rewardPoints === Math.round(Number(prev.pointsCost) * 1.5))) {
        newData.rewardPoints = Math.round(Number(value) * 1.5);
      }
      return newData;
    });
  };

  return (
    <div className="container mx-auto max-w-full space-y-0 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/predictions')}
            className="pl-0 gap-2 text-gray-500 hover:text-gray-900 hover:bg-transparent transition-colors -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            {t('admin.createPrediction')}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            {t('admin.createEditPredictions')}
          </p>
        </div>
      </div>

      {/* Create Form */}
      <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
        <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6 sm:px-8">
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            {t('admin.predictionDetails')}
          </CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            {t('admin.enterPredictionInformation')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Info */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700">{t('admin.title')} <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('admin.enterPredictionTitle')}
                  required
                  className="h-12 text-lg px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-100 transition-all rounded-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">{t('admin.description')} <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('admin.enterPredictionDescription')}
                  rows={5}
                  required
                  className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-100 transition-all rounded-lg p-4"
                />
              </div>
            </div>

            {/* Image */}
            <div className="space-y-3 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
              <Label htmlFor="image" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-gray-500" />
                {t('admin.predictionImage')}
              </Label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => handleInputChange('imageUrl', url)}
                placeholder={t('admin.uploadPredictionImage')}
                className="w-full bg-white border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors rounded-xl"
              />
              <p className="text-sm text-gray-500 ml-1">
                {t('admin.imageDescription')}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Points & Rewards */}
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Coins className="h-4 w-4" />
                  {t('admin.pointsConfig')}
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pointsCost" className="text-sm font-medium text-gray-700">{t('admin.pointsCost')} <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">-</span>
                      <Input
                        id="pointsCost"
                        type="number"
                        min="1"
                        value={formData.pointsCost}
                        onChange={(e) => handleInputChange('pointsCost', parseInt(e.target.value) || 0)}
                        required
                        className="pl-6 h-11 border-gray-200"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Điểm người chơi bị trừ khi dự đoán sai</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rewardPoints" className="text-sm font-medium text-gray-700">Điểm thưởng <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-semibold">+</span>
                      <Input
                        id="rewardPoints"
                        type="number"
                        min="1"
                        value={formData.rewardPoints}
                        onChange={(e) => handleInputChange('rewardPoints', parseInt(e.target.value) || 0)}
                        required
                        className="pl-6 h-11 border-gray-200"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Điểm người chơi nhận được khi dự đoán đúng</p>
                  </div>
                </div>
              </div>

              {/* Status & Answer */}
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                  <ShieldCheck className="h-4 w-4" />
                  {t('admin.controlSettings')}
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700">{t('admin.status')} <span className="text-red-500">*</span></Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger className="h-11 border-gray-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active" className="text-green-600 focus:text-green-700">{t('admin.active')}</SelectItem>
                        <SelectItem value="inactive" className="text-gray-600 focus:text-gray-700">{t('admin.inactive')}</SelectItem>
                        <SelectItem value="pending" className="text-orange-600 focus:text-orange-700">{t('admin.pending')}</SelectItem>
                        <SelectItem value="completed" className="text-blue-600 focus:text-blue-700">{t('admin.completed')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="answer" className="text-sm font-medium text-gray-700">{t('admin.correctAnswer')}</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="answer"
                        value={formData.answer}
                        onChange={(e) => handleInputChange('answer', e.target.value)}
                        placeholder={t('admin.enterCorrectAnswer')}
                        className="pl-9 h-11 border-gray-200"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {t('admin.answerDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end pt-6 border-t border-gray-100 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/predictions')}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 h-11 border-gray-200 hover:bg-gray-50 text-gray-700"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-8 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('admin.createPrediction')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPredictionCreate;
