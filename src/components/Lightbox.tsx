import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageSquare, Send } from "lucide-react";
import type { Photo } from "../data/mock";
import { cn } from "../lib/utils";

interface LightboxProps {
    photo: Photo | null;
    onClose: () => void;
}

interface Comment {
    id: string;
    text: string;
    date: number;
}

export const Lightbox = ({ photo, onClose }: LightboxProps) => {
    const [likes, setLikes] = useState<number>(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");

    // Reset state when photo changes
    useEffect(() => {
        if (photo) {
            // Load from local storage
            const storedLikes = localStorage.getItem(`likes-${photo.id}`);
            const storedHasLiked = localStorage.getItem(`hasLiked-${photo.id}`);
            const storedComments = localStorage.getItem(`comments-${photo.id}`);

            setLikes(storedLikes ? parseInt(storedLikes) : photo.likes);
            setHasLiked(storedHasLiked === "true");
            setComments(storedComments ? JSON.parse(storedComments) : []);
        }
    }, [photo]);

    const handleLike = () => {
        if (!photo) return;

        const newHasLiked = !hasLiked;
        const newLikes = newHasLiked ? likes + 1 : likes - 1;

        setHasLiked(newHasLiked);
        setLikes(newLikes);

        // Save to local storage
        localStorage.setItem(`likes-${photo.id}`, newLikes.toString());
        localStorage.setItem(`hasLiked-${photo.id}`, newHasLiked.toString());
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!photo || !newComment.trim()) return;

        const comment: Comment = {
            id: Date.now().toString(),
            text: newComment,
            date: Date.now(),
        };

        const updatedComments = [comment, ...comments];
        setComments(updatedComments);
        setNewComment("");

        // Save to local storage
        localStorage.setItem(`comments-${photo.id}`, JSON.stringify(updatedComments));
    };

    if (!photo) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
                onClick={onClose}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
                >
                    <X size={32} />
                </button>

                <div
                    className="relative w-full max-w-6xl h-[90vh] grid grid-cols-1 lg:grid-cols-3 gap-0 bg-zinc-900 rounded-lg overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Image Section */}
                    <div className="lg:col-span-2 h-full bg-black flex items-center justify-center relative">
                        <img
                            src={photo.url}
                            alt={photo.title}
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>

                    {/* Interaction Section */}
                    <div className="lg:col-span-1 h-full flex flex-col bg-zinc-950 text-white border-l border-zinc-800">
                        <div className="p-6 border-b border-zinc-800">
                            <h2 className="text-2xl font-bold">{photo.title}</h2>
                            <p className="text-zinc-400">by {photo.author}</p>
                            <div className="flex items-center gap-4 mt-4">
                                <button
                                    onClick={handleLike}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                                        hasLiked ? "bg-red-500/20 text-red-500" : "bg-zinc-800 hover:bg-zinc-700"
                                    )}
                                >
                                    <Heart className={cn("w-5 h-5", hasLiked && "fill-current")} />
                                    <span>{likes}</span>
                                </button>
                                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full text-zinc-300">
                                    <MessageSquare className="w-5 h-5" />
                                    <span>{comments.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {comments.length === 0 ? (
                                <div className="text-center text-zinc-500 mt-10">
                                    No comments yet. Be the first to share your thoughts!
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="bg-zinc-900 p-3 rounded-lg">
                                        <p className="text-sm">{comment.text}</p>
                                        <span className="text-xs text-zinc-500 mt-1 block">
                                            {new Date(comment.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Comment Input */}
                        <form onSubmit={handleCommentSubmit} className="p-4 border-t border-zinc-800 bg-zinc-900">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Leave a comment..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-full py-3 px-4 pr-12 text-sm focus:outline-none focus:border-white transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white disabled:opacity-50 hover:text-blue-400 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
