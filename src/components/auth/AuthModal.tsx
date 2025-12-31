import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useToast } from "../Toast";

type AuthTab = "login" | "register";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: AuthTab;
}

export const AuthModal = ({ isOpen, onClose, initialTab = "login" }: AuthModalProps) => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

    // Sync active tab with initialTab when opening
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    // Update active tab if initialTab changes when opening
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (activeTab === "register") {
                // Generate a unique username by appending 4 random characters
                const username = `${email.split('@')[0]}_${Math.random().toString(36).slice(2, 6)}`;
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            username: username,
                            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
                        },
                    },
                });
                if (signUpError) throw signUpError;

                // Check if email confirmation is required (Supabase default usually requires it)
                // We'll show a persistent message or a clear toast instructing the user to check their email.
                showToast("Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản trước khi đăng nhập.", "success");

                // Optional: Show a more prominent UI feedback instead of just a toast, 
                // leveraging the error/message area in the modal
                setError("Vui lòng kiểm tra email của bạn để xác thực tài khoản.");
                // We don't automatically switch to login immediately to let them read the message
                // or we can switch and show the message there.
                // setActiveTab("login"); 

                // Let's reset the form but keep them on the register tab or move to login with a message?
                // Moving to login seems standard, but the message needs to persist.
                // For now, let's keep them on the register tab with the success message in the error/info box area
                // actually "setError" renders in red, maybe we need a success state message.

                // Re-implementation:
                alert("Đăng ký thành công! Vui lòng kiểm tra hộp thư (cả mục Spam) để xác thực tài khoản trước khi đăng nhập.");
                setActiveTab("login");
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    showToast(`Chào mừng trở lại, ${user.user_metadata.full_name || user.email}!`, "success");
                } else {
                    showToast("Đăng nhập thành công!", "success");
                }
                onClose();
            }
        } catch (err: any) {
            let message = err.message || "An error occurred";

            // Translate common Supabase errors
            if (message.includes("Email not confirmed")) {
                message = "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email của bạn để xác thực.";
            } else if (message.includes("Invalid login credentials")) {
                message = "Email hoặc mật khẩu không chính xác.";
            } else if (message.includes("User already registered")) {
                message = "Email này đã được sử dụng.";
            }

            setError(message);
            showToast(message, "error");
        } finally {
            setLoading(false);
        }
    };

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
                            <div className="mb-8 text-center pt-4">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {activeTab === "login" ? "Đăng nhập" : "Đăng ký tài khoản"}
                                </h2>
                                <p className="text-zinc-400 text-sm">
                                    {activeTab === "login"
                                        ? "Nhập thông tin để truy cập bộ sưu tập của bạn."
                                        : "Tham gia cộng đồng và bắt đầu sáng tạo."}
                                </p>
                            </div>

                            {/* Removed Tabs */}



                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {activeTab === "register" && (
                                    <div className="space-y-2">
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
                                )}

                                <div className="space-y-2">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                        <input
                                            type="email"
                                            placeholder="Email của bạn"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-black/50 border border-zinc-800 rounded-xl px-10 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                        <input
                                            type="password"
                                            placeholder="Mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-black/50 border border-zinc-800 rounded-xl px-10 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Đang xử lý..." : activeTab === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                                </button>
                            </form>

                            {/* Switch Mode Link */}
                            <div className="mt-6 text-center text-sm">
                                <span className="text-zinc-400">
                                    {activeTab === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                                </span>
                                <button
                                    onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
                                    className="text-white hover:underline font-medium"
                                >
                                    {activeTab === "login" ? "Đăng ký ngay" : "Đăng nhập ngay"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
