import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Coins,
  MessageSquare,
  // User,
  Calendar,
  // Star
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import apiService from '../../services/api';
// import type { Feedback } from '../../types';

interface FeedbackWithUser {
  id: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  pointsAwarded?: number;
  content?: string;
  rejectionReason?: string;
}

const AdminFeedback: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [feedback, setFeedback] = useState<FeedbackWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithUser | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [pointsToAward, setPointsToAward] = useState(10);
  const [rejectionReason, setRejectionReason] = useState('');

  // Pagination states
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [approvedCurrentPage, setApprovedCurrentPage] = useState(1);
  const [rejectedCurrentPage, setRejectedCurrentPage] = useState(1);
  const [allCurrentPage, setAllCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get('/admin/feedback');
      const feedbackData = response.data?.data || response.data || [];
      setFeedback(Array.isArray(feedbackData) ? feedbackData : []);
    } catch (error) {
      console.error('Failed to load feedback:', error);
      setFeedback([]);
      toast({
        title: t('common.error'),
        description: t('admin.failedToLoadFeedback'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedFeedback) return;

    setProcessingId(selectedFeedback.id);
    try {
      await apiService.patch(`/admin/feedback/${selectedFeedback.id}/approve`, {
        pointsAwarded: pointsToAward
      });

      toast({
        title: t('admin.feedbackApproved'),
        description: t('admin.pointsAwarded', { points: pointsToAward }),
        variant: "default"
      });

      setApproveDialogOpen(false);
      setSelectedFeedback(null);
      setPointsToAward(10);
      await loadFeedback();
    } catch (error) {
      console.error('Failed to approve feedback:', error);
      toast({
        title: t('common.error'),
        description: t('admin.failedToApproveFeedback'),
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedFeedback) return;

    setProcessingId(selectedFeedback.id);
    try {
      await apiService.patch(`/admin/feedback/${selectedFeedback.id}/reject`, {
        reason: rejectionReason
      });

      toast({
        title: t('admin.feedbackRejected'),
        description: t('admin.feedbackRejectedSuccessfully'),
        variant: "default"
      });

      setRejectDialogOpen(false);
      setSelectedFeedback(null);
      setRejectionReason('');
      await loadFeedback();
    } catch (error) {
      console.error('Failed to reject feedback:', error);
      toast({
        title: t('common.error'),
        description: t('admin.failedToRejectFeedback'),
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const pendingFeedback = feedback.filter(f => f.status === 'pending');
  const approvedFeedback = feedback.filter(f => f.status === 'approved');
  const rejectedFeedback = feedback.filter(f => f.status === 'rejected');

  const totalPointsAwarded = approvedFeedback.reduce((sum, f) => sum + (f.pointsAwarded || 0), 0);

  // Pagination calculations
  const pendingTotalPages = Math.ceil(pendingFeedback.length / itemsPerPage);
  const approvedTotalPages = Math.ceil(approvedFeedback.length / itemsPerPage);
  const rejectedTotalPages = Math.ceil(rejectedFeedback.length / itemsPerPage);
  const allTotalPages = Math.ceil(feedback.length / itemsPerPage);

  const paginatedPendingFeedback = pendingFeedback.slice(
    (pendingCurrentPage - 1) * itemsPerPage,
    pendingCurrentPage * itemsPerPage
  );
  const paginatedApprovedFeedback = approvedFeedback.slice(
    (approvedCurrentPage - 1) * itemsPerPage,
    approvedCurrentPage * itemsPerPage
  );
  const paginatedRejectedFeedback = rejectedFeedback.slice(
    (rejectedCurrentPage - 1) * itemsPerPage,
    rejectedCurrentPage * itemsPerPage
  );
  const paginatedAllFeedback = feedback.slice(
    (allCurrentPage - 1) * itemsPerPage,
    allCurrentPage * itemsPerPage
  );

  // Pagination component
  const PaginationControls: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          {t('common.previous')}
        </Button>

        <span className="text-sm text-gray-600">
          {t('admin.page')} {currentPage} {t('admin.of')} {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          {t('common.next')}
        </Button>
      </div>
    );
  };

  // Feedback table component
  const FeedbackTable: React.FC<{
    feedbackList: FeedbackWithUser[];
    onApprove?: (feedback: FeedbackWithUser) => void;
    onReject?: (feedback: FeedbackWithUser) => void;
    processingId: string | null;
    showActions?: boolean;
  }> = ({ feedbackList, processingId, showActions = false, onApprove, onReject }) => {
    if (feedbackList.length === 0) {
      return (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">{t('admin.noFeedbackFound')}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {feedbackList.map((item) => (
          <div key={item.id} className="group border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 transition-all hover:shadow-sm bg-white">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <Avatar className="h-10 w-10 border border-gray-100">
                  <AvatarImage src={item.user?.avatar} />
                  <AvatarFallback className="bg-blue-50 text-blue-600 font-medium text-xs">{getInitials(item.user?.name || '')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{item.user?.name}</h4>
                    <span className="text-gray-300 hidden sm:inline">•</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <Badge variant={getStatusVariant(item.status)} className={`capitalize ${item.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-200' : item.status === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}>
                      {t(`admin.${item.status}`)}
                    </Badge>
                  </div>

                  <p className="text-gray-700 text-sm leading-relaxed">{item.content}</p>

                  {(item.pointsAwarded || item.rejectionReason) && (
                    <div className="flex items-center gap-3 pt-2">
                      {item.pointsAwarded && (
                        <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200 flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          +{item.pointsAwarded} points
                        </Badge>
                      )}
                      {item.rejectionReason && (
                        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                          <span className="font-medium">{t('admin.rejectionReason')}:</span> {item.rejectionReason}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

              {showActions && item.status === 'pending' && (
                <div className="flex gap-2 sm:self-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 bg-white hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                    onClick={() => {
                      if (onApprove) onApprove(item);
                    }}
                    disabled={processingId === item.id}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {t('admin.approve')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                    onClick={() => {
                      if (onReject) onReject(item);
                    }}
                    disabled={processingId === item.id}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {t('admin.reject')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-lg text-gray-600">{t('admin.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-yellow-500" />
            {t('admin.reviewFeedback')}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            {t('admin.reviewFeedbackDescription')}
          </p>
        </div>
        <Button onClick={loadFeedback} variant="outline" className="gap-2 bg-white hover:bg-gray-50 shadow-sm border-gray-200">
          <RefreshCw className="h-4 w-4" />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{feedback.length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('admin.totalFeedback')}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-2">
              <Clock className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{pendingFeedback.length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('admin.pendingReview')}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{approvedFeedback.length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('admin.approved')}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-2">
              <Coins className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalPointsAwarded}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('admin.pointsAwarded')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Lists */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-gray-100/50 p-1 border border-gray-100 rounded-full w-full sm:w-auto inline-flex h-auto">
          <TabsTrigger value="pending" className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all h-auto">
            {t('admin.pending')} <span className="ml-2 py-0.5 px-2 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold group-data-[state=active]:bg-blue-50 group-data-[state=active]:text-blue-600">{pendingFeedback.length}</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm transition-all h-auto">
            {t('admin.approved')} <span className="ml-2 py-0.5 px-2 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold group-data-[state=active]:bg-green-50 group-data-[state=active]:text-green-600">{approvedFeedback.length}</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all h-auto">
            {t('admin.rejected')} <span className="ml-2 py-0.5 px-2 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold group-data-[state=active]:bg-red-50 group-data-[state=active]:text-red-600">{rejectedFeedback.length}</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all h-auto">
            {t('admin.all')} <span className="ml-2 py-0.5 px-2 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold group-data-[state=active]:bg-gray-50 group-data-[state=active]:text-gray-900">{feedback.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0">
          <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
            <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6">
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                {t('admin.pendingFeedback')}
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                {t('admin.pendingFeedbackDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <FeedbackTable
                feedbackList={paginatedPendingFeedback}
                onApprove={(feedback) => {
                  setSelectedFeedback(feedback);
                  setApproveDialogOpen(true);
                }}
                onReject={(feedback) => {
                  setSelectedFeedback(feedback);
                  setRejectDialogOpen(true);
                }}
                processingId={processingId}
                showActions={true}
              />
              <PaginationControls
                currentPage={pendingCurrentPage}
                totalPages={pendingTotalPages}
                onPageChange={setPendingCurrentPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-0">
          <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
            <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6">
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                {t('admin.approvedFeedback')}
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                {t('admin.approvedFeedbackDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <FeedbackTable
                feedbackList={paginatedApprovedFeedback}
                processingId={processingId}
                showActions={false}
              />
              <PaginationControls
                currentPage={approvedCurrentPage}
                totalPages={approvedTotalPages}
                onPageChange={setApprovedCurrentPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-0">
          <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
            <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6">
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                {t('admin.rejectedFeedback')}
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                {t('admin.rejectedFeedbackDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <FeedbackTable
                feedbackList={paginatedRejectedFeedback}
                processingId={processingId}
                showActions={false}
              />
              <PaginationControls
                currentPage={rejectedCurrentPage}
                totalPages={rejectedTotalPages}
                onPageChange={setRejectedCurrentPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
            <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6">
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                {t('admin.allFeedback')}
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                {t('admin.allFeedbackDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <FeedbackTable
                feedbackList={paginatedAllFeedback}
                processingId={processingId}
                showActions={false}
              />
              <PaginationControls
                currentPage={allCurrentPage}
                totalPages={allTotalPages}
                onPageChange={setAllCurrentPage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.approveFeedback')}</DialogTitle>
            <DialogDescription>
              {t('admin.approveFeedbackDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">{t('admin.pointsToAward')}</label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  value={pointsToAward}
                  onChange={(e) => setPointsToAward(parseInt(e.target.value) || 0)}
                  min="1"
                  max="1000"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setApproveDialogOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleApprove}
                disabled={processingId === selectedFeedback?.id}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {processingId === selectedFeedback?.id ? t('admin.approving') : t('admin.approve')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.rejectFeedback')}</DialogTitle>
            <DialogDescription>
              {t('admin.rejectFeedbackDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">{t('admin.rejectionReason')}</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t('admin.enterRejectionReason')}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={processingId === selectedFeedback?.id || !rejectionReason.trim()}
              >
                {processingId === selectedFeedback?.id ? t('admin.rejecting') : t('admin.reject')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeedback;