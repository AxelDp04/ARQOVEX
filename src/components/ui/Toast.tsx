"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 4000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 10, scale: 0.95 }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                                flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-md shadow-2xl min-w-[320px] max-w-md
                                ${toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : ""}
                                ${toast.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : ""}
                                ${toast.type === "info" ? "bg-brand-blue/10 border-brand-blue/20 text-brand-blue-light" : ""}
                            `}>
                                <div className="flex-shrink-0">
                                    {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
                                    {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
                                    {toast.type === "info" && <Info className="w-5 h-5" />}
                                </div>
                                <p className="text-sm font-medium flex-1 line-clamp-2 leading-relaxed">
                                    {toast.message}
                                </p>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="p-1 rounded-lg hover:bg-white/5 transition-colors opacity-60 hover:opacity-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};
