"use client";

import { useState } from "react";
import { 
    User, Mail, Calendar, MessageSquare, 
    Loader2, CheckCircle2, ChevronRight, Globe
} from "lucide-react";
import { useToast } from "./Toast";

interface CitasFormProps {
    propiedadId: string;
    propiedadTitulo: string;
}

export default function CitasForm({ propiedadId, propiedadTitulo }: CitasFormProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        nombre_completo: "",
        email: "",
        telefono: "",
        fecha_cita: "",
        mensaje: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/citas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    propiedad_id: propiedadId,
                    url_propiedad: window.location.href
                })
            });

            if (res.ok) {
                setSuccess(true);
                showToast("¡Solicitud enviada! El equipo de ARQOVEX se pondrá en contacto contigo pronto.", "success");
            } else {
                const data = await res.json();
                showToast(data.error || "Error al enviar solicitud", "error");
            }
        } catch {
            showToast("Error de conexión", "error");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="glass-card p-8 text-center space-y-4 animate-fade-in border-green-500/20">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">¡Solicitud Enviada!</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Gracias por tu interés en {propiedadTitulo}. El equipo de <strong>ARQOVEX</strong> ha recibido tu solicitud y te contactará en breve.
                </p>
                <button 
                    onClick={() => setSuccess(false)}
                    className="text-brand-blue text-sm font-medium hover:underline pt-2"
                >
                    Enviar otra solicitud
                </button>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 md:p-8 space-y-6 border-white/5 relative overflow-hidden group">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-blue/10 transition-colors" />
            
            <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2 text-brand-blue mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Agendar Visita</span>
                </div>
                <h3 className="font-display text-xl font-bold text-white">¿Te interesa esta propiedad?</h3>
                <p className="text-xs text-gray-500">Completa tus datos para coordinar una cita profesional.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                {/* Nombre */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider ml-1">Nombre Completo</label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            required
                            value={formData.nombre_completo}
                            onChange={e => setFormData({...formData, nombre_completo: e.target.value})}
                            className="input-field pl-11 text-sm h-11"
                            placeholder="Ej: AXEL PEREZ"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider ml-1">Correo Electrónico</label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="input-field pl-11 text-sm h-11"
                            placeholder="tu@email.com"
                        />
                    </div>
                </div>

                {/* Teléfono RD */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                        Teléfono (RD) <Globe className="w-3 h-3 text-emerald-500" />
                    </label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pr-2 border-r border-white/10 h-1/2">
                            <span className="text-[14px]">🇩🇴</span>
                            <span className="text-[12px] text-gray-500 font-bold">+1</span>
                        </div>
                        <input
                            type="tel"
                            required
                            value={formData.telefono}
                            onChange={e => setFormData({...formData, telefono: e.target.value})}
                            className="input-field pl-[72px] text-sm h-11"
                            placeholder="829 000 0000"
                        />
                    </div>
                </div>

                {/* Fecha */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider ml-1">Fecha Sugerida</label>
                    <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={formData.fecha_cita}
                            onChange={e => setFormData({...formData, fecha_cita: e.target.value})}
                            className="input-field pl-11 text-sm h-11 appearance-none"
                        />
                    </div>
                </div>

                {/* Mensaje */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider ml-1">Mensaje (Opcional)</label>
                    <div className="relative">
                        <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                        <textarea
                            rows={3}
                            value={formData.mensaje}
                            onChange={e => setFormData({...formData, mensaje: e.target.value})}
                            className="input-field pl-11 py-3 text-sm min-h-[100px] resize-none"
                            placeholder="Cuéntanos más sobre tu interés..."
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 text-base font-bold shadow-blue-glow group mt-2"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Solicitar Cita Profesional
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
            
            <p className="text-[9px] text-center text-gray-600 uppercase tracking-widest font-medium pt-2">
                Atención preferencial por ARQOVEX Real Estate
            </p>
        </div>
    );
}
