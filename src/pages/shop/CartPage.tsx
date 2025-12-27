import { useState, useEffect } from 'react';
import { cartAPI } from '../../services/shopServices';
import { Button } from '../../components/ui/button';
import { Minus, Plus, Trash2, Ticket, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Checkbox } from '../../components/ui/checkbox';
import { useLanguage } from '../../hooks/useLanguage';

export default function CartPage() {
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useLanguage();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const res = await cartAPI.get();
            if (res.data.success) {
                setCart(res.data.data);
            }
        } catch (error) {
            console.error('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId: string, newQty: number) => {
        if (newQty < 1) return;
        try {
            await cartAPI.update(itemId, newQty);
            fetchCart();
        } catch (e) { toast.error(t('cart.updateFailed')); }
    };

    const removeItem = async (itemId: string) => {
        try {
            await cartAPI.remove(itemId);
            fetchCart();
            toast.success(t('cart.itemRemoved'));
        } catch (e) { toast.error(t('cart.removeFailed')); }
    };

    if (!loading && (!cart || cart.items.length === 0)) {
        return (
            <div className="bg-[#f5f5f5] min-h-screen py-20 flex flex-col items-center justify-center">
                <div className="bg-white p-12 rounded shadow-sm text-center flex flex-col items-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <ShoppingCart className="h-16 w-16 text-gray-300" />
                    </div>
                    <h2 className="text-gray-500 font-medium mb-6">{t('cart.emptyCartMessage')}</h2>
                    <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => navigate('/shop')}>{t('cart.startShopping')}</Button>
                </div>
            </div>
        )
    }

    const subtotal = cart?.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0;

    return (
        <div className="bg-[#f5f5f5] min-h-screen pb-20 font-sans">
            <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center gap-4">
                    <span className="text-xl font-bold text-primary flex items-center gap-2 cursor-pointer" onClick={() => navigate('/shop')}>
                        <ShoppingCart className="h-6 w-6" /> Jiudi {t('cart.title')}
                    </span>
                    <div className="h-6 w-px bg-gray-300 mx-2"></div>
                    <span className="text-lg text-gray-700">{t('cart.shoppingCart')}</span>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl pt-6 px-4">

                {/* Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 bg-white p-4 rounded shadow-sm text-sm text-gray-500 mb-4 items-center font-medium">
                    <div className="col-span-6 flex items-center gap-4">
                        <Checkbox />
                        <span>{t('cart.product')}</span>
                    </div>
                    <div className="col-span-2 text-center">{t('cart.unitPrice')}</div>
                    <div className="col-span-2 text-center">{t('cart.quantity')}</div>
                    <div className="col-span-1 text-center">{t('cart.totalPrice')}</div>
                    <div className="col-span-1 text-center">{t('cart.actions')}</div>
                </div>

                {/* Shop Items */}
                <div className="bg-white rounded shadow-sm mb-4">
                    <div className="p-4 border-b flex items-center gap-2">
                        <Checkbox />
                        <span className="font-bold text-gray-700">{t('cart.officialStore')}</span>
                        <span className="bg-primary text-white text-[10px] px-1 rounded ml-2">{t('shop.official')}</span>
                    </div>

                    {cart?.items.map((item: any) => (
                        <div key={item._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center border-b last:border-0 bg-white hover:bg-gray-50 transition-colors">
                            <div className="col-span-6 flex items-center gap-4">
                                <Checkbox />
                                <div className="flex gap-4">
                                    {item.product.images[0] && <img src={item.product.images[0]} className="w-20 h-20 object-cover border rounded-sm" />}
                                    <div className="flex flex-col justify-center">
                                        <div className="line-clamp-2 text-sm mb-1 font-medium">{item.product.name}</div>
                                        <div className="text-xs text-primary border border-primary w-fit px-1 rounded-[2px]">{t('cart.freeReturn')}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:block col-span-2 text-center">
                                <span className="text-gray-400 line-through mr-2 text-xs">₫{Math.round(item.price * 1.2).toLocaleString()}</span>
                                <span className="text-gray-800 font-medium">₫{item.price.toLocaleString()}</span>
                            </div>
                            <div className="col-span-6 md:col-span-2 flex md:justify-center items-center gap-2 md:gap-0 pl-[34px] md:pl-0">
                                <div className="flex items-center border border-gray-300 rounded-sm bg-white">
                                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100 border-r"><Minus className="h-3 w-3" /></button>
                                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100 border-l"><Plus className="h-3 w-3" /></button>
                                </div>
                                {/* Mobile Price view */}
                                <div className="md:hidden ml-auto font-medium text-primary">
                                    ₫{(item.price * item.quantity).toLocaleString()}
                                </div>
                            </div>
                            <div className="hidden md:block col-span-1 text-center text-primary font-medium">
                                ₫{(item.price * item.quantity).toLocaleString()}
                            </div>
                            <div className="col-span-6 md:col-span-1 flex justify-end md:justify-center">
                                <button onClick={() => removeItem(item._id)} className="text-gray-500 hover:text-red-500 text-sm flex items-center gap-1">
                                    <Trash2 className="h-4 w-4 md:hidden" /> <span className="md:hidden">{t('cart.delete')}</span> <span className="hidden md:inline">{t('cart.delete')}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sticky Footer */}
                <div className="sticky bottom-0 bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex flex-col md:flex-row justify-between items-center z-20 border-t gap-4 md:gap-0">
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
                        <div className="flex items-center gap-2">
                            <Checkbox id="selectAll" />
                            <label htmlFor="selectAll" className="text-sm cursor-pointer select-none">{t('cart.selectAll')} ({cart?.items.length})</label>
                        </div>
                        <div className="flex gap-4">
                            <button className="text-sm hover:text-primary hidden md:block">{t('cart.delete')}</button>
                            <button className="text-sm hover:text-primary flex items-center gap-1 text-primary">
                                <Ticket className="h-4 w-4" /> {t('cart.saveUpTo')} ₫10k
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right flex-1 md:flex-none">
                            <div className="flex items-center justify-end gap-2 text-base">
                                <span className="hidden md:inline">{t('cart.total')} ({cart?.items.length} {t('cart.items')}):</span>
                                <span className="md:hidden">{t('cart.total')}:</span>
                                <span className="text-primary text-xl font-bold">₫{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-green-600">{t('cart.youSaved')} ₫25.000</div>
                        </div>
                        <Button className="bg-primary hover:bg-primary/90 h-10 px-8 rounded-sm text-base text-white shadow-md" onClick={() => navigate('/shop/checkout')}>{t('cart.checkOut')}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
