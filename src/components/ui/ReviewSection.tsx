"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Star, MessageSquare, Send, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Resena } from "@/types";

interface ReviewSectionProps {
    planoId: string;
    userId: string | undefined;
}

export default function ReviewSection({ planoId, userId }: ReviewSectionProps) {
    const [resenas, setResenas] = useState<Resena[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [comentario, setComentario] = useState("");
    const [estrellas, setEstrellas] = useState(5);
    const [hover, setHover] = useState(0);
    const [success, setSuccess] = useState(false);

    const supabase = createClient();

    const fetchResenas = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("resenas")
                .select("*, usuario:perfiles(nombre_completo, avatar_url, email)")
                .eq("plano_id", planoId)
                .eq("aprobado", true)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching reviews:", error.message);
            } else {
                setResenas(data as Resena[]);
            }
        } catch (err) {
            console.error("Exception fetching reviews:", err);
        }
        setLoading(false);
    }, [planoId, supabase]);

    useEffect(() => {
        if (planoId) fetchResenas();
    }, [planoId, fetchResenas]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        if (!comentario.trim()) return;

        setSubmitting(true);
        try {
            const { error } = await supabase.from("resenas").insert({
                usuario_id: userId,
                plano_id: planoId,
                estrellas,
                comentario,
                aprobado: false // Needs admin approval
            });

            if (error) {
                console.error("Error submitting review:", error.message);
            } else {
                setSuccess(true);
                setComentario("");
                setEstrellas(5);
                setTimeout(() => setSuccess(false), 5000);
            }
        } catch (err) {
            console.error("Exception submitting review:", err);
        }
        setSubmitting(false);
    };

    return (
        <div className="space-y-8 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-brand-blue" />
                </div>
                <h2 className="font-display text-2xl font-bold text-white">Opiniones de Clientes</h2>
            </div>

            {/* Formulario de Reseña */}
            {userId ? (
                <form onSubmit={handleSubmit} className="glass-card p-6 border-white/5 space-y-4">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm font-medium text-gray-400">Tu Calificación:</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setEstrellas(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-6 h-6 ${(hover || estrellas) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <textarea
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            placeholder="Comparte tu experiencia con este diseño..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-brand-blue/50 min-h-[100px] transition-colors"
                            required
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-[10px] text-gray-500 italic">
                            *Tu comentario será revisado por un moderador antes de ser publicado.
                        </p>
                        <button
                            type="submit"
                            disabled={submitting || !comentario.trim()}
                            className="btn-primary py-2 px-6 text-sm flex items-center gap-2 shadow-blue-glow group disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                            Enviar Reseña
                        </button>
                    </div>

                    {success && (
                        <div className="flex items-center gap-2 text-green-400 text-sm py-2 animate-fade-in">
                            <CheckCircle2 className="w-4 h-4" />
                            ¡Reseña enviada con éxito! Pendiente de aprobación.
                        </div>
                    )}
                </form>
            ) : (
                <div className="p-6 rounded-xl bg-brand-blue/5 border border-brand-blue/10 text-center">
                    <p className="text-sm text-gray-400 italic">
                        Debes <a href="/auth/login" className="text-brand-blue hover:underline">iniciar sesión</a> para dejar una opinión.
                    </p>
                </div>
            )}

            {/* Lista de Reseñas */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                    </div>
                ) : resenas.length > 0 ? (
                    resenas.map((r: Resena) => (
                        <div key={r.id} className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                            <div className="flex-shrink-0">
                                {r.usuario?.avatar_url ? (
                                    <Image 
                                        src={r.usuario.avatar_url} 
                                        alt={r.usuario.nombre_completo} 
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded-full border border-brand-blue/20 object-cover" 
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center border border-white/10 backdrop-blur-sm shadow-inner group-hover:border-brand-blue/30 transition-colors">
                                        <span className="font-display font-bold text-xl text-brand-blue-light uppercase">
                                            {(r.usuario?.nombre_completo || "U").charAt(0)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-white">
                                        {r.usuario?.nombre_completo || 
                                         (r.usuario?.email ? r.usuario.email.split("@")[0] : "Usuario ARQOVEX")}
                                    </h4>
                                    <span className="text-[10px] text-gray-600">{new Date(r.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex gap-0.5 mb-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className={`w-3 h-3 ${r.estrellas >= s ? "fill-yellow-400 text-yellow-400" : "text-gray-700"}`} />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed italic">&quot;{r.comentario}&quot;</p>
                                
                                {r.respuesta_admin && (
                                    <div className="mt-4 p-3 rounded-xl bg-brand-blue/5 border border-brand-blue/10 flex gap-3 items-start animate-fade-in">
                                        <div className="w-6 h-6 rounded-full bg-brand-gradient flex items-center justify-center shrink-0 shadow-blue-glow">
                                            <span className="text-[10px] font-bold text-white">A</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h5 className="text-xs font-bold text-brand-blue-light">Robert Pérez (ARQOVEX)</h5>
                                                <CheckCircle2 className="w-3 h-3 text-brand-blue" />
                                            </div>
                                            <p className="text-xs text-gray-300 leading-relaxed">{r.respuesta_admin}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                        <p className="text-gray-600 text-sm">Aún no hay opiniones aprobadas para esta propiedad.</p>
                        <p className="text-gray-700 text-xs mt-1">¡Sé el primero en calificarla!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
