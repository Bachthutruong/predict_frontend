import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  HelpCircle, 
  Plus, 
  Star, 
  CheckCircle, 
  XCircle,
  Edit2,
  Eye,
  BarChart3,
  Coins
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface Question {
  id: string;
  questionText: string;
  imageUrl?: string;
  answer: string;
  isPriority: boolean;
  points: number;
  status: 'active' | 'inactive';
  displayCount: number;
  correctAnswerCount: number;
  createdAt: string;
}

const AdminQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    imageUrl: '',
    answer: '',
    isPriority: false,
    points: 10,
  });

  const [editQuestion, setEditQuestion] = useState({
    questionText: '',
    imageUrl: '',
    answer: '',
    isPriority: false,
    points: 10,
  });

  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getAllQuestions();
      if (response.success && response.data) {
        setQuestions(response.data);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await adminAPI.createQuestion(newQuestion);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Question created successfully!",
        });
        setNewQuestion({
          questionText: '',
          imageUrl: '',
          answer: '',
          isPriority: false,
          points: 10,
        });
        setIsCreateDialogOpen(false);
        loadQuestions();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create question",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Create question error:', error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    setIsSubmitting(true);

    try {
      const response = await adminAPI.updateQuestion(editingQuestion.id, editQuestion);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Question updated successfully!",
        });
        setEditingQuestion(null);
        loadQuestions();
      } else {
        toast({
          title: "Error",
          description: "Failed to update question",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Update question error:', error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

  const handleStatusToggle = async (questionId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await adminAPI.updateQuestion(questionId, { status: newStatus });
      loadQuestions();
    } catch (error) {
      console.error('Failed to update question status:', error);
    }
  };

  const handlePriorityToggle = async (questionId: string, currentPriority: boolean) => {
    try {
      await adminAPI.updateQuestion(questionId, { isPriority: !currentPriority });
      loadQuestions();
    } catch (error) {
      console.error('Failed to update question priority:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  const activeQuestions = questions.filter(q => q.status === 'active');
  const inactiveQuestions = questions.filter(q => q.status === 'inactive');
  const priorityQuestions = questions.filter(q => q.isPriority);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="hidden sm:inline">Admin: Manage Questions</span>
            <span className="sm:hidden">Manage Questions</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Create and manage questions for daily check-ins
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">All questions created</span>
              <span className="sm:hidden">Total</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{activeQuestions.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">Currently available</span>
              <span className="sm:hidden">Available</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Priority</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{priorityQuestions.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">High priority questions</span>
              <span className="sm:hidden">Priority</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{inactiveQuestions.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">Disabled questions</span>
              <span className="sm:hidden">Disabled</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create Button */}
      <div className="flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Question</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Question</DialogTitle>
              <DialogDescription className="text-sm">
                Create a new question for daily check-ins. Users will answer to earn points.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateSubmit} className="space-y-4">
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
                <Label htmlFor="imageUrl">Question Image URL</Label>
                <Input
                  id="imageUrl"
                  value={newQuestion.imageUrl}
                  onChange={(e) => setNewQuestion(prev => ({...prev, imageUrl: e.target.value}))}
                  placeholder="https://example.com/image.jpg"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Add an image URL to accompany the question
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
                <p className="text-xs text-muted-foreground">
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
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Question</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      id="priority"
                      checked={newQuestion.isPriority}
                      onChange={(e) => setNewQuestion(prev => ({...prev, isPriority: e.target.checked}))}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="priority" className="text-sm">
                      Show this question more frequently
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? 'Creating...' : 'Create Question'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Questions List */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger value="active" className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-2 py-1.5 sm:py-2 h-auto whitespace-nowrap">
            <span className="hidden sm:inline">Active ({activeQuestions.length})</span>
            <span className="sm:hidden">Act ({activeQuestions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-2 py-1.5 sm:py-2 h-auto whitespace-nowrap">
            <span className="hidden sm:inline">Inactive ({inactiveQuestions.length})</span>
            <span className="sm:hidden">Ina ({inactiveQuestions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="priority" className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-2 py-1.5 sm:py-2 h-auto whitespace-nowrap">
            <span className="hidden sm:inline">Priority ({priorityQuestions.length})</span>
            <span className="sm:hidden">Pri ({priorityQuestions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-2 py-1.5 sm:py-2 h-auto whitespace-nowrap">
            <span className="hidden sm:inline">All ({questions.length})</span>
            <span className="sm:hidden">All ({questions.length})</span>
          </TabsTrigger>
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
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription className="text-sm">
              Update the question details.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
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
              <Label htmlFor="edit-imageUrl">Question Image URL</Label>
              <Input
                id="edit-imageUrl"
                value={editQuestion.imageUrl}
                onChange={(e) => setEditQuestion(prev => ({...prev, imageUrl: e.target.value}))}
                placeholder="https://example.com/image.jpg"
                disabled={isSubmitting}
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
                  min="1"
                  max="100"
                  value={editQuestion.points}
                  onChange={(e) => setEditQuestion(prev => ({...prev, points: parseInt(e.target.value) || 10}))}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority Question</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="edit-priority"
                    checked={editQuestion.isPriority}
                    onChange={(e) => setEditQuestion(prev => ({...prev, isPriority: e.target.checked}))}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="edit-priority" className="text-sm">
                    Show this question more frequently
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingQuestion(null)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
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

function QuestionsList({ 
  questions, 
  onStatusToggle, 
  onPriorityToggle, 
  onEdit,
  emptyMessage
}: QuestionsListProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard 
                key={question.id} 
                question={question}
                onStatusToggle={onStatusToggle}
                onPriorityToggle={onPriorityToggle}
                onEdit={onEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface QuestionCardProps {
  question: Question;
  onStatusToggle: (id: string, status: string) => void;
  onPriorityToggle: (id: string, priority: boolean) => void;
  onEdit: (question: Question) => void;
}

function QuestionCard({ 
  question, 
  onStatusToggle, 
  onPriorityToggle,
  onEdit
}: QuestionCardProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 border rounded-lg">
      {/* Image */}
      <div className="flex sm:block">
        {question.imageUrl ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={question.imageUrl} 
              alt="Question"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <HelpCircle className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm sm:text-base leading-relaxed break-words">
              {question.questionText}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Answer: <span className="font-medium">{question.answer}</span>
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge 
              variant={question.status === 'active' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {question.status === 'active' ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {question.status}
            </Badge>
            
            {question.isPriority && (
              <Badge variant="outline" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Priority
              </Badge>
            )}
            
            <Badge variant="outline" className="text-xs">
              <Coins className="h-3 w-3 mr-1" />
              {question.points} pts
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{question.displayCount} views</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>{question.correctAnswerCount} correct</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            <span>
              {question.displayCount > 0 
                ? Math.round((question.correctAnswerCount / question.displayCount) * 100)
                : 0}% accuracy
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(question)}
            className="text-xs px-2 py-1"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusToggle(question.id, question.status)}
            className="text-xs px-2 py-1"
          >
            {question.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPriorityToggle(question.id, question.isPriority)}
            className="text-xs px-2 py-1"
          >
            {question.isPriority ? (
              <>
                <Star className="h-3 w-3 mr-1" />
                Remove Priority
              </>
            ) : (
              <>
                <Star className="h-3 w-3 mr-1" />
                Set Priority
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AdminQuestions; 