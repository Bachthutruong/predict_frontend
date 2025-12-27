import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
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
  // BarChart3,
  Coins,
  // Search,
  Power,
  Zap,
  LayoutList
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';

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

  // Pagination states
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [inactiveCurrentPage, setInactiveCurrentPage] = useState(1);
  const [priorityCurrentPage, setPriorityCurrentPage] = useState(1);
  const [allCurrentPage, setAllCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
  const { t } = useLanguage();

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
        title: t('common.error'),
        description: t('admin.failedToLoadData'),
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
          title: t('common.success'),
          description: t('adminQuestions.questionCreated'),
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
          title: t('common.error'),
          description: response.message || t('adminQuestions.failedCreate'),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Create question error:', error);
      toast({
        title: t('common.error'),
        description: t('common.tryAgain'),
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
          title: t('common.success'),
          description: t('adminQuestions.questionUpdated'),
        });
        setEditingQuestion(null);
        loadQuestions();
      } else {
        toast({
          title: t('common.error'),
          description: t('adminQuestions.failedUpdate'),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Update question error:', error);
      toast({
        title: t('common.error'),
        description: t('common.tryAgain'),
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
      toast({
        title: t('common.error'),
        description: t('admin.failedToUpdateStatus'),
        variant: "destructive"
      });
    }
  };

  const handlePriorityToggle = async (questionId: string, currentPriority: boolean) => {
    try {
      await adminAPI.updateQuestion(questionId, { isPriority: !currentPriority });
      loadQuestions();
    } catch (error) {
      console.error('Failed to update question priority:', error);
      toast({
        title: t('common.error'),
        description: t('admin.failedToUpdatePriority'),
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-lg text-gray-600">{t('adminQuestions.loadingQuestions')}</div>
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

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-blue-600" />
            {t('adminQuestions.title')}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            {t('adminQuestions.manageDailyQuestions')}
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">{t('adminQuestions.createQuestion')}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md sm:max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('adminQuestions.createNewQuestion')}</DialogTitle>
              <DialogDescription>
                {t('adminQuestions.fillInQuestionDetails')}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateSubmit} className="space-y-6 py-4">
              <div className="space-y-3">
                <Label htmlFor="questionText" className="text-sm font-semibold text-gray-700">{t('adminQuestions.questionText')} <span className="text-red-500">*</span></Label>
                <Textarea
                  id="questionText"
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                  placeholder={t('adminQuestions.questionText')}
                  required
                  disabled={isSubmitting}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="imageUrl" className="text-sm font-semibold text-gray-700">{t('formFields.imageUrlLabel')}</Label>
                <Input
                  id="imageUrl"
                  value={newQuestion.imageUrl}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder={t('formFields.imageUrlPlaceholder')}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 pl-1">
                  {t('formFields.imageUrlHint')}
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="answer" className="text-sm font-semibold text-gray-700">{t('formFields.correctAnswerLabel')}</Label>
                <Input
                  id="answer"
                  value={newQuestion.answer}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder={t('formFields.correctAnswerPlaceholder')}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 pl-1">
                  {t('formFields.correctAnswerHint')}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="points" className="text-sm font-semibold text-gray-700">{t('formFields.pointsReward')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    max="100"
                    value={newQuestion.points}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="priority" className="text-sm font-semibold text-gray-700">{t('formFields.priorityQuestion')}</Label>
                  <label htmlFor="priority" className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      id="priority"
                      checked={newQuestion.isPriority}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, isPriority: e.target.checked }))}
                      disabled={isSubmitting}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      {t('formFields.priorityQuestionHint')}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {t('formFields.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                  {isSubmitting ? t('formFields.saving') : t('formFields.createQuestion')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
              <LayoutList className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('adminQuestions.questions')}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{activeQuestions.length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('adminQuestions.active')}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-2">
              <Star className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{priorityQuestions.length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('adminQuestions.isPriority')}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-2">
              <XCircle className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{inactiveQuestions.length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('adminQuestions.inactive')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-gray-100/50 p-1 border border-gray-100 rounded-full w-full sm:w-auto inline-flex h-auto">
          <TabsTrigger value="active" className="rounded-full px-4 sm:px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all h-auto">
            {t('formFields.active')} <span className="ml-2 py-0.5 px-2 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold group-data-[state=active]:bg-blue-50 group-data-[state=active]:text-blue-600">{activeQuestions.length}</span>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="rounded-full px-4 sm:px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all h-auto">
            {t('formFields.inactive')} <span className="ml-2 py-0.5 px-2 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold group-data-[state=active]:bg-blue-50 group-data-[state=active]:text-blue-600">{inactiveQuestions.length}</span>
          </TabsTrigger>
          <TabsTrigger value="priority" className="rounded-full px-4 sm:px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all h-auto">
            {t('formFields.priority')} <span className="ml-2 py-0.5 px-2 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold group-data-[state=active]:bg-blue-50 group-data-[state=active]:text-blue-600">{priorityQuestions.length}</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-full px-4 sm:px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all h-auto">
            {t('formFields.all')} <span className="ml-2 py-0.5 px-2 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold group-data-[state=active]:bg-blue-50 group-data-[state=active]:text-blue-600">{questions.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-0">
          <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
            <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6">
              <CardTitle className="text-xl text-gray-800">{t('formFields.active')} {t('formFields.questions')}</CardTitle>
              <CardDescription className="text-gray-500 mt-1">{t('adminQuestions.overviewOfAllQuestions')}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <QuestionsTable
                questions={paginatedActiveQuestions}
                onStatusToggle={handleStatusToggle}
                onPriorityToggle={handlePriorityToggle}
                onEdit={openEditDialog}
                emptyMessage={t('adminQuestions.noQuestionsFound')}
                t={t}
              />
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <PaginationControls
                  currentPage={activeCurrentPage}
                  totalPages={activeTotalPages}
                  onPageChange={setActiveCurrentPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="mt-0">
          <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
            <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6">
              <CardTitle className="text-xl text-gray-800">{t('formFields.inactive')} {t('formFields.questions')}</CardTitle>
              <CardDescription className="text-gray-500 mt-1">{t('adminQuestions.overviewOfAllQuestions')}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <QuestionsTable
                questions={paginatedInactiveQuestions}
                onStatusToggle={handleStatusToggle}
                onPriorityToggle={handlePriorityToggle}
                onEdit={openEditDialog}
                emptyMessage={t('adminQuestions.noQuestionsFound')}
                t={t}
              />
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <PaginationControls
                  currentPage={inactiveCurrentPage}
                  totalPages={inactiveTotalPages}
                  onPageChange={setInactiveCurrentPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority" className="mt-0">
          <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
            <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6">
              <CardTitle className="text-xl text-gray-800">{t('formFields.priority')} {t('formFields.questions')}</CardTitle>
              <CardDescription className="text-gray-500 mt-1">{t('adminQuestions.overviewOfAllQuestions')}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <QuestionsTable
                questions={paginatedPriorityQuestions}
                onStatusToggle={handleStatusToggle}
                onPriorityToggle={handlePriorityToggle}
                onEdit={openEditDialog}
                emptyMessage={t('adminQuestions.noQuestionsFound')}
                t={t}
              />
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <PaginationControls
                  currentPage={priorityCurrentPage}
                  totalPages={priorityTotalPages}
                  onPageChange={setPriorityCurrentPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
            <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6">
              <CardTitle className="text-xl text-gray-800">{t('formFields.all')} {t('formFields.questions')}</CardTitle>
              <CardDescription className="text-gray-500 mt-1">{t('adminQuestions.overviewOfAllQuestions')}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <QuestionsTable
                questions={paginatedAllQuestions}
                onStatusToggle={handleStatusToggle}
                onPriorityToggle={handlePriorityToggle}
                onEdit={openEditDialog}
                emptyMessage={t('adminQuestions.noQuestionsFound')}
                t={t}
              />
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <PaginationControls
                  currentPage={allCurrentPage}
                  totalPages={allTotalPages}
                  onPageChange={setAllCurrentPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
        <DialogContent className="max-w-md sm:max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('formFields.editQuestion')}</DialogTitle>
            <DialogDescription>
              {t('adminQuestions.fillInQuestionDetails')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="edit-questionText" className="text-sm font-semibold text-gray-700">{t('formFields.questionTextLabel')}</Label>
              <Textarea
                id="edit-questionText"
                value={editQuestion.questionText}
                onChange={(e) => setEditQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                placeholder={t('formFields.questionTextPlaceholder')}
                required
                disabled={isSubmitting}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="edit-imageUrl" className="text-sm font-semibold text-gray-700">{t('formFields.imageUrlLabel')}</Label>
              <Input
                id="edit-imageUrl"
                value={editQuestion.imageUrl}
                onChange={(e) => setEditQuestion(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder={t('formFields.imageUrlPlaceholder')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="edit-answer" className="text-sm font-semibold text-gray-700">{t('formFields.correctAnswerLabel')}</Label>
              <Input
                id="edit-answer"
                value={editQuestion.answer}
                onChange={(e) => setEditQuestion(prev => ({ ...prev, answer: e.target.value }))}
                placeholder={t('formFields.correctAnswerPlaceholder')}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="edit-points" className="text-sm font-semibold text-gray-700">{t('formFields.pointsRewardLabel')}</Label>
                <Input
                  id="edit-points"
                  type="number"
                  min="1"
                  max="100"
                  value={editQuestion.points}
                  onChange={(e) => setEditQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="edit-priority" className="text-sm font-semibold text-gray-700">{t('formFields.priorityQuestionLabel')}</Label>
                <label htmlFor="edit-priority" className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="edit-priority"
                    checked={editQuestion.isPriority}
                    onChange={(e) => setEditQuestion(prev => ({ ...prev, isPriority: e.target.checked }))}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    {t('formFields.priorityQuestionHint')}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingQuestion(null)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {t('formFields.cancelButton')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                {isSubmitting ? t('formFields.saving') : t('formFields.saveQuestionButton')}
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
  t: (key: string) => string;
}

function QuestionsTable({
  questions,
  onStatusToggle,
  onPriorityToggle,
  onEdit,
  emptyMessage,
  t
}: QuestionsTableProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <HelpCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('formFields.image')}</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">{t('formFields.question')}</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('formFields.answer')}</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('formFields.points')}</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('formFields.status')}</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('formFields.stats')}</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('formFields.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {questions.map((question) => (
            <tr key={question.id} className="hover:bg-gray-50/80 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                {question.imageUrl ? (
                  <img
                    src={question.imageUrl}
                    alt="Question"
                    className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="max-w-md">
                  <p className="font-medium text-gray-900 line-clamp-2 leading-snug">{question.questionText}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {question.isPriority && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-orange-50 text-orange-600 border-orange-100">
                        <Star className="h-3 w-3 mr-1 fill-orange-600/20" />
                        {t('formFields.priority')}
                      </Badge>
                    )}
                    {!question.isPriority && (
                      <span className="text-xs text-gray-400 italic">Normal priority</span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600 font-medium truncate block max-w-[150px] bg-gray-50 px-2 py-1 rounded border border-gray-100 border-dashed">
                  {question.answer}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  <Coins className="h-3 w-3" />
                  <span>{question.points}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {question.status === 'active' ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 gap-1 pl-1.5">
                    <CheckCircle className="h-3 w-3 fill-green-600/20" />
                    <span className="capitalize">{question.status}</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 gap-1 pl-1.5">
                    <XCircle className="h-3 w-3 fill-gray-600/20" />
                    <span className="capitalize">{question.status}</span>
                  </Badge>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-2 justify-between">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {t('admin.views')}</span>
                    <span className="font-medium">{question.displayCount}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-between">
                    <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {t('admin.correct')}</span>
                    <span className="font-medium text-green-600">{question.correctAnswerCount}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                    <div
                      className="bg-green-500 h-1 rounded-full"
                      style={{
                        width: `${question.displayCount > 0 ? Math.min(100, Math.round((question.correctAnswerCount / question.displayCount) * 100)) : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(question)}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onStatusToggle(question.id, question.status)}
                    className={`h-8 w-8 p-0 rounded-full transition-colors ${question.status === 'active'
                      ? 'text-red-500 hover:text-red-700 hover:bg-red-50'
                      : 'text-green-500 hover:text-green-700 hover:bg-green-50'
                      }`}
                  >
                    {question.status === 'active' ? <Power className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onPriorityToggle(question.id, question.isPriority)}
                    className={`h-8 w-8 p-0 rounded-full transition-colors ${question.isPriority
                      ? 'text-orange-500 hover:text-orange-700 hover:bg-orange-50'
                      : 'text-gray-300 hover:text-orange-500 hover:bg-orange-50'
                      }`}
                  >
                    <Star className={`h-4 w-4 ${question.isPriority ? 'fill-orange-500' : ''}`} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminQuestions;