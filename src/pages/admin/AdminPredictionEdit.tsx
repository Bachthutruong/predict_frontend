import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  ArrowLeft,
  Save,
  Loader2
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
    status: 'active',
    answer: ''
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
          status: predictionData.status || 'active',
          answer: predictionData.answer || predictionData.correctAnswer || ''
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
        status: formData.status,
        correctAnswer: formData.answer
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="container mx-auto p-4 sm:p-6 text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Prediction Not Found</h1>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          The prediction you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/admin/predictions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Predictions
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/admin/predictions/${id}`)}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.back')}</span>
          </Button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{t('admin.editPrediction')}</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {t('admin.editPredictionDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.predictionDetails')}</CardTitle>
          <CardDescription>
            {t('admin.updatePredictionInfo')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t('admin.title')} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={t('admin.enterPredictionTitle')}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('admin.description')} *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('admin.enterPredictionDescription')}
                rows={4}
                required
                className="w-full"
              />
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pointsCost">{t('admin.pointsCost')} *</Label>
                <Input
                  id="pointsCost"
                  type="number"
                  min="1"
                  value={formData.pointsCost}
                  onChange={(e) => handleInputChange('pointsCost', parseInt(e.target.value) || 0)}
                  placeholder="10"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t('admin.status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('admin.active')}</SelectItem>
                    <SelectItem value="finished">{t('admin.finished')}</SelectItem>
                    <SelectItem value="cancelled">{t('admin.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">{t('admin.correctAnswer')}</Label>
              <Input
                id="answer"
                value={formData.answer}
                onChange={(e) => handleInputChange('answer', e.target.value)}
                placeholder={t('admin.enterCorrectAnswer')}
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                {t('admin.answerDescription')}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/admin/predictions/${id}`)}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
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