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

  useEffect(() => {
    loadData();
  }, [currentPage, statusFilter, searchTerm, itemsPerPage]);

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

      const orderData = ordersResponse.data?.data;
      if (orderData) {
        setOrders(orderData.orders || []);
        setTotalPages(orderData.pagination?.pages || 1);
        setTotalItems(orderData.pagination?.total || 0);
      } else {
        setOrders([]);
        setTotalPages(1);
        setTotalItems(0);
      }

      // Load stats
      const statsResponse = await apiService.get('/admin/orders/stats/overview');
      setStats(statsResponse.data?.data?.stats || null);

    } catch (error: any) {
      console.error('Failed to load orders:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to load orders',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        title: "Success",
        description: `Order status updated to ${newStatus}`,
        variant: "default"
      });
      loadData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to update order status',
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
          Showing {startItem} to {endItem} of {totalItems} orders
          {totalPages >= 1 && ` (Page ${currentPage} of ${totalPages})`}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage <= 1 || isLoading}
          >
            First
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage <= 1 || isLoading}
          >
            Previous
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
            Next
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage >= totalPages || isLoading}
          >
            Last
          </Button>
        </div>

        {/* Items per page selector */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">Items per page:</span>
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
            Order Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor WooCommerce orders
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="space-y-3">
          {/* Main Stats Row - Badges */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-white border-gray-200">
              <ShoppingCart className="h-3 w-3 text-gray-500" />
              <span className="text-sm font-medium">{stats.totalOrders} Orders</span>
            </Badge>

            <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-yellow-50 border-yellow-200 text-yellow-700">
              <Clock className="h-3 w-3" />
              <span className="text-sm font-medium">{stats.pendingOrders} Pending</span>
            </Badge>

            <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700">
              <TrendingUp className="h-3 w-3" />
              <span className="text-sm font-medium">{stats.processingOrders} Processing</span>
            </Badge>

            <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-green-50 border-green-200 text-green-700">
              <CheckCircle className="h-3 w-3" />
              <span className="text-sm font-medium">{stats.completedOrders} Completed</span>
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
                <span className="text-sm font-medium">{stats.onHoldOrders} On Hold</span>
              </Badge>
            )}

            {(stats.cancelledOrders > 0) && (
              <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-red-50 border-red-200 text-red-700">
                <XCircle className="h-3 w-3" />
                <span className="text-sm font-medium">{stats.cancelledOrders} Cancelled</span>
              </Badge>
            )}

            {(stats.ecpayOrders > 0 || stats.ecpayShippingOrders > 0) && (
              <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-teal-50 border-teal-200 text-teal-700">
                <CreditCard className="h-3 w-3" />
                <span className="text-sm font-medium">{(stats.ecpayOrders || 0) + (stats.ecpayShippingOrders || 0)} ECPay</span>
              </Badge>
            )}

            {stats.totalCustomers && (
              <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-indigo-50 border-indigo-200 text-indigo-700">
                <Users className="h-3 w-3" />
                <span className="text-sm font-medium">{stats.totalCustomers} Customers</span>
              </Badge>
            )}
          </div>

          {/* Monthly Stats Row - Badges */}
          {(stats.ordersThisMonth > 0 || stats.revenueThisMonth > 0) && (
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-cyan-50 border-cyan-200 text-cyan-700">
                <Calendar className="h-3 w-3" />
                <span className="text-sm font-medium">{stats.ordersThisMonth || 0} This Month</span>
              </Badge>

              <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-emerald-50 border-emerald-200 text-emerald-700">
                <DollarSign className="h-3 w-3" />
                <span className="text-sm font-medium">TWD {Math.round(stats.revenueThisMonth || 0).toLocaleString()} Revenue</span>
              </Badge>

              {stats.averageOrderValue && (
                <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-violet-50 border-violet-200 text-violet-700">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-sm font-medium">TWD {Math.round(stats.averageOrderValue).toLocaleString()} Avg</span>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order ID, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="ecpay-shipping">ECPay Shipping</SelectItem>
                <SelectItem value="ecpay">ECPay</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500 self-center">
              {totalItems > 0 ? (
                <>
                  Found {totalItems} order{totalItems !== 1 ? 's' : ''}
                  {statusFilter !== 'all' && ` with status "${statusFilter}"`}
                  {searchTerm && ` matching "${searchTerm}"`}
                </>
              ) : (
                'No orders found'
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Click on an order to view details and manage status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No orders found</p>
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
              Order #{selectedOrder?.wordpressOrderId}
            </DialogTitle>
            <DialogDescription>
              Order details and management
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge className={`${getStatusColor(selectedOrder.status)} flex items-center gap-1`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="font-semibold">{formatCurrency(selectedOrder.total, selectedOrder.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Payment:</span>
                      <span className="text-sm">{selectedOrder.paymentMethodTitle}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm">{formatDate(selectedOrder.dateCreated)}</span>
                    </div>
                    {selectedOrder.dateCompleted && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completed:</span>
                        <span className="text-sm">{formatDate(selectedOrder.dateCompleted)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Customer Information</CardTitle>
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
                        <span className="text-sm">Transaction: {selectedOrder.transactionId}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Status Update */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Update Order Status</CardTitle>
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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="ecpay-shipping">ECPay Shipping</SelectItem>
                        <SelectItem value="ecpay">ECPay</SelectItem>
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
                  <CardTitle className="text-sm">Order Items</CardTitle>
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
                              Quantity: {item.quantity}
                              {item.sku && ` • SKU: ${item.sku}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(item.total)}</div>
                          <div className="text-sm text-gray-600">
                            {formatCurrency(item.price.toString())} each
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
                      Billing Address
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
                          Phone: {selectedOrder.billingAddress.phone}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Shipping Address
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
                      Customer Note
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
                    {selectedOrder.processingError || 'This order has not been fully processed yet.'}
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