import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoCard } from "./PhotoCard";
import { Lightbox } from "./Lightbox";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

export type Category = string;
// Removed CATEGORIES constant

export interface Photo {
    id: string;
    url: string;
    title: string;
    author: string;
    category: Category;
    likes: number;
}

export const Gallery = () => {
    const [activeCategory, setActiveCategory] = useState<string | "All">("All");
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
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

                const mappedPhotos: Photo[] = (photosData || []).map((p: any) => ({
                    id: p.id,
                    url: p.url,
                    title: p.title || "Untitled",
                    author: "Unknown Photographer",
                    category: p.category as Category,
                    likes: 0
                }));

                setPhotos(mappedPhotos);

                // Fetch categories
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name');

                if (categoriesError) {
                    console.warn("Could not fetch categories:", categoriesError);
                } else {
                    setCategories(categoriesData || []);
                }

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
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.name)}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-all duration-300 border border-transparent",
                                activeCategory === cat.name
                                    ? "bg-white text-black font-bold"
                                    : "bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700"
                            )}
                        >
                            {cat.name}
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
            <Lightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
        </section>
    );
};
