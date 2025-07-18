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

  const [prediction, setPrediction] = useState<PredictionWithDetails | null>(null);
  const [userPredictions, setUserPredictions] = useState<(UserPrediction & { user: User })[]>([]);
  const [stats, setStats] = useState({
    totalPredictions: 0,
    correctPredictions: 0,
    totalPointsAwarded: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination states
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
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/predictions')}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.back')}</span>
          </Button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{prediction.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base line-clamp-2">{prediction.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleEditPrediction}
            className="flex items-center gap-2"
            size="sm"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.edit')}</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleDeletePrediction}
            className="flex items-center gap-2"
            size="sm"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.delete')}</span>
          </Button>
        </div>
      </div>

      {/* Prediction Image */}
      {prediction.imageUrl && (
        <Card>
          <CardContent className="p-0">
            <img 
              src={prediction.imageUrl} 
              alt={prediction.title}
              className="w-full h-48 sm:h-64 object-cover rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">{t('admin.totalPredictions')}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalPredictions}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-blue-50 flex-shrink-0">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">{t('admin.correctPredictions')}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.correctPredictions}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-green-50 flex-shrink-0">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">{t('admin.totalPointsAwarded')}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalPointsAwarded}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-yellow-50 flex-shrink-0">
                <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Details */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.predictionDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <span className="text-sm font-medium text-gray-600">{t('admin.status')}:</span>
              <Badge variant={getStatusVariant(prediction.status)}>
                {t(`admin.${prediction.status}`)}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <span className="text-sm font-medium text-gray-600">{t('admin.pointsCost')}:</span>
              <span className="text-sm">{prediction.pointsCost} {t('admin.points')}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <span className="text-sm font-medium text-gray-600">{t('admin.createdAt')}:</span>
              <span className="text-sm">{new Date(prediction.createdAt).toLocaleDateString()}</span>
            </div>
            {prediction.answer && (
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <span className="text-sm font-medium text-gray-600">{t('admin.correctAnswer')}:</span>
                <span className="text-sm font-medium text-green-600">{prediction.answer}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.participants')}</CardTitle>
            <CardDescription>
              {t('admin.totalParticipants')}: {userPredictions.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paginatedUserPredictions.slice(0, 5).map((userPrediction) => (
                <div key={userPrediction.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={userPrediction.user?.avatarUrl} />
                      <AvatarFallback>
                        {getInitials(userPrediction.user?.name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{userPrediction.user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(userPrediction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={userPrediction.isCorrect ? 'default' : 'secondary'} className="text-xs">
                      {userPrediction.isCorrect ? t('admin.correct') : t('admin.incorrect')}
                    </Badge>
                    <span className="text-sm text-gray-600 truncate max-w-20">
                      {userPrediction.guess}
                    </span>
                  </div>
                </div>
              ))}
              {userPredictions.length > 5 && (
                <div className="text-center pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAllParticipants(!showAllParticipants)}
                    className="w-full sm:w-auto"
                  >
                    {showAllParticipants ? t('admin.hideParticipants') : t('admin.viewAllParticipants')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Predictions List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.allPredictions')}</CardTitle>
          <CardDescription>
            {t('admin.allUserPredictions')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedUserPredictions.map((userPrediction) => (
              <div key={userPrediction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={userPrediction.user?.avatarUrl} />
                    <AvatarFallback>
                      {getInitials(userPrediction.user?.name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{userPrediction.user?.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(userPrediction.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-medium truncate max-w-32">{userPrediction.guess}</p>
                    <p className="text-sm text-gray-500">
                      {userPrediction.pointsSpent} {t('admin.points')}
                    </p>
                  </div>
                  <Badge variant={userPrediction.isCorrect ? 'default' : 'secondary'}>
                    {userPrediction.isCorrect ? t('admin.correct') : t('admin.incorrect')}
                  </Badge>
                </div>
              </div>
            ))}
            {userPredictions.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('admin.noPredictionsYet')}</p>
              </div>
            )}
          </div>
          
          <PaginationControls />
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