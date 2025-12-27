import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import type { Prediction } from '../../types';

const AdminPredictionEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pointsCost: 0,
    rewardPoints: 0,
    status: 'active',
    answer: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (id) {
      loadPrediction();
    }
  }, [id]);

  const loadPrediction = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get(`/admin/predictions/${id}`);

      if (response.data?.success && response.data?.data) {
        const predictionData = response.data.data;
        setPrediction(predictionData);
        setFormData({
          title: predictionData.title || '',
          description: predictionData.description || '',
          pointsCost: predictionData.pointsCost || 0,
          rewardPoints: typeof predictionData.rewardPoints === 'number' && predictionData.rewardPoints > 0
            ? predictionData.rewardPoints
            : Math.round((predictionData.pointsCost || 0) * 1.5),
          status: predictionData.status || 'active',
          answer: predictionData.correctAnswer || predictionData.answer || '',
          imageUrl: predictionData.imageUrl || ''
        });
      } else {
        toast({
          title: t('common.error'),
          description: t('admin.failedToLoadPredictions'),
          variant: 'destructive',
        });
        navigate('/admin/predictions');
      }
    } catch (error) {
      console.error('Failed to load prediction:', error);
      toast({
        title: t('common.error'),
        description: t('admin.failedToLoadPredictions'),
        variant: 'destructive',
      });
      navigate('/admin/predictions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: t('common.error'),
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiService.put(`/admin/predictions/${id}`, {
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
          description: 'Prediction updated successfully!',
          variant: 'default',
        });
        navigate(`/admin/predictions/${id}`);
      } else {
        toast({
          title: t('common.error'),
          description: 'Failed to update prediction',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to update prediction:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to update prediction',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const newData: any = {
        ...prev,
        [field]: value
      };
      // Do not override rewardPoints if admin is editing it directly
      if (field === 'pointsCost' && (prev.rewardPoints === Math.round(Number(prev.pointsCost) * 1.5))) {
        newData.rewardPoints = Math.round(Number(value) * 1.5);
      }
      return newData;
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 sm:p-8 max-w-5xl flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-lg text-gray-600">{t('admin.loading')}</div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="container mx-auto p-6 sm:p-8 max-w-5xl text-center">
        <div className="bg-white rounded-xl shadow-sm p-12 space-y-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Prediction Not Found</h1>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">
            The prediction you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/admin/predictions')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Predictions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-full space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => navigate(`/admin/predictions/${id}`)}
            className="pl-0 gap-2 text-gray-500 hover:text-gray-900 hover:bg-transparent transition-colors -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.back')}</span>
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            {t('admin.editPrediction')}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            {t('admin.editPredictionDescription')}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
        <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6 sm:px-8">
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            {t('admin.predictionDetails')}
          </CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            {t('admin.updatePredictionInfo')}
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
                        placeholder="10"
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
                        placeholder="15"
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
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700">{t('admin.status')}</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger className="h-11 border-gray-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active" className="text-green-600 focus:text-green-700">{t('admin.active')}</SelectItem>
                        <SelectItem value="finished" className="text-blue-600 focus:text-blue-700">{t('admin.finished')}</SelectItem>
                        <SelectItem value="cancelled" className="text-gray-600 focus:text-gray-700">{t('admin.cancelled')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="answer" className="text-sm font-medium text-gray-700">{t('admin.correctAnswer')}</Label>
                    {formData.answer === '***ENCRYPTED***' ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <Key className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-red-600">
                          {t('admin.encryptedAnswerMessage')}
                        </p>
                      </div>
                    ) : (
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
                    )}
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
                onClick={() => navigate(`/admin/predictions/${id}`)}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 h-11 border-gray-200 hover:bg-gray-50 text-gray-700"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSaving || formData.answer === '***ENCRYPTED***'}
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
                    {t('common.save')}
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

export default AdminPredictionEdit;