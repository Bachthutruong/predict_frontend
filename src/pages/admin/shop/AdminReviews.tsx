import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Star, Trash2, MessageSquare, ThumbsUp, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import toast from 'react-hot-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../../components/ui/dialog";
import { Textarea } from '../../../components/ui/textarea';
import { useLanguage } from '../../../hooks/useLanguage';

export default function AdminReviews() {
    const { t } = useLanguage();
    const [reviews, setReviews] = useState<any[]>([]);
    const [configPoints, setConfigPoints] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Reply Modal
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [currentReview, setCurrentReview] = useState<any>(null);
    const [replyContent, setReplyContent] = useState('');

    useEffect(() => {
        fetchConfig();
        fetchReviews();
    }, [page, limit]);

    const fetchConfig = async () => {
        try {
            const res = await api.get('/reviews/config');
            if (res.data.success) {
                setConfigPoints(res.data.data.settingValue);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await api.get('/reviews/admin/all', {
                params: { page, limit, search: searchTerm }
            });
            if (res.data.success) {
                setReviews(res.data.data);
                if (res.data.pagination) {
                    setTotalPages(res.data.pagination.pages);
                    setTotalItems(res.data.pagination.total);
                }
            }
        } catch (e) {
            toast.error(t('admin.shop.reviews.toast.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchReviews();
    };

    const handleUpdateConfig = async () => {
        try {
            await api.put('/reviews/config', { points: Number(configPoints) });
            toast.success(t('admin.shop.reviews.toast.settingsUpdated'));
        } catch (e) {
            toast.error(t('admin.shop.reviews.toast.settingsUpdateFailed'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('admin.shop.reviews.toast.deleteConfirm'))) return;
        try {
            await api.delete(`/reviews/${id}`);
            toast.success(t('admin.shop.reviews.toast.deleted'));
            fetchReviews();
        } catch (e) {
            toast.error(t('admin.shop.reviews.toast.deleteFailed'));
        }
    };

    const handleOpenReply = (review: any) => {
        setCurrentReview(review);
        setReplyContent(review.reply || '');
        setReplyModalOpen(true);
    };

    const handleSendReply = async () => {
        try {
            await api.post(`/reviews/${currentReview._id}/reply`, { reply: replyContent });
            toast.success(t('admin.shop.reviews.toast.replySent'));
            setReplyModalOpen(false);
            fetchReviews();
        } catch (e) {
            toast.error(t('admin.shop.reviews.toast.replyFailed'));
        }
    };

    const handleToggleReaction = async (review: any) => {
        const newReaction = review.adminReaction ? null : 'like';
        try {
            await api.put(`/reviews/${review._id}/reaction`, { reaction: newReaction });
            // Optimistic update or refetch
            setReviews(prev => prev.map(r => r._id === review._id ? { ...r, adminReaction: newReaction } : r));
            toast.success(newReaction ? t('admin.shop.reviews.toast.reactionAdded') : t('admin.shop.reviews.toast.reactionRemoved'));
        } catch (e) {
            toast.error(t('admin.shop.reviews.toast.reactionFailed'));
        }
    };

    return (
        <div className="max-w-full">
            <h1 className="text-2xl font-bold mb-6">{t('admin.shop.reviews.title')}</h1>

            {/* Config Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-end gap-4 border">
                <div className="w-full max-w-sm">
                    <label className="block text-sm font-medium mb-1">{t('admin.shop.reviews.config.label')}</label>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            value={configPoints}
                            onChange={(e) => setConfigPoints(Number(e.target.value))}
                            min="0"
                        />
                        <Button onClick={handleUpdateConfig} variant="outline" className="flex items-center gap-2">
                            <Save className="h-4 w-4" /> {t('admin.shop.reviews.config.save')}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('admin.shop.reviews.config.description')}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex justify-between items-center mb-4">
                <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
                    <Input
                        placeholder={t('admin.shop.reviews.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button type="submit">Search</Button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('admin.shop.reviews.table.user')}</TableHead>
                            <TableHead>{t('admin.shop.reviews.table.product')}</TableHead>
                            <TableHead>{t('admin.shop.reviews.table.rating')}</TableHead>
                            <TableHead className="w-[30%]">{t('admin.shop.reviews.table.comment')}</TableHead>
                            <TableHead>{t('admin.shop.reviews.table.date')}</TableHead>
                            <TableHead>{t('admin.shop.reviews.table.status')}</TableHead>
                            <TableHead className="text-right">{t('admin.shop.reviews.table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-8">{t('admin.shop.reviews.table.loading')}</TableCell></TableRow>
                        ) : reviews.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-8">{t('admin.shop.reviews.table.noReviews')}</TableCell></TableRow>
                        ) : (
                            reviews.map((review) => (
                                <TableRow key={review._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs">
                                                {review.isAnonymous ? 'A' : review.user?.name?.[0] || 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{review.isAnonymous ? t('admin.shop.reviews.table.anonymous') : review.user?.name || t('admin.shop.reviews.table.unknown')}</span>
                                                <span className="text-xs text-gray-400">{review.user?.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {review.product ? (
                                            <div className="flex items-center gap-2">
                                                {review.product.images?.[0] && <img src={review.product.images[0]} className="w-8 h-8 object-cover rounded" />}
                                                <span className="text-sm truncate max-w-[150px]" title={review.product.name}>{review.product.name}</span>
                                            </div>
                                        ) : <span className="text-gray-400">{t('admin.shop.reviews.table.productDeleted')}</span>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm relative group">
                                            <p>{review.comment}</p>
                                            {review.images?.length > 0 && (
                                                <div className="flex gap-1 mt-1">
                                                    {review.images.map((img: string, i: number) => (
                                                        <a key={i} href={img} target="_blank" rel="noreferrer">
                                                            <img src={img} className="w-8 h-8 object-cover rounded border hover:opacity-80" />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                            {review.reply && (
                                                <div className="mt-2 text-xs bg-blue-50 p-2 rounded border-l-2 border-blue-500 text-gray-700">
                                                    <span className="font-bold">{t('admin.shop.reviews.table.replyPrefix')}</span> {review.reply}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {review.reply ? <Badge variant="default" className="bg-green-500">{t('admin.shop.reviews.table.replied')}</Badge> : <Badge variant="outline">{t('admin.shop.reviews.table.pending')}</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className={review.adminReaction ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-gray-400 hover:text-red-500"}
                                                onClick={() => handleToggleReaction(review)}
                                                title="Like/React"
                                            >
                                                <ThumbsUp className={`h-4 w-4 ${review.adminReaction ? 'fill-current' : ''}`} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleOpenReply(review)}
                                                title="Reply"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(review._id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {reviews.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Rows per page:</span>
                        <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
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
                            Total: {totalItems}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> {t('common.previous')}
                        </Button>
                        <span className="text-sm font-medium">
                            {t('common.pageOf', { current: page, total: totalPages })}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            {t('common.next')} <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Reply Modal */}
            <Dialog open={replyModalOpen} onOpenChange={setReplyModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin.shop.reviews.reply.title')}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="mb-4 bg-gray-50 p-3 rounded text-sm text-gray-600 italic">
                            "{currentReview?.comment}"
                        </div>
                        <label className="block text-sm font-medium mb-2">{t('admin.shop.reviews.reply.label')}</label>
                        <Textarea
                            rows={4}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={t('admin.shop.reviews.reply.placeholder')}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReplyModalOpen(false)}>{t('admin.shop.reviews.reply.cancel')}</Button>
                        <Button onClick={handleSendReply}>{t('admin.shop.reviews.reply.submit')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
