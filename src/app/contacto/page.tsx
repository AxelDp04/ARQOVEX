"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Loader2, CheckCircle, MessageCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

const servicios = [
    "Diseño de Vivienda Unifamiliar",
    "Proyecto Comercial",
    "Remodelación",
    "Asesoría Arquitectónica",
    "Diseño de Interiores",
    "Otro",
];

const contactInfo = [
    { icon: MapPin, label: "Ubicación", value: "República Dominicana y Latinoamérica" },
    { icon: Phone, label: "Teléfono", value: "+1 (829) 650-3337" },
    { icon: Mail, label: "Email", value: "Arqovex@gmail.com" },
    { icon: Clock, label: "Horario", value: "Lun – Vie: 8am – 6pm (VET)" },
];

export default function ContactoPage() {
    const [form, setForm] = useState({ nombre: "", email: "", telefono: "", tipo: servicios[0], mensaje: "" });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Enviar a API de proyectos (correo + base de datos)
            const response = await fetch('/api/proyectos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: form.nombre,
                    email: form.email,
                    telefono: form.telefono,
                    tipo_servicio: form.tipo,
                    mensaje: form.mensaje,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // 2. Abrir WhatsApp automáticamente (persistente independiente del correo)
                const phone = "18296503337"; // Central ARQOVEX Oficial
                const whatsappMessage = `Hola equipo de ARQOVEX, acabo de enviar una solicitud para un ${form.tipo} desde la web oficial. Mi nombre es ${form.nombre} y espero su contacto para iniciar la consultoría profesional.`;
                const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
                
                // Abrir WhatsApp en nueva pestaña
                window.open(whatsappUrl, "_blank");
                
                // 3. Mostrar mensaje de éxito
                setSuccess(true);
            } else {
                setError(data.error || 'Error al enviar la solicitud');
            }
        } catch {
            setError('Error de conexión. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="pt-24 pb-16 min-h-screen">
                {/* Header */}
                <div className="container-section mb-16">
                    <div className="text-center space-y-4">
                        <div className="badge-blue mx-auto w-fit">Contáctanos</div>
                        <h1 className="section-title">
                            Hablemos de tu{" "}
                            <span className="bg-gradient-to-r from-brand-blue to-brand-blue-light bg-clip-text text-transparent">
                                proyecto
                            </span>
                        </h1>
                        <p className="section-subtitle mx-auto text-center max-w-xl">
                            ¿Tienes una idea? Nuestro equipo de arquitectos está listo para convertirla
                            en realidad. Escríbenos y te respondemos en menos de 24 horas.
                        </p>
                    </div>
                </div>

                <div className="container-section">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                        {/* Contact info */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="glass-card p-8 space-y-6">
                                <h2 className="font-display text-xl font-bold text-white">Información de Contacto</h2>
                                <div className="space-y-4">
                                    {contactInfo.map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Icon className="w-5 h-5 text-brand-blue" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</div>
                                                <div className="text-sm text-white mt-0.5">{value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* FAQ quick links */}
                            <div className="glass-card p-6 space-y-4">
                                <h3 className="font-display text-base font-semibold text-white">Preguntas Frecuentes</h3>
                                {[
                                    "¿Los planos incluyen memoria descriptiva?",
                                    "¿Puedo solicitar modificaciones al plano?",
                                    "¿En qué formatos entrego los planos?",
                                ].map((q) => (
                                    <div key={q} className="flex items-start gap-2 group cursor-pointer">
                                        <span className="text-brand-blue mt-0.5 text-xs">▸</span>
                                        <span className="text-sm text-gray-400 group-hover:text-white transition-colors leading-relaxed">{q}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form */}
                        <div className="lg:col-span-3">
                            {success ? (
                                <div className="glass-card p-12 text-center space-y-5">
                                    <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h3 className="font-display text-2xl font-bold text-white">¡Solicitud Recibida! 🏛️</h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        El equipo técnico de ARQOVEX está revisando tus detalles. Te contactarán en menos de 24h para tu consultoría de ingeniería.
                                    </p>
                                    <button
                                        onClick={() => { setSuccess(false); setForm({ nombre: "", email: "", telefono: "", tipo: servicios[0], mensaje: "" }); }}
                                        className="btn-secondary mt-4"
                                    >
                                        Enviar otro mensaje
                                    </button>
                                </div>
                            ) : (
                                <div className="glass-card p-8">
                                    <h2 className="font-display text-xl font-bold text-white mb-6">Solicitar Servicio</h2>
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nombre *</label>
                                                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-field" placeholder="Tu nombre completo" required />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email *</label>
                                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="tu@email.com" required />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Teléfono</label>
                                                <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="input-field" placeholder="+1 829 650 3337" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo de Servicio *</label>
                                                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="input-field" required>
                                                    {servicios.map((s) => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Mensaje *</label>
                                            <textarea
                                                value={form.mensaje}
                                                onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                                                className="input-field min-h-[140px] resize-none"
                                                placeholder="Cuéntanos sobre tu proyecto: ubicación, terreno disponible, estilo que prefieres, presupuesto aproximado..."
                                                required
                                                rows={6}
                                            />
                                        </div>

                                        {error && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}

                                        <button type="submit" disabled={loading} className="btn-primary w-full py-4 bg-brand-gradient border-none group">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                <>
                                                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    <span>Enviar Solicitud de Proyecto</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
