import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageSquare, Send, ChevronRight, LogIn } from "lucide-react";
import type { Photo } from "./Gallery";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

interface LightboxProps {
    photo: Photo | null;
    onClose: () => void;
    user: User | null;
    onLoginClick: () => void;
}

interface Comment {
    id: string;
    text: string;
    created_at: string;
    username: string;
}

export const Lightbox = ({ photo, onClose, user, onLoginClick }: LightboxProps) => {
    const [likes, setLikes] = useState<number>(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch likes and comments when photo changes
    useEffect(() => {
        if (photo) {
            fetchLikesAndComments();
            setIsCommentOpen(false);
        }
    }, [photo, user]);

    const fetchLikesAndComments = async () => {
        if (!photo) return;

        try {
            // Fetch like count
            const { count: likeCount } = await supabase
                .from('photo_likes')
                .select('*', { count: 'exact', head: true })
                .eq('photo_id', photo.id);

            setLikes(likeCount || 0);

            // Check if current user has liked
            if (user) {
                const { data: userLike } = await supabase
                    .from('photo_likes')
                    .select('id')
                    .eq('photo_id', photo.id)
                    .eq('user_id', user.id)
                    .maybeSingle();

                setHasLiked(!!userLike);
            } else {
                setHasLiked(false);
            }

            // Fetch comments with username
            const { data: commentsData } = await supabase
                .from('photo_comments')
                .select(`
                    id,
                    text,
                    created_at,
                    user_id
                `)
                .eq('photo_id', photo.id)
                .order('created_at', { ascending: false });

            if (commentsData) {
                // Fetch usernames for comments
                const userIds = [...new Set(commentsData.map(c => c.user_id))];
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, username, email')
                    .in('id', userIds);

                const profileMap: Record<string, string> = {};
                profiles?.forEach(p => {
                    profileMap[p.id] = p.username || p.email || 'Người dùng';
                });

                setComments(commentsData.map(c => ({
                    id: c.id,
                    text: c.text,
                    created_at: c.created_at,
                    username: profileMap[c.user_id] || 'Người dùng'
                })));
            }
        } catch (error) {
            console.error('Error fetching likes/comments:', error);
        }
    };

    const handleLike = async () => {
        if (!photo) return;

        if (!user) {
            onLoginClick();
            return;
        }

        setLoading(true);
        try {
            if (hasLiked) {
                // Remove like
                await supabase
                    .from('photo_likes')
                    .delete()
                    .eq('photo_id', photo.id)
                    .eq('user_id', user.id);

                setHasLiked(false);
                setLikes(prev => Math.max(0, prev - 1));
            } else {
                // Add like
                await supabase
                    .from('photo_likes')
                    .insert({
                        photo_id: photo.id,
                        user_id: user.id
                    });

                setHasLiked(true);
                setLikes(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!photo || !newComment.trim()) return;

        if (!user) {
            onLoginClick();
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('photo_comments')
                .insert({
                    photo_id: photo.id,
                    user_id: user.id,
                    text: newComment.trim()
                })
                .select()
                .single();

            if (error) throw error;

            // Get username for the new comment
            const username = user.user_metadata?.full_name || user.email || 'Người dùng';

            const comment: Comment = {
                id: data.id,
                text: data.text,
                created_at: data.created_at,
                username: username
            };

            setComments(prev => [comment, ...prev]);
            setNewComment("");
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!photo) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl"
                onClick={onClose}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all"
                >
                    <X size={24} />
                </button>

                {/* Fullscreen Image Container */}
                <div
                    className="w-full h-full flex items-center justify-center p-4 md:p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative group/image w-fit flex justify-center items-center">
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            src={photo.url}
                            alt={photo.title}
                            className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {/* Photo Info - Top Left (Inside Image) */}
                        <div
                            className="absolute top-4 left-4 z-40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"
                        >
                            <div className="px-4 py-2 rounded-xl bg-black/50 backdrop-blur-md">
                                <h2 className="text-lg font-semibold text-white">{photo.title}</h2>
                            </div>
                        </div>

                        {/* Like Button - Bottom Left (Inside Image) */}
                        <div
                            className="absolute bottom-4 left-4 z-40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLike}
                                disabled={loading}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-3 rounded-full backdrop-blur-md transition-all shadow-lg",
                                    hasLiked
                                        ? "bg-red-500/30 text-red-400 border border-red-500/50"
                                        : "bg-white/10 text-white border border-white/20 hover:bg-white/20",
                                    loading && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {!user ? (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        <span className="font-medium text-sm">Đăng nhập để thích</span>
                                    </>
                                ) : (
                                    <>
                                        <Heart
                                            className={cn(
                                                "w-6 h-6 transition-all",
                                                hasLiked && "fill-current animate-pulse"
                                            )}
                                        />
                                        <span className="font-medium text-lg">{likes}</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Comment Toggle Button - Bottom Right Corner */}
                <div
                    className="absolute bottom-6 right-6 z-40"
                    onClick={(e) => e.stopPropagation()}
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCommentOpen(!isCommentOpen)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-3 rounded-full backdrop-blur-md transition-all shadow-lg",
                            isCommentOpen
                                ? "bg-blue-500/30 text-blue-400 border border-blue-500/50"
                                : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                        )}
                    >
                        <MessageSquare className="w-6 h-6" />
                        <span className="font-medium text-lg">{comments.length}</span>
                    </motion.button>
                </div>

                {/* Comment Panel - Slide from Right */}
                <motion.div
                    initial={false}
                    animate={{
                        x: isCommentOpen ? 0 : "100%",
                        opacity: isCommentOpen ? 1 : 0
                    }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute right-0 top-0 h-full w-80 z-40 flex flex-col bg-zinc-950/95 backdrop-blur-xl border-l border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div className="flex items-center gap-2 text-white">
                            <MessageSquare className="w-5 h-5" />
                            <span className="font-semibold">Bình luận ({comments.length})</span>
                        </div>
                        <button
                            onClick={() => setIsCommentOpen(false)}
                            className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {comments.length === 0 ? (
                            <div className="text-center text-zinc-500 mt-10 px-4">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Chưa có bình luận nào.</p>
                                <p className="text-xs mt-1 text-zinc-600">Hãy là người đầu tiên bình luận!</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/5 p-3 rounded-xl border border-white/5"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                                            {comment.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs font-medium text-blue-400">{comment.username}</span>
                                    </div>
                                    <p className="text-sm text-white/90">{comment.text}</p>
                                    <span className="text-xs text-zinc-500 mt-2 block">
                                        {new Date(comment.created_at).toLocaleDateString("vi-VN")}
                                    </span>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Comment Input */}
                    {user ? (
                        <form onSubmit={handleCommentSubmit} className="p-4 border-t border-white/10 bg-zinc-900/80">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Viết bình luận..."
                                    disabled={loading}
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-4 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || loading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white disabled:opacity-30 hover:text-blue-400 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-4 border-t border-white/10 bg-zinc-900/80">
                            <button
                                onClick={onLoginClick}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium transition-colors"
                            >
                                <LogIn size={18} />
                                Đăng nhập để bình luận
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
