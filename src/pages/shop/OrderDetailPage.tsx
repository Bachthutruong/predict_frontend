import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/shopServices';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ImageUpload } from '../../components/ui/image-upload';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { ArrowLeft, CheckCircle, Truck, Package, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../context/AuthContext';

export default function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { refreshUser } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [proofImage, setProofImage] = useState('');
    const [proofNote, setProofNote] = useState('');
    const [isEditingProof, setIsEditingProof] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    // Refresh user points when order status changes to completed
    useEffect(() => {
        if (order && order.status === 'completed') {
            refreshUser();
        }
    }, [order?.status, refreshUser]);

    const fetchOrder = async () => {
        if (!id || id === 'undefined') {
            setLoading(false);
            return;
        }
        try {
            const res = await orderAPI.getById(id!);
            if (res.data.success) {
                setOrder(res.data.data);
            }
        } catch (error) {
            // toast.error('Order not found');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitProof = async () => {
        if (!proofImage) return toast.error('Please upload an image');
        try {
            await orderAPI.submitPaymentProof(id!, { paymentImage: proofImage, note: proofNote });
            toast.success('Payment proof submitted');
            fetchOrder();
        } catch (e) { toast.error('Failed to submit'); }
    };

    const handleMarkDelivered = async () => {
        if (!confirm('Confirm you received the order?')) return;
        try {
            await orderAPI.markDelivered(id!);
            toast.success('Order completed');
            fetchOrder();
        } catch (e) { toast.error('Failed to update'); }
    };

    if (!loading && !order) return <div>{t('errors.notFound')}</div>;
    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Button variant="ghost" onClick={() => navigate('/shop')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> {t('shop.orderDetail.backToShop')}
            </Button>

            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold">{t('shop.orderDetail.title', { number: order.orderNumber })}</h1>
                    <p className="text-gray-500 text-sm">{t('shop.orderDetail.placedOn')} {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <Badge className="text-lg px-4 py-1 mb-1">{order.status.replace('_', ' ')}</Badge>
                    <div className="text-sm text-gray-500 capitalize">{t('shop.orders.payment')}: {order.paymentStatus}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle>{t('shop.orderDetail.items')}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    {item.product?.images?.[0] && <img src={item.product.images[0]} className="w-12 h-12 rounded border" />}
                                    <div>
                                        <div className="font-medium">{item.product?.name || item.name}</div>
                                        <div className="text-xs text-gray-500">x{item.quantity}</div>
                                    </div>
                                </div>
                                <span>{(item.price * item.quantity).toLocaleString()} đ</span>
                            </div>
                        ))}
                        <div className="border-t pt-4 space-y-1 text-sm">
                            <div className="flex justify-between"><span>{t('shop.orderDetail.subtotal')}</span><span>{order.subtotal.toLocaleString()} đ</span></div>
                            <div className="flex justify-between"><span>{t('shop.orderDetail.shipping')}</span><span>{order.shippingCost.toLocaleString()} đ</span></div>
                            <div className="flex justify-between font-bold text-lg pt-2"><span>{t('shop.orderDetail.total')}</span><span>{order.totalAmount.toLocaleString()} đ</span></div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>{t('shop.orderDetail.deliveryInfo')}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="font-semibold block mb-1">{t('shop.orderDetail.method')}:</span>
                            <span className="capitalize flex items-center gap-2">
                                {order.deliveryMethod === 'pickup' ? <Package className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                                {order.deliveryMethod}
                            </span>
                        </div>
                        {order.deliveryMethod === 'shipping' ? (
                            <div className="text-sm text-gray-600">
                                <p className="font-semibold text-gray-900 mb-1">{t('shop.orderDetail.shippingAddress')}:</p>
                                <p>{order.shippingAddress.name} - {order.shippingAddress.phone}</p>
                                <p>{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-600">
                                <p className="font-semibold text-gray-900 mb-1">{t('shop.orderDetail.pickupAtStore')}:</p>
                                {/* Branch details would be populated ideally */}
                                <p>{t('shop.orderDetail.pickupDesc')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {order.paymentMethod === 'bank_transfer' && order.paymentStatus !== 'paid' && (
                <Card className="border-blue-200 bg-blue-50 shadow-sm mt-6">
                    <CardHeader className="bg-blue-100/50 border-b border-blue-200/50 pb-4">
                        <CardTitle className="text-blue-800 flex items-center gap-2 text-lg">
                            <AlertCircle className="h-5 w-5 text-blue-600" />
                            {t('shop.orderDetail.paymentConfirmation')}
                        </CardTitle>
                        <CardDescription className="text-blue-700 mt-2">
                            {t('shop.orderDetail.paymentConfirmationDesc')}
                            <br />
                            <span className="text-xs opacity-80 mt-1 block">
                                {t('shop.orderDetail.statusNote')}
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {order.paymentConfirmation?.submittedAt && !isEditingProof ? (
                            <div className="flex flex-col items-center justify-center py-8 bg-white rounded-xl border-2 border-dashed border-green-200">
                                <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                                <p className="font-bold text-green-700 text-lg">{t('shop.orderDetail.proofSubmitted')}</p>
                                <p className="text-sm text-gray-500 mb-4">{t('shop.orderDetail.waitingApproval')}</p>
                                <div className="text-xs text-gray-400">
                                    {t('shop.orderDetail.submittedAt')} {new Date(order.paymentConfirmation.submittedAt).toLocaleString()}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" size="sm" className="opacity-75 cursor-default">{t('shop.orderDetail.statusWaiting')}</Button>
                                    <Button size="sm" onClick={() => setIsEditingProof(true)} variant="secondary">{t('shop.orderDetail.reUpload')}</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="bg-white p-4 rounded-lg border border-blue-100">
                                    <h4 className="text-sm font-semibold mb-3 text-gray-700">{t('shop.orderDetail.transferInfo')}</h4>
                                    {/* Ideally show Bank info here again if available logic permits, but keep simple upload focus */}
                                    <p className="text-sm text-gray-600 mb-2">
                                        {t('shop.orderDetail.uploadInstruction')}
                                    </p>
                                    <ImageUpload
                                        value={proofImage}
                                        onChange={setProofImage}
                                        placeholder={t('shop.orderDetail.uploadProof')}
                                        className="h-48"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">{t('shop.orderDetail.noteLabel')}</label>
                                    <Input
                                        value={proofNote}
                                        onChange={e => setProofNote(e.target.value)}
                                        placeholder={t('shop.orderDetail.notePlaceholder')}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    {isEditingProof && (
                                        <Button variant="outline" className="flex-1" onClick={() => setIsEditingProof(false)}>{t('shop.orderDetail.cancel')}</Button>
                                    )}
                                    <Button
                                        onClick={() => {
                                            handleSubmitProof().then(() => setIsEditingProof(false));
                                        }}
                                        disabled={!proofImage}
                                        className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all active:scale-[0.98]"
                                    >
                                        {t('shop.orderDetail.submit')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {order.status === 'shipped' && (
                <Button className="w-full h-12 text-lg" onClick={handleMarkDelivered}>
                    {t('shop.orderDetail.received')}
                </Button>
            )}
        </div>
    );
}
