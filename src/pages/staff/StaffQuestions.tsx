import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  HelpCircle, 
  Plus, 
  Edit2, 
  Star, 
  CheckCircle, 
  XCircle, 
  Coins,
  // Image as ImageIcon,
  Shield,
  // Calendar
} from 'lucide-react';
import apiService from '../../services/api';
import { ImageUpload } from '../../components/ui/image-upload';
import type { Question } from '../../types';

interface QuestionFormData {
  questionText: string;
  imageUrl: string;
  answer: string;
  isPriority: boolean;
  points: number;
}

const StaffQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{success: boolean, message?: string} | null>(null);
  
  // Pagination states
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [inactiveCurrentPage, setInactiveCurrentPage] = useState(1);
  const [priorityCurrentPage, setPriorityCurrentPage] = useState(1);
  const [allCurrentPage, setAllCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [newQuestion, setNewQuestion] = useState<QuestionFormData>({
    questionText: '',
    imageUrl: '',
    answer: '',
    isPriority: false,
    points: 10,
  });

  const [editQuestion, setEditQuestion] = useState<QuestionFormData>({
    questionText: '',
    imageUrl: '',
    answer: '',
    isPriority: false,
    points: 10,
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get('/staff/questions');
      // Handle API response structure
      const questionsData = response.data?.data?.questions || response.data?.questions || response.data?.data || response.data || [];
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (error) {
      console.error('Failed to load questions:', error);
      setQuestions([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      await apiService.post('/staff/questions', newQuestion);
      setResult({ success: true, message: 'Question created successfully!' });
      setNewQuestion({
        questionText: '',
        imageUrl: '',
        answer: '',
        isPriority: false,
        points: 10,
      });
      setIsCreateDialogOpen(false);
      loadQuestions();
    } catch (error) {
      console.error('Create question error:', error);
      setResult({ success: false, message: 'Failed to create question. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      // Staff cannot modify points, so we exclude it from the update
      const updateData = {
        questionText: editQuestion.questionText,
        imageUrl: editQuestion.imageUrl,
        answer: editQuestion.answer,
        isPriority: editQuestion.isPriority,
      };

      await apiService.put(`/staff/questions/${editingQuestion.id}`, updateData);
      setResult({ success: true, message: 'Question updated successfully!' });
      setEditingQuestion(null);
      loadQuestions();
    } catch (error) {
      console.error('Update question error:', error);
      setResult({ success: false, message: 'Failed to update question. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (questionId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await apiService.patch(`/staff/questions/${questionId}/status`, { status: newStatus });
      loadQuestions();
    } catch (error) {
      console.error('Failed to update question status:', error);
    }
  };

  const handlePriorityToggle = async (questionId: string, currentPriority: boolean) => {
    try {
      await apiService.patch(`/staff/questions/${questionId}/priority`, { isPriority: !currentPriority });
      loadQuestions();
    } catch (error) {
      console.error('Failed to update question priority:', error);
    }
  };

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    setEditQuestion({
      questionText: question.questionText,
      imageUrl: question.imageUrl || '',
      answer: question.answer,
      isPriority: question.isPriority,
      points: question.points,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeQuestions = questions.filter(q => q.status === 'active');
  const inactiveQuestions = questions.filter(q => q.status === 'inactive');
  const priorityQuestions = questions.filter(q => q.isPriority);

  // Pagination calculations
  const activeTotalPages = Math.ceil(activeQuestions.length / itemsPerPage);
  const inactiveTotalPages = Math.ceil(inactiveQuestions.length / itemsPerPage);
  const priorityTotalPages = Math.ceil(priorityQuestions.length / itemsPerPage);
  const allTotalPages = Math.ceil(questions.length / itemsPerPage);
  
  const paginatedActiveQuestions = activeQuestions.slice(
    (activeCurrentPage - 1) * itemsPerPage,
    activeCurrentPage * itemsPerPage
  );
  const paginatedInactiveQuestions = inactiveQuestions.slice(
    (inactiveCurrentPage - 1) * itemsPerPage,
    inactiveCurrentPage * itemsPerPage
  );
  const paginatedPriorityQuestions = priorityQuestions.slice(
    (priorityCurrentPage - 1) * itemsPerPage,
    priorityCurrentPage * itemsPerPage
  );
  const paginatedAllQuestions = questions.slice(
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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Staff: Manage Questions
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage questions for daily check-ins
            <br />
            <span className="text-orange-600 font-medium">Note: Staff cannot modify point rewards (admin-only)</span>
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Question</DialogTitle>
              <DialogDescription>
                Create a new question for daily check-ins. Users will answer to earn points.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {result && (
                <Alert variant={result.success ? 'default' : 'destructive'}>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="questionText">Question *</Label>
                <Textarea
                  id="questionText"
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion(prev => ({...prev, questionText: e.target.value}))}
                  placeholder="Enter your question..."
                  required
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Question Image</Label>
                <ImageUpload
                  value={newQuestion.imageUrl}
                  onChange={(url) => setNewQuestion(prev => ({...prev, imageUrl: url}))}
                  disabled={isSubmitting}
                  placeholder="Upload question image (optional)"
                />
                <p className="text-xs text-gray-500">
                  Optional: Add an image to accompany the question
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">Correct Answer *</Label>
                <Input
                  id="answer"
                  value={newQuestion.answer}
                  onChange={(e) => setNewQuestion(prev => ({...prev, answer: e.target.value}))}
                  placeholder="Enter the correct answer..."
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  Answer comparison is case-insensitive
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="points">Points Reward *</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    max="100"
                    value={newQuestion.points}
                    onChange={(e) => setNewQuestion(prev => ({...prev, points: parseInt(e.target.value) || 10}))}
                    required
                    disabled={true} // Staff cannot modify points
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-orange-600">
                    Staff cannot modify check-in points.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Question</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      id="priority"
                      type="checkbox"
                      checked={newQuestion.isPriority}
                      onChange={(e) => setNewQuestion(prev => ({...prev, isPriority: e.target.checked}))}
                      disabled={isSubmitting}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="priority" className="text-sm">
                      Show this question more frequently
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Question'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-gray-500">All questions created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeQuestions.length}</div>
            <p className="text-xs text-gray-500">Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priority</CardTitle>
            <Star className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{priorityQuestions.length}</div>
            <p className="text-xs text-gray-500">High priority questions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveQuestions.length}</div>
            <p className="text-xs text-gray-500">Disabled questions</p>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active ({activeQuestions.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveQuestions.length})</TabsTrigger>
          <TabsTrigger value="priority">Priority ({priorityQuestions.length})</TabsTrigger>
          <TabsTrigger value="all">All ({questions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className=" max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle>Active Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionsTable 
                questions={paginatedActiveQuestions} 
                onStatusToggle={handleStatusToggle}
                onPriorityToggle={handlePriorityToggle}
                onEdit={openEditDialog}
                emptyMessage="No active questions"
              />
              <PaginationControls
                currentPage={activeCurrentPage}
                totalPages={activeTotalPages}
                onPageChange={setActiveCurrentPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive">
          <Card className=" max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle>Inactive Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionsTable 
                questions={paginatedInactiveQuestions} 
                onStatusToggle={handleStatusToggle}
                onPriorityToggle={handlePriorityToggle}
                onEdit={openEditDialog}
                emptyMessage="No inactive questions"
              />
              <PaginationControls
                currentPage={inactiveCurrentPage}
                totalPages={inactiveTotalPages}
                onPageChange={setInactiveCurrentPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority">
          <Card className=" max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle>Priority Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionsTable 
                questions={paginatedPriorityQuestions} 
                onStatusToggle={handleStatusToggle}
                onPriorityToggle={handlePriorityToggle}
                onEdit={openEditDialog}
                emptyMessage="No priority questions"
              />
              <PaginationControls
                currentPage={priorityCurrentPage}
                totalPages={priorityTotalPages}
                onPageChange={setPriorityCurrentPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card className=" max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle>All Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionsTable 
                questions={paginatedAllQuestions} 
                onStatusToggle={handleStatusToggle}
                onPriorityToggle={handlePriorityToggle}
                onEdit={openEditDialog}
                emptyMessage="No questions created yet"
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

      {/* Edit Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update the question details. Point rewards cannot be modified by staff.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {result && (
              <Alert variant={result.success ? 'default' : 'destructive'}>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-questionText">Question *</Label>
              <Textarea
                id="edit-questionText"
                value={editQuestion.questionText}
                onChange={(e) => setEditQuestion(prev => ({...prev, questionText: e.target.value}))}
                placeholder="Enter your question..."
                required
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Question Image</Label>
              <ImageUpload
                value={editQuestion.imageUrl}
                onChange={(url) => setEditQuestion(prev => ({...prev, imageUrl: url}))}
                disabled={isSubmitting}
                placeholder="Upload question image (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-answer">Correct Answer *</Label>
              <Input
                id="edit-answer"
                value={editQuestion.answer}
                onChange={(e) => setEditQuestion(prev => ({...prev, answer: e.target.value}))}
                placeholder="Enter the correct answer..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-points">Points Reward *</Label>
                <Input
                  id="edit-points"
                  type="number"
                  value={editQuestion.points}
                  disabled={true} // Staff cannot modify points
                  className="bg-gray-100"
                />
                <p className="text-xs text-orange-600">
                  Staff cannot modify check-in points.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority Question</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    id="edit-priority"
                    type="checkbox"
                    checked={editQuestion.isPriority}
                    onChange={(e) => setEditQuestion(prev => ({...prev, isPriority: e.target.checked}))}
                    disabled={isSubmitting}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="edit-priority" className="text-sm">
                    Show this question more frequently
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingQuestion(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Question'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface QuestionsTableProps {
  questions: Question[];
  onStatusToggle: (id: string, status: string) => void;
  onPriorityToggle: (id: string, priority: boolean) => void;
  onEdit: (question: Question) => void;
  emptyMessage: string;
}

const QuestionsTable: React.FC<QuestionsTableProps> = ({ 
  questions, 
  onStatusToggle, 
  onPriorityToggle, 
  onEdit,
  emptyMessage
}) => {
  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
      <div className="min-w-full inline-block align-middle">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Question</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Answer</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {questions.map((question) => (
              <tr key={question.id} className="hover:bg-gray-50">
                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                  {question.imageUrl ? (
                    <img 
                      src={question.imageUrl} 
                      alt="Question"
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-md flex items-center justify-center">
                      <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="px-2 sm:px-4 py-3">
                  <div className="max-w-xs">
                    <p className="font-medium text-xs sm:text-sm line-clamp-2">{question.questionText}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {question.isPriority && (
                        <Badge variant="outline" className="text-xs text-orange-600">
                          <Star className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Priority</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                  <span className="text-xs sm:text-sm font-medium truncate block max-w-[100px]">{question.answer}</span>
                </td>
                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    <span className="text-xs sm:text-sm">{question.points}</span>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                  <Badge variant={question.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {question.status === 'active' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    <span className="hidden sm:inline">{question.status}</span>
                  </Badge>
                </td>
                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                  <span className="text-xs sm:text-sm">{new Date(question.createdAt).toLocaleDateString()}</span>
                </td>
                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(question)}
                      className="text-xs p-1 sm:p-2"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={question.status === 'active' ? 'destructive' : 'default'}
                      onClick={() => onStatusToggle(question.id, question.status)}
                      className="text-xs p-1 sm:p-2"
                    >
                      {question.status === 'active' ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={question.isPriority ? 'secondary' : 'outline'}
                      onClick={() => onPriorityToggle(question.id, question.isPriority)}
                      className="text-xs p-1 sm:p-2"
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffQuestions; 