'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import RatingStars from './RatingStars';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, Calendar, Send, Star, CheckCircle } from 'lucide-react';
import Skeleton from './Skeleton';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewsSectionProps {
  projectId: string;
}

export default function ReviewsSection({ projectId }: ReviewsSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [success, setSuccess] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/reviews`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data.reviews);
        setStats(data.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userName: user.displayName || user.email?.split('@')[0] || 'Student',
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setNewReview({ rating: 5, comment: '' });
        fetchReviews();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16 pt-16 border-t border-white/10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Student Reviews</h2>
          <div className="flex items-center gap-4">
            <RatingStars rating={stats.average} size="lg" />
            <span className="text-2xl font-bold text-white">{stats.average}</span>
            <span className="text-gray-500 text-sm">({stats.count} students reviewed)</span>
          </div>
        </div>

        {!user && (
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl max-w-sm">
            <p className="text-xs text-gray-400 leading-relaxed">
              Log in to share your experience with this project and help other students build excellence.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Reviews List */}
        <div className="lg:col-span-12 space-y-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              // Loading skeletons for reviews
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glassmorphism p-6 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex gap-4">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="space-y-2 flex-grow">
                      <Skeleton variant="text" width={120} height={16} className="rounded-md" />
                      <Skeleton variant="text" width={180} height={12} className="rounded-md" />
                    </div>
                  </div>
                  <Skeleton variant="text" height={20} className="rounded-lg" />
                  <Skeleton variant="text" width="90%" height={20} className="rounded-lg opacity-50" />
                </div>
              ))
            ) : reviews.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 glassmorphism rounded-2xl border-dashed border-2 border-white/10"
              >
                <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-gray-500 uppercase tracking-widest font-bold text-sm">No reviews yet. Be the first!</p>
              </motion.div>
            ) : (
              reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glassmorphism p-6 rounded-2xl border border-white/5 hover:border-brand-purple/20 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-purple/20 to-brand-orange/20 flex items-center justify-center border border-white/10">
                        <User className="w-5 h-5 text-brand-purple" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{review.user_name}</h4>
                        <div className="flex items-center gap-2">
                            <RatingStars rating={review.rating} size="xs" />
                            <span className="text-[10px] text-gray-500 flex items-center gap-1 uppercase tracking-widest">
                                <Calendar className="w-3 h-3" /> {new Date(review.created_at).toLocaleDateString()}
                            </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed italic text-sm">
                    "{review.comment}"
                  </p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Submit Review Form */}
        {user && (
          <div className="lg:col-span-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glassmorphism p-8 rounded-2xl border border-brand-purple/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl">
                 <Star className="w-32 h-32 text-brand-purple fill-brand-purple" />
              </div>
              
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Leave Your Feedback</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="flex flex-col gap-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Star className="w-3 h-3" /> Select Star Rating
                  </label>
                  <RatingStars 
                    rating={newReview.rating} 
                    interactive={true} 
                    onRatingChange={(r) => setNewReview({ ...newReview, rating: r })} 
                    size="lg" 
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label htmlFor="comment" className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> Your Experience
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Tell other students what you liked about this project..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-brand-purple/50 transition-all resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || success}
                  className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 group relative overflow-hidden transition-all duration-500 ${success ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'btn-gradient'}`}
                >
                  {submitting ? (
                     <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                  ) : success ? (
                    <>
                      <CheckCircle className="w-5 h-5" /> Submitted Successfully
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Post Review
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
