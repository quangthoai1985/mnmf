import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "../lib/utils";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
    isLoading?: boolean;
}

export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    isDangerous = false,
    isLoading = false
}: ConfirmModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={isLoading ? undefined : onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    >
                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
                        >
                            {/* Decorative Background */}
                            <div className={cn(
                                "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none",
                                isDangerous ? "bg-red-500/10" : "bg-blue-500/10"
                            )}></div>

                            <div className="relative z-10">
                                {/* Icon */}
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                                    isDangerous ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                                )}>
                                    <AlertTriangle size={24} />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                                <p className="text-slate-400 mb-6 leading-relaxed">
                                    {message}
                                </p>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className={cn(
                                            "flex-1 px-4 py-2.5 font-bold rounded-xl text-white transition-all shadow-lg flex items-center justify-center gap-2",
                                            isDangerous
                                                ? "bg-red-500 hover:bg-red-600 shadow-red-900/20"
                                                : "bg-blue-500 hover:bg-blue-600 shadow-blue-900/20",
                                            isLoading && "opacity-70 cursor-wait"
                                        )}
                                    >
                                        {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                        {confirmText}
                                    </button>
                                </div>
                            </div>

                            {/* Close Button */}
                            {!isLoading && (
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-1 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
