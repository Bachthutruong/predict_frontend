import React, { useState, useEffect, useMemo } from 'react';
import { feedbackAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { MessageSquare, Loader2, Send, CheckCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import type { Feedback } from '../../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/auth/AuthModal';

const FeedbackPage: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userFeedbacks, setUserFeedbacks] = useState<Feedback[]>([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchUserFeedbacks = async () => {
    setIsLoadingFeedbacks(true);
    try {
      const response = await feedbackAPI.getMy();
      if (response.success && Array.isArray(response.data)) {
        setUserFeedbacks(response.data);
      } else {
        toast({ title: "Error", description: "Could not fetch your feedback history.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch your feedback history.", variant: "destructive" });
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserFeedbacks();
    } else {
      setIsLoadingFeedbacks(false);
      setUserFeedbacks([]);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (feedback.trim().length < 10) {
      toast({
        title: 'Feedback too short',
        description: 'Please provide a bit more detail in your feedback.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await feedbackAPI.submit(feedback.trim());
      
      if (response.success) {
        setFeedback('');
        toast({
          title: 'Feedback Submitted!',
          description: 'Thank you for your suggestion. The admin team will review it shortly.',
        });
        // Refresh feedback list after submission
        fetchUserFeedbacks(); 
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to submit feedback',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Feedback submission error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit feedback',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const approvedFeedbacks = useMemo(() => 
    userFeedbacks.filter(fb => fb.status === 'approved'), 
    [userFeedbacks]
  );
  
  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return approvedFeedbacks.slice(startIndex, startIndex + rowsPerPage);
  }, [approvedFeedbacks, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(approvedFeedbacks.length / rowsPerPage);

  return (
    <div className="space-y-8">
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={fetchUserFeedbacks} />
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          Feedback & Suggestions
        </h1>
        <p className="text-muted-foreground mt-2">
          Share your ideas to help us improve PredictWin
        </p>
      </div>

      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Your Feedback</CardTitle>
          <CardDescription>
            Tell us what you think! Your feedback helps us make PredictWin better for everyone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Describe your idea or suggestion..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              disabled={isLoading}
              className="resize-none"
            />
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {feedback.length}/500 characters (minimum 10)
              </p>
              
              <Button 
                type="submit" 
                disabled={isLoading || feedback.trim().length < 10}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Idea
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Approved Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Approved Feedback</CardTitle>
          <CardDescription>
            Here are your suggestions that have been approved and rewarded with points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!user ? (
             <div className="text-center py-8">
                <p className="text-muted-foreground">Please log in to see your feedback history.</p>
                <Button onClick={() => setShowAuthModal(true)} className="mt-4">Login</Button>
            </div>
          ) : isLoadingFeedbacks ? (
            <p>Loading feedback history...</p>
          ) : approvedFeedbacks.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feedback</TableHead>
                    <TableHead className="w-[150px] text-center">Status</TableHead>
                    <TableHead className="w-[150px] text-center">Points Awarded</TableHead>
                    <TableHead className="w-[180px] text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFeedbacks.map(fb => (
                    <TableRow key={fb.id}>
                      <TableCell className="max-w-[400px] truncate">{fb.feedbackText}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-center">{fb.pointsAwarded}</TableCell>
                      <TableCell className="text-right">{new Date(fb.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select value={String(rowsPerPage)} onValueChange={value => setRowsPerPage(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20].map(val => (
                        <SelectItem key={val} value={String(val)}>{val}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">You have no approved feedback yet.</p>
          )}
        </CardContent>
      </Card>
      
      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What we're looking for</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• New prediction categories or topics</li>
              <li>• User interface improvements</li>
              <li>• New features or game mechanics</li>
              <li>• Bug reports or technical issues</li>
              <li>• Any other suggestions to improve the platform</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Our team reviews all feedback carefully</li>
              <li>• We may reach out for clarification</li>
              <li>• Good suggestions may earn you bonus points</li>
              <li>• Implemented features will be announced</li>
              <li>• Your feedback helps shape the future of PredictWin</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground mb-4">
              To help us process your feedback effectively, please:
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-green-600 mb-2">✅ Do:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Be specific and detailed</li>
                  <li>Explain the problem or opportunity</li>
                  <li>Suggest concrete solutions</li>
                  <li>Be constructive and respectful</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-red-600 mb-2">❌ Don't:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Submit spam or irrelevant content</li>
                  <li>Use offensive or inappropriate language</li>
                  <li>Submit the same feedback multiple times</li>
                  <li>Request personal account changes here</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackPage; 