import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Coins, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';
import apiService from '../../services/api';
import type { Feedback } from '../../types';

interface FeedbackListProps {
  feedbackList: Feedback[];
  onApprove?: (feedback: Feedback) => void;
  onReject?: (id: string) => void;
  processingId: string | null;
  showActions: boolean;
}

const AdminFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [awardPoints, setAwardPoints] = useState(50);
  
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
      // Handle API response structure
      const feedbackData = response.data?.data || response.data || [];
      const validFeedback = Array.isArray(feedbackData) 
        ? feedbackData.filter((item: Feedback) => item.user) 
        : [];
      setFeedback(validFeedback);
    } catch (error) {
      console.error('Failed to load feedback:', error);
      setFeedback([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (feedbackId: string, points: number) => {
    if (!feedbackId) {
      console.error('Feedback ID is undefined');
      return;
    }
    
    setProcessingId(feedbackId);
    try {
      await apiService.patch(`/admin/feedback/${feedbackId}/approve`, { points });
      setApproveDialogOpen(false);
      setSelectedFeedback(null);
      loadFeedback();
    } catch (error) {
      console.error('Failed to approve feedback:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (feedbackId: string) => {
    setProcessingId(feedbackId);
    try {
      await apiService.patch(`/admin/feedback/${feedbackId}/reject`);
      loadFeedback();
    } catch (error) {
      console.error('Failed to reject feedback:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/3"></div>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 sm:h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pendingFeedback = feedback.filter(f => f.status === 'pending');
  const approvedFeedback = feedback.filter(f => f.status === 'approved');
  const rejectedFeedback = feedback.filter(f => f.status === 'rejected');
  const totalPointsAwarded = approvedFeedback.reduce((sum, f) => sum + (f.awardedPoints || 0), 0);

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
    if (totalPages < 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>
        
        {startPage > 1 && (
          <>
            <Button variant="outline" size="sm" onClick={() => onPageChange(1)}>1</Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            Admin: Review Feedback
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Review user feedback submissions and award points for valuable suggestions
          </p>
        </div>
        <Button onClick={loadFeedback} variant="outline" size="sm" className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-white border-gray-200">
          <MessageSquare className="h-3 w-3 text-gray-500" />
          <span className="text-sm font-medium">{feedback.length} Total Feedback</span>
        </Badge>

        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-orange-50 border-orange-200 text-orange-700">
          <Clock className="h-3 w-3" />
          <span className="text-sm font-medium">{pendingFeedback.length} Pending Review</span>
        </Badge>

        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-green-50 border-green-200 text-green-700">
          <CheckCircle className="h-3 w-3" />
          <span className="text-sm font-medium">{approvedFeedback.length} Approved</span>
        </Badge>

        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700">
          <Coins className="h-3 w-3" />
          <span className="text-sm font-medium">{totalPointsAwarded} Points Awarded</span>
        </Badge>
      </div>

      {/* Feedback Lists */}
      <Tabs defaultValue="pending" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 grid-rows-2 h-auto gap-1">
          <TabsTrigger value="pending" className="text-xs sm:text-sm h-12">
            Pending ({pendingFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-xs sm:text-sm h-12">
            Approved ({approvedFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs sm:text-sm h-12">
            Rejected ({rejectedFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs sm:text-sm h-12">
            All ({feedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className=" max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                Pending Feedback
              </CardTitle>
              <CardDescription className="text-sm">
                Review these submissions and decide whether to approve or reject them
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
          <Card className=" max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                Approved Feedback
              </CardTitle>
              <CardDescription className="text-sm">
                Feedback that has been approved and points awarded
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
          <Card className=" max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                Rejected Feedback
              </CardTitle>
              <CardDescription className="text-sm">
                Feedback that was not suitable for approval
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
          <Card className=" max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">All Feedback</CardTitle>
              <CardDescription className="text-sm">
                Complete history of all feedback submissions
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
        <DialogContent className="max-w-md sm:max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Approve Feedback</DialogTitle>
            <DialogDescription>
              Award points to the user for their valuable feedback
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="p-3 sm:p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarFallback>{getInitials(selectedFeedback.user?.name || 'Unknown User')}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{selectedFeedback.user?.name || 'Unknown User'}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{selectedFeedback.feedbackText}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Points to Award</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  max="500"
                  value={awardPoints}
                  onChange={(e) => setAwardPoints(parseInt(e.target.value) || 50)}
                />
                <p className="text-xs text-gray-500">
                  Typically 25-100 points based on feedback quality
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setApproveDialogOpen(false)}
                  disabled={processingId === selectedFeedback.id}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const feedbackId = selectedFeedback.id;
                    if (!feedbackId) {
                      console.error('No valid ID found for feedback:', selectedFeedback);
                      return;
                    }
                    handleApprove(feedbackId, awardPoints);
                  }}
                  disabled={processingId === selectedFeedback.id}
                  className="w-full sm:w-auto"
                >
                  {processingId === selectedFeedback.id ? 'Approving...' : `Approve & Award ${awardPoints} Points`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FeedbackTable: React.FC<FeedbackListProps> = ({ 
  feedbackList, 
  onApprove, 
  onReject, 
  processingId, 
  showActions 
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  if (feedbackList.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-3" />
        <p className="text-sm sm:text-base text-gray-500">No feedback to display</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
      <div className="min-w-full inline-block align-middle">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">User</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Feedback</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              {showActions && (
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feedbackList.map((feedback) => (
              <tr key={feedback.id} className="hover:bg-gray-50">
                <td className="px-2 sm:px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs sm:text-sm">{getInitials(feedback.user?.name || 'Unknown User')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{feedback.user?.name || 'Unknown User'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-3">
                  <p className="text-xs sm:text-sm leading-relaxed max-w-xs line-clamp-3">{feedback.feedbackText}</p>
                </td>
                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                  <Badge 
                    variant={
                      feedback.status === 'pending' ? 'secondary' :
                      feedback.status === 'approved' ? 'default' : 'destructive'
                    }
                    className="text-xs"
                  >
                    {feedback.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                    {feedback.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {feedback.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                    <span className="hidden sm:inline">{feedback.status}</span>
                  </Badge>
                </td>
                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                  {feedback.awardedPoints ? (
                    <Badge variant="outline" className="text-xs">
                      <Coins className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">+</span>{feedback.awardedPoints}
                    </Badge>
                  ) : (
                    <span className="text-xs sm:text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                  <span className="text-xs sm:text-sm">{new Date(feedback.createdAt).toLocaleDateString()}</span>
                </td>
                {showActions && (
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                    {feedback.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => onApprove?.(feedback)}
                          disabled={processingId === feedback.id}
                          className="text-xs p-1 sm:p-2"
                        >
                          <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReject?.(feedback.id)}
                          disabled={processingId === feedback.id}
                          className="text-xs p-1 sm:p-2"
                        >
                          <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFeedback; 