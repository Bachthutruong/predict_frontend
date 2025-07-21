import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { adminContestAPI } from '../../services/api';
import type { Contest } from '../../types';
import { useToast } from '../../hooks/use-toast';
import { ImageUpload } from '../../components/ui/image-upload';
import { useLanguage } from '../../hooks/useLanguage';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Tooltip } from '../../components/ui/tooltip';

const AdminContests: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    pointsPerAnswer: 0,
    rewardPoints: 0,
    imageUrl: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contestToDelete, setContestToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await adminContestAPI.getContests();
      // console.log('response:', response); // Xóa debug log
      if (response.data) {
        // Normalize authorId and id
        const normalized = (response.data || []).map((c: any) => ({
          ...c,
          authorId: typeof c.authorId === 'object' && c.authorId !== null ? c.authorId.id : c.authorId,
          id: typeof c.id === 'object' && c.id !== null ? c.id.toString() : c.id,
        }));
        setContests(normalized);
      }
    } catch (error) {
      // console.error('Error fetching contests:', error);
      toast({
        title: t('common.error'),
        description: t('contests.failedToFetchContests'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const localToUTC = (local: string) => {
    if (!local) return '';
    const [date, time] = local.split('T');
    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');
    const d = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)));
    return d.toISOString();
  };

  // Thêm hàm formatUTC giống AdminContestDetail
  const formatUTC = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} ${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
  };

  const handleCreateContest = async () => {
    const payload = {
      ...createForm,
      startDate: localToUTC(createForm.startDate),
      endDate: localToUTC(createForm.endDate),
    };
    try {
      const response = await adminContestAPI.createContest(payload);
      if (response) {
        toast({
          title: t('common.success'),
          description: t('contests.createdSuccessfully'),
        });
        setIsCreateDialogOpen(false);
        setCreateForm({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          pointsPerAnswer: 0,
          rewardPoints: 0,
          imageUrl: '',
        });
        fetchContests();
      }
    } catch (error) {
      // console.error('Error creating contest:', error);
      toast({
        title: t('common.error'),
        description: t('contests.failedToCreateContest'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteContest = async (contestId: string) => {
    try {
      const response = await adminContestAPI.deleteContest(contestId);
      if (response.success) {
        toast({
          title: t('common.success'),
          description: t('contests.deletedSuccessfully'),
        });
        fetchContests();
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('contests.failedToDeleteContest'),
        variant: 'destructive',
      });
    }
  };

  // Sửa getStatusBadge để đồng bộ logic
  const getStatusBadge = (contest: Contest) => {
    // Lấy giờ hiện tại ở GMT+7
    const now = new Date();
    const nowGMT7 = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const start = new Date(contest.startDate);
    const end = new Date(contest.endDate);
    if (contest.isAnswerPublished) {
      return <Badge variant="secondary">{t('contests.answerPublished')}</Badge>;
    }
    if (nowGMT7 < start) {
      return <Badge variant="outline">{t('contests.upcoming')}</Badge>;
    } else if (nowGMT7 >= start && nowGMT7 <= end) {
      return <Badge variant="default">{t('contests.active')}</Badge>;
    } else {
      return <Badge variant="secondary">{t('contests.ended')}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('contests.loading')}</div>
        </div>
      </div>
    );
  }

  // Debug: log contests dat
  return (
    <div className="container bg-white rounded-lg shadow-md mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('contests.management')}</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>{t('contests.createNew')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('contests.createNew')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">{t('contests.title')}</Label>
                <Input
                  id="title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder={t('contests.enterTitlePlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="description">{t('contests.description')}</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder={t('contests.enterDescriptionPlaceholder')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">{t('contests.startDate')}</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">{t('contests.endDate')}</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pointsPerAnswer">{t('contests.pointsPerAnswer')}</Label>
                  <Input
                    id="pointsPerAnswer"
                    type="number"
                    value={createForm.pointsPerAnswer}
                    onChange={(e) => setCreateForm({ ...createForm, pointsPerAnswer: parseInt(e.target.value) })}
                    placeholder={t('contests.pointsPerAnswerPlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="rewardPoints">{t('contests.rewardPoints')}</Label>
                  <Input
                    id="rewardPoints"
                    type="number"
                    value={createForm.rewardPoints}
                    onChange={(e) => setCreateForm({ ...createForm, rewardPoints: parseInt(e.target.value) })}
                    placeholder={t('contests.rewardPointsPlaceholder')}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="imageUrl">{t('contests.contestImage')}</Label>
                <ImageUpload
                  value={createForm.imageUrl}
                  onChange={(url) => setCreateForm({ ...createForm, imageUrl: url })}
                  placeholder={t('contests.uploadContestImagePlaceholder')}
                />
                <p className="text-xs text-gray-500">{t('contests.optionalImageHint')}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>{t('contests.cancel')}</Button>
                <Button onClick={handleCreateContest}>{t('contests.createContest')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {contests.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">{t('contests.noContestsFound')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('contests.contestImage')}</TableHead>
                  <TableHead>{t('contests.title')}</TableHead>
                  <TableHead>{t('contests.description')}</TableHead>
                  <TableHead>{t('contests.startDate')}</TableHead>
                  <TableHead>{t('contests.endDate')}</TableHead>
                  <TableHead>{t('contests.pointsPerAnswer')}</TableHead>
                  <TableHead>{t('contests.rewardPoints')}</TableHead>
                  <TableHead className="text-center">{t('contests.status')}</TableHead>
                  <TableHead className="text-center">{t('contests.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contests.map((contest) => (
                  <TableRow key={contest.id}>
                    <TableCell>
                      {contest.imageUrl ? (
                        <img
                          src={contest.imageUrl}
                          alt={contest.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-400">
                          {t('contests.noImage')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{contest.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{contest.description}</TableCell>
                    <TableCell>{formatUTC(contest.startDate)}</TableCell>
                    <TableCell>{formatUTC(contest.endDate)}</TableCell>
                    <TableCell>{contest.pointsPerAnswer}</TableCell>
                    <TableCell>{contest.rewardPoints}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(contest)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Tooltip content={t('contests.viewDetails')}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/contests/${contest.id}`)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-5 w-5" />
                            <span className="sr-only">{t('contests.viewDetails')}</span>
                          </Button>
                        </Tooltip>
                        <Tooltip content={t('contests.edit')}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/contests/${contest.id}/edit`)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-5 w-5" />
                            <span className="sr-only">{t('contests.edit')}</span>
                          </Button>
                        </Tooltip>
                        <Tooltip content={t('contests.delete')}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setContestToDelete(contest.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-5 w-5 text-destructive" />
                            <span className="sr-only">{t('contests.delete')}</span>
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      {/* Dialog xác nhận xoá contest */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('contests.delete')}</DialogTitle>
          </DialogHeader>
          <p>{t('contests.confirmDelete')}</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('contests.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (contestToDelete) {
                  await handleDeleteContest(contestToDelete);
                  setDeleteDialogOpen(false);
                  setContestToDelete(null);
                }
              }}
            >
              {t('contests.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContests; 