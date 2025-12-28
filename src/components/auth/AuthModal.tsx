import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Github } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/utils";
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

    // Update active tab if initialTab changes when opening
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (activeTab === "register") {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
                        },
                    },
                });
                if (signUpError) throw signUpError;
                showToast("Đăng ký thành công! Bạn có thể đăng nhập ngay.", "success");
                setActiveTab("login");
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                showToast("Đăng nhập thành công!", "success");
                onClose();
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
            showToast(err.message || "Có lỗi xảy ra", "error");
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
                                    {activeTab === "login" ? "Welcome Back" : "Create Account"}
                                </h2>
                                <p className="text-zinc-400 text-sm">
                                    {activeTab === "login"
                                        ? "Enter your details to access your collection."
                                        : "Join the community and start curating."}
                                </p>
                            </div>

                            {/* Tabs */}
                            <div className="flex p-1 bg-zinc-800/50 rounded-xl mb-8 relative">
                                <div className="absolute inset-0 p-1 flex">
                                    <motion.div
                                        layout
                                        className="w-1/2 h-full bg-zinc-800 rounded-lg shadow-sm"
                                        animate={{
                                            x: activeTab === "login" ? "0%" : "100%",
                                        }}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                </div>
                                <button
                                    onClick={() => setActiveTab("login")}
                                    className={cn(
                                        "relative z-10 w-1/2 py-2 text-sm font-medium transition-colors text-center",
                                        activeTab === "login" ? "text-white" : "text-zinc-400 hover:text-white"
                                    )}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setActiveTab("register")}
                                    className={cn(
                                        "relative z-10 w-1/2 py-2 text-sm font-medium transition-colors text-center",
                                        activeTab === "register" ? "text-white" : "text-zinc-400 hover:text-white"
                                    )}
                                >
                                    Register
                                </button>
                            </div>

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
                                                placeholder="Full Name"
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
                                            placeholder="hello@example.com"
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
                                            placeholder="Password"
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
                                    {loading ? "Processing..." : activeTab === "login" ? "Sign In" : "Create Account"}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-800"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
                                </div>
                            </div>

                            {/* Social Auth */}
                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex items-center justify-center gap-2 bg-black/50 border border-zinc-800 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:border-zinc-600 transition-all">
                                    <Github className="w-4 h-4" />
                                    <span className="text-sm font-medium">Github</span>
                                </button>
                                <button className="flex items-center justify-center gap-2 bg-black/50 border border-zinc-800 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:border-zinc-600 transition-all">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">Google</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
