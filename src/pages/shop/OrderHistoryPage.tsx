import { useEffect, useState } from 'react';
import { orderAPI } from '../../services/shopServices';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Loader2, Package, ShoppingBag, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useLanguage } from '../../hooks/useLanguage';

interface OrderItem {
    product: {
        _id: string;
        name: string;
        images: string[];
        price: number;
    };
    quantity: number;
    price: number;
    variant?: {
        name: string;
        price: number;
    };
}

interface Order {
    id: string;
    _id?: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    itemCount: number;
    items: OrderItem[];
    createdAt: string;
}

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useLanguage();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await orderAPI.getMyOrders({});
            if (res.data.success) {
                setOrders(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load your orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 hover:bg-green-200';
            case 'processing': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
            case 'shipped': return 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200';
            case 'cancelled': return 'bg-red-100 text-red-700 hover:bg-red-200';
            case 'waiting_payment': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
            default: return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className=" mx-auto px-4 py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('shop.orders.title')}</h1>
                    <p className="text-gray-500 mt-2">{t('shop.orders.subtitle')}</p>
                </div>
                <Button onClick={() => navigate('/shop')} variant="outline" className="hidden sm:flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    {t('shop.orders.continueShopping')}
                </Button>
            </div>

            {orders.length === 0 ? (
                <Card className="text-center py-16 border-dashed">
                    <CardContent className="flex flex-col items-center">
                        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Package className="h-10 w-10 text-gray-300" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('shop.orders.noOrders')}</h2>
                        <p className="text-gray-500 max-w-sm mb-8">
                            {t('shop.orders.noOrdersDesc')}
                        </p>
                        <Button onClick={() => navigate('/shop')} className="bg-primary hover:bg-primary/90">
                            {t('shop.orders.startShopping')}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Card key={order.id || order._id} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow group">
                            <CardHeader className="bg-gray-50/50 border-b py-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 text-sm">
                                        <div>
                                            <p className="text-gray-500 mb-1">{t('shop.orders.orderPlaced')}</p>
                                            <p className="font-medium text-gray-900 flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                {format(new Date(order.createdAt), 'dd MMM yyyy')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">{t('shop.orders.totalAmount')}</p>
                                            <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <p className="text-gray-500 mb-1">{t('shop.orders.orderNumber')}</p>
                                            <p className="font-medium text-gray-900 font-mono">{order.orderNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className={`${getStatusColor(order.status)} border-none px-3 py-1 capitalize`}>
                                            {getStatusLabel(order.status)}
                                        </Badge>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="hidden sm:flex"
                                            onClick={() => navigate(`/shop/orders/${order.id || order._id}`)}
                                        >
                                            {t('shop.orders.viewDetails')}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {order.items.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <div className="h-16 w-16 bg-white border rounded-md overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.product?.images?.[0] || 'https://via.placeholder.com/150'}
                                                    alt={item.product?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">{item.product?.name}</h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Qty: {item.quantity} {item.variant ? `• ${item.variant.name}` : ''}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <p className="text-sm text-gray-500 pt-2 border-t border-dashed">
                                            + {order.items.length - 3} more items
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="bg-white border-t p-4 flex justify-between items-center">
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    {t('shop.orders.payment')}: <span className="font-medium text-gray-900 capitalize">{order.paymentStatus}</span>
                                </div>
                                <Button
                                    className="w-full sm:w-auto sm:hidden"
                                    onClick={() => navigate(`/shop/orders/${order.id || order._id}`)}
                                >
                                    View Details
                                </Button>
                                <Button
                                    variant="link"
                                    className="hidden sm:flex items-center text-primary group-hover:translate-x-1 transition-transform p-0 h-auto font-medium"
                                    onClick={() => navigate(`/shop/orders/${order.id || order._id}`)}
                                >
                                    {t('shop.orders.detailedStatus')} <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
