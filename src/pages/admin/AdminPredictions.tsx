import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Calendar,
  Coins,
  TrendingUp,
  RefreshCw,
  Search
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import apiService from '../../services/api';
import type { Prediction } from '../../types';

interface PredictionWithStats extends Prediction {
  totalParticipants: number;
  totalPoints: number;
  averagePoints: number;
}

const AdminPredictions: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [predictions, setPredictions] = useState<PredictionWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionWithStats | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadPredictions = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get('/admin/predictions');
      const predictionsData = response.data?.data || response.data || [];
      setPredictions(Array.isArray(predictionsData) ? predictionsData : []);
    } catch (error) {
      console.error('Failed to load predictions:', error);
      setPredictions([]);
      toast({
        title: t('common.error'),
        description: t('admin.failedToLoadPredictions'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

    const handleDelete = async () => {
    if (!selectedPrediction) return;

    setProcessingId(selectedPrediction.id);
    try {
      await apiService.delete(`/admin/predictions/${selectedPrediction.id}`);
      
      toast({
        title: t('admin.predictionDeleted'),
        description: t('admin.predictionDeletedSuccessfully'),
        variant: "default"
      });
      
      setConfirmDeleteDialogOpen(false);
      setSelectedPrediction(null);
      await loadPredictions();
    } catch (error) {
      console.error('Failed to delete prediction:', error);
      toast({
        title: t('common.error'),
        description: t('admin.failedToDeletePrediction'),
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'finished': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };



  const handleViewPrediction = (prediction: PredictionWithStats) => {
    navigate(`/admin/predictions/${prediction.id}`);
  };

  const handleEditPrediction = (prediction: PredictionWithStats) => {
    navigate(`/admin/predictions/${prediction.id}/edit`);
  };

  const filteredPredictions = predictions.filter(prediction => {
    const matchesSearch = prediction.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prediction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prediction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activePredictions = predictions.filter(p => p.status === 'active');
  const totalParticipants = predictions.reduce((sum, p) => sum + (p.totalParticipants || 0), 0);
  const totalPoints = predictions.reduce((sum, p) => sum + (p.totalPoints || 0), 0);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPredictions.length / itemsPerPage);
  const paginatedPredictions = filteredPredictions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
            <span className="truncate">{t('admin.managePredictions')}</span>
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {t('admin.createEditPredictions')}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button onClick={loadPredictions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('common.refresh')}</span>
          </Button>
          <Button size="sm" onClick={() => navigate('/admin/predictions/create')}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('admin.createPrediction')}</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalPredictions')}</CardTitle>
            <Trophy className="h-4 w-4 text-gray-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-xs text-gray-500">{t('admin.allPredictions')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.activePredictions')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePredictions.length}</div>
            <p className="text-xs text-gray-500">{t('admin.currentlyActive')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalParticipants')}</CardTitle>
            <Users className="h-4 w-4 text-blue-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalParticipants}</div>
            <p className="text-xs text-gray-500">{t('admin.allTimeParticipants')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalPoints')}</CardTitle>
            <Coins className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalPoints.toLocaleString()}</div>
            <p className="text-xs text-gray-500">{t('admin.pointsInPlay')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('admin.searchPredictions')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
            >
              <option value="all">{t('admin.allStatuses')}</option>
              <option value="active">{t('admin.active')}</option>
              <option value="finished">{t('admin.finished')}</option>
              <option value="cancelled">{t('admin.cancelled')}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Predictions List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.predictionsList')}</CardTitle>
          <CardDescription>
            {t('admin.showingResults', { count: filteredPredictions.length, total: predictions.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedPredictions.map((prediction) => (
              <div key={prediction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {prediction.imageUrl && (
                    <img 
                      src={prediction.imageUrl} 
                      alt={prediction.title}
                      className="w-12 h-12 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{prediction.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2 sm:line-clamp-1">{prediction.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 flex-shrink-0" />
                        {prediction.totalParticipants || 0} {t('admin.participants')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins className="h-3 w-3 flex-shrink-0" />
                        {prediction.totalPoints || 0} {t('admin.points')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        {new Date(prediction.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={getStatusVariant(prediction.status)} className="text-xs">
                    {t(`admin.${prediction.status}`)}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPrediction(prediction)}
                      title={t('admin.viewPrediction')}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPrediction(prediction)}
                      title={t('admin.editPrediction')}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPrediction(prediction);
                        setConfirmDeleteDialogOpen(true);
                      }}
                      title={t('admin.deletePrediction')}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDeleteDialogOpen}
        onOpenChange={setConfirmDeleteDialogOpen}
        title={t('admin.deletePrediction')}
        description={selectedPrediction ? 
          `${t('admin.deletePredictionDescription')}\n\n${selectedPrediction.title}` : 
          t('admin.deletePredictionDescription')
        }
        onConfirm={handleDelete}
        confirmText={processingId === selectedPrediction?.id ? t('admin.deleting') : t('common.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
      />
    </div>
  );
};

export default AdminPredictions; 