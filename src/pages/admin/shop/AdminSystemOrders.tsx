import { useState, useEffect } from 'react';
import { adminSystemOrderAPI } from '../../../services/adminShopServices';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Eye, Package, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../../hooks/useLanguage';


export default function AdminSystemOrders() {
    const { t } = useLanguage();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, currentPage, limit]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params: any = { page: currentPage, limit };
            if (statusFilter !== 'all') params.status = statusFilter;
            const res = await adminSystemOrderAPI.getAll(params);
            if (res.data.success) {
                setOrders(res.data.data);
                if (res.data.pagination) {
                    setTotalPages(res.data.pagination.pages);
                    setTotalOrders(res.data.pagination.total);
                }
            }
        } catch (e) { toast.error(t('admin.shop.orders.toast.loadFailed')); }
        finally { setLoading(false); }
    };

    const updateStatus = async (status: string) => {
        try {
            // Check if payment is required for this status
            const statusesRequiringPayment = ['processing', 'shipped', 'delivered', 'completed'];
            if (statusesRequiringPayment.includes(status) && selectedOrder.paymentStatus !== 'paid') {
                toast.error(t('admin.shop.orders.toast.paymentRequired', { status }));
                return;
            }
            
            await adminSystemOrderAPI.updateStatus(selectedOrder.id, status);
            toast.success(t('admin.shop.orders.toast.updated'));
            setSelectedOrder((prev: any) => ({ ...prev, status }));
            fetchOrders();
        } catch (e: any) {
            const errorMessage = e?.response?.data?.message || t('admin.shop.orders.toast.updateFailed');
            toast.error(errorMessage);
        }
    };

    const updatePaymentStatus = async (status: string) => {
        try {
            await adminSystemOrderAPI.updatePaymentStatus(selectedOrder.id, status);
            toast.success(t('admin.shop.orders.toast.paymentUpdated'));
            setSelectedOrder((prev: any) => ({ ...prev, paymentStatus: status }));
            fetchOrders();
        } catch (e) { toast.error(t('admin.shop.orders.toast.updateFailed')); }
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
                <h1 className="text-2xl font-bold">{t('admin.shop.orders.title')}</h1>
                <div className="w-48">
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('admin.shop.orders.filterStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('admin.shop.orders.allStatus')}</SelectItem>
                            <SelectItem value="pending">{t('admin.shop.orders.status.pending')}</SelectItem>
                            <SelectItem value="waiting_payment">{t('admin.shop.orders.status.waiting_payment')}</SelectItem>
                            <SelectItem value="waiting_confirmation">{t('admin.shop.orders.status.waiting_confirmation')}</SelectItem>
                            <SelectItem value="processing">{t('admin.shop.orders.status.processing')}</SelectItem>
                            <SelectItem value="shipped">{t('admin.shop.orders.status.shipped')}</SelectItem>
                            <SelectItem value="delivered">{t('admin.shop.orders.status.delivered')}</SelectItem>
                            <SelectItem value="completed">{t('admin.shop.orders.status.completed')}</SelectItem>
                            <SelectItem value="cancelled">{t('admin.shop.orders.status.cancelled')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('admin.shop.orders.table.orderNumber')}</TableHead>
                            <TableHead>{t('admin.shop.orders.table.user')}</TableHead>
                            <TableHead>{t('admin.shop.orders.table.items')}</TableHead>
                            <TableHead>{t('admin.shop.orders.table.total')}</TableHead>
                            <TableHead>{t('admin.shop.orders.table.delivery')}</TableHead>
                            <TableHead>{t('admin.shop.orders.table.status')}</TableHead>
                            <TableHead>{t('admin.shop.orders.table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">{t('admin.shop.orders.table.noOrders')}</TableCell>
                            </TableRow>
                        )}
                        {orders.map(o => (
                            <TableRow key={o.id}>
                                <TableCell className="font-medium">{o.orderNumber}</TableCell>
                                <TableCell>
                                    <div>{o.user?.name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500">{o.user?.phone}</div>
                                </TableCell>
                                <TableCell>{o.items?.length} {t('admin.shop.orders.table.items')}</TableCell>
                                <TableCell>{o.totalAmount?.toLocaleString()} đ</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-xs">
                                        {o.deliveryMethod === 'pickup' ? (
                                            <><MapPin className="h-3 w-3" /> {t('shop.checkout.storePickup')}</>
                                        ) : (
                                            <><Package className="h-3 w-3" /> {t('shop.checkout.homeDelivery')}</>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(o.status)} variant="outline">
                                        {t(`admin.shop.orders.status.${o.status}`)}
                                    </Badge>
                                    <div className="text-xs mt-1 text-gray-500 capitalize">{t(`admin.shop.orders.status.${o.paymentStatus}`)}</div>
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

            {/* Pagination Controls */}
            {orders.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{t('common.pageSize')}:</span>
                        <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-500">
                            {t('admin.shop.orders.table.total')}: {totalOrders}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> {t('common.previous')}
                        </Button>
                        <span className="text-sm font-medium">
                            {t('common.pageOf', { current: currentPage, total: totalPages })}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            {t('common.next')} <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {selectedOrder && (
                <Dialog open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{t('admin.shop.orders.details.title', { number: selectedOrder.orderNumber })}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">{t('admin.shop.orders.details.customerInfo')}</h3>
                                    <p>{t('admin.shop.orders.details.name')}: {selectedOrder.user?.name}</p>
                                    <p>{t('admin.shop.orders.details.phone')}: {selectedOrder.user?.phone}</p>
                                    <h3 className="font-semibold mt-2 mb-1">{t('admin.shop.orders.details.deliveryAddress')}</h3>
                                    {selectedOrder.deliveryMethod === 'pickup' ? (
                                        <p className="text-blue-600 font-medium">{t('admin.shop.orders.details.pickupNote')}</p>
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
                                    <h3 className="font-semibold mb-2">{t('admin.shop.orders.details.orderStatus')}</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span>{t('admin.shop.orders.details.paymentStatus')}:</span>
                                        <Select onValueChange={updatePaymentStatus} value={selectedOrder.paymentStatus}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">{t('admin.shop.orders.status.pending')}</SelectItem>
                                                <SelectItem value="paid">{t('admin.shop.orders.status.paid')}</SelectItem>
                                                <SelectItem value="failed">{t('admin.shop.orders.status.failed')}</SelectItem>
                                                <SelectItem value="refunded">{t('admin.shop.orders.status.refunded')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>{t('admin.shop.orders.details.orderStatus')}:</span>
                                        <Select onValueChange={updateStatus} value={selectedOrder.status}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">{t('admin.shop.orders.status.pending')}</SelectItem>
                                                <SelectItem value="waiting_payment">{t('admin.shop.orders.status.waiting_payment')}</SelectItem>
                                                <SelectItem value="waiting_confirmation">{t('admin.shop.orders.status.waiting_confirmation')}</SelectItem>
                                                <SelectItem value="processing">{t('admin.shop.orders.status.processing')}</SelectItem>
                                                <SelectItem value="shipped">{t('admin.shop.orders.status.shipped')}</SelectItem>
                                                <SelectItem value="delivered">{t('admin.shop.orders.status.delivered')}</SelectItem>
                                                <SelectItem value="completed">{t('admin.shop.orders.status.completed')}</SelectItem>
                                                <SelectItem value="cancelled">{t('admin.shop.orders.status.cancelled')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {selectedOrder.paymentConfirmation?.image && (
                                    <div className="mt-4 border p-2 rounded">
                                        <h4 className="font-medium text-sm mb-2">{t('admin.shop.orders.details.paymentProof')}</h4>
                                        <a href={selectedOrder.paymentConfirmation.image} target="_blank" rel="noreferrer">
                                            <img src={selectedOrder.paymentConfirmation.image} className="w-full h-auto max-h-40 object-contain" />
                                        </a>
                                        <p className="text-xs mt-1 text-gray-500">{selectedOrder.paymentConfirmation.note}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-6">
                            <h3 className="font-semibold mb-2">{t('admin.shop.orders.details.orderItems')}</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('admin.shop.orders.details.product')}</TableHead>
                                        <TableHead>{t('admin.shop.orders.details.quantity')}</TableHead>
                                        <TableHead>{t('admin.shop.orders.details.price')}</TableHead>
                                        <TableHead>{t('admin.shop.orders.details.total')}</TableHead>
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
                                        <TableCell colSpan={3} className="text-right font-bold">{t('admin.shop.orders.details.subtotal')}</TableCell>
                                        <TableCell>{selectedOrder.subtotal?.toLocaleString()} đ</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-right font-bold">{t('admin.shop.orders.details.shipping')}</TableCell>
                                        <TableCell>{selectedOrder.shippingCost?.toLocaleString()} đ</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-right font-bold">{t('admin.shop.orders.details.discount')}</TableCell>
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
