import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoCard } from "./PhotoCard";
import { Lightbox } from "./Lightbox";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

export type Category = string;

export interface Photo {
    id: string;
    url: string;
    title: string;
    author: string;
    category: Category;
    category_display?: string;
    likes: number;
}

interface GalleryProps {
    user: User | null;
    onLoginClick: () => void;
}

// MAPPING: English (DB) -> Vietnamese (UI)
const CATEGORY_MAP: Record<string, string> = {
    'Portrait': 'Ảnh Chân Dung',
    'Landscape': 'Ảnh Phong Cảnh',
    'Street': 'Ảnh Tự Do',
    // Add others if needed
};

export const Gallery = ({ user, onLoginClick }: GalleryProps) => {
    // activeCategory stores the English Key (e.g., "Portrait") or "All"
    const [activeCategory, setActiveCategory] = useState<string | "All">("All");
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    // const [categories, setCategories] = useState<{ id: string, name: string }[]>([]); // Not relying on DB categories table for now to ensure mapping works
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPhotosAndCategories = async () => {
            try {
                // Fetch photos from Supabase
                const { data: photosData, error: photosError } = await supabase
                    .from('photos')
                    .select('*');

                if (photosError) throw photosError;

                // Fetch like counts for all photos
                const photoIds = (photosData || []).map(p => p.id);
                const likeCounts: Record<string, number> = {};

                if (photoIds.length > 0) {
                    // Get like counts grouped by photo_id
                    const { data: likesData } = await supabase
                        .from('photo_likes')
                        .select('photo_id');

                    if (likesData) {
                        likesData.forEach(like => {
                            likeCounts[like.photo_id] = (likeCounts[like.photo_id] || 0) + 1;
                        });
                    }
                }

                const mappedPhotos: Photo[] = (photosData || []).map((p: any) => ({
                    id: p.id,
                    url: p.url,
                    title: p.title || "Untitled",
                    author: "Unknown Photographer",
                    category: p.category as Category,
                    category_display: CATEGORY_MAP[p.category] || p.category,
                    likes: likeCounts[p.id] || 0
                }));

                setPhotos(mappedPhotos);

                // We are skipping fetching 'categories' table to strictly enforce the requested mapping
                // and avoid mismatches. If we needed to fetch, we would map the names here.

            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError(err.message || "Failed to load gallery.");
            } finally {
                setLoading(false);
            }
        };

        fetchPhotosAndCategories();
    }, []);

    const filteredPhotos = useMemo(() => {
        if (activeCategory === "All") return photos;
        // activeCategory is English (e.g., "Portrait"), photo.category is English
        return photos.filter((photo) => photo.category === activeCategory);
    }, [activeCategory, photos]);

    if (loading) {
        return <div className="min-h-screen bg-background text-white flex items-center justify-center">Loading Gallery...</div>;
    }

    if (error) {
        return <div className="min-h-screen bg-background text-red-500 flex items-center justify-center">{error}</div>;
    }

    return (
        <section className="py-20 px-4 min-h-screen bg-background">
            <div className="container mx-auto">
                {/* Filter Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    <button
                        onClick={() => setActiveCategory("All")}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-all duration-300 border border-transparent",
                            activeCategory === "All"
                                ? "bg-white text-black font-bold"
                                : "bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700"
                        )}
                    >
                        Tất cả
                    </button>
                    {Object.entries(CATEGORY_MAP).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key)}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-all duration-300 border border-transparent",
                                activeCategory === key
                                    ? "bg-white text-black font-bold"
                                    : "bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700"
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                <motion.div
                    layout
                    className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4"
                >
                    <AnimatePresence>
                        {filteredPhotos.map((photo, index) => (
                            <PhotoCard
                                key={photo.id}
                                photo={photo}
                                index={index}
                                onClick={setSelectedPhoto}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Empty State */}
                {filteredPhotos.length === 0 && (
                    <div className="text-center text-zinc-500 py-20">
                        No photos found in this category.
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            <Lightbox
                photo={selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
                user={user}
                onLoginClick={onLoginClick}
            />
        </section>
    );
};
