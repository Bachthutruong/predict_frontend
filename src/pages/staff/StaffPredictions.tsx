import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Trophy, Clock, CheckCircle, Coins, Shield } from 'lucide-react';
import apiService from '../../services/api';
import type { Prediction } from '../../types';

const StaffPredictions: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination states
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [finishedCurrentPage, setFinishedCurrentPage] = useState(1);
  const [allCurrentPage, setAllCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get('/staff/predictions');
      // Handle API response structure
      const predictionsData = response.data?.data?.predictions || response.data?.predictions || response.data?.data || response.data || [];
      setPredictions(Array.isArray(predictionsData) ? predictionsData : []);
    } catch (error) {
      console.error('Failed to load predictions:', error);
      setPredictions([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activePredictions = predictions.filter(p => p.status === 'active');
  const finishedPredictions = predictions.filter(p => p.status === 'finished');

  // Pagination calculations
  const activeTotalPages = Math.ceil(activePredictions.length / itemsPerPage);
  const finishedTotalPages = Math.ceil(finishedPredictions.length / itemsPerPage);
  const allTotalPages = Math.ceil(predictions.length / itemsPerPage);
  
  const paginatedActivePredictions = activePredictions.slice(
    (activeCurrentPage - 1) * itemsPerPage,
    activeCurrentPage * itemsPerPage
  );
  const paginatedFinishedPredictions = finishedPredictions.slice(
    (finishedCurrentPage - 1) * itemsPerPage,
    finishedCurrentPage * itemsPerPage
  );
  const paginatedAllPredictions = predictions.slice(
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
            Staff: View Predictions
          </h1>
          <p className="text-gray-600 mt-2">
            View and monitor all predictions (read-only access)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Trophy className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-xs text-gray-500">All time created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activePredictions.length}</div>
            <p className="text-xs text-gray-500">Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{finishedPredictions.length}</div>
            <p className="text-xs text-gray-500">Finished predictions</p>
          </CardContent>
        </Card>
      </div>

      {/* Predictions List */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active ({activePredictions.length})</TabsTrigger>
          <TabsTrigger value="finished">Finished ({finishedPredictions.length})</TabsTrigger>
          <TabsTrigger value="all">All ({predictions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className=" max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle>Active Predictions</CardTitle>
              <CardDescription>
                Predictions that users can currently participate in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activePredictions.length > 0 ? (
                <>
                  <StaffPredictionsTable predictions={paginatedActivePredictions} />
                  <PaginationControls
                    currentPage={activeCurrentPage}
                    totalPages={activeTotalPages}
                    onPageChange={setActiveCurrentPage}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No active predictions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finished">
          <Card className=" max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle>Finished Predictions</CardTitle>
              <CardDescription>
                Predictions that have been completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {finishedPredictions.length > 0 ? (
                <>
                  <StaffPredictionsTable predictions={paginatedFinishedPredictions} />
                  <PaginationControls
                    currentPage={finishedCurrentPage}
                    totalPages={finishedTotalPages}
                    onPageChange={setFinishedCurrentPage}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No finished predictions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card className=" max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle>All Predictions</CardTitle>
              <CardDescription>
                Complete list of all predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictions.length > 0 ? (
                <>
                  <StaffPredictionsTable predictions={paginatedAllPredictions} />
                  <PaginationControls
                    currentPage={allCurrentPage}
                    totalPages={allTotalPages}
                    onPageChange={setAllCurrentPage}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No predictions created yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StaffPredictionsTableProps {
  predictions: Prediction[];
}

const StaffPredictionsTable: React.FC<StaffPredictionsTableProps> = ({ predictions }) => {
  return (
    <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
      <div className="min-w-full inline-block align-middle">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Title</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points Cost</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Winner Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {predictions.map((prediction) => (
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
                  <div className="max-w-xs">
                    <p className="font-medium text-xs sm:text-sm line-clamp-2">{prediction.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 hidden sm:block">{prediction.description}</p>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                  <Badge variant={prediction.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {prediction.status === 'active' ? (
                      <Clock className="h-3 w-3 mr-1" />
                    ) : (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    )}
                    <span className="hidden sm:inline">{prediction.status}</span>
                  </Badge>
                </td>
                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    <span className="text-xs sm:text-sm">{prediction.pointsCost}</span>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                  <span className="text-xs sm:text-sm">{new Date(prediction.createdAt).toLocaleDateString()}</span>
                </td>
                <td className="px-2 sm:px-4 py-3">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 hidden sm:block">Answer: Hidden for staff</div>
                    {prediction.winnerId && (
                      <div className="text-xs sm:text-sm text-green-600 font-medium">Winner found!</div>
                    )}
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

export default StaffPredictions; 