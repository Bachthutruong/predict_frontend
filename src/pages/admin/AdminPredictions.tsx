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
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
            <Trophy className="h-8 w-8 text-blue-600" />
            {t('admin.managePredictions')}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {t('admin.createEditPredictions')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadPredictions} variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-gray-200">
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('common.refresh')}</span>
          </Button>
          <Button size="sm" onClick={() => navigate('/admin/predictions/create')} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all rounded-full px-6">
            <Plus className="h-4 w-4 mr-2" />
            <span>{t('admin.createPrediction')}</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-100 shadow-google bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('admin.totalPredictions')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{predictions.length}</div>
            <p className="text-xs text-blue-600 mt-1 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded-full">
              {t('admin.allPredictions')}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-google bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('admin.activePredictions')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{activePredictions.length}</div>
            <p className="text-xs text-green-600 mt-1 font-medium bg-green-50 inline-block px-2 py-0.5 rounded-full">
              {t('admin.currentlyActive')}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-google bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('admin.totalParticipants')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{totalParticipants}</div>
            <p className="text-xs text-indigo-600 mt-1 font-medium bg-indigo-50 inline-block px-2 py-0.5 rounded-full">
              {t('admin.allTimeParticipants')}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-google bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('admin.totalPoints')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-yellow-50 flex items-center justify-center">
              <Coins className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{totalPoints.toLocaleString()}</div>
            <p className="text-xs text-yellow-600 mt-1 font-medium bg-yellow-50 inline-block px-2 py-0.5 rounded-full">
              {t('admin.pointsInPlay')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
        <CardHeader className="border-b border-gray-100 bg-white pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-gray-800">{t('admin.predictionsList')}</CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                {t('admin.showingResults', { count: filteredPredictions.length, total: predictions.length })}
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('admin.searchPredictions')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 w-full sm:w-40 bg-gray-50 border-transparent rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              >
                <option value="all">{t('admin.allStatuses')}</option>
                <option value="active">{t('admin.active')}</option>
                <option value="finished">{t('admin.finished')}</option>
                <option value="cancelled">{t('admin.cancelled')}</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {paginatedPredictions.map((prediction) => (
              <div key={prediction.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Image and basic info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      {prediction.imageUrl ? (
                        <img
                          src={prediction.imageUrl}
                          alt={prediction.title}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm group-hover:shadow transition-shadow"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <Trophy className="h-6 w-6" />
                        </div>
                      )}
                      <div className={`absolute -top-2 -right-2 w-3 h-3 rounded-full border-2 border-white ${prediction.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 truncate text-lg">{prediction.title}</h4>
                        <Badge variant={getStatusVariant(prediction.status)} className="flex-shrink-0 text-xs px-2 py-0.5">
                          {t(`admin.${prediction.status}`)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">{prediction.description}</p>

                      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                          <Users className="h-3 w-3" />
                          {prediction.totalParticipants || 0} {t('admin.participants')}
                        </span>
                        <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-md">
                          <Coins className="h-3 w-3" />
                          {prediction.totalPoints || 0} {t('admin.points')}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(prediction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 sm:self-center mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full sm:w-auto justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewPrediction(prediction)}
                      title={t('admin.viewPrediction')}
                      className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-9 w-9 p-0 rounded-full"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPrediction(prediction)}
                      title={t('admin.editPrediction')}
                      className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 h-9 w-9 p-0 rounded-full"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPrediction(prediction);
                        setConfirmDeleteDialogOpen(true);
                      }}
                      title={t('admin.deletePrediction')}
                      className="text-gray-500 hover:text-red-600 hover:bg-red-50 h-9 w-9 p-0 rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {paginatedPredictions.length === 0 && (
              <div className="p-12 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('admin.noPredictionsFound')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('admin.tryAdjustingFilters')}</p>
              </div>
            )}
          </div>

          <div className="py-4 border-t border-gray-100">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
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