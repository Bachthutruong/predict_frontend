import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/shopServices';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ImageUpload } from '../../components/ui/image-upload';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { ArrowLeft, CheckCircle, Truck, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [proofImage, setProofImage] = useState('');
    const [proofNote, setProofNote] = useState('');

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
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
            await orderAPI.submitPaymentProof(id!, { image: proofImage, note: proofNote });
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

    if (!loading && !order) return <div>Order not found</div>;
    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Button variant="ghost" onClick={() => navigate('/shop')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
            </Button>

            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
                    <p className="text-gray-500 text-sm">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <Badge className="text-lg px-4 py-1 mb-1">{order.status.replace('_', ' ')}</Badge>
                    <div className="text-sm text-gray-500 capitalize">Payment: {order.paymentStatus}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
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
                            <div className="flex justify-between"><span>Subtotal</span><span>{order.subtotal.toLocaleString()} đ</span></div>
                            <div className="flex justify-between"><span>Shipping</span><span>{order.shippingCost.toLocaleString()} đ</span></div>
                            <div className="flex justify-between font-bold text-lg pt-2"><span>Total</span><span>{order.totalAmount.toLocaleString()} đ</span></div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Delivery Info</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="font-semibold block mb-1">Method:</span>
                            <span className="capitalize flex items-center gap-2">
                                {order.deliveryMethod === 'pickup' ? <Package className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                                {order.deliveryMethod}
                            </span>
                        </div>
                        {order.deliveryMethod === 'shipping' ? (
                            <div className="text-sm text-gray-600">
                                <p className="font-semibold text-gray-900 mb-1">Shipping Address:</p>
                                <p>{order.shippingAddress.name} - {order.shippingAddress.phone}</p>
                                <p>{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-600">
                                <p className="font-semibold text-gray-900 mb-1">Pickup at Store:</p>
                                {/* Branch details would be populated ideally */}
                                <p>Please visit the selected store to pick up your order.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {order.paymentMethod === 'bank_transfer' && order.paymentStatus !== 'paid' && (
                <Card className="border-blue-100 bg-blue-50/50">
                    <CardHeader>
                        <CardTitle className="text-blue-800">Payment Confirmation</CardTitle>
                        <CardDescription>Please transfer the total amount and upload the proof here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.paymentConfirmation?.submittedAt ? (
                            <div className="text-center py-4 bg-white rounded-lg border border-green-100">
                                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                <p className="font-medium text-green-800">Payment proof submitted</p>
                                <p className="text-xs text-gray-500">Waiting for admin verification</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Upload Screenshot</label>
                                    <ImageUpload value={proofImage} onChange={setProofImage} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Note (Optional)</label>
                                    <Input value={proofNote} onChange={e => setProofNote(e.target.value)} placeholder="Transaction code, etc." />
                                </div>
                                <Button onClick={handleSubmitProof} disabled={!proofImage}>Submit Payment Proof</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {order.status === 'shipped' && (
                <Button className="w-full h-12 text-lg" onClick={handleMarkDelivered}>
                    I have received this order
                </Button>
            )}
        </div>
    );
}
