import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import {
    Upload,
    Trash2,
    Edit3,
    X,
    Check,
    ArrowLeft,
    Image as ImageIcon,
    Loader2,
    CloudUpload,
    MoreVertical,
    LogOut
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { ConfirmModal } from "../components/ConfirmModal";
import { useToast } from "../components/Toast";
import { cn } from "../lib/utils";

interface Photo {
    id: string;
    title: string;
    url: string;
    category: string;
    created_at: string;
}

export const UserPhotos = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    // Form states
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Edit states
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    // Delete Modal state
    const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);


    useEffect(() => {
        const checkUser = async () => {
            // Fetch categories
            const { data: categoriesData } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (categoriesData) {
                setCategories(categoriesData);
                if (categoriesData.length > 0) {
                    setCategory(categoriesData[0].name);
                }
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/");
                return;
            }
            setUser(user);
            fetchPhotos(user.id);
        };
        checkUser();
    }, [navigate]);

    const fetchPhotos = async (userId: string) => {
        const { data, error } = await supabase
            .from("photos")
            .select("*")
            .eq("photographer_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching photos:", error);
        } else {
            setPhotos(data || []);
        }
        setLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = (selectedFile: File) => {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            processFile(droppedFile);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !user || !title.trim()) return;

        setUploading(true);
        setUploadProgress(0);

        // Simulate progress since Supabase storage simple upload doesn't provide it easily
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 95) {
                    clearInterval(progressInterval);
                    return 95;
                }
                return prev + 5;
            });
        }, 100);

        try {
            // Upload to storage
            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from("photos")
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from("photos")
                .getPublicUrl(fileName);

            // Insert to database
            const { error: dbError } = await supabase
                .from("photos")
                .insert({
                    title: title.trim(),
                    url: publicUrl,
                    category,
                    photographer_id: user.id,
                });

            if (dbError) throw dbError;

            setUploadProgress(100);
            clearInterval(progressInterval);

            // Small delay to show 100%
            setTimeout(() => {
                // Reset form and refresh
                setTitle("");
                setCategory(categories.length > 0 ? categories[0].name : "");
                setFile(null);
                setPreview(null);
                setUploadProgress(0);
                fetchPhotos(user.id);
                showToast("Tải ảnh lên thành công!", "success");
            }, 500);

        } catch (error: any) {
            console.error("Upload error:", error);
            showToast("Lỗi khi tải ảnh: " + error.message, "error");
            clearInterval(progressInterval);
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteClick = (photo: Photo) => {
        setPhotoToDelete(photo);
    };

    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirmDelete = async () => {
        if (!photoToDelete) return;
        setIsDeleting(true);
        console.log("Starting delete process for:", photoToDelete.id);

        try {
            // Extract file path from URL
            const urlParts = photoToDelete.url.split("/photos/");
            if (urlParts.length > 1) {
                const filePath = decodeURIComponent(urlParts[1]); // Ensure path is decoded, e.g. %20 -> space
                console.log("Deleting from storage:", filePath);
                const { error: storageError } = await supabase.storage.from("photos").remove([filePath]);
                if (storageError) {
                    console.error("Storage delete error (non-blocking):", storageError);
                }
            } else {
                console.warn("Could not extract file path from URL:", photoToDelete.url);
            }

            // Delete from database
            console.log("Deleting from DB:", photoToDelete.id);
            const { error, count } = await supabase
                .from("photos")
                .delete({ count: 'exact' })
                .eq("id", photoToDelete.id);

            console.log("DB Delete Result:", { error, count });

            if (error) throw error;
            if (count === 0) {
                throw new Error("Xóa thất bại. Có thể do lỗi phân quyền (RLS) hoặc ảnh không còn tồn tại.");
            }

            setPhotos(prev => prev.filter((p) => p.id !== photoToDelete.id));
            showToast("Đã xóa ảnh thành công!", "success");
        } catch (error: any) {
            console.error("Delete error:", error);
            showToast("Lỗi khi xóa ảnh: " + error.message, "error");
        } finally {
            setIsDeleting(false);
            setPhotoToDelete(null);
        }
    };

    const handleEdit = (photo: Photo) => {
        setEditingId(photo.id);
        setEditTitle(photo.title);
    };

    const handleSaveEdit = async (photoId: string) => {
        if (!editTitle.trim()) return;

        try {
            const { error } = await supabase
                .from("photos")
                .update({ title: editTitle.trim() })
                .eq("id", photoId);

            if (error) throw error;

            setPhotos(photos.map((p) =>
                p.id === photoId ? { ...p, title: editTitle.trim() } : p
            ));
            setEditingId(null);
            setEditTitle("");
            showToast("Đã cập nhật tên ảnh!", "success");
        } catch (error: any) {
            console.error("Edit error:", error);
            showToast("Lỗi khi cập nhật: " + error.message, "error");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            {/* Background Gradients */}
            <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/10 via-slate-900/10 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/")}
                            className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white">Ảnh dự thi của bạn</h1>
                            <p className="text-xs text-slate-400">Quản lý thư viện ảnh cá nhân</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 mr-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
                                    <img
                                        src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.user_metadata.full_name || 'User'}`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="text-sm font-medium text-slate-200 hidden sm:block">
                                    {user.user_metadata.full_name || "Nhiếp ảnh gia"}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                window.location.href = "/";
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                            title="Đăng xuất"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Column: Upload Form */}
                    <div className="lg:col-span-4 lg:sticky lg:top-28 lg:h-fit space-y-6">
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            {/* Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                                    <CloudUpload className="w-5 h-5" />
                                </div>
                                Tải ảnh mới
                            </h2>

                            <form onSubmit={handleUpload} className="space-y-4 relative z-10">
                                {/* Drag & Drop Zone */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById("file-input")?.click()}
                                    className={cn(
                                        "relative group border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300",
                                        isDragging ? "border-blue-500 bg-blue-500/10 scale-[1.02]" : "border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50",
                                        preview ? "border-transparent p-0 overflow-hidden" : ""
                                    )}
                                >
                                    {preview ? (
                                        <div className="relative aspect-video w-full">
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <p className="text-sm font-medium text-white">Nhấn để thay đổi</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFile(null);
                                                    setPreview(null);
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500/80 backdrop-blur rounded-full text-white hover:bg-red-500 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-8">
                                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                            <p className="text-slate-300 text-sm font-medium">Kéo thả ảnh vào đây</p>
                                            <p className="text-slate-500 text-xs mt-1">hoặc nhấn để chọn file</p>
                                        </div>
                                    )}
                                    <input
                                        id="file-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>

                                {/* Inputs */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 ml-1 mb-1 block">Tên tác phẩm</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Đặt tên cho bức ảnh..."
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-slate-400 ml-1 mb-1 block">Chủ đề</label>
                                        <div className="relative">
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                                            >
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.name} className="bg-slate-900">{cat.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                <MoreVertical className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {uploading && (
                                    <div className="w-full bg-slate-800 rounded-full h-2.5 mb-2 overflow-hidden border border-white/10">
                                        <div
                                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!file || !title.trim() || uploading}
                                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 mt-2"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Đang tải lên {uploadProgress}%...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            <span>Tải ảnh lên</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Photos Grid */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-blue-400" />
                                Thư viện của tôi
                                <span className="text-slate-500 text-sm font-normal ml-2">({photos.length} ảnh)</span>
                            </h2>
                        </div>

                        {photos.length === 0 ? (
                            <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-20 text-center flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                    <ImageIcon className="w-10 h-10 text-slate-700" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Chưa có ảnh nào</h3>
                                <p className="text-slate-400 max-w-sm mx-auto">
                                    Hãy tải lên những bức ảnh tuyệt vời nhất của bạn để tham gia dự thi!
                                </p>
                            </div>
                        ) : (
                            <motion.div layout className="grid sm:grid-cols-2 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {photos.map((photo) => (
                                        <motion.div
                                            key={photo.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            className="group bg-slate-900 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300"
                                        >
                                            <div className="aspect-[4/3] relative bg-slate-950">
                                                <img
                                                    src={photo.url}
                                                    alt={photo.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />

                                                {/* Overlay Actions */}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                                    <button
                                                        onClick={() => handleEdit(photo)}
                                                        className="flex flex-col items-center gap-1 group/btn"
                                                    >
                                                        <div className="p-3 bg-white/10 group-hover/btn:bg-blue-500 text-white rounded-full backdrop-blur-md transition-all transform group-hover/btn:scale-110">
                                                            <Edit3 className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-xs font-medium text-white/90">Sửa</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(photo)}
                                                        className="flex flex-col items-center gap-1 group/btn"
                                                    >
                                                        <div className="p-3 bg-white/10 group-hover/btn:bg-red-500 text-white rounded-full backdrop-blur-md transition-all transform group-hover/btn:scale-110">
                                                            <Trash2 className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-xs font-medium text-white/90">Xóa</span>
                                                    </button>
                                                </div>

                                                {/* Category Badge */}
                                                <div className="absolute top-3 left-3 pointer-events-none">
                                                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-xs font-medium text-white shadow-lg">
                                                        {photo.category}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-slate-900 relative z-10">
                                                {editingId === photo.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={editTitle}
                                                            onChange={(e) => setEditTitle(e.target.value)}
                                                            className="flex-1 bg-slate-950 border border-blue-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleSaveEdit(photo.id);
                                                                if (e.key === 'Escape') setEditingId(null);
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => handleSaveEdit(photo.id)}
                                                            className="p-2 bg-green-500 rounded-lg text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="p-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <h3 className="font-bold text-white truncate text-base mb-1" title={photo.title}>
                                                                {photo.title}
                                                            </h3>
                                                            <p className="text-xs text-slate-500 font-medium">
                                                                {new Date(photo.created_at).toLocaleDateString("vi-VN", {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
            <ConfirmModal
                isOpen={!!photoToDelete}
                onClose={() => setPhotoToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Xóa ảnh?"
                message="Hành động này không thể hoàn tác. Ảnh sẽ bị xóa vĩnh viễn khỏi hệ thống."
                confirmText="Xóa ngay"
                isDangerous={true}
                isLoading={isDeleting}
            />
        </div>
    );
};
