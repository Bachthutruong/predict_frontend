import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, orderAPI } from '../../services/shopServices';
// Actually shopAPI methods are added now? No, I defined `shopAPI` in service earlier WITHOUT getBranches/PaymentConfig.
// I need to update `frontend/src/services/shopServices.ts` first.
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cart, setCart] = useState<any>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [paymentConfig, setPaymentConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        postalCode: user?.address?.postalCode || '',
        country: 'Vietnam',
        deliveryMethod: 'shipping', // or 'pickup'
        pickupBranchId: '',
        paymentMethod: 'bank_transfer', // or 'cod'
        usePoints: false,
        note: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [cartRes, branchRes, configRes] = await Promise.all([
                cartAPI.get(),
                api.get('/shop/branches'),
                api.get('/shop/payment-cfg')
            ]);
            if (cartRes.data.success) setCart(cartRes.data.data);
            if (branchRes.data.success) setBranches(branchRes.data.data);
            if (configRes.data.success) setPaymentConfig(configRes.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async () => {
        if (!cart || cart.items.length === 0) return toast.error('Cart is empty');

        // Validate
        if (!formData.name || !formData.phone) return toast.error('Name and Phone are required');
        if (formData.deliveryMethod === 'shipping') {
            if (!formData.street || !formData.city) return toast.error('Shipping address required');
        } else {
            if (!formData.pickupBranchId) return toast.error('Select a pickup branch');
        }

        try {
            const orderData = {
                shippingAddress: {
                    name: formData.name,
                    phone: formData.phone,
                    street: formData.street,
                    city: formData.city,
                    state: formData.state || 'VN',
                    postalCode: formData.postalCode || '10000',
                    country: formData.country,
                    notes: formData.note
                },
                paymentMethod: formData.paymentMethod,
                deliveryMethod: formData.deliveryMethod,
                pickupBranchId: formData.pickupBranchId,
                usePoints: formData.usePoints ? (user?.points || 0) : 0
            };

            const res = await orderAPI.create(orderData);
            if (res.data.success) {
                toast.success('Order placed successfully!');
                navigate(`/shop/orders/${res.data.data.id}`); // Redirect to order detail/success
            }
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Order failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    const subtotal = cart?.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0;
    const shippingCost = formData.deliveryMethod === 'shipping' ? 30000 : 0;
    const total = subtotal + shippingCost; // Points deduction logic is backend handled usually, simplifying here

    return (
        <div className="bg-[#f5f5f5] min-h-screen pt-8 pb-20 font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto px-4 lg:px-0">
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Contact & Delivery</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Delivery Method</Label>
                                <RadioGroup value={formData.deliveryMethod} onValueChange={v => setFormData({ ...formData, deliveryMethod: v })} className="flex gap-4">
                                    <div className={`flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer transition-colors ${formData.deliveryMethod === 'shipping' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                                        <RadioGroupItem value="shipping" id="shipping" />
                                        <Label htmlFor="shipping" className="cursor-pointer">Home Delivery</Label>
                                    </div>
                                    <div className={`flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer transition-colors ${formData.deliveryMethod === 'pickup' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                                        <RadioGroupItem value="pickup" id="pickup" />
                                        <Label htmlFor="pickup" className="cursor-pointer">Store Pickup</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {formData.deliveryMethod === 'shipping' ? (
                                <div className="space-y-4 pt-2">
                                    <div className="space-y-2">
                                        <Label>Address</Label>
                                        <Input value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} placeholder="Street address" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="City" />
                                        <Input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} placeholder="State/District" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 pt-2">
                                    <Label>Select Branch</Label>
                                    <Select value={formData.pickupBranchId} onValueChange={v => setFormData({ ...formData, pickupBranchId: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a store near you" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map(b => (
                                                <SelectItem key={b.id} value={b.id}>{b.name} - {b.address}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Note (Optional)</Label>
                                <Input value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
                        <CardContent>
                            <RadioGroup value={formData.paymentMethod} onValueChange={v => setFormData({ ...formData, paymentMethod: v })} className="space-y-4">
                                <div className={`flex items-center space-x-2 border p-3 rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                                    <RadioGroupItem value="bank_transfer" id="bank" />
                                    <div className="flex-1">
                                        <Label htmlFor="bank" className="cursor-pointer font-medium">Bank Transfer (QR)</Label>
                                        <p className="text-sm text-gray-500">Scan QR code to pay instantly.</p>
                                    </div>
                                </div>
                                <div className={`flex items-center space-x-2 border p-3 rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                                    <RadioGroupItem value="cod" id="cod" />
                                    <div className="flex-1">
                                        <Label htmlFor="cod" className="cursor-pointer font-medium">Cash on Delivery (COD)</Label>
                                        <p className="text-sm text-gray-500">Pay when you receive the package.</p>
                                    </div>
                                </div>
                            </RadioGroup>

                            {formData.paymentMethod === 'bank_transfer' && paymentConfig && (
                                <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-lg text-center shadow-sm">
                                    <p className="text-sm font-medium mb-2 text-primary">Transfer to:</p>
                                    <p className="font-bold text-gray-800">{paymentConfig.bankName} - {paymentConfig.accountNumber}</p>
                                    <p className="text-xs uppercase mb-3 text-gray-600 font-medium">{paymentConfig.accountName}</p>
                                    {paymentConfig.qrCodeUrl && (
                                        <img src={paymentConfig.qrCodeUrl} className="mx-auto w-40 h-40 object-contain border bg-white rounded-lg p-2 shadow-sm" />
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">Upload payment proof after order creation.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {cart?.items.map((item: any) => (
                                <div key={item._id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 border rounded overflow-hidden bg-gray-50">
                                            {item.product.images[0] && <img src={item.product.images[0]} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <div className="font-medium truncate max-w-[150px]">{item.product.name}</div>
                                            <div className="text-xs text-gray-500">x{item.quantity}</div>
                                        </div>
                                    </div>
                                    <span className="font-medium">{(item.price * item.quantity).toLocaleString()} đ</span>
                                </div>
                            ))}
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{subtotal.toLocaleString()} đ</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping Mode</span>
                                    <span className="capitalize">{formData.deliveryMethod}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping Cost</span>
                                    <span>{shippingCost.toLocaleString()} đ</span>
                                </div>
                                <div className="flex justify-between font-bold text-xl pt-4 border-t mt-4">
                                    <span>Total</span>
                                    <span className="text-primary">{total.toLocaleString()} đ</span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-4">
                                <Checkbox id="points" onCheckedChange={c => setFormData({ ...formData, usePoints: !!c })} checked={formData.usePoints} />
                                <Label htmlFor="points" className="text-sm cursor-pointer">Use points to get discount (if applicable)</Label>
                            </div>

                            <Button className="w-full text-lg h-12 bg-primary hover:bg-primary/90 mt-4" onClick={handleSubmit}>Place Order</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
