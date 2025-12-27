import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { adminContestAPI } from '../../services/api';
import { useLanguage } from '../../hooks/useLanguage';
import { ImageUpload } from '../../components/ui/image-upload';

import { ArrowLeft, Save } from 'lucide-react';

const AdminContestEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    pointsPerAnswer: 0,
    rewardPoints: 0,
    imageUrl: ''
  });

  useEffect(() => {
    if (id) {
      loadContest();
    }
  }, [id]);

  const loadContest = async () => {
    try {
      setLoading(true);
      const response = await adminContestAPI.getContestById(id!);
      // @ts-ignore
      if (response && response.data && response.data.contest) {
        setForm({
          // @ts-ignore
          title: response.data.contest?.title || '',
          // @ts-ignore
          description: response.data.contest?.description || '',
          // @ts-ignore
          startDate: response.data.contest?.startDate ? response.data.contest?.startDate.slice(0, 16) : '',
          // @ts-ignore
          endDate: response.data.contest?.endDate ? response.data.contest?.endDate.slice(0, 16) : '',
          // @ts-ignore
          pointsPerAnswer: response.data.contest?.pointsPerAnswer || 0,
          // @ts-ignore
          rewardPoints: response.data.contest?.rewardPoints || 0,
          // @ts-ignore
          imageUrl: response.data.contest?.imageUrl || ''
        });
      } else {
        toast({ title: t('common.error'), description: t('contests.failedToFetchDetails'), variant: 'destructive' });
        navigate('/admin/contests');
      }
    } catch (error) {
      toast({ title: t('common.error'), description: t('contests.failedToFetchDetails'), variant: 'destructive' });
      navigate('/admin/contests');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const localToUTC = (local: string) => {
    if (!local) return '';
    const [date, time] = local.split('T');
    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');
    const d = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)));
    return d.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      startDate: localToUTC(form.startDate),
      endDate: localToUTC(form.endDate),
    };
    try {
      const response = await adminContestAPI.updateContest(id!, payload);
      if (response) {
        toast({ title: t('common.success'), description: t('contests.updatedSuccessfully') });
        navigate(`/admin/contests/${id}`);
      } else {
        toast({ title: t('common.error'), description: t('contests.failedToUpdateContest'), variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: t('common.error'), description: t('contests.failedToUpdateContest'), variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-lg text-gray-600">{t('contests.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto space-y-0 pb-12">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 pl-0 hover:pl-2 transition-all gap-2 text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">{t('contests.editContest')}</h1>
      </div>

      <Card className="border-0 shadow-google bg-white rounded-xl overflow-hidden">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">{t('contests.title')}</Label>
              <Input
                id="title"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                placeholder={t('contests.enterTitlePlaceholder')}
                className="mt-1.5 h-10"
                required
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">{t('contests.description')}</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder={t('contests.enterDescriptionPlaceholder')}
                className="mt-1.5 min-h-[120px]"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">{t('contests.startDate')}</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={e => handleChange('startDate', e.target.value)}
                  className="mt-1.5 h-10"
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">{t('contests.endDate')}</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={e => handleChange('endDate', e.target.value)}
                  className="mt-1.5 h-10"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="pointsPerAnswer" className="text-sm font-medium text-gray-700">{t('contests.pointsPerAnswer')}</Label>
                <Input
                  id="pointsPerAnswer"
                  type="number"
                  value={form.pointsPerAnswer}
                  onChange={e => handleChange('pointsPerAnswer', parseInt(e.target.value))}
                  placeholder={t('contests.pointsPerAnswerPlaceholder')}
                  className="mt-1.5 h-10"
                  required
                />
              </div>
              <div>
                <Label htmlFor="rewardPoints" className="text-sm font-medium text-gray-700">{t('contests.rewardPoints')}</Label>
                <Input
                  id="rewardPoints"
                  type="number"
                  value={form.rewardPoints}
                  onChange={e => handleChange('rewardPoints', parseInt(e.target.value))}
                  placeholder={t('contests.rewardPointsPlaceholder')}
                  className="mt-1.5 h-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">{t('contests.contestImage')}</Label>
              <div className="mt-1.5">
                <ImageUpload value={form.imageUrl} onChange={url => handleChange('imageUrl', url)} placeholder={t('contests.uploadContestImagePlaceholder')} />
              </div>
              <p className="text-xs text-gray-500 mt-2">{t('contests.optionalImageHint')}</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="h-10 px-6">{t('common.cancel')}</Button>
              <Button type="submit" className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md">
                <Save className="h-4 w-4" />
                {t('contests.saveChanges')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContestEdit; 