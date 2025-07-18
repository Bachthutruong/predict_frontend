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
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          {t('common.previous')}
        </Button>
        
        <span className="text-sm">
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
  }> = ({ feedbackList, processingId, showActions = false }) => {
    if (feedbackList.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">{t('admin.noFeedbackFound')}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {feedbackList.map((item) => (
          <div key={item.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={item.user?.avatar} />
                  <AvatarFallback>{getInitials(item.user?.name || '')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{item.user?.name}</h4>
                    <Badge variant={getStatusVariant(item.status)}>
                      {t(`admin.${item.status}`)}
                    </Badge>
                    {item.pointsAwarded && (
                      <Badge variant="outline" className="text-green-600">
                        <Coins className="h-3 w-3 mr-1" />
                        +{item.pointsAwarded}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.content}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    {item.rejectionReason && (
                      <span className="text-red-600">
                        {t('admin.rejectionReason')}: {item.rejectionReason}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {showActions && item.status === 'pending' && (
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFeedback(item);
                      setApproveDialogOpen(true);
                    }}
                    disabled={processingId === item.id}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {t('admin.approve')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFeedback(item);
                      setRejectDialogOpen(true);
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
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            {t('admin.reviewFeedback')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            {t('admin.reviewFeedbackDescription')}
          </p>
        </div>
        <Button onClick={loadFeedback} variant="outline" size="sm" className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-white border-gray-200">
          <MessageSquare className="h-3 w-3 text-gray-500" />
          <span className="text-sm font-medium">{feedback.length} {t('admin.totalFeedback')}</span>
        </Badge>

        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-orange-50 border-orange-200 text-orange-700">
          <Clock className="h-3 w-3" />
          <span className="text-sm font-medium">{pendingFeedback.length} {t('admin.pendingReview')}</span>
        </Badge>

        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-green-50 border-green-200 text-green-700">
          <CheckCircle className="h-3 w-3" />
          <span className="text-sm font-medium">{approvedFeedback.length} {t('admin.approved')}</span>
        </Badge>

        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700">
          <Coins className="h-3 w-3" />
          <span className="text-sm font-medium">{totalPointsAwarded} {t('admin.pointsAwarded')}</span>
        </Badge>
      </div>

      {/* Feedback Lists */}
      <Tabs defaultValue="pending" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 grid-rows-2 h-auto gap-1">
          <TabsTrigger value="pending" className="text-xs sm:text-sm h-12">
            {t('admin.pending')} ({pendingFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-xs sm:text-sm h-12">
            {t('admin.approved')} ({approvedFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs sm:text-sm h-12">
            {t('admin.rejected')} ({rejectedFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs sm:text-sm h-12">
            {t('admin.all')} ({feedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                {t('admin.pendingFeedback')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('admin.pendingFeedbackDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackTable 
                feedbackList={paginatedPendingFeedback}
                onApprove={(feedback) => {
                  setSelectedFeedback(feedback);
                  setApproveDialogOpen(true);
                }}
                onReject={handleReject}
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

        <TabsContent value="approved">
          <Card className="max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                {t('admin.approvedFeedback')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('admin.approvedFeedbackDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
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

        <TabsContent value="rejected">
          <Card className="max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                {t('admin.rejectedFeedback')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('admin.rejectedFeedbackDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
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

        <TabsContent value="all">
          <Card className="max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                {t('admin.allFeedback')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('admin.allFeedbackDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.approveFeedback')}</DialogTitle>
            <DialogDescription>
              {t('admin.approveFeedbackDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('admin.pointsToAward')}</label>
              <Input
                type="number"
                value={pointsToAward}
                onChange={(e) => setPointsToAward(parseInt(e.target.value) || 0)}
                min="1"
                max="1000"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setApproveDialogOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleApprove}
                disabled={processingId === selectedFeedback?.id}
              >
                {processingId === selectedFeedback?.id ? t('admin.approving') : t('admin.approve')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.rejectFeedback')}</DialogTitle>
            <DialogDescription>
              {t('admin.rejectFeedbackDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('admin.rejectionReason')}</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t('admin.enterRejectionReason')}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
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