import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

const ToastIcon = ({ type }: { type: ToastType }) => {
    switch (type) {
        case "success":
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case "error":
            return <XCircle className="w-5 h-5 text-red-500" />;
        case "warning":
            return <AlertCircle className="w-5 h-5 text-yellow-500" />;
        case "info":
            return <Info className="w-5 h-5 text-blue-500" />;
    }
};

const getToastStyles = (type: ToastType) => {
    switch (type) {
        case "success":
            return "border-green-500/30 bg-green-500/10";
        case "error":
            return "border-red-500/30 bg-red-500/10";
        case "warning":
            return "border-yellow-500/30 bg-yellow-500/10";
        case "info":
            return "border-blue-500/30 bg-blue-500/10";
    }
};

const getProgressColor = (type: ToastType) => {
    switch (type) {
        case "success":
            return "bg-green-500";
        case "error":
            return "bg-red-500";
        case "warning":
            return "bg-yellow-500";
        case "info":
            return "bg-blue-500";
    }
};

interface ToastItemProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`relative overflow-hidden rounded-xl border backdrop-blur-md shadow-lg ${getToastStyles(toast.type)}`}
        >
            <div className="flex items-center gap-3 px-4 py-3">
                <ToastIcon type={toast.type} />
                <p className="text-sm font-medium text-white flex-1">{toast.message}</p>
                <button
                    onClick={() => onRemove(toast.id)}
                    className="p-1 text-white/50 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            {/* Progress Bar */}
            <motion.div
                className={`absolute bottom-0 left-0 h-1 ${getProgressColor(toast.type)}`}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: toast.duration / 1000, ease: "linear" }}
            />
        </motion.div>
    );
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = "success", duration: number = 3000) => {
            const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newToast: Toast = { id, message, type, duration };

            setToasts((prev) => [...prev, newToast]);

            // Auto remove after duration
            setTimeout(() => {
                removeToast(id);
            }, duration);
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
