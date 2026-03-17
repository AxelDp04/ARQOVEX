"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Check, User, Loader2, MessageCircle, FileCheck, ShieldCheck, Ruler } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PayPalButton from "@/components/ui/PayPalButton";
import type { Plano } from "@/types";

interface QuickBuyModalProps {
    plano: Plano;
    isOpen: boolean;
    onClose: () => void;
}

function formatPrice(price: number): string {
    return "US$ " + new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(price);
}

export default function QuickBuyModal({ plano, isOpen, onClose }: QuickBuyModalProps) {
    const supabase = createClient();
    const [userId, setUserId] = useState<string | null>(null);
    const [isAcquired, setIsAcquired] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const init = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);

            if (user) {
                // Check both new and legacy tables
                const [newVenta, legacyAdq] = await Promise.all([
                    supabase
                        .from("ventas_planos")
                        .select("id")
                        .eq("plano_id", plano.id)
                        .eq("usuario_id", user.id)
                        .eq("descarga_habilitada", true)
                        .maybeSingle(),
                    supabase
                        .from("adquisiciones")
                        .select("id")
                        .eq("plano_id", plano.id)
                        .eq("user_id", user.id)
                        .eq("estado", "completado")
                        .maybeSingle()
                ]);

                setIsAcquired(!!newVenta.data || !!legacyAdq.data);
            }
            setLoading(false);
        };

        init();
    }, [isOpen, plano.id, supabase]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const handleDownload = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/download/${plano.id}`);
            const data = await res.json();
            if (data.url) {
                // Use a hidden anchor to trigger download instead of window.open to avoid popup blockers in some flows
                const link = document.createElement('a');
                link.href = data.url;
                link.target = '_blank';
                // Try to suggest a name, although signed URLs might override this
                link.download = `${plano.titulo.replace(/\s+/g, '_')}_ARQOVEX.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            else alert("No se pudo obtener el archivo. Intenta desde Mi Panel.");
        } catch {
            alert("Error al obtener el archivo.");
        } finally {
            setActionLoading(false);
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
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 overflow-y-auto pointer-events-none md:items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 10 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="w-full max-w-md bg-[#090b14]/95 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
                        >
                        {/* Header */}
                        <div className="flex items-start justify-between p-6 border-b border-white/[0.06] shrink-0">
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-1">Compra Rápida</p>
                                <h2 className="font-display text-lg font-bold text-white truncate leading-tight">{plano.titulo}</h2>
                                <p className="text-2xl font-black text-white mt-1">{formatPrice(plano.precio)}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body (Scrollable) */}
                        <div className="p-6 space-y-5 overflow-y-auto overflow-x-hidden flex-1 relative hide-scrollbar">
                            {loading ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                                </div>
                            ) : isAcquired ? (
                                /* ---- ALREADY ACQUIRED ---- */
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center space-y-2">
                                        <Check className="w-6 h-6 text-green-400 mx-auto" />
                                        <div className="text-sm font-semibold text-white">Adquisición verificada</div>
                                        <div className="text-xs text-green-400">Tu descarga está disponible</div>
                                    </div>
                                    <button
                                        onClick={handleDownload}
                                        disabled={actionLoading}
                                        className="btn-primary w-full py-4 bg-brand-gradient flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                        Descargar Archivo Técnico
                                    </button>
                                    <Link href="/dashboard" onClick={onClose} className="btn-ghost w-full block text-center">
                                        Mi Panel de Archivos
                                    </Link>
                                </div>
                            ) : userId ? (
                                /* ---- LOGGED IN, NOT ACQUIRED ---- */
                                <div className="space-y-5">
                                    {/* Includes list */}
                                    <ul className="space-y-2.5">
                                        {[
                                            { icon: Ruler, text: "Archivos editables AutoCAD (.DWG)" },
                                            { icon: FileCheck, text: "Planos en PDF alta resolución" },
                                            { icon: ShieldCheck, text: "Certificación arquitectónica" },
                                            { icon: MessageCircle, text: "Asistencia directa personalizada" },
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                                                <item.icon className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                                                <span>{item.text}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* PayPal */}
                                    <PayPalButton
                                        planoId={plano.id}
                                        monto={plano.precio}
                                        userId={userId}
                                        onSuccess={() => {
                                            setIsAcquired(true);
                                            // Delay Slightly to ensure DB triggers/writes are visible to the next API call
                                            setTimeout(() => handleDownload(), 500);
                                        }}
                                    />

                                    <Link
                                        href={`/plano/${plano.id}`}
                                        onClick={onClose}
                                        className="block text-center text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        Ver detalles completos del proyecto →
                                    </Link>
                                </div>
                            ) : (
                                /* ---- NOT LOGGED IN ---- */
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-400 text-center">
                                        Necesitas una cuenta para realizar tu compra y acceder a tus descargas.
                                    </p>
                                    <Link
                                        href={`/auth/login?returnTo=/plano/${plano.id}%23comprar`}
                                        className="btn-primary w-full py-4 text-base shadow-blue-glow flex items-center justify-center gap-2"
                                        onClick={onClose}
                                    >
                                        <User className="w-5 h-5" />
                                        Inicia sesión para comprar
                                    </Link>
                                    <Link
                                        href={`/auth/registro?returnTo=/plano/${plano.id}%23comprar`}
                                        className="btn-ghost w-full text-center block"
                                        onClick={onClose}
                                    >
                                        Crear cuenta gratis
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-5 flex items-center justify-center gap-2 text-[10px] text-gray-600">
                            <ShieldCheck className="w-3 h-3" />
                            Pago 100% seguro vía PayPal · Acceso inmediato tras confirmación
                        </div>
                    </motion.div>
                </div>
                </>
            )}
        </AnimatePresence>
    );
}
