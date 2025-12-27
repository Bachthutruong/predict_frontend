import { useState, useEffect } from 'react';
import { reviewAPI } from '../../services/shopServices';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Star, X, ThumbsUp, Store, MessageSquare, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { ImageUpload } from '../../components/ui/image-upload';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default function ReviewSection({ productId }: { productId: string }) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rewardPoints] = useState(50);

    useEffect(() => {
        fetchReviews();
        // fetchRewardConfig(); // If needed for dynamic points
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const res = await reviewAPI.getReviews(productId);
            if (res.data.success) {
                setReviews(res.data.data);
            }
        } catch (e) { }
    };

    const handleSubmit = async () => {
        if (!comment.trim()) return toast.error('Please write a comment');
        setLoading(true);
        try {
            await reviewAPI.create({ productId, rating, comment, images });
            toast.success(`Review submitted! You earned ${rewardPoints} points!`);
            setShowForm(false);
            setComment('');
            setImages([]);
            setRating(5);
            fetchReviews();
        } catch (e) {
            toast.error('Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const handleAddImage = (url: string) => {
        if (url) setImages(prev => [...prev, url]);
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <Card className="w-full border-none shadow-none sm:shadow-sm sm:border bg-white overflow-hidden">
            <CardHeader className="border-b bg-gray-50/50 pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-3">
                            Customer Reviews
                            <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                                {reviews.length} reviews
                            </Badge>
                        </CardTitle>
                        {Number(averageRating) > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex text-yellow-500">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`h-5 w-5 ${star <= Math.round(Number(averageRating)) ? 'fill-current' : 'text-gray-300 fill-none'}`} />
                                    ))}
                                </div>
                                <span className="text-lg font-bold text-gray-900">{averageRating}</span>
                                <span className="text-sm text-gray-500">out of 5</span>
                            </div>
                        )}
                        {!user && (
                            <p className="text-sm text-gray-500 mt-2">Log in to write a review and earn points.</p>
                        )}
                        {user && !showForm && (
                            <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1.5 animate-pulse bg-green-50 w-fit px-3 py-1 rounded-full border border-green-100">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                Earn {rewardPoints} coins for your review!
                            </div>
                        )}
                    </div>

                    {user && !showForm && (
                        <Button
                            onClick={() => setShowForm(true)}
                            className="bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-medium"
                        >
                            Write a Review
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {showForm && (
                    <div className="p-6 bg-slate-50 border-b animate-in slide-in-from-top-4 duration-300">
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="space-y-2 text-center">
                                <h4 className="font-semibold text-gray-900">How was your product?</h4>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="transition-transform hover:scale-110 focus:outline-none p-1"
                                        >
                                            <Star
                                                className={`h-8 w-8 ${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm font-medium text-yellow-600 min-h-[20px]">
                                    {['', 'Terrible', 'Bad', 'Average', 'Good', 'Excellent'][(hoverRating || rating)]}
                                </p>
                            </div>

                            <div className="space-y-4 bg-white p-4 rounded-xl border shadow-sm">
                                <Textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Tell us what you liked or disliked about the product..."
                                    className="min-h-[120px] border-gray-200 focus:border-primary focus:ring-primary/20 resize-none text-base p-4 rounded-lg"
                                />

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <Camera className="h-4 w-4" /> Add Photos
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border bg-gray-100 group shadow-sm transition-all hover:shadow-md">
                                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => handleRemoveImage(idx)}
                                                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {images.length < 5 && (
                                            <div className="w-24 h-24">
                                                <ImageUpload
                                                    value=""
                                                    onChange={handleAddImage}
                                                    className="w-full h-full border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 rounded-lg transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
                                                    placeholder="+"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Max 5 images. Supported formats: JPG, PNG.</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="ghost" onClick={() => setShowForm(false)} disabled={loading} className="hover:bg-gray-100">
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} disabled={loading} className="bg-primary hover:bg-primary/90 px-8">
                                    {loading ? 'Submitting...' : 'Submit Review'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="divide-y divide-gray-100">
                    {reviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center bg-white">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mt-1">Be the first to share your thoughts on this product.</p>
                            {user && !showForm && (
                                <Button variant="outline" onClick={() => setShowForm(true)} className="mt-6 border-primary text-primary hover:bg-primary/5">
                                    Write a Review
                                </Button>
                            )}
                        </div>
                    ) : (
                        reviews.map((review: any) => (
                            <div key={review._id} className="p-6 md:p-8 hover:bg-gray-50/50 transition-colors">
                                <div className="flex gap-4">
                                    <Avatar className="h-10 w-10 border shadow-sm">
                                        <AvatarImage src={review.user?.avatar} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {review.user?.name?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">{review.user?.name || 'Anonymous User'}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            {review.adminReaction && (
                                                <div className="flex items-center text-red-500 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
                                                    <ThumbsUp className="h-3 w-3 mr-1 fill-current" />
                                                    Seller liked this
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-gray-700 mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                                            {review.comment}
                                        </p>

                                        {review.images && review.images.length > 0 && (
                                            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-none">
                                                {review.images.map((img: string, i: number) => (
                                                    <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border shadow-sm cursor-zoom-in hover:shadow-md transition-all flex-shrink-0" onClick={() => window.open(img, '_blank')}>
                                                        <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Review attachment" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {review.reply && (
                                            <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-xl p-4 relative group">
                                                <div className="absolute top-4 left-0 w-1 h-8 bg-blue-500 rounded-r-full"></div>
                                                <div className="flex gap-3">
                                                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                                                        <Store className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-sm font-bold text-gray-900">Seller Response</span>
                                                            <span className="text-xs text-gray-500">
                                                                {review.repliedAt ? new Date(review.repliedAt).toLocaleDateString() : 'Recently'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 leading-relaxed">
                                                            {review.reply}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
