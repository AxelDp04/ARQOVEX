"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Link as LinkIcon, Loader2, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { LOGO_SRC } from "@/lib/constants";
import { verifyRecoveryTokenAction } from "@/app/auth/actions";

export default function RecuperarManualPage() {
    const [linkText, setLinkText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Intentamos extraer el token si es una URL completa
        let token = linkText.trim();
        try {
            if (token.includes("token=")) {
                const url = new URL(token.replace(/#/g, "?")); // Manejamos hashes de Supabase
                const searchParams = new URLSearchParams(url.search);
                token = searchParams.get("token") || token;
            }
        } catch (e) {
            // Si falla el parseo, lo tratamos como token plano
        }

        if (!token) {
            setError("No pudimos encontrar un código válido en lo que pegaste.");
            return;
        }

        startTransition(async () => {
            const result = await verifyRecoveryTokenAction(token);
            if (result.error) {
                setError(result.error);
            } else if (result.success) {
                // Si la validación es exitosa, el servidor ya nos inició sesión
                // Ahora redirigimos a la página de cambio de contraseña
                router.push("/auth/reset-password");
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-slate-deeper relative p-6">
            <div className="absolute inset-0 bg-hero-pattern opacity-30" />
            
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-blue-dark/15 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-xl relative">
                {/* Logo y Encabezado */}
                <div className="text-center mb-10 space-y-4">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="relative w-12 h-12 transition-transform duration-300 group-hover:rotate-12">
                            <Image src={LOGO_SRC} alt="ARQOVEX" fill sizes="100vw" className="object-contain" />
                        </div>
                        <span className="font-display text-2xl font-bold">
                            <span className="text-white">ARQO</span><span className="text-brand-blue">VEX</span>
                        </span>
                    </Link>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-display font-black text-white tracking-tight">Modo Rescate</h1>
                        <p className="text-gray-400">Si el enlace de tu correo no abre, arréglalo aquí</p>
                    </div>
                </div>

                {/* Card de Rescate */}
                <div className="glass-card border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldCheck className="w-24 h-24" />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-brand-blue/10 border border-brand-blue/20">
                            <HelpCircle className="w-6 h-6 text-brand-blue shrink-0 mt-0.5" />
                            <div className="text-sm space-y-2">
                                <p className="text-white font-bold">Instrucciones:</p>
                                <ol className="list-decimal list-inside text-gray-400 space-y-1">
                                    <li>Ve a tu correo de recuperación.</li>
                                    <li>Haz **clic derecho** en el botón "Confirmar" o "Restablecer".</li>
                                    <li>Selecciona **"Copiar dirección de enlace"**.</li>
                                    <li>Pégalo en el cuadro de abajo.</li>
                                </ol>
                            </div>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Pega el enlace o código aquí</label>
                                <div className="relative group">
                                    <textarea
                                        value={linkText}
                                        onChange={(e) => setLinkText(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-5 text-sm text-gray-300 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all min-h-[120px] resize-none placeholder:text-gray-700"
                                        placeholder="https://...supabase.co/auth/v1/verify?token=..."
                                        disabled={isPending}
                                        required
                                    />
                                    <LinkIcon className="absolute right-4 bottom-4 w-5 h-5 text-gray-800 group-focus-within:text-brand-blue/30 transition-colors" />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 animate-in fade-in slide-in-from-top-1">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isPending || !linkText.trim()}
                                className="w-full py-4 bg-brand-blue hover:bg-brand-blue-light disabled:bg-gray-800 disabled:opacity-50 text-white font-bold rounded-2xl transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-brand-blue/20"
                            >
                                {isPending ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Validar Identidad y Continuar
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer del Rescate */}
                <p className="text-center mt-8 text-sm text-gray-500">
                    ¿Aún tienes problemas? <Link href="/contacto" className="text-brand-blue hover:underline">Contactar soporte</Link>
                </p>
            </div>
        </div>
    );
}
