import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shopAPI } from '../../services/shopServices';
import { Button } from '../../components/ui/button';
import { ShoppingBag, Search, Filter, List, Star, ChevronLeft, ChevronRight, Store, Coins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import ChatWidget from './ChatWidget';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function ShopPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);

    const [filters, setFilters] = useState({
        category: '',
        search: '',
        minPrice: 0,
        maxPrice: 0,
        sortBy: 'relevance'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        fetchData();

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchData = async () => {
        try {
            const prodRes = await shopAPI.getProducts({ limit: 100 });
            if (prodRes.data.success) setProducts(prodRes.data.data);
        } catch (error) {
            console.error('Failed to load products', error);
        }

        try {
            const catRes = await shopAPI.getCategories();
            if (catRes.data.success) {
                const cats = catRes.data.data;
                if (Array.isArray(cats) && typeof cats[0] === 'object') {
                    setCategories(cats.map((c: any) => c.name || c));
                } else {
                    setCategories(cats);
                }
            }
        } catch (error) {
            console.error('Failed to load categories', error);
        }

        setLoading(false);
    };


    const filteredProducts = products.filter(p => {
        const matchCat = !filters.category || p.category === filters.category;
        const matchSearch = !filters.search || p.name.toLowerCase().includes(filters.search.toLowerCase());
        const min = filters.minPrice ? Number(filters.minPrice) : 0;
        const max = filters.maxPrice > 0 ? Number(filters.maxPrice) : Infinity;
        const matchPrice = p.price >= min && p.price <= max;

        return matchCat && matchSearch && matchPrice;
    }).sort((a, b) => {
        if (filters.sortBy === 'price_asc') return a.price - b.price;
        if (filters.sortBy === 'price_desc') return b.price - a.price;
        if (filters.sortBy === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (filters.sortBy === 'sales') return (b.purchaseCount || 0) - (a.purchaseCount || 0);
        return 0; // relevance
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    return (
        <div className="min-h-screen pb-20 font-sans">
            {/* Main Header - Sticky */}
            <div className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2' : 'bg-gradient-to-r from-primary to-[#1557b0] py-4'} text-white`}>
                <div className="container mx-auto max-w-7xl px-4 flex gap-4 items-center justify-between">
                    <div className="flex items-center gap-8 flex-1">
                        <Link to="/shop" className={`font-bold text-2xl tracking-tighter cursor-pointer flex items-center gap-2 transition-colors ${isScrolled ? 'text-primary' : 'text-white'}`}>
                            <Store className="h-8 w-8" /> <span>{t('shop.title')}</span>
                        </Link>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-2xl hidden md:block">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder={t('shop.searchPlaceholder')}
                                    className={`w-full pl-4 pr-12 py-2.5 rounded-sm outline-none transition-all ${isScrolled ? 'bg-gray-100 focus:bg-white text-gray-900 border border-transparent focus:border-primary' : 'bg-white text-gray-900 shadow-sm'}`}
                                    value={filters.search}
                                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                                />
                                <button className={`absolute right-1 top-1 bottom-1 px-4 rounded-sm transition-colors ${isScrolled ? 'bg-primary text-white hover:bg-primary/90' : 'bg-primary text-white hover:bg-primary/90'}`}>
                                    <Search className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Cart moved to MainLayout header */}
                        <div className={`hidden md:flex flex-col text-xs font-medium cursor-pointer ${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-white'}`}>
                            <span>{t('shop.welcome')}!</span>
                            <span className="font-bold text-sm truncate max-w-[100px]">{user?.name || 'Guest'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-full">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Filters */}
                    <div className="lg:w-64 flex-shrink-0 space-y-6 hidden lg:block">
                        {/* Categories */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="flex items-center gap-2 font-bold mb-4 text-gray-800 pb-2 border-b">
                                <List className="h-5 w-5" /> {t('shop.categories')}
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li className={`cursor-pointer p-2 rounded-md font-medium transition-colors ${filters.category === '' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
                                    onClick={() => setFilters({ ...filters, category: '' })}>
                                    {t('shop.allProducts')}
                                </li>
                                {categories.map((cat, i) => (
                                    <li key={i}
                                        className={`cursor-pointer p-2 rounded-md transition-colors ${filters.category === cat ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
                                        onClick={() => setFilters({ ...filters, category: cat })}
                                    >
                                        {cat}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Improved Price Filter */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="flex items-center gap-2 font-bold mb-4 text-gray-800 pb-2 border-b">
                                <Filter className="h-4 w-4" /> {t('shop.priceRange')}
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder={t('shop.min')}
                                        className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                        value={filters.minPrice || ''}
                                        onChange={e => setFilters({ ...filters, minPrice: Number(e.target.value) || 0 })}
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="number"
                                        placeholder={t('shop.max')}
                                        className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                        value={filters.maxPrice || ''}
                                        onChange={e => setFilters({ ...filters, maxPrice: Number(e.target.value) || 0 })}
                                    />
                                </div>
                                <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                                    {t('shop.apply')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Sort Bar */}
                        <div className="bg-gray-100 p-3 rounded-md mb-4 flex flex-wrap items-center gap-4 text-sm sticky top-[75px] z-30 backdrop-blur-sm bg-gray-100/90 shadow-sm border border-white/50">
                            <span className="text-gray-500 font-medium ml-1">{t('shop.sortBy')}</span>
                            <div className="flex gap-2 items-center">
                                <button
                                    className={`px-4 py-2 rounded-sm transition-all ${filters.sortBy === 'relevance' ? 'bg-primary text-white shadow-sm' : 'bg-white border hover:bg-gray-50 text-gray-700'}`}
                                    onClick={() => setFilters({ ...filters, sortBy: 'relevance' })}
                                >
                                    {t('shop.relevance')}
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-sm transition-all ${filters.sortBy === 'latest' ? 'bg-primary text-white shadow-sm' : 'bg-white border hover:bg-gray-50 text-gray-700'}`}
                                    onClick={() => setFilters({ ...filters, sortBy: 'latest' })}
                                >
                                    {t('shop.latest')}
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-sm transition-all ${filters.sortBy === 'sales' ? 'bg-primary text-white shadow-sm' : 'bg-white border hover:bg-gray-50 text-gray-700'}`}
                                    onClick={() => setFilters({ ...filters, sortBy: 'sales' })}
                                >
                                    {t('shop.topSales')}
                                </button>

                                {/* PRICE SELECT DROPDOWN FIX */}
                                <Select
                                    value={filters.sortBy.includes('price') ? filters.sortBy : ''}
                                    onValueChange={(val) => setFilters({ ...filters, sortBy: val })}
                                >
                                    <SelectTrigger className={`w-[180px] h-[38px] transition-all rounded-sm ${filters.sortBy.includes('price') ? 'bg-primary text-white border-primary' : 'bg-white border-input hover:bg-gray-50 text-gray-700'}`}>
                                        <SelectValue placeholder={t('shop.price')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="price_asc">{t('shop.priceLowToHigh')}</SelectItem>
                                        <SelectItem value="price_desc">{t('shop.priceHighToLow')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-md p-4 animate-pulse h-64"></div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-dashed border-gray-300">
                                <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShoppingBag className="h-12 w-12 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-medium text-gray-900">{t('shop.noProductsFound')}</h3>
                                <p className="text-gray-500 mt-2 mb-6">{t('shop.adjustFilters')}</p>
                                <Button variant="outline" onClick={() => setFilters({ category: '', search: '', minPrice: 0, maxPrice: 0, sortBy: 'relevance' })}>
                                    Clear All Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {paginatedProducts.map(product => (
                                    <Link to={`/shop/products/${product.id || product._id}`} key={product.id || product._id} className="bg-white rounded-md shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary/30 overflow-hidden flex flex-col relative group h-full">
                                        <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                            {product.images[0] ? (
                                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag /></div>
                                            )}
                                            {/* Badges */}
                                            {product.stock <= 0 && (
                                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                                                    <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{t('shop.outOfStock')}</span>
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] shadow-sm">{t('shop.official')}</span>
                                                {product.originalPrice > product.price && (
                                                    <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] shadow-sm">
                                                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                                    </span>
                                                )}
                                            </div>

                                            {/* Quick Actions (Hover) */}
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center translate-y-2 group-hover:translate-y-0 duration-300">
                                                <span className="text-white text-xs font-medium">{t('shop.viewDetails')}</span>
                                            </div>
                                        </div>

                                        <div className="p-3 flex flex-col flex-1">
                                            <h3 className="text-sm text-gray-800 line-clamp-2 min-h-[40px] mb-2 group-hover:text-primary transition-colors duration-200" title={product.name}>{product.name}</h3>

                                            <div className="mt-auto space-y-2">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-primary font-bold">₫</span>
                                                    <span className="text-lg font-bold text-primary">{product.price.toLocaleString()}</span>
                                                </div>
                                                {/* Points Reward */}
                                                {product.pointsReward > 0 && (
                                                    <div className="flex items-center gap-1 text-[10px] text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full w-fit">
                                                        <Coins className="h-3 w-3" />
                                                        <span className="font-medium">{product.pointsReward} {t('shop.pointsReward') || 'xu'}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between text-[10px] text-gray-500">
                                                    <div className="flex items-center gap-0.5">
                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                        <span>{product.averageRating ? Number(product.averageRating).toFixed(1) : '0.0'}</span>
                                                    </div>
                                                    <span>{new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(product.purchaseCount || 0)} {t('shop.sold')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <Button
                                        key={i}
                                        variant={currentPage === i + 1 ? "default" : "outline"}
                                        size="sm"
                                        className={`h-8 w-8 p-0 ${currentPage === i + 1 ? 'bg-primary text-white' : ''}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ChatWidget />
        </div>
    );
}
