import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Heart } from "lucide-react";
import { supabase } from "../lib/supabase";
import { cn } from "../lib/utils";

interface Photo {
    id: string;
    url: string;
    title: string;
    author: string;
    likes: number;
    author_avatar?: string;
    category?: string;
}

export const TopVoted = () => {
    const [winners, setWinners] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopVoted = async () => {
            try {
                // 1. Fetch all photos
                const { data: photosData, error: photosError } = await supabase
                    .from('photos')
                    .select('*');

                if (photosError) throw photosError;
                if (!photosData || photosData.length === 0) {
                    setLoading(false);
                    return;
                }

                // 2. Fetch all likes
                const { data: likesData, error: likesError } = await supabase
                    .from('photo_likes')
                    .select('photo_id');

                if (likesError) throw likesError;

                // 3. Count likes
                const likeCounts: Record<string, number> = {};
                likesData?.forEach((like) => {
                    likeCounts[like.photo_id] = (likeCounts[like.photo_id] || 0) + 1;
                });

                // 4. Find Max Likes
                let maxLikes = 0;
                Object.values(likeCounts).forEach(count => {
                    if (count > maxLikes) maxLikes = count;
                });

                if (maxLikes === 0) {
                    setLoading(false);
                    return; // No votes yet
                }

                // 5. Filter Winners
                const winningPhotos = photosData
                    .filter(p => (likeCounts[p.id] || 0) === maxLikes)
                    .map(p => ({
                        id: p.id,
                        url: p.url,
                        title: p.title,
                        author: "Unknown", // Placeholder, ideally fetch author profile
                        likes: maxLikes,
                        category: p.category
                    }));

                // Fetch author names for winners
                const authorIds = [...new Set(photosData.map(p => p.photographer_id))];
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, username, avatar_url')
                    .in('id', authorIds);

                const profileMap: Record<string, any> = {};
                profiles?.forEach(p => {
                    profileMap[p.id] = p;
                });

                const finalWinners = winningPhotos.map(p => {
                    const originalPhoto = photosData.find(op => op.id === p.id);
                    const author = profileMap[originalPhoto?.photographer_id];
                    return {
                        ...p,
                        author: author?.full_name || author?.email || "Unknown Photographer",
                        author_avatar: author?.avatar_url
                    };
                });

                setWinners(finalWinners);

            } catch (err) {
                console.error("Error fetching top voted:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTopVoted();
    }, []);

    if (loading || winners.length === 0) return null;

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-slate-950">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-yellow-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 mb-6">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-wider">Hall of Fame</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                        Tác phẩm được <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">Yêu thích nhất</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Những khoảnh khắc ấn tượng nhất được cộng đồng bình chọn.
                    </p>
                </motion.div>

                <div className={cn(
                    "grid gap-8 max-w-7xl mx-auto",
                    winners.length === 1 ? "grid-cols-1 justify-items-center" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}>
                    {winners.map((photo, index) => (
                        <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "group relative rounded-3xl overflow-hidden bg-slate-900 border border-yellow-500/30 shadow-2xl shadow-yellow-500/10",
                                winners.length === 1 ? "w-full max-w-4xl" : "w-full"
                            )}
                        >
                            {/* Image */}
                            <div className="relative w-full">
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60" />
                                <img
                                    src={photo.url}
                                    alt={photo.title}
                                    className="w-full h-auto object-contain transform group-hover:scale-[1.01] transition-transform duration-700 ease-out"
                                />

                                {/* Badge */}
                                <div className="absolute top-6 right-6 z-20">
                                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/50 animate-pulse">
                                        <Heart className="w-5 h-5 fill-black" />
                                        <span className="text-sm">{photo.likes}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white/90 text-xs font-medium border border-white/10">
                                            {photo.category || "General"}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2 leading-tight group-hover:text-yellow-400 transition-colors drop-shadow-lg">
                                        {photo.title}
                                    </h3>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
