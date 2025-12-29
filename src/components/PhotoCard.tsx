import { motion } from "framer-motion";
import type { Photo } from "./Gallery";

interface PhotoCardProps {
    photo: Photo;
    onClick: (photo: Photo) => void;
    index: number;
}

export const PhotoCard = ({ photo, onClick, index }: PhotoCardProps) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            onClick={() => onClick(photo)}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-gray-900 break-inside-avoid mb-4"
        >
            <img
                src={photo.url}
                alt={photo.title}
                className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
            />

            {/* Category Badge */}
            <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                    {photo.category_display || photo.category}
                </span>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4">
                <h3 className="text-lg font-bold text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {photo.title}
                </h3>
            </div>
        </motion.div>
    );
};
