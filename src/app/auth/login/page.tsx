"use client";

import { useState, useEffect, Suspense, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { LOGO_SRC } from "@/lib/constants";
import { loginAction } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const searchParams = useSearchParams();
    const resetSuccess = searchParams.get("reset") === "success";

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

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData();
        formData.set('email', email);
        formData.set('password', password);

        startTransition(async () => {
            try {
                console.log("Iniciando Server Action loginAction...");
                const result = await loginAction(formData) as { error?: string; redirectUrl?: string };
                console.log("Resultado de loginAction:", result);
                
                if (!result) {
                    setError("Respuesta vacía del servidor.");
                } else if (result.error) {
                    setError(result.error);
                } else if (result.redirectUrl) {
                    console.log("Redirigiendo a:", result.redirectUrl);
                    window.location.href = result.redirectUrl;
                }
            } catch (err: any) {
                console.error("Excepción atrapada en loginAction:", err);
                setError("Ocurrió un error inesperado de red.");
            }
        });
    };

    return (
        <div className="min-h-screen flex">
            {/* Left: Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-brand-slate-deeper relative">
                <div className="absolute inset-0 bg-hero-pattern opacity-50" />

                {/* Back to home */}
                <div className="absolute top-6 left-6">
                    <Link href="/" className="flex items-center gap-2.5 group">
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
                        <h1 className="font-display text-3xl font-bold text-white">Bienvenido de nuevo</h1>
                        <p className="text-gray-500">Accede a tu cuenta para gestionar tus planos</p>
                    </div>

                    {/* Reset Success Message */}
                    {resetSuccess && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 animate-fade-in">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <p className="text-sm text-emerald-400 font-medium">
                                Contraseña actualizada. Ya puedes iniciar sesión.
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-11"
                                    placeholder="tu@email.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-11 pr-11"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link
                                href="/auth/olvide-mi-contrasena"
                                className="text-xs font-medium text-gray-500 hover:text-brand-blue-light transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {error && (
                            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="btn-primary w-full py-3.5 mt-2"
                        >
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Entrar a mi cuenta
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-brand-slate-deeper px-2 text-gray-500 font-medium tracking-widest">O continúa con</span>
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
                        ¿No tienes cuenta?{" "}
                        <Link href="/auth/registro" className="text-brand-blue hover:text-brand-blue-light font-medium transition-colors">
                            Regístrate gratis
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right: Decorative */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-brand-slate via-brand-slate-dark to-brand-slate-deeper relative overflow-hidden">
                <div className="absolute inset-0 bg-hero-pattern" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-blue-dark/15 rounded-full blur-[60px]" />

                <div className="relative z-10 p-12 text-center space-y-6">
                    <div className="relative w-32 h-32 mx-auto animate-float">
                        <Image src={LOGO_SRC} alt="ARQOVEX" fill sizes="100vw" className="object-contain" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-display text-2xl font-bold text-white">ARQOVEX</h2>
                        <p className="text-brand-blue font-medium">Planos para el Futuro</p>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs italic">
                        &quot;La arquitectura es el arte que nos permite crear nuestros sueños y llevarlos a la realidad.&quot;
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-brand-slate-deeper flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
