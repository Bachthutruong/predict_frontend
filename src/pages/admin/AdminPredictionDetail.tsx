import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import {
  ArrowLeft,
  Trophy,
  Coins,
  Users,
  Target,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import apiService from '../../services/api';
import type { Prediction, UserPrediction, User } from '../../types';
import { formatDate, formatDateTime } from '../../lib/utils';

interface PredictionWithDetails extends Prediction {
  userPredictions: (UserPrediction & { user: User })[];
  totalPredictions: number;
  correctPredictions: number;
  totalPointsAwarded: number;
}

const AdminPredictionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [prediction, setPrediction] = useState<(PredictionWithDetails & { isAnswerPublished?: boolean; correctAnswer?: string }) | null>(null);
  const [userPredictions, setUserPredictions] = useState<(UserPrediction & { user: User })[]>([]);
  const [stats, setStats] = useState({
    totalPredictions: 0,
    correctPredictions: 0,
    totalPointsAwarded: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadPredictionDetails = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const response = await apiService.get(`/admin/predictions/${id}`);

      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        setPrediction(data);
        setUserPredictions(data.userPredictions || []);
        setStats({
          totalPredictions: data.totalPredictions,
          correctPredictions: data.correctPredictions,
          totalPointsAwarded: data.totalPointsAwarded
        });
      } else {
        toast({
          title: t('common.error'),
          description: t('admin.failedToLoadPredictions'),
          variant: 'destructive',
        });
        navigate('/admin/predictions');
      }
    } catch (error) {
      console.error('Failed to load prediction details:', error);
      toast({
        title: t('common.error'),
        description: t('admin.failedToLoadPredictions'),
        variant: 'destructive',
      });
      navigate('/admin/predictions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPredictionDetails();
  }, [id]);

  const handleEditPrediction = () => {
    navigate(`/admin/predictions/${id}/edit`);
  };

  const handleDeletePrediction = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // TODO: Implement delete functionality with API call
    toast({
      title: t('admin.deletePrediction'),
      description: 'Delete functionality will be implemented',
      variant: 'default',
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'finished': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  // Pagination calculations
  const totalPages = Math.ceil(userPredictions.length / itemsPerPage);
  const paginatedUserPredictions = userPredictions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-4">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <span className="text-sm text-gray-600">{t('admin.itemsPerPage')}:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
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
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            {t('common.next')}
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="container mx-auto p-4 sm:p-6 text-center">
        <Trophy className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-4" />
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Prediction Not Found</h1>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          The prediction you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/admin/predictions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Predictions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/predictions')}
            className="flex items-center gap-2 flex-shrink-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full h-10 w-10 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">{t('common.back')}</span>
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold truncate text-gray-800">{prediction.title}</h1>
            <p className="text-gray-500 mt-1 text-lg line-clamp-1">{prediction.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleEditPrediction}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-200"
            size="sm"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.edit')}</span>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeletePrediction}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 shadow-sm"
            size="sm"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.delete')}</span>
          </Button>
        </div>
      </div>

      {/* Prediction Image */}
      {prediction.imageUrl && (
        <div className="rounded-xl overflow-hidden shadow-google border border-gray-100 bg-white">
          <img
            src={prediction.imageUrl}
            alt={prediction.title}
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border border-gray-100 shadow-google bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('admin.totalPredictions')}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPredictions}</p>
                  <span className="text-sm text-gray-500">entries</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-google bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('admin.correctPredictions')}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold text-gray-900">{stats.correctPredictions}</p>
                  <span className="text-sm text-green-600 font-medium">
                    {stats.totalPredictions > 0 ? Math.round((stats.correctPredictions / stats.totalPredictions) * 100) : 0}% success
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-google bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('admin.totalPointsAwarded')}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPointsAwarded.toLocaleString()}</p>
                  <span className="text-sm text-yellow-600 font-medium">pts</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center">
                <Coins className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Details */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-0 shadow-google bg-white h-full">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl text-gray-800">{t('admin.predictionDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('admin.status')}</p>
                <Badge variant={getStatusVariant(prediction.status)} className="text-sm py-1 px-3">
                  {t(`admin.${prediction.status}`)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('admin.pointsCost')}</p>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="text-lg font-semibold text-gray-900">{prediction.pointsCost}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('admin.createdAt')}</p>
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="font-medium">{formatDate(prediction.createdAt)}</span>
                </div>
              </div>
              {prediction.answer && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{t('admin.correctAnswer')}</p>
                  <div className={`p-2 rounded-lg inline-block ${prediction.answer === '***ENCRYPTED***' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                    <span className="font-medium">
                      {prediction.answer === '***ENCRYPTED***' ? t('admin.encryptedAnswer') : prediction.answer}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-google bg-white h-full">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-gray-800">{t('admin.participants')}</CardTitle>
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                {userPredictions.length} {t('admin.users')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {paginatedUserPredictions.slice(0, 5).map((userPrediction) => (
                <div key={userPrediction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 border border-gray-100">
                      <AvatarImage src={userPrediction.user?.avatarUrl} />
                      <AvatarFallback className="bg-blue-50 text-blue-600 font-medium">
                        {getInitials(userPrediction.user?.name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{userPrediction.user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(userPrediction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">"{userPrediction.guess}"</span>
                    <Badge variant={userPrediction.isCorrect ? 'default' : 'secondary'} className={`text-xs ${userPrediction.isCorrect ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {userPrediction.isCorrect ? t('admin.correct') : t('admin.incorrect')}
                    </Badge>
                  </div>
                </div>
              ))}
              {userPredictions.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  {t('admin.noParticipantsYet')}
                </div>
              )}
            </div>
            {userPredictions.length > 5 && (
              <div className="p-4 border-t border-gray-100 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllParticipants(!showAllParticipants)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {showAllParticipants ? t('admin.hideParticipants') : t('admin.viewAllParticipants')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Predictions List (Full Table) */}
      <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
        <CardHeader className="border-b border-gray-100 bg-white pb-6">
          <CardTitle className="text-xl text-gray-800">{t('admin.allPredictions')}</CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            {t('admin.allUserPredictions')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {paginatedUserPredictions.map((userPrediction) => (
              <div key={userPrediction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 border border-gray-100">
                    <AvatarImage src={userPrediction.user?.avatarUrl} />
                    <AvatarFallback className="bg-blue-50 text-blue-600 font-medium">
                      {getInitials(userPrediction.user?.name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{userPrediction.user?.name}</h3>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(userPrediction.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mt-4 sm:mt-0 flex-shrink-0">
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-500 mb-1">{t('admin.predicted')}</p>
                    <p className="font-medium text-gray-900 text-lg">"{userPrediction.guess}"</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-500 mb-1">{t('admin.wager')}</p>
                    <div className="flex items-center gap-1 sm:justify-end">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-gray-900">{userPrediction.pointsSpent}</span>
                    </div>
                  </div>
                  <Badge variant={userPrediction.isCorrect ? 'default' : 'secondary'} className={`h-8 px-3 rounded-full flex items-center justify-center min-w-[100px] ${userPrediction.isCorrect ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {userPrediction.isCorrect ? t('admin.correct') : t('admin.incorrect')}
                  </Badge>
                </div>
              </div>
            ))}
            {userPredictions.length === 0 && (
              <div className="p-12 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('admin.noPredictionsYet')}</h3>
                <p className="mt-1 text-sm text-gray-500">Wait for users to participate.</p>
              </div>
            )}
          </div>

          <div className="py-4 border-t border-gray-100">
            <PaginationControls />
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('admin.deletePrediction')}
        description={t('admin.deletePredictionDescription')}
        onConfirm={confirmDelete}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
      />
    </div>
  );
};

export default AdminPredictionDetail; 