import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { adminContestAPI } from '../../services/api';
import { useLanguage } from '../../hooks/useLanguage';
import { ImageUpload } from '../../components/ui/image-upload';

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
      if (response && response.data && response.data.contest ) {
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
    return <div className="flex items-center justify-center h-64 text-lg">{t('contests.loading')}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t('contests.editContest')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <Label htmlFor="title">{t('contests.title')}</Label>
              <Input id="title" value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder={t('contests.enterTitlePlaceholder')} required />
            </div>
            <div>
              <Label htmlFor="description">{t('contests.description')}</Label>
              <Textarea id="description" value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder={t('contests.enterDescriptionPlaceholder')} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">{t('contests.startDate')}</Label>
                <Input id="startDate" type="datetime-local" value={form.startDate} onChange={e => handleChange('startDate', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="endDate">{t('contests.endDate')}</Label>
                <Input id="endDate" type="datetime-local" value={form.endDate} onChange={e => handleChange('endDate', e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pointsPerAnswer">{t('contests.pointsPerAnswer')}</Label>
                <Input id="pointsPerAnswer" type="number" value={form.pointsPerAnswer} onChange={e => handleChange('pointsPerAnswer', parseInt(e.target.value))} placeholder={t('contests.pointsPerAnswerPlaceholder')} required />
              </div>
              <div>
                <Label htmlFor="rewardPoints">{t('contests.rewardPoints')}</Label>
                <Input id="rewardPoints" type="number" value={form.rewardPoints} onChange={e => handleChange('rewardPoints', parseInt(e.target.value))} placeholder={t('contests.rewardPointsPlaceholder')} required />
              </div>
            </div>
            <div>
              <Label htmlFor="imageUrl">{t('contests.contestImage')}</Label>
              <ImageUpload value={form.imageUrl} onChange={url => handleChange('imageUrl', url)} placeholder={t('contests.uploadContestImagePlaceholder')} />
              <p className="text-xs text-gray-500">{t('contests.optionalImageHint')}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => navigate(-1)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('contests.saveChanges')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContestEdit; 