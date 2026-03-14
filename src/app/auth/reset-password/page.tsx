"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const validatePassword = (pass: string) => {
        if (pass.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
        if (!/[0-9]/.test(pass)) return "La contraseña debe incluir al menos un número.";
        return null;
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationError = validatePassword(password);
        if (validationError) {
            setError(validationError);
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            setTimeout(() => {
                router.push("/auth/login");
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left: Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-brand-slate-deeper relative">
                <div className="absolute inset-0 bg-hero-pattern opacity-50" />

                <div className="w-full max-w-md relative z-10">
                    <div className="mb-8 space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center mb-4 text-brand-blue">
                             <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h1 className="font-display text-3xl font-bold text-white">Nueva contraseña</h1>
                        <p className="text-gray-500">Define tu nueva contraseña de acceso seguro</p>
                    </div>

                    {success ? (
                        <div className="px-6 py-8 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 text-center space-y-4">
                            <div className="w-12 h-12 bg-brand-blue/20 rounded-full flex items-center justify-center mx-auto text-brand-blue">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-white">¡Actualizada con éxito!</h3>
                                <p className="text-gray-400 text-sm">Tu contraseña ha sido actualizada. Redirigiendo al login...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nueva Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field pl-11 pr-11"
                                        placeholder="Mínimo 8 caracteres"
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

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Confirmar Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input-field pl-11"
                                        placeholder="Repite tu contraseña"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Requisitos de Seguridad</p>
                                <ul className="text-xs text-gray-400 space-y-1">
                                    <li className={`flex items-center gap-2 ${password.length >= 8 ? "text-emerald-400" : ""}`}>
                                        <div className={`w-1 h-1 rounded-full ${password.length >= 8 ? "bg-emerald-400" : "bg-gray-600"}`} />
                                        Mínimo 8 caracteres
                                    </li>
                                    <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? "text-emerald-400" : ""}`}>
                                        <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(password) ? "bg-emerald-400" : "bg-gray-600"}`} />
                                        Al menos un número
                                    </li>
                                </ul>
                            </div>

                            {error && (
                                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3.5 mt-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Actualizar Contraseña
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Right Side: Visual */}
             <div className="hidden lg:flex flex-1 items-center justify-center bg-brand-slate-deeper relative overflow-hidden">
                <div className="absolute inset-0 bg-hero-pattern" />
                <div className="relative p-12 text-center">
                    <div className="relative w-32 h-32 mx-auto animate-float">
                        <Image src="/Logo.png" alt="ARQOVEX" fill className="object-contain" />
                    </div>
                    <div className="mt-8 space-y-2">
                        <h2 className="text-2xl font-bold text-white font-display">Control Total</h2>
                        <p className="text-brand-blue">Tu llave a los mejores diseños</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
