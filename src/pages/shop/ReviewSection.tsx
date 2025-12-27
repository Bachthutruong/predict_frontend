import { useState, useEffect } from 'react';
import { reviewAPI } from '../../services/shopServices';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
// import { Separator } from '../../components/ui/separator';

export default function ReviewSection({ productId }: { productId: string }) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchReviews();
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
        try {
            await reviewAPI.create({ productId, rating, comment });
            toast.success('Review submitted!');
            setShowForm(false);
            setComment('');
            fetchReviews();
        } catch (e) {
            toast.error('Failed to submit review');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Product Ratings ({reviews.length})</h3>
                {user && !showForm && (
                    <Button onClick={() => setShowForm(true)} variant="outline" className="text-primary border-primary hover:bg-primary/5">
                        Write a Review
                    </Button>
                )}
            </div>

            {showForm && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border animate-in fade-in slide-in-from-top-2">
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Your Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    className={`h-6 w-6 cursor-pointer ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Your Review</label>
                        <Textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Share your thoughts about the product..."
                            className="bg-white"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">Submit Review</Button>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No reviews yet. Be the first to review!</div>
                ) : (
                    reviews.map((review: any) => (
                        <div key={review._id} className="border-b pb-6 last:border-0 last:pb-0">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                    {review.user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{review.user?.name || 'Anonymous'}</div>
                                    <div className="flex text-yellow-400 text-xs my-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                    <div className="text-gray-400 text-xs mb-2">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-gray-700">{review.comment}</div>
                                    {review.reply && (
                                        <div className="mt-3 bg-gray-50 p-3 rounded text-sm border-l-2 border-primary">
                                            <div className="font-bold text-primary text-xs mb-1">Jiudi Response:</div>
                                            <div className="text-gray-600">{review.reply}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
