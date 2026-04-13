'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Enviar reporte al servidor (Vigilancia Silenciosa)
        const reportError = async () => {
            try {
                const description = `[CRITICAL ERROR] ${error.message} | URL: ${window.location.href} | Digest: ${error.digest || 'N/A'}`;
                await fetch('/api/sentinel/report', {
                    method: 'POST',
                    body: JSON.stringify({ description }),
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (err) {
                console.error("Sentinel Reporting Error:", err);
            }
        };

        reportError();
    }, [error]);

    return (
        <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="glass-card max-w-xl w-full p-10 text-center relative z-10 border-red-500/20">
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>

                <h1 className="font-display text-3xl font-bold text-white mb-4 tracking-tight">
                    Interrupción Detectada
                </h1>
                
                <p className="text-gray-400 mb-8 leading-relaxed">
                    Hemos detectado una anomalía en el motor de ARQOVEX. El error ha sido reportado automáticamente al sistema central de monitoreo **Sentinel (Nexus)** para su resolución inmediata por el equipo técnico.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <button
                        onClick={() => reset()}
                        className="btn-primary w-full sm:w-auto bg-red-600 hover:bg-red-700 border-red-500 shadow-red-900/20 px-8 py-3.5 flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reintentar Operación
                    </button>
                    
                    <Link
                        href="/"
                        className="btn-ghost w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Volver al Inicio
                    </Link>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">
                        Nexus Task System | Sentinel Active
                    </p>
                </div>
            </div>
        </div>
    );
}
