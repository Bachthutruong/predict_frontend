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
  Loader2
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
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/predictions')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold">
            {t('admin.createPrediction')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.createEditPredictions')}
          </p>
        </div>
      </div>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.predictionDetails')}</CardTitle>
          <CardDescription>
            {t('admin.createEditPredictions')}
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

            <div className="space-y-2">
              <Label htmlFor="image">{t('admin.predictionImage')}</Label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => handleInputChange('imageUrl', url)}
                placeholder={t('admin.uploadPredictionImage')}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                {t('admin.imageDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pointsCost">{t('admin.pointsCost')} *</Label>
                <Input
                  id="pointsCost"
                  type="number"
                  min="1"
                  value={formData.pointsCost}
                  onChange={(e) => handleInputChange('pointsCost', parseInt(e.target.value) || 0)}
                  required
                  className="w-full"
                />
                <p className="text-sm text-gray-500">Điểm trừ khi dự đoán sai</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rewardPoints">Điểm thưởng *</Label>
                <Input
                  id="rewardPoints"
                  type="number"
                  min="1"
                  value={formData.rewardPoints}
                  onChange={(e) => handleInputChange('rewardPoints', parseInt(e.target.value) || 0)}
                  required
                  className="w-full"
                />
                <p className="text-sm text-gray-500">Điểm cộng khi dự đoán đúng</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t('admin.status')} *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('admin.active')}</SelectItem>
                    <SelectItem value="inactive">{t('admin.inactive')}</SelectItem>
                    <SelectItem value="pending">{t('admin.pending')}</SelectItem>
                    <SelectItem value="completed">{t('admin.completed')}</SelectItem>
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
              <p className="text-sm text-muted-foreground">
                {t('admin.answerDescription')}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/predictions')}
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
