import { useState, useEffect } from 'react';
import { adminSystemOrderAPI } from '../../../services/adminShopServices';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Eye, Package, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';


export default function AdminSystemOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            const params: any = { limit: 50 };
            if (statusFilter !== 'all') params.status = statusFilter;
            const res = await adminSystemOrderAPI.getAll(params);
            if (res.data.success) {
                setOrders(res.data.data);
            }
        } catch (e) { toast.error('Failed to load orders'); }
        finally { setLoading(false); }
    };

    const updateStatus = async (status: string) => {
        try {
            await adminSystemOrderAPI.updateStatus(selectedOrder.id, status);
            toast.success('Order status updated');
            setSelectedOrder((prev: any) => ({ ...prev, status }));
            fetchOrders();
        } catch (e) { toast.error('Failed update'); }
    };

    const updatePaymentStatus = async (status: string) => {
        try {
            await adminSystemOrderAPI.updatePaymentStatus(selectedOrder.id, status);
            toast.success('Payment status updated');
            setSelectedOrder((prev: any) => ({ ...prev, paymentStatus: status }));
            fetchOrders();
        } catch (e) { toast.error('Failed update'); }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">System Orders</h1>
                <div className="w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="waiting_payment">Waiting Payment</SelectItem>
                            <SelectItem value="waiting_confirmation">Waiting Confirmation</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order #</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Delivery</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">No orders found</TableCell>
                            </TableRow>
                        )}
                        {orders.map(o => (
                            <TableRow key={o.id}>
                                <TableCell className="font-medium">{o.orderNumber}</TableCell>
                                <TableCell>
                                    <div>{o.user?.name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500">{o.user?.phone}</div>
                                </TableCell>
                                <TableCell>{o.items?.length} items</TableCell>
                                <TableCell>{o.totalAmount?.toLocaleString()} đ</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-xs">
                                        {o.deliveryMethod === 'pickup' ? (
                                            <><MapPin className="h-3 w-3" /> Pickup</>
                                        ) : (
                                            <><Package className="h-3 w-3" /> Ship</>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(o.status)} variant="outline">
                                        {o.status.replace('_', ' ')}
                                    </Badge>
                                    <div className="text-xs mt-1 text-gray-500 capitalize">{o.paymentStatus.replace('_', ' ')}</div>
                                </TableCell>
                                <TableCell>
                                    <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(o)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {selectedOrder && (
                <Dialog open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Order Details: {selectedOrder.orderNumber}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Customer Info</h3>
                                    <p>Name: {selectedOrder.user?.name}</p>
                                    <p>Phone: {selectedOrder.user?.phone}</p>
                                    <h3 className="font-semibold mt-2 mb-1">Delivery Address</h3>
                                    {selectedOrder.deliveryMethod === 'pickup' ? (
                                        <p className="text-blue-600 font-medium">Customer will pick up at branch.</p>
                                    ) : (
                                        <p className="text-sm whitespace-pre-wrap">
                                            {selectedOrder.shippingAddress?.name}, {selectedOrder.shippingAddress?.phone}
                                            <br />
                                            {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Order Status</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span>Order Status:</span>
                                        <Select onValueChange={updateStatus} value={selectedOrder.status}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="waiting_payment">Waiting Payment</SelectItem>
                                                <SelectItem value="waiting_confirmation">Waiting Confirmation</SelectItem>
                                                <SelectItem value="processing">Processing</SelectItem>
                                                <SelectItem value="shipped">Shipped</SelectItem>
                                                <SelectItem value="delivered">Delivered</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>Payment Status:</span>
                                        <Select onValueChange={updatePaymentStatus} value={selectedOrder.paymentStatus}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="failed">Failed</SelectItem>
                                                <SelectItem value="refunded">Refunded</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {selectedOrder.paymentConfirmation?.image && (
                                    <div className="mt-4 border p-2 rounded">
                                        <h4 className="font-medium text-sm mb-2">Payment Proof</h4>
                                        <a href={selectedOrder.paymentConfirmation.image} target="_blank" rel="noreferrer">
                                            <img src={selectedOrder.paymentConfirmation.image} className="w-full h-auto max-h-40 object-contain" />
                                        </a>
                                        <p className="text-xs mt-1 text-gray-500">{selectedOrder.paymentConfirmation.note}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-6">
                            <h3 className="font-semibold mb-2">Order Items</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedOrder.items?.map((item: any, i: number) => (
                                        <TableRow key={i}>
                                            <TableCell className="flex items-center gap-2">
                                                {item.product?.images?.[0] && <img src={item.product.images[0]} className="w-8 h-8 rounded" />}
                                                {item.product?.name || item.name}
                                                {item.variant?.name && <span className="text-xs text-gray-500">({item.variant.name}: {item.variant.value})</span>}
                                            </TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.price?.toLocaleString()}</TableCell>
                                            <TableCell>{(item.quantity * item.price).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-right font-bold">Subtotal</TableCell>
                                        <TableCell>{selectedOrder.subtotal?.toLocaleString()} đ</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-right font-bold">Shipping</TableCell>
                                        <TableCell>{selectedOrder.shippingCost?.toLocaleString()} đ</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-right font-bold">Discount</TableCell>
                                        <TableCell>-{selectedOrder.discountAmount?.toLocaleString()} đ</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-right font-bold text-lg">Total</TableCell>
                                        <TableCell className="text-lg font-bold text-primary">{selectedOrder.totalAmount?.toLocaleString()} đ</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
