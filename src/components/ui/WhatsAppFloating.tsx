"use client";

import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function WhatsAppFloating() {
    const [isVisible, setIsVisible] = useState(false);
    const robertNumber = "18299898038"; // Using the standard format for WhatsApp API

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleClick = () => {
        const message = encodeURIComponent("¡Hola Robert! Vengo desde la web de ARQOVEX. Me gustaría recibir asesoría.");
        window.open(`https://wa.me/${robertNumber}?text=${message}`, "_blank");
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClick}
                    className="fixed bottom-6 right-6 z-[100] bg-emerald-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-shadow group overflow-hidden border border-white/10"
                >
                    {/* Ripple effect background */}
                    <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full origin-center" />
                    
                    <div className="relative z-10 flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 fill-white/20" />
                        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-sm font-bold">
                            Soporte ARQOVEX
                        </span>
                    </div>

                    {/* Notification dot */}
                    <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-emerald-500 animate-pulse" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
