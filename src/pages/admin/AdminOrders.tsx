import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
// import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
// import { Separator } from '../../components/ui/separator';

import { 
  Package,
  Search,
  // Eye,
  RefreshCw,
  // Filter,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Truck,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Info
} from 'lucide-react';

import { useToast } from '../../hooks/use-toast';
import apiService from '../../services/api';
import type { Order, OrderStats } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

// interface OrdersResponse {
//   orders: Order[];
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     pages: number;
//   };
// }

const AdminOrders: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load orders with filters
      const ordersResponse = await apiService.get('/admin/orders', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchTerm || undefined
        }
      });

      const raw = ordersResponse.data;
      const list = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.data?.orders)
          ? raw.data.orders
          : Array.isArray(raw?.orders)
            ? raw.orders
            : [];
      const pg = raw?.pagination || raw?.data?.pagination || { pages: 1, total: list.length };

      setOrders(list);
      setTotalPages(Number(pg.pages || 1));
      setTotalItems(Number(pg.total || list.length));

      // Load stats
      const statsResponse = await apiService.get('/admin/orders/stats/overview');
      setStats(statsResponse.data?.data?.stats || null);

    } catch (error: any) {
      console.error('Failed to load orders:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('adminOrders.failedToLoadOrders'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, statusFilter, searchTerm, itemsPerPage]);

  const handleOrderClick = async (order: Order) => {
    try {
      const response = await apiService.get(`/admin/orders/${order.id}`);
      setSelectedOrder(response.data?.data || order);
      setIsDetailsDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to load order details:', error);
      setSelectedOrder(order);
      setIsDetailsDialogOpen(true);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await apiService.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast({
        title: t('common.success'),
        description: t('adminOrders.orderStatusUpdated', { status: newStatus }),
        variant: "default"
      });
      loadData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('adminOrders.failedToUpdateStatus'),
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on-hold': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-gray-100 text-gray-800';
      case 'ecpay-shipping': return 'bg-indigo-100 text-indigo-800';
      case 'ecpay': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'ecpay-shipping': return <Truck className="h-4 w-4" />;
      case 'ecpay': return <CreditCard className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: string, currency: string = 'TWD') => {
    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  // Pagination component
  const PaginationControls: React.FC = () => {
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

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="space-y-4 mt-6">
        {/* Pagination Info */}
        <div className="text-sm text-gray-600 text-center">
          {t('adminOrders.showingToOf', { start: startItem, end: endItem, total: totalItems })}
          {totalPages >= 1 && ` (${t('adminOrders.pageOf', { current: currentPage, total: totalPages })})`}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage <= 1 || isLoading}
          >
            {t('adminOrders.first')}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage <= 1 || isLoading}
          >
            {t('adminOrders.previous')}
          </Button>
          
          {startPage >= 1 && (
            <>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)}>1</Button>
              {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
            </>
          )}
          
          {pages.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              disabled={isLoading}
            >
              {page}
            </Button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)}>
                {totalPages}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages || isLoading}
          >
            {t('adminOrders.next')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage >= totalPages || isLoading}
          >
            {t('adminOrders.last')}
          </Button>
        </div>

        {/* Items per page selector */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">{t('adminOrders.itemsPerPage')}:</span>
          <Select 
            value={itemsPerPage.toString()} 
            onValueChange={(value) => {
              setItemsPerPage(parseInt(value));
            }}
            disabled={isLoading}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            {t('adminOrders.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('adminOrders.manageAndMonitorOrders')}
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {t('adminOrders.refresh')}
        </Button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="space-y-3">
          {/* Main Stats Row - Badges */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-white border-gray-200">
              <ShoppingCart className="h-3 w-3 text-gray-500" />
              <span className="text-sm font-medium">{stats.totalOrders} {t('adminOrders.orders')}</span>
            </Badge>

            <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-yellow-50 border-yellow-200 text-yellow-700">
              <Clock className="h-3 w-3" />
              <span className="text-sm font-medium">{stats.pendingOrders} {t('adminOrders.pending')}</span>
            </Badge>

            <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700">
              <TrendingUp className="h-3 w-3" />
              <span className="text-sm font-medium">{stats.processingOrders} {t('adminOrders.processing')}</span>
            </Badge>

            <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-green-50 border-green-200 text-green-700">
              <CheckCircle className="h-3 w-3" />
              <span className="text-sm font-medium">{stats.completedOrders} {t('adminOrders.completed')}</span>
            </Badge>

            <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-purple-50 border-purple-200 text-purple-700">
              <DollarSign className="h-3 w-3" />
              <span className="text-sm font-medium">TWD {Math.round(stats.totalRevenue || 0).toLocaleString()}</span>
            </Badge>
          </div>

          {/* Additional Stats Row - Badges */}
          <div className="flex flex-wrap gap-3">
            {(stats.onHoldOrders > 0) && (
              <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-orange-50 border-orange-200 text-orange-700">
                <AlertCircle className="h-3 w-3" />
                <span className="text-sm font-medium">{stats.onHoldOrders} {t('adminOrders.onHold')}</span>
              </Badge>
            )}

            {(stats.cancelledOrders > 0) && (
              <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-red-50 border-red-200 text-red-700">
                <XCircle className="h-3 w-3" />
                <span className="text-sm font-medium">{stats.cancelledOrders} {t('adminOrders.cancelled')}</span>
              </Badge>
            )}

            {(stats.ecpayOrders > 0 || stats.ecpayShippingOrders > 0) && (
              <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-teal-50 border-teal-200 text-teal-700">
                <CreditCard className="h-3 w-3" />
                <span className="text-sm font-medium">{(stats.ecpayOrders || 0) + (stats.ecpayShippingOrders || 0)} {t('adminOrders.ecpay')}</span>
              </Badge>
            )}

            {stats.totalCustomers && (
              <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-indigo-50 border-indigo-200 text-indigo-700">
                <Users className="h-3 w-3" />
                <span className="text-sm font-medium">{stats.totalCustomers} {t('adminOrders.customers')}</span>
              </Badge>
            )}
          </div>

          {/* Monthly Stats Row - Badges */}
          {(stats.ordersThisMonth > 0 || stats.revenueThisMonth > 0) && (
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-cyan-50 border-cyan-200 text-cyan-700">
                <Calendar className="h-3 w-3" />
                <span className="text-sm font-medium">{stats.ordersThisMonth || 0} {t('adminOrders.thisMonth')}</span>
              </Badge>

              <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-emerald-50 border-emerald-200 text-emerald-700">
                <DollarSign className="h-3 w-3" />
                <span className="text-sm font-medium">TWD {Math.round(stats.revenueThisMonth || 0).toLocaleString()} {t('adminOrders.revenue')}</span>
              </Badge>

              {stats.averageOrderValue && (
                <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-violet-50 border-violet-200 text-violet-700">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-sm font-medium">TWD {Math.round(stats.averageOrderValue).toLocaleString()} {t('adminOrders.average')}</span>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('adminOrders.filtersAndSearch')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('adminOrders.searchByOrderId')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('adminOrders.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('adminOrders.allStatus')}</SelectItem>
                <SelectItem value="pending">{t('adminOrders.pending')}</SelectItem>
                <SelectItem value="processing">{t('adminOrders.processing')}</SelectItem>
                <SelectItem value="on-hold">{t('adminOrders.onHold')}</SelectItem>
                <SelectItem value="completed">{t('adminOrders.completed')}</SelectItem>
                <SelectItem value="cancelled">{t('adminOrders.cancelled')}</SelectItem>
                <SelectItem value="refunded">{t('adminOrders.refunded')}</SelectItem>
                <SelectItem value="failed">{t('adminOrders.failed')}</SelectItem>
                <SelectItem value="ecpay-shipping">{t('adminOrders.ecpayShipping')}</SelectItem>
                <SelectItem value="ecpay">{t('adminOrders.ecpay')}</SelectItem>
              </SelectContent>
            </Select>
        
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('adminOrders.orders')}</CardTitle>
          <CardDescription>
            {t('adminOrders.clickOrderToView')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>{t('adminOrders.noOrdersFound')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleOrderClick(order)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            <Users className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{order.wordpressOrderId}</span>
                          <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                            {getStatusIcon(order.status)}
                            {order.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(order.total, order.currency)}</div>
                      <div className="text-sm text-gray-500">{formatDate(order.dateCreated)}</div>
                      <div className="text-xs text-gray-400">{order.paymentMethodTitle}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <PaginationControls />
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('adminOrders.orderDetails')} #{selectedOrder?.wordpressOrderId}
            </DialogTitle>
            <DialogDescription>
              {t('adminOrders.orderDetailsAndManagement')}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t('adminOrders.orderInformation')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('adminOrders.status')}:</span>
                      <Badge className={`${getStatusColor(selectedOrder.status)} flex items-center gap-1`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('adminOrders.total')}:</span>
                      <span className="font-semibold">{formatCurrency(selectedOrder.total, selectedOrder.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('adminOrders.payment')}:</span>
                      <span className="text-sm">{selectedOrder.paymentMethodTitle}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('adminOrders.created')}:</span>
                      <span className="text-sm">{formatDate(selectedOrder.dateCreated)}</span>
                    </div>
                    {selectedOrder.dateCompleted && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('adminOrders.completed')}:</span>
                        <span className="text-sm">{formatDate(selectedOrder.dateCompleted)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t('adminOrders.customerInformation')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedOrder.customerEmail}</span>
                    </div>
                    {selectedOrder.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedOrder.customerPhone}</span>
                      </div>
                    )}
                    {selectedOrder.transactionId && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{t('adminOrders.transactionId')}: {selectedOrder.transactionId}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Status Update */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t('adminOrders.updateOrderStatus')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => handleStatusUpdate(selectedOrder.id, value)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t('adminOrders.pending')}</SelectItem>
                        <SelectItem value="processing">{t('adminOrders.processing')}</SelectItem>
                        <SelectItem value="on-hold">{t('adminOrders.onHold')}</SelectItem>
                        <SelectItem value="completed">{t('adminOrders.completed')}</SelectItem>
                        <SelectItem value="cancelled">{t('adminOrders.cancelled')}</SelectItem>
                        <SelectItem value="refunded">{t('adminOrders.refunded')}</SelectItem>
                        <SelectItem value="failed">{t('adminOrders.failed')}</SelectItem>
                        <SelectItem value="ecpay-shipping">{t('adminOrders.ecpayShipping')}</SelectItem>
                        <SelectItem value="ecpay">{t('adminOrders.ecpay')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {isUpdating && (
                      <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t('adminOrders.orderItems')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.lineItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          {item.image?.src && (
                            <img
                              src={item.image.src}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-600">
                              {t('adminOrders.quantity')}: {item.quantity}
                              {item.sku && ` • SKU: ${item.sku}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(item.total)}</div>
                          <div className="text-sm text-gray-600">
                            {formatCurrency(item.price.toString())} {t('adminOrders.each')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Addresses */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t('adminOrders.billingAddress')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <div>{selectedOrder.billingAddress.first_name} {selectedOrder.billingAddress.last_name}</div>
                      {selectedOrder.billingAddress.company && (
                        <div>{selectedOrder.billingAddress.company}</div>
                      )}
                      <div>{selectedOrder.billingAddress.address_1}</div>
                      {selectedOrder.billingAddress.address_2 && (
                        <div>{selectedOrder.billingAddress.address_2}</div>
                      )}
                      <div>
                        {selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.postcode}
                      </div>
                      <div>{selectedOrder.billingAddress.country}</div>
                      {selectedOrder.billingAddress.phone && (
                        <div className="mt-2 pt-2 border-t">
                          {t('adminOrders.phone')}: {selectedOrder.billingAddress.phone}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      {t('adminOrders.shippingAddress')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <div>{selectedOrder.shippingAddress.first_name} {selectedOrder.shippingAddress.last_name}</div>
                      {selectedOrder.shippingAddress.company && (
                        <div>{selectedOrder.shippingAddress.company}</div>
                      )}
                      <div>{selectedOrder.shippingAddress.address_1}</div>
                      {selectedOrder.shippingAddress.address_2 && (
                        <div>{selectedOrder.shippingAddress.address_2}</div>
                      )}
                      <div>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postcode}
                      </div>
                      <div>{selectedOrder.shippingAddress.country}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Note */}
              {selectedOrder.customerNote && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      {t('adminOrders.customerNote')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedOrder.customerNote}</p>
                  </CardContent>
                </Card>
              )}

              {/* Processing Status */}
              {(selectedOrder.processingError || !selectedOrder.isProcessed) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {selectedOrder.processingError || t('adminOrders.thisOrderNotProcessed')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders; 