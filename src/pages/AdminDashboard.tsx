import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
    Trash2,
    ExternalLink,
    LogOut,
    ArrowLeft,
    LayoutDashboard,
    Image as ImageIcon,
    Users,
    Search,
    Bell,
    Menu,
    X,
    Layers,
    Heart,
    RefreshCw,
    Plus,
    Edit2,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { cn } from "../lib/utils";
import { Lightbox } from "../components/Lightbox";
import { ConfirmModal } from "../components/ConfirmModal";
import type { Photo as GalleryPhoto } from "../components/Gallery";
import { useToast } from '../components/Toast';

interface Photo {
    id: string;
    title: string;
    url: string;
    category: string;
    status: "pending" | "approved" | "rejected";
    photographer_id: string;
    author_name?: string;
    created_at: string;
    likes?: number;
}

export function AdminDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const { showToast } = useToast();
    const [isAdmin, setIsAdmin] = useState(false);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "users" | "photos" | "categories">("overview");

    // Category form states
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        type: 'photo' | 'user' | 'category' | null;
        id: string | null;
        extraData?: any; // e.g. photo url
    }>({ isOpen: false, type: null, id: null });

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Check role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile?.role === 'admin') {
                    setIsAdmin(true);
                    fetchData();
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch photos
            const { data: photosData, error: photosError } = await supabase
                .from('photos')
                .select('*')
                .order('created_at', { ascending: false });

            if (photosError) throw photosError;

            // Fetch profiles
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*');

            if (profilesError) throw profilesError;

            // Fetch categories
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (categoriesError) {
                console.warn("Could not fetch categories (table might not exist yet):", categoriesError);
            } else {
                setCategories(categoriesData || []);
            }

            setProfiles(profilesData || []);

            // Map photos with author names
            const profilesMap = (profilesData || []).reduce((acc: Record<string, string>, profile: any) => {
                acc[profile.id] = profile.username || profile.email || 'Unknown';
                return acc;
            }, {});

            // Fetch like counts from photo_likes table
            const { data: likesData } = await supabase
                .from('photo_likes')
                .select('photo_id');

            const likeCounts: Record<string, number> = {};
            if (likesData) {
                likesData.forEach((like: any) => {
                    likeCounts[like.photo_id] = (likeCounts[like.photo_id] || 0) + 1;
                });
            }

            const photosWithAuthor = (photosData || []).map((p: any) => ({
                ...p,
                author_name: profilesMap[p.photographer_id] || 'Unknown',
                likes: likeCounts[p.id] || 0
            }));

            setPhotos(photosWithAuthor);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    const openDeleteModal = (type: 'photo' | 'user' | 'category', id: string, extraData?: any) => {
        setDeleteModal({ isOpen: true, type, id, extraData });
    };

    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirmDelete = async () => {
        const { type, id, extraData } = deleteModal;
        if (!type || !id) return;
        setIsDeleting(true);

        try {
            if (type === 'photo') {
                // Delete Photo Logic
                const url = extraData;
                const urlParts = url.split("/photos/");
                if (urlParts.length > 1) {
                    const filePath = decodeURIComponent(urlParts[1]);
                    console.log("Admin deleting file:", filePath);
                    const { error: storageError } = await supabase.storage.from("photos").remove([filePath]);
                    if (storageError) console.error("Storage delete warning:", storageError);
                }

                const { error, count } = await supabase.from('photos').delete({ count: 'exact' }).eq('id', id);
                console.log("Delete Photo Result:", { error, count });
                if (error) throw error;
                if (count === 0) throw new Error("Không xóa được ảnh (RLS hoặc không tồn tại)");
                setPhotos(prev => prev.filter((p) => p.id !== id));
                showToast("Đã xóa ảnh thành công", "success");

            } else if (type === 'user') {
                // Delete User Logic
                const { error, count } = await supabase.from('profiles').delete({ count: 'exact' }).eq('id', id);
                console.log("Delete User Result:", { error, count });
                if (error) throw error;
                if (count === 0) throw new Error("Không xóa được user (RLS hoặc không tồn tại)");
                setProfiles(prev => prev.filter(p => p.id !== id));
                showToast("Đã xóa người dùng thành công", "success");

            } else if (type === 'category') {
                // Delete Category Logic
                const { error, count } = await supabase.from('categories').delete({ count: 'exact' }).eq('id', id);
                console.log("Delete Category Result:", { error, count });
                if (error) throw error;
                if (count === 0) throw new Error("Không xóa được category (RLS hoặc không tồn tại)");
                setCategories(prev => prev.filter(c => c.id !== id));
                showToast("Đã xóa thể loại thành công", "success");
            }
        } catch (error: any) {
            console.error("Admin delete error:", error);
            showToast(error.message || "Lỗi xóa dữ liệu", "error");
        } finally {
            setIsDeleting(false);
            setDeleteModal({ isOpen: false, type: null, id: null });
            if (!isDeleting) { // Only show success if we reached here without error re-throw loop (which isn't fully accurate in this structure but alert replacement is key)
                // Actually we threw error above so success toast needs to be inside try block before finally
            }
        }
    };

    // Category Management
    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([{ name: newCategoryName.trim() }])
                .select()
                .single();

            if (error) throw error;

            setCategories([...categories, data]);
            setNewCategoryName("");
            showToast("Đã thêm thể loại mới", "success");
        } catch (error: any) {
            showToast("Lỗi thêm thể loại: " + error.message, "error");
        }
    };

    // Keep old function names if they are used elsewhere or just redirect them
    const handleDeletePhoto = (id: string, url: string) => openDeleteModal('photo', id, url);
    const handleDeleteUser = (id: string) => openDeleteModal('user', id);
    const handleDeleteCategory = (id: string) => openDeleteModal('category', id);

    const handleUpdateCategory = async (id: string, newName: string) => {
        if (!newName.trim()) return;
        try {
            const { error } = await supabase
                .from('categories')
                .update({ name: newName.trim() })
                .eq('id', id);

            if (error) throw error;

            setCategories(categories.map(c => c.id === id ? { ...c, name: newName.trim() } : c));
            setEditingCategory(null);
            showToast("Đã cập nhật thể loại", "success");
        } catch (error: any) {
            showToast("Lỗi cập nhật thể loại: " + error.message, "error");
        }
    };


    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!user || !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
                <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
                <p className="text-zinc-400 mb-8">You do not have permission to view this page.</p>
                <a href="/" className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                    Go Back Home
                </a>
            </div>
        );
    }

    const renderStatCard = ({ icon: Icon, label, value, colorClass }: { icon: any, label: string, value: number, colorClass: string }) => (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex items-center gap-5 hover:border-white/10 transition-all group">
            <div className={cn("p-4 rounded-xl", colorClass, "bg-opacity-10 group-hover:scale-110 transition-transform duration-300")}>
                <Icon className={cn("w-6 h-6", colorClass.replace('bg-', 'text-'))} />
            </div>
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
            </div>
        </div>
    );

    const renderOverviewTab = () => {
        // Sort photos by likes desc
        const topLikedPhotos = [...photos].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 4);

        return (
            <div className="space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderStatCard({
                        icon: ImageIcon,
                        label: "Tổng số ảnh",
                        value: photos.length,
                        colorClass: "bg-blue-500 text-blue-500"
                    })}
                    {renderStatCard({
                        icon: LayoutDashboard,
                        label: "Thể loại",
                        value: new Set(photos.map(p => p.category)).size,
                        colorClass: "bg-purple-500 text-purple-500"
                    })}
                    {renderStatCard({
                        icon: Users,
                        label: "Người dùng",
                        value: profiles.length,
                        colorClass: "bg-emerald-500 text-emerald-500"
                    })}
                </div>

                {/* Top Liked Section */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Heart className="text-red-500 fill-red-500" size={24} />
                        Ảnh được yêu thích nhất
                    </h3>
                    {topLikedPhotos.length === 0 ? (
                        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-16 text-center">
                            <ImageIcon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-400 text-lg">Chưa có dữ liệu "Like".</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {topLikedPhotos.map((photo) => (
                                <motion.div
                                    key={photo.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group bg-slate-900 border border-white/5 rounded-2xl overflow-hidden hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-900/20 transition-all duration-300"
                                >
                                    <div className="aspect-[4/3] relative overflow-hidden">
                                        <img
                                            src={photo.url}
                                            alt={photo.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="px-2.5 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg text-xs font-medium text-white">
                                                {photo.category}
                                            </span>
                                        </div>
                                        <div className="absolute top-3 right-3">
                                            <span className="px-2.5 py-1 bg-red-500/90 backdrop-blur-md rounded-lg text-xs font-bold text-white flex items-center gap-1">
                                                <Heart size={12} className="fill-white" />
                                                {photo.likes || 0}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h4 className="font-bold text-white mb-2 truncate" title={photo.title}>{photo.title}</h4>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                                                {photo.author_name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <span className="text-sm text-slate-400 truncate flex-1" title={photo.author_name}>
                                                {photo.author_name}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                            <span className="text-xs text-slate-500">
                                                {new Date(photo.created_at).toLocaleDateString("vi-VN")}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Uploads Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Ảnh mới tải lên</h3>
                        <button onClick={() => setActiveTab("photos")} className="text-sm text-blue-400 hover:text-blue-300 font-medium">Xem tất cả</button>
                    </div>
                    {photos.length === 0 ? (
                        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-16 text-center">
                            <ImageIcon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-400 text-lg">Chưa có ảnh dự thi nào.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {photos.slice(0, 4).map((photo) => (
                                <motion.div
                                    key={photo.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group bg-slate-900 border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300"
                                >
                                    <div className="aspect-[4/3] relative overflow-hidden">
                                        <img
                                            src={photo.url}
                                            alt={photo.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="px-2.5 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg text-xs font-medium text-white">
                                                {photo.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h4 className="font-bold text-white mb-2 truncate" title={photo.title}>{photo.title}</h4>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                                                {photo.author_name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <span className="text-sm text-slate-400 truncate flex-1" title={photo.author_name}>
                                                {photo.author_name}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                            <span className="text-xs text-slate-500">
                                                {new Date(photo.created_at).toLocaleDateString("vi-VN")}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderPhotosTab = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Quản lý Ảnh dự thi ({photos.length})</h3>
            {photos.length === 0 ? (
                <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-16 text-center">
                    <p className="text-slate-400 text-lg">Chưa có dữ liệu.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {photos.map((photo) => (
                        <motion.div
                            key={photo.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="group bg-slate-900 border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-2xl transition-all duration-300"
                        >
                            <div className="aspect-[4/3] relative overflow-hidden">
                                <img
                                    src={photo.url}
                                    alt={photo.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                {/* Actions Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                    <button
                                        onClick={() => setSelectedPhoto({
                                            id: photo.id,
                                            url: photo.url,
                                            title: photo.title,
                                            category: photo.category,
                                            author: photo.author_name || "Unknown",
                                            likes: photo.likes || 0
                                        })}
                                        className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
                                        title="Xem ảnh gốc"
                                    >
                                        <ExternalLink size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeletePhoto(photo.id, photo.url)}
                                        className="p-2.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors"
                                        title="Xóa ảnh"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="absolute top-3 left-3">
                                    <span className="px-2.5 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg text-xs font-medium text-white">
                                        {photo.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-white mb-1 truncate">{photo.title}</h4>
                                <p className="text-xs text-slate-400 mb-3">bởi {photo.author_name}</p>
                                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                    <span className="text-xs text-slate-500">
                                        {new Date(photo.created_at).toLocaleDateString("vi-VN")}
                                    </span>
                                    <span className="text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded">
                                        Đã duyệt
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderUsersTab = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Quản lý Người dùng ({profiles.length})</h3>
            <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950 text-slate-200 font-medium border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4">Người dùng</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Vai trò</th>
                            <th className="px-6 py-4">Ngày tham gia</th>
                            <th className="px-6 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {profiles.map((profile) => (
                            <tr key={profile.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{(profile.full_name || profile.username || "U").charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <span className="font-medium text-white">{profile.full_name || profile.username || "Chưa đặt tên"}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-400">{profile.email || "N/A"}</td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "px-2 py-1 rounded text-xs font-medium",
                                        profile.role === 'admin' ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                                    )}>
                                        {profile.role === 'admin' ? "Admin" : "User"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString("vi-VN") : "N/A"}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDeleteUser(profile.id)}
                                        className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5"
                                        title="Xóa người dùng (Demo)"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderCategoriesTab = () => {
        // MAPPING: English (DB) -> Vietnamese (UI)
        const CATEGORY_MAP: Record<string, string> = {
            'Portrait': 'Ảnh Chân Dung',
            'Landscape': 'Ảnh Phong Cảnh',
            'Street': 'Ảnh Tự Do',
        };

        return (
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6">Quản lý Thể loại ({categories.length})</h3>

                {/* Create form */}
                <form onSubmit={handleAddCategory} className="bg-slate-900 border border-white/5 p-4 rounded-xl flex gap-3 mb-6">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nhập tên thể loại (English Key)..."
                        className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={!newCategoryName.trim()}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Thêm
                    </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-slate-900 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                            {editingCategory?.id === cat.id ? (
                                <div className="flex gap-2 w-full">
                                    <input
                                        type="text"
                                        defaultValue={cat.name}
                                        autoFocus
                                        onBlur={(e) => handleUpdateCategory(cat.id, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleUpdateCategory(cat.id, e.currentTarget.value);
                                            if (e.key === 'Escape') setEditingCategory(null);
                                        }}
                                        className="flex-1 bg-slate-950 border border-blue-500 rounded px-2 py-1 text-sm text-white"
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    <span className="font-bold text-white">{CATEGORY_MAP[cat.name] || cat.name}</span>
                                    <span className="text-xs text-slate-500 font-mono">{cat.name}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingCategory(cat)}
                                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <LayoutDashboard size={16} className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex overflow-hidden">
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-slate-800 rounded-lg text-white"
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-white/5 transform transition-transform duration-300 z-40 lg:translate-x-0 lg:static flex flex-col",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-8 pb-4">
                    <h1 className="text-2xl font-black tracking-tight text-white mb-1">MNMF</h1>
                    <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">Admin Panel</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <button
                        onClick={() => { setActiveTab("overview"); setSidebarOpen(false); }}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left",
                            activeTab === "overview"
                                ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <LayoutDashboard size={20} />
                        <span>Tổng quan</span>
                    </button>
                    <div className="px-4 py-2 mt-6">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quản lý</p>
                        <button
                            onClick={() => { setActiveTab("photos"); setSidebarOpen(false); }}
                            className={cn(
                                "w-full flex items-center gap-3 py-2 transition-colors text-left",
                                activeTab === "photos" ? "text-white" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <ImageIcon size={18} />
                            <span>Ảnh dự thi</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab("users"); setSidebarOpen(false); }}
                            className={cn(
                                "w-full flex items-center gap-3 py-2 transition-colors text-left",
                                activeTab === "users" ? "text-white" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <Users size={18} />
                            <span>Người dùng</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab("categories"); setSidebarOpen(false); }}
                            className={cn(
                                "w-full flex items-center gap-3 py-2 transition-colors text-left",
                                activeTab === "categories" ? "text-white" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <Layers size={18} />
                            <span>Thể loại</span>
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t border-white/5 space-y-2">
                    <a href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <ArrowLeft size={18} />
                        <span>Về trang chủ</span>
                    </a>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <LogOut size={18} />
                        <span>Đăng xuất</span>
                    </button>

                    <div className="pt-4 px-2 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden">
                            <img src={user?.user_metadata?.avatar_url || "https://ui-avatars.com/api/?name=Admin"} alt="Admin" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.user_metadata?.full_name || "Admin"}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen bg-slate-950 relative">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 via-slate-900/10 to-transparent pointer-events-none" />

                <div className="relative p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
                    {/* Header Section */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                {activeTab === "overview" && "Tổng quan"}
                                {activeTab === "photos" && "Quản lý Ảnh"}
                                {activeTab === "users" && "Quản lý Người dùng"}
                                {activeTab === "categories" && "Quản lý Thể loại"}
                            </h2>
                            <p className="text-slate-400">
                                {activeTab === "overview" && "Chào mừng trở lại, đây là tình hình hoạt động hôm nay."}
                                {activeTab === "photos" && "Xem và quản lý tất cả các ảnh dự thi."}
                                {activeTab === "users" && "Xem danh sách người dùng đã đăng ký."}
                                {activeTab === "categories" && "Thêm, xóa, sửa các thể loại ảnh dự thi."}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    className="bg-slate-900 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 w-64 transition-colors"
                                />
                            </div>
                            <button className="p-2.5 bg-slate-900 border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
                            </button>
                        </div>
                    </header>

                    {/* Content Views */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === "overview" && renderOverviewTab()}
                            {activeTab === "photos" && renderPhotosTab()}
                            {activeTab === "categories" && renderCategoriesTab()}
                            {activeTab === "users" && renderUsersTab()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <Lightbox
                photo={selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
                user={user}
                onLoginClick={() => { }} // Admin is already logged in
            />

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa?"
                message={
                    deleteModal.type === 'photo' ? "Bạn có chắc muốn xóa ảnh này? Hành động này không thể hoàn tác." :
                        deleteModal.type === 'user' ? "Bạn có chắc muốn xóa người dùng này? Họ sẽ mất quyền truy cập." :
                            "Xóa thể loại này sẽ không xóa ảnh thuộc về nó, nhưng ảnh sẽ bị mất liên kết."
                }
                confirmText="Xóa ngay"
                isDangerous={true}
                isLoading={isDeleting}
            />
        </div>
    );
};
