"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function OlvideContrasenaPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const supabase = createClient();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `https://arqovex.vercel.app/auth/reset-password`,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left: Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-brand-slate-deeper relative">
                <div className="absolute inset-0 bg-hero-pattern opacity-50" />

                {/* Back to Home */}
                <div className="absolute top-6 left-6">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="relative w-8 h-8">
                            <Image src="/Logo.png" alt="ARQOVEX" fill className="object-contain" />
                        </div>
                        <span className="font-display text-lg font-bold">
                            <span className="text-white">ARQO</span><span className="text-brand-blue">VEX</span>
                        </span>
                    </Link>
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="mb-8 space-y-2">
                        <h1 className="font-display text-3xl font-bold text-white">Recuperar contraseña</h1>
                        <p className="text-gray-500">Te enviaremos un enlace para restablecer tu contraseña</p>
                    </div>

                    {success ? (
                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center mx-auto">
                                <Mail className="w-8 h-8 text-brand-blue" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">¡Correo enviado!</h3>
                                <p className="text-gray-400">
                                    Hemos enviado las instrucciones a <strong className="text-white">{email}</strong>.
                                    Por favor, revisa tu bandeja de entrada.
                                </p>
                            </div>
                            <Link href="/auth/login" className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Volver al Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email registrado</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field pl-11"
                                        placeholder="tu@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full py-3.5"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Enviar enlace de recuperación
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                                <Link
                                    href="/auth/login"
                                    className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-white transition-colors py-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Cancelar y volver al login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Right: Decorative */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-brand-slate via-brand-slate-dark to-brand-slate-deeper relative overflow-hidden">
                <div className="absolute inset-0 bg-hero-pattern" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-[80px]" />
                
                <div className="relative z-10 p-12 text-center space-y-6">
                    <div className="relative w-32 h-32 mx-auto animate-float">
                        <Image src="/Logo.png" alt="ARQOVEX" fill className="object-contain drop-shadow-[0_0_40px_rgba(0,102,255,0.5)]" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-display text-2xl font-bold text-white">Blindaje ARQOVEX</h2>
                        <p className="text-brand-blue font-medium">Protección de Datos Nivel Élite</p>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs italic">
                        &quot;La seguridad no es un producto, es un proceso continuo de protección de los sueños de nuestros clientes.&quot;
                    </p>
                </div>
            </div>
        </div>
    );
}
