import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Users,
  CheckCircle,
  Clock,
  Trophy,
  Target,
  Activity,
  DollarSign,
  TrendingUp,
  XCircle
} from 'lucide-react';
import apiService from '../../services/api';
import { ImageUpload } from '../../components/ui/image-upload';
import type { Prediction, UserPrediction, User } from '../../types';

interface PredictionFormData {
  title: string;
  description: string;
  imageUrl: string;
  pointsCost: number;
  correctAnswer: string;
  status: 'active' | 'finished';
}

interface PredictionWithStats extends Prediction {
  totalPredictions: number;
  correctPredictions: number;
  totalPointsAwarded: number;
  correctAnswer?: string;
  userPredictions?: (UserPrediction & { user: User })[];
}

const AdminPredictions: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionWithStats[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{success: boolean, message?: string} | null>(null);
  
  // Pagination states
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [finishedCurrentPage, setFinishedCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [newPrediction, setNewPrediction] = useState<PredictionFormData>({
    title: '',
    description: '',
    imageUrl: '',
    pointsCost: 10,
    correctAnswer: '',
    status: 'active',
  });

  const [editPrediction, setEditPrediction] = useState<PredictionFormData>({
    title: '',
    description: '',
    imageUrl: '',
    pointsCost: 10,
    correctAnswer: '',
    status: 'active',
  });

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get('/admin/predictions');
      const predictionsData = response.data?.data || response.data || [];
      setPredictions(Array.isArray(predictionsData) ? predictionsData : []);
    } catch (error) {
      console.error('Failed to load predictions:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPredictionDetails = async (predictionId: string) => {
    try {
      const response = await apiService.get(`/admin/predictions/${predictionId}`);
      const predictionData = response.data?.data || response.data;
      setSelectedPrediction(predictionData);
      setIsDetailsDialogOpen(true);
    } catch (error) {
      console.error('Failed to load prediction details:', error);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      await apiService.post('/admin/predictions', newPrediction);
      setResult({ success: true, message: 'Prediction created successfully!' });
      setNewPrediction({
        title: '',
        description: '',
        imageUrl: '',
        pointsCost: 10,
        correctAnswer: '',
        status: 'active',
      });
      setIsCreateDialogOpen(false);
      loadPredictions();
    } catch (error) {
      console.error('Create prediction error:', error);
      setResult({ success: false, message: 'Failed to create prediction. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrediction) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      await apiService.put(`/admin/predictions/${selectedPrediction.id}`, editPrediction);
      setResult({ success: true, message: 'Prediction updated successfully!' });
      setIsEditDialogOpen(false);
      setSelectedPrediction(null);
      loadPredictions();
    } catch (error) {
      console.error('Update prediction error:', error);
      setResult({ success: false, message: 'Failed to update prediction. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (predictionId: string, predictionTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${predictionTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.delete(`/admin/predictions/${predictionId}`);
      setResult({ success: true, message: `"${predictionTitle}" has been deleted successfully!` });
      loadPredictions();
    } catch (error) {
      console.error('Delete prediction error:', error);
      setResult({ success: false, message: 'Failed to delete prediction. Please try again.' });
    }
  };

  const handleStatusToggle = async (predictionId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'finished' : 'active';
    
    try {
      await apiService.put(`/admin/predictions/${predictionId}/status`, { status: newStatus });
      setResult({ success: true, message: `Prediction status updated to ${newStatus}!` });
      loadPredictions();
    } catch (error) {
      console.error('Update status error:', error);
      setResult({ success: false, message: 'Failed to update prediction status.' });
    }
  };

  const openEditDialog = (prediction: PredictionWithStats) => {
    setSelectedPrediction(prediction);
    setEditPrediction({
      title: prediction.title,
      description: prediction.description,
      imageUrl: prediction.imageUrl || '',
      pointsCost: prediction.pointsCost,
      correctAnswer: prediction.correctAnswer || '',
      status: prediction.status as 'active' | 'finished',
    });
    setIsEditDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

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
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
            >
              1
            </Button>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
            >
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

  const activePredictions = predictions.filter(p => p.status === 'active');
  const finishedPredictions = predictions.filter(p => p.status === 'finished');
  const totalPredictions = predictions.length;
  const totalPointsAwarded = predictions.reduce((sum, p) => sum + (p.totalPointsAwarded || 0), 0);

  // Pagination calculations
  const activeTotalPages = Math.ceil(activePredictions.length / itemsPerPage);
  const finishedTotalPages = Math.ceil(finishedPredictions.length / itemsPerPage);
  
  const activeStartIndex = (activeCurrentPage - 1) * itemsPerPage;
  const finishedStartIndex = (finishedCurrentPage - 1) * itemsPerPage;
  
  const paginatedActivePredictions = activePredictions.slice(
    activeStartIndex,
    activeStartIndex + itemsPerPage
  );
  const paginatedFinishedPredictions = finishedPredictions.slice(
    finishedStartIndex,
    finishedStartIndex + itemsPerPage
  );

  // Pagination handlers
  const handleActivePageChange = (page: number) => {
    setActiveCurrentPage(page);
  };

  const handleFinishedPageChange = (page: number) => {
    setFinishedCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
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

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            Admin: Manage Predictions
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Create, edit, and manage prediction challenges for users
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Prediction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Prediction</DialogTitle>
              <DialogDescription>
                Create a new prediction challenge for users to participate in.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {result && (
                <Alert variant={result.success ? 'default' : 'destructive'}>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newPrediction.title}
                    onChange={(e) => setNewPrediction(prev => ({...prev, title: e.target.value}))}
                    placeholder="Enter prediction title..."
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pointsCost">Points Cost *</Label>
                  <Input
                    id="pointsCost"
                    type="number"
                    min="1"
                    max="1000"
                    value={newPrediction.pointsCost}
                    onChange={(e) => setNewPrediction(prev => ({...prev, pointsCost: parseInt(e.target.value) || 10}))}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newPrediction.description}
                  onChange={(e) => setNewPrediction(prev => ({...prev, description: e.target.value}))}
                  placeholder="Enter detailed description..."
                  required
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Prediction Image</Label>
                <ImageUpload
                  value={newPrediction.imageUrl}
                  onChange={(url) => setNewPrediction(prev => ({...prev, imageUrl: url}))}
                  disabled={isSubmitting}
                  placeholder="Upload prediction image"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="correctAnswer">Correct Answer *</Label>
                  <Input
                    id="correctAnswer"
                    value={newPrediction.correctAnswer}
                    onChange={(e) => setNewPrediction(prev => ({...prev, correctAnswer: e.target.value}))}
                    placeholder="Enter correct answer..."
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={newPrediction.status}
                    onChange={(e) => setNewPrediction(prev => ({...prev, status: e.target.value as 'active' | 'finished'}))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value="active">Active</option>
                    <option value="finished">Finished</option>
                  </select>
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
                  {isSubmitting ? 'Creating...' : 'Create Prediction'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-white border-gray-200">
          <Target className="h-3 w-3 text-gray-500" />
          <span className="text-sm font-medium">{totalPredictions} Total Predictions</span>
        </Badge>

        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-green-50 border-green-200 text-green-700">
          <Activity className="h-3 w-3" />
          <span className="text-sm font-medium">{activePredictions.length} Active</span>
        </Badge>

        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700">
          <CheckCircle className="h-3 w-3" />
          <span className="text-sm font-medium">{finishedPredictions.length} Finished</span>
        </Badge>

        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-purple-50 border-purple-200 text-purple-700">
          <TrendingUp className="h-3 w-3" />
          <span className="text-sm font-medium">{totalPointsAwarded} Points Awarded</span>
        </Badge>
      </div>

      {/* Result Alert */}
      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      {/* Predictions Tabs */}
      <Tabs defaultValue="active" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="text-xs sm:text-sm">
            Active ({activePredictions.length})
          </TabsTrigger>
          <TabsTrigger value="finished" className="text-xs sm:text-sm">
            Finished ({finishedPredictions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className=" max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Active Predictions</CardTitle>
              <CardDescription className="text-sm">
                Currently active predictions that users can participate in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paginatedActivePredictions.length > 0 ? (
                <div className="space-y-4">
                  <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-full inline-block align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Image
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                              Title
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Points Cost
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                              Stats
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedActivePredictions.map((prediction) => (
                            <tr key={prediction.id} className="hover:bg-gray-50">
                              <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                                {prediction.imageUrl ? (
                                  <img 
                                    src={prediction.imageUrl} 
                                    alt={prediction.title}
                                    className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md"
                                  />
                                ) : (
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                                  </div>
                                )}
                              </td>
                              <td className="px-2 sm:px-4 py-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-xs sm:text-sm">{prediction.title}</span>
                                    <Badge variant="default" className="text-xs">Active</Badge>
                                  </div>
                                  <p className="text-xs text-gray-600 line-clamp-2 max-w-xs hidden sm:block">
                                    {prediction.description}
                                  </p>
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                                  <span className="text-xs sm:text-sm">{prediction.pointsCost}</span>
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-3">
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{prediction.totalPredictions || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>{prediction.correctPredictions || 0}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                                <span className="text-xs sm:text-sm">
                                  {new Date(prediction.createdAt).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => loadPredictionDetails(prediction.id)}
                                    className="text-xs p-2"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(prediction)}
                                    className="text-xs p-2"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusToggle(prediction.id, prediction.status)}
                                    className="text-xs p-2"
                                  >
                                    <Clock className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(prediction.id, prediction.title)}
                                    className="text-xs p-2"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <PaginationControls
                    currentPage={activeCurrentPage}
                    totalPages={activeTotalPages}
                    onPageChange={handleActivePageChange}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No active predictions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finished">
          <Card className=" max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Finished Predictions</CardTitle>
              <CardDescription className="text-sm">
                Completed predictions that are no longer accepting new submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paginatedFinishedPredictions.length > 0 ? (
                <div className="space-y-4">
                  <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-full inline-block align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Image
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                              Title
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Points Cost
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                              Stats
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedFinishedPredictions.map((prediction) => (
                            <tr key={prediction.id} className="hover:bg-gray-50">
                              <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                                {prediction.imageUrl ? (
                                  <img 
                                    src={prediction.imageUrl} 
                                    alt={prediction.title}
                                    className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md"
                                  />
                                ) : (
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                                  </div>
                                )}
                              </td>
                              <td className="px-2 sm:px-4 py-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-xs sm:text-sm">{prediction.title}</span>
                                    <Badge variant="secondary" className="text-xs">Finished</Badge>
                                  </div>
                                  <p className="text-xs text-gray-600 line-clamp-2 max-w-xs hidden sm:block">
                                    {prediction.description}
                                  </p>
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                                  <span className="text-xs sm:text-sm">{prediction.pointsCost}</span>
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-3">
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{prediction.totalPredictions || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>{prediction.correctPredictions || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>{prediction.totalPointsAwarded || 0}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                                <span className="text-xs sm:text-sm">
                                  {new Date(prediction.createdAt).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="px-2 py-3 whitespace-nowrap">
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => loadPredictionDetails(prediction.id)}
                                    className="text-xs p-2"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(prediction)}
                                    className="text-xs p-2"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusToggle(prediction.id, prediction.status)}
                                    className="text-xs p-2"
                                  >
                                    <Activity className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(prediction.id, prediction.title)}
                                    className="text-xs p-2"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <PaginationControls
                    currentPage={finishedCurrentPage}
                    totalPages={finishedTotalPages}
                    onPageChange={handleFinishedPageChange}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No finished predictions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && setIsEditDialogOpen(false)}>
        <DialogContent className="max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Prediction</DialogTitle>
            <DialogDescription>
              Update the prediction details and settings.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={editPrediction.title}
                  onChange={(e) => setEditPrediction(prev => ({...prev, title: e.target.value}))}
                  placeholder="Enter prediction title..."
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-pointsCost">Points Cost *</Label>
                <Input
                  id="edit-pointsCost"
                  type="number"
                  min="1"
                  max="1000"
                  value={editPrediction.pointsCost}
                  onChange={(e) => setEditPrediction(prev => ({...prev, pointsCost: parseInt(e.target.value) || 10}))}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={editPrediction.description}
                onChange={(e) => setEditPrediction(prev => ({...prev, description: e.target.value}))}
                placeholder="Enter detailed description..."
                required
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Prediction Image</Label>
              <ImageUpload
                value={editPrediction.imageUrl}
                onChange={(url) => setEditPrediction(prev => ({...prev, imageUrl: url}))}
                disabled={isSubmitting}
                placeholder="Upload prediction image"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-correctAnswer">Correct Answer *</Label>
                <Input
                  id="edit-correctAnswer"
                  value={editPrediction.correctAnswer}
                  onChange={(e) => setEditPrediction(prev => ({...prev, correctAnswer: e.target.value}))}
                  placeholder="Enter correct answer..."
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={editPrediction.status}
                  onChange={(e) => setEditPrediction(prev => ({...prev, status: e.target.value as 'active' | 'finished'}))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="active">Active</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Updating...' : 'Update Prediction'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={(open) => !open && setIsDetailsDialogOpen(false)}>
        <DialogContent className="max-w-4xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prediction Details</DialogTitle>
            <DialogDescription>
              View detailed information and user predictions
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrediction && (
            <div className="space-y-6">
              {/* Prediction Info */}
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {selectedPrediction.title}</div>
                    <div><strong>Status:</strong> 
                      <Badge variant={selectedPrediction.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                        {selectedPrediction.status}
                      </Badge>
                    </div>
                    <div><strong>Points Cost:</strong> {selectedPrediction.pointsCost}</div>
                    <div><strong>Correct Answer:</strong> {selectedPrediction.correctAnswer}</div>
                    <div><strong>Created:</strong> {new Date(selectedPrediction.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Total Predictions:</strong> {selectedPrediction.totalPredictions || 0}</div>
                    <div><strong>Correct Predictions:</strong> {selectedPrediction.correctPredictions || 0}</div>
                    <div><strong>Success Rate:</strong> {selectedPrediction.totalPredictions > 0 ? Math.round(((selectedPrediction.correctPredictions || 0) / selectedPrediction.totalPredictions) * 100) : 0}%</div>
                    <div><strong>Total Points Awarded:</strong> {selectedPrediction.totalPointsAwarded || 0}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {selectedPrediction.description}
                </p>
              </div>

              {/* Image */}
              {selectedPrediction.imageUrl && (
                <div>
                  <h3 className="font-semibold mb-2">Image</h3>
                  <img 
                    src={selectedPrediction.imageUrl} 
                    alt={selectedPrediction.title}
                    className="max-w-full h-auto rounded-md"
                  />
                </div>
              )}

              {/* User Predictions */}
              {selectedPrediction.userPredictions && selectedPrediction.userPredictions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">User Predictions ({selectedPrediction.userPredictions.length})</h3>
                  <div className="max-h-64 overflow-y-auto border rounded-md">
                    {selectedPrediction.userPredictions.map((userPrediction) => (
                      <div key={userPrediction.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={userPrediction.user?.avatarUrl || ''} />
                            <AvatarFallback className="text-xs">
                              {userPrediction.user?.name ? getInitials(userPrediction.user.name) : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{userPrediction.user?.name || 'Unknown User'}</p>
                            <p className="text-xs text-gray-500">"{userPrediction.guess}"</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={userPrediction.isCorrect ? 'default' : 'secondary'}>
                            {userPrediction.isCorrect ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Correct
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Incorrect
                              </>
                            )}
                          </Badge>
                          <span className="text-xs text-gray-500 hidden sm:inline">
                            {new Date(userPrediction.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPredictions; 