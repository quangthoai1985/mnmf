import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, User, Save, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useToast } from "../Toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: SupabaseUser | null;
}

export const UserProfileModal = ({ isOpen, onClose, user }: UserProfileModalProps) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        if (user && isOpen) {
            setFullName(user.user_metadata.full_name || "");
            setAvatarUrl(user.user_metadata.avatar_url || "");
            setPassword("");
            setConfirmPassword("");
            setError(null);
        }
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const updates: any = {
                data: { full_name: fullName }
            };

            if (password) {
                if (password !== confirmPassword) {
                    throw new Error("Mật khẩu mới không khớp");
                }
                if (password.length < 6) {
                    throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
                }
                updates.password = password;
            }

            const { error: updateError } = await supabase.auth.updateUser(updates);

            if (updateError) throw updateError;

            showToast("Cập nhật thông tin thành công!", "success");
            onClose();
        } catch (err: any) {
            setError(err.message || "Không thể cập nhật thông tin");
            showToast(err.message || "Lỗi cập nhật", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 pointer-events-auto relative overflow-hidden shadow-2xl">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Header */}
                            <div className="mb-6 text-center pt-4">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Hồ sơ cá nhân
                                </h2>
                                <p className="text-zinc-400 text-sm">
                                    Cập nhật thông tin tài khoản của bạn
                                </p>
                            </div>

                            {/* Avatar Display (Read-only for now, or just visual) */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20">
                                        <img
                                            src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "User")}`}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {/* Placeholder for future avatar upload */}
                                    <div className="absolute bottom-0 right-0 p-1 bg-blue-500 rounded-full border border-black text-white pointer-events-none">
                                        <Camera className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">
                                        Tên hiển thị
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                        <input
                                            type="text"
                                            placeholder="Họ và tên"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-black/50 border border-zinc-800 rounded-xl px-10 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-4 space-y-2">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">
                                        Đổi mật khẩu (Tuỳ chọn)
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                        <input
                                            type="password"
                                            placeholder="Mật khẩu mới"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-black/50 border border-zinc-800 rounded-xl px-10 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                                        />
                                    </div>
                                    {password && (
                                        <div className="relative mt-2">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                            <input
                                                type="password"
                                                placeholder="Xác nhận mật khẩu mới"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-10 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {loading ? (
                                        "Đang lưu..."
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Lưu thay đổi
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
