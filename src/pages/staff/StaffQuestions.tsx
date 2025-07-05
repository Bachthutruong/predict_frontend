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
          <QuestionsList 
            questions={activeQuestions} 
            onStatusToggle={handleStatusToggle}
            onPriorityToggle={handlePriorityToggle}
            onEdit={openEditDialog}
            emptyMessage="No active questions"
          />
        </TabsContent>

        <TabsContent value="inactive">
          <QuestionsList 
            questions={inactiveQuestions} 
            onStatusToggle={handleStatusToggle}
            onPriorityToggle={handlePriorityToggle}
            onEdit={openEditDialog}
            emptyMessage="No inactive questions"
          />
        </TabsContent>

        <TabsContent value="priority">
          <QuestionsList 
            questions={priorityQuestions} 
            onStatusToggle={handleStatusToggle}
            onPriorityToggle={handlePriorityToggle}
            onEdit={openEditDialog}
            emptyMessage="No priority questions"
          />
        </TabsContent>

        <TabsContent value="all">
          <QuestionsList 
            questions={questions} 
            onStatusToggle={handleStatusToggle}
            onPriorityToggle={handlePriorityToggle}
            onEdit={openEditDialog}
            emptyMessage="No questions created yet"
          />
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

interface QuestionsListProps {
  questions: Question[];
  onStatusToggle: (id: string, status: string) => void;
  onPriorityToggle: (id: string, priority: boolean) => void;
  onEdit: (question: Question) => void;
  emptyMessage: string;
}

const QuestionsList: React.FC<QuestionsListProps> = ({ 
  questions, 
  onStatusToggle, 
  onPriorityToggle, 
  onEdit,
  emptyMessage
}) => {
  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <Card key={question.id} className="p-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={question.status === 'active' ? 'default' : 'secondary'}>
                    {question.status === 'active' ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                  {question.isPriority && (
                    <Badge variant="outline" className="text-orange-600">
                      <Star className="h-3 w-3 mr-1" />
                      Priority
                    </Badge>
                  )}
                  <Badge variant="outline">
                    <Coins className="h-3 w-3 mr-1" />
                    {question.points} pts
                  </Badge>
                </div>
                <h3 className="font-medium mb-2">{question.questionText}</h3>
                <p className="text-sm text-gray-500">
                  <strong>Answer:</strong> {question.answer}
                </p>
                {question.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={question.imageUrl} 
                      alt="Question" 
                      className="w-32 h-20 object-cover rounded border"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Created {new Date(question.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(question)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={question.status === 'active' ? 'destructive' : 'default'}
                  onClick={() => onStatusToggle(question.id, question.status)}
                >
                  {question.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant={question.isPriority ? 'secondary' : 'outline'}
                  onClick={() => onPriorityToggle(question.id, question.isPriority)}
                >
                  <Star className="h-4 w-4 mr-1" />
                  {question.isPriority ? 'Remove Priority' : 'Set Priority'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StaffQuestions; 