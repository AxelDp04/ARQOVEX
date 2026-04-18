"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, User, ArrowRight } from "lucide-react";
import { LOGO_SRC } from "@/lib/constants";
import { registerAction } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
    const router = useRouter();
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Google OAuth — still uses client-side redirect which is fine
    const handleGoogleLogin = async () => {
        setLoadingGoogle(true);
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            setError(error.message);
            setLoadingGoogle(false);
        }
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side pre-validation for instant feedback
        if (!nombre.trim()) { setError("El nombre completo es obligatorio."); return; }
        if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
        if (!/[0-9]/.test(password)) { setError("La contraseña debe incluir al menos un número."); return; }

        const formData = new FormData();
        formData.set('nombre', nombre);
        formData.set('email', email);
        formData.set('password', password);

        startTransition(async () => {
            const result = await registerAction(formData) as { error?: string; success?: boolean; redirectUrl?: string };
            if (result?.error) {
                setError(result.error);
            } else if (result?.success) {
                // Determine redirect manually or handle it from action if returned
                window.location.href = result.redirectUrl || '/arquitectura';
            }
        });
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-slate-deeper p-8">
                <div className="text-center space-y-6 max-w-md">
                    <div className="w-16 h-16 rounded-full bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center mx-auto">
                        <Mail className="w-8 h-8 text-brand-blue" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white">¡Revisa tu email!</h2>
                    <p className="text-gray-400 leading-relaxed">
                        Te enviamos un enlace de confirmación a <strong className="text-white">{email}</strong>.
                        Haz clic en el enlace para activar tu cuenta.
                    </p>
                    <Link href="/auth/login" className="btn-primary inline-flex mt-4">
                        Ir al Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Decorative Left */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-brand-slate via-brand-slate-dark to-brand-slate-deeper relative overflow-hidden">
                <div className="absolute inset-0 bg-hero-pattern" />
                <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-brand-blue-dark/15 rounded-full blur-[60px]" />
                <div className="relative z-10 p-12 text-center space-y-6">
                    <div className="relative w-32 h-32 mx-auto animate-float">
                        <Image src={LOGO_SRC} alt="ARQOVEX" fill sizes="100vw" className="object-contain" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-display text-2xl font-bold text-white">Únete a ARQOVEX</h2>
                        <p className="text-brand-blue font-medium">Diseños y propiedades exclusivas</p>
                    </div>
                    <ul className="text-sm text-gray-500 space-y-2 text-left max-w-xs mx-auto">
                        {["Catálogo completo de planos", "Descarga inmediata", "Soporte técnico especializado", "Proyectos personalizados"].map((item) => (
                            <li key={item} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-brand-slate-deeper relative">
                <div className="absolute inset-0 bg-hero-pattern opacity-50" />
                <div className="absolute top-6 right-6">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8">
                            <Image src={LOGO_SRC} alt="ARQOVEX" fill sizes="100vw" className="object-contain" />
                        </div>
                        <span className="font-display text-lg font-bold">
                            <span className="text-white">ARQO</span><span className="text-brand-blue">VEX</span>
                        </span>
                    </Link>
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="mb-8 space-y-2">
                        <h1 className="font-display text-3xl font-bold text-white">Crea tu cuenta</h1>
                        <p className="text-gray-500">Accede a todos los planos arquitectónicos</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="input-field pl-11" placeholder="Tu nombre completo" autoComplete="name" required />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-11" placeholder="tu@email.com" autoComplete="email" required />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-11 pr-11" placeholder="Mínimo 8 caracteres (letras y números)" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
                        )}

                        <button type="submit" disabled={isPending} className="btn-primary w-full py-3.5 mt-2">
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Crear mi cuenta
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-brand-slate-deeper px-2 text-gray-500 font-medium tracking-widest">O regístrate con</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loadingGoogle || isPending}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loadingGoogle ? (
                                <Loader2 className="w-5 h-5 animate-spin text-black" />
                            ) : (
                                <>
                                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Continuar con Google
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-6">
                        ¿Ya tienes cuenta?{" "}
                        <Link href="/auth/login" className="text-brand-blue hover:text-brand-blue-light font-medium transition-colors">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
