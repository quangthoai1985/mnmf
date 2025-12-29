import { motion, AnimatePresence } from "framer-motion";
import { X, Lock } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useToast } from "../Toast";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            showToast("Password updated successfully!", "success");
            onClose();
            setPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err.message || "Failed to update password");
            showToast(err.message || "Failed to update password", "error");
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
                                    Change Password
                                </h2>
                                <p className="text-zinc-400 text-sm">
                                    Enter your new password below.
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                        <input
                                            type="password"
                                            placeholder="New Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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
                                            placeholder="Confirm New Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    {loading ? "Updating..." : "Update Password"}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
