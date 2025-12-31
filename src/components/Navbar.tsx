import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import type { User } from "@supabase/supabase-js";
import { LogOut, Camera, Settings, Lock } from "lucide-react";

interface NavbarProps {
    onLoginClick: () => void;
    onRegisterClick: () => void;
    onLogoutClick: () => void;
    onProfileClick?: () => void;
    user: User | null;
    isAdmin?: boolean;
}

export const Navbar = ({ onLoginClick, onRegisterClick, onLogoutClick, onProfileClick, user, isAdmin = false }: NavbarProps) => {
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
        setScrolled(latest > 50);
    });

    return (
        <motion.nav
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={cn(
                "fixed top-0 inset-x-0 z-40 px-6 py-4 transition-all duration-300",
                scrolled ? "bg-black/50 backdrop-blur-md border-b border-white/10" : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="text-xl font-black tracking-tighter text-white">
                    MNMF
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {/* Admin: "Quản lý ảnh dự thi" | User: "Gửi ảnh dự thi" */}
                            {isAdmin ? (
                                <button
                                    onClick={() => navigate("/admin")}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-full hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="hidden md:inline">Quản lý ảnh dự thi</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate("/my-photos")}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
                                >
                                    <Camera className="w-4 h-4" />
                                    <span className="hidden md:inline">Gửi ảnh dự thi</span>
                                </button>
                            )}

                            <button
                                onClick={onProfileClick}
                                className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
                                title="Cập nhật thông tin"
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                    <img
                                        src={user.user_metadata.avatar_url || "https://ui-avatars.com/api/?name=User"}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="text-sm font-medium text-white hidden md:block">
                                    {user.user_metadata.full_name || "User"}
                                </span>
                                <Lock className="w-3 h-3 text-white/50 group-hover:text-white transition-colors ml-1" />
                            </button>
                            <button
                                onClick={onLogoutClick}
                                className="p-2 text-white/60 hover:text-white transition-colors"
                                title="Log out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={onLoginClick}
                                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                            >
                                Đăng nhập
                            </button>
                            <button
                                onClick={onRegisterClick}
                                className="px-5 py-2 text-sm font-bold text-black bg-white rounded-full hover:bg-gray-200 transition-colors"
                            >
                                Đăng ký
                            </button>
                        </>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};
