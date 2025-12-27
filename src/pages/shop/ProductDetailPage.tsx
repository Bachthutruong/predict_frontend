import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shopAPI, cartAPI } from '../../services/shopServices';
import { Button } from '../../components/ui/button';
import {
    ShoppingCart, Minus, Plus, Star,
    Heart, Share2, ShieldCheck, Truck, Store,
    RotateCcw, MessageCircle, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReviewSection from './ReviewSection';
import ChatWidget from './ChatWidget';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await shopAPI.getProduct(id!);
            if (res.data.success) {
                setProduct(res.data.data);
            }
        } catch (error) {
            toast.error('Product not found');
            navigate('/shop');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (isBuyNow = false) => {
        try {
            await cartAPI.add(product.id || product._id, quantity);
            if (isBuyNow) {
                navigate('/shop/cart');
            } else {
                toast.success('Added to cart!');
            }
        } catch (error) {
            toast.error('Failed to add to cart. Please login.');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

    return (
        <div className="bg-[#f5f5f5] min-h-screen pb-20 pt-4 font-sans">
            <div className="container mx-auto max-w-7xl px-4 lg:px-0">
                {/* Breadcrumb / Back */}
                <div className="text-sm breadcrumbs mb-4 text-gray-500 cursor-pointer hover:text-primary transition-colors flex items-center gap-1" onClick={() => navigate('/shop')}>
                    ← Back to Shop
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                        {/* Left: Images */}
                        <div className="md:col-span-5 space-y-4">
                            <div className="aspect-square relative overflow-hidden rounded-lg border border-gray-100 bg-gray-50 group">
                                {product.images[activeImage] ? (
                                    <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Store className="h-16 w-16 opacity-50" />
                                    </div>
                                )}
                                {product.stock <= 0 && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                                        <span className="bg-black/80 text-white px-4 py-2 rounded-full font-bold uppercase tracking-wide">Out of Stock</span>
                                    </div>
                                )}
                            </div>
                            {product.images.length > 0 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                                    {product.images.map((img: string, i: number) => (
                                        <div
                                            key={i}
                                            onMouseEnter={() => setActiveImage(i)}
                                            className={`w-20 h-20 flex-shrink-0 cursor-pointer border-2 rounded-md overflow-hidden transition-all snap-start ${activeImage === i ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-300'}`}
                                        >
                                            <img src={img} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-center gap-8 text-sm text-gray-500 pt-2">
                                <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                                    <Share2 className="h-4 w-4" /> Share
                                </div>
                                <div className="border-l border-gray-300 pl-8 flex items-center gap-2 cursor-pointer hover:text-red-500 transition-colors">
                                    <Heart className="h-4 w-4" /> Favorite
                                </div>
                            </div>
                        </div>

                        {/* Right: Info */}
                        <div className="md:col-span-7 flex flex-col">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-4">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-6 text-sm mb-6 pb-6 border-b border-gray-100">
                                <div className="flex items-center gap-2 pr-6 border-r border-gray-200 text-yellow-500">
                                    <span className="text-primary font-bold text-lg border-b-2 border-primary text-black">4.9</span>
                                    <div className="flex">
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                    </div>
                                </div>
                                <div className="pr-6 border-r border-gray-200">
                                    <span className="font-bold text-gray-900 text-lg mr-1">{Math.floor(Math.random() * 500) + 50}</span>
                                    <span className="text-gray-500">Ratings</span>
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 text-lg mr-1">{product.stock < 100 ? '9.8k' : '500+'}</span>
                                    <span className="text-gray-500">Sold</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 flex items-baseline gap-4 mb-8">
                                {product.originalPrice > product.price && (
                                    <span className="text-gray-400 line-through text-lg mt-1">₫{product.originalPrice.toLocaleString()}</span>
                                )}
                                <div className="text-primary text-4xl font-bold">
                                    <span className="text-xl align-top mr-1">₫</span>
                                    {product.price.toLocaleString()}
                                </div>
                                {product.originalPrice > product.price && (
                                    <span className="self-center bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-sm uppercase">
                                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                    </span>
                                )}
                            </div>

                            <div className="space-y-6 flex-1 mb-8">
                                {/* Transport */}
                                <div className="grid grid-cols-[110px_1fr] gap-4 text-sm items-start">
                                    <div className="text-gray-500 mt-1 font-medium">Shipping</div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-gray-800 font-medium">
                                            <Truck className="h-4 w-4 text-gray-700" />
                                            <span>Free Shipping</span>
                                        </div>
                                        <div className="text-gray-500 text-xs">
                                            Free shipping for orders over ₫99.000
                                        </div>
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div className="grid grid-cols-[110px_1fr] gap-4 text-sm items-center">
                                    <div className="text-gray-500 font-medium">Quantity</div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-gray-300 rounded-sm bg-white">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="p-2.5 hover:bg-gray-50 border-r transition-colors"
                                                disabled={quantity <= 1}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <input
                                                className="w-16 text-center outline-none bg-transparent font-medium"
                                                value={quantity}
                                                readOnly
                                            />
                                            <button
                                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                                className="p-2.5 hover:bg-gray-50 border-l transition-colors"
                                                disabled={quantity >= product.stock}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <span className="text-gray-500 text-xs ml-2">{product.stock} pieces available</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mb-8 pb-8 border-b">
                                <Button
                                    className="flex-1 bg-primary h-12 text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all text-white"
                                    onClick={() => handleAddToCart(true)}
                                    disabled={product.stock <= 0}
                                >
                                    Buy Now
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 text-base font-bold border-primary text-primary hover:bg-primary/5 hover:-translate-y-0.5 transition-all"
                                    onClick={() => handleAddToCart()}
                                    disabled={product.stock <= 0}
                                >
                                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="h-12 w-12 rounded-full border border-gray-200 text-gray-400 hover:text-primary hover:bg-blue-50 hover:border-blue-200 transition-all"
                                    onClick={() => {
                                        // Open ChatWidget manually if possible or just rely on the floating one
                                        const chatButton = document.querySelector('button[aria-label="chat"]');
                                        if (chatButton instanceof HTMLElement) chatButton.click();
                                        else toast.success('Chat available in bottom right!');
                                    }}
                                >
                                    <MessageCircle className="h-6 w-6" />
                                </Button>
                            </div>

                            {/* Policies */}
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="text-primary h-5 w-5" />
                                    <span>Original Product 100%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck className="text-primary h-5 w-5" />
                                    <span>Fast & Free Shipping</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RotateCcw className="text-primary h-5 w-5" />
                                    <span>7 Days Return</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap className="text-primary h-5 w-5" />
                                    <span>Fast Delivery</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description & Reviews */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        {/* Description */}
                        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
                            <h3 className="text-xl font-bold mb-6 text-gray-900 border-b pb-4">Product Description</h3>
                            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </div>

                            {/* Product Specs Placeholder */}
                            <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-bold mb-4 text-gray-800">Specifications</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Category</span>
                                        <span className="font-medium text-primary">{product.category}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Brand</span>
                                        <span className="font-medium">No Brand</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Material</span>
                                        <span className="font-medium">Cotton / Polyester</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Origin</span>
                                        <span className="font-medium">Vietnam</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reviews */}
                        <ReviewSection productId={product.id || product._id} />
                    </div>
                </div>
            </div>

            <ChatWidget />
        </div>
    );
}
