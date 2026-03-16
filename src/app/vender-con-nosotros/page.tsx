"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Instagram,
  Facebook,
  Linkedin,
  User,
  Globe,
  ChevronRight,
  Loader2,
  ArrowUpRight,
  Zap,
  Building2,
  BarChart3,
  Globe as GlobeIcon,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function VenderConNosotrosPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre_completo: "",
    cedula: "",
    telefono: "",
    bio: "",
    instagram: "",
    facebook: "",
    linkedin: "",
  });

  const steps = [
    { id: 1, title: "Perfil", icon: User },
    { id: 2, title: "Redes", icon: Globe },
    { id: 3, title: "Enviar", icon: ShieldCheck },
  ];

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login?returnTo=/vender-con-nosotros");
        return;
      }
      const { error: insertError } = await supabase.from("solicitudes_vendedores").insert([
        {
          usuario_id: user.id,
          nombre_completo: formData.nombre_completo,
          cedula: formData.cedula || null,
          telefono: formData.telefono,
          bio: formData.bio,
          social_links: {
            instagram: formData.instagram,
            facebook: formData.facebook,
            linkedin: formData.linkedin,
          },
        },
      ]);
      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Error al enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Zap, title: "Visibilidad", desc: "Tu portafolio ante el mercado internacional." },
    { icon: Building2, title: "Infraestructura", desc: "Plataforma técnica de alta disponibilidad." },
    { icon: BarChart3, title: "Conversión", desc: "Arquitectura de datos pensada para resultados." },
    { icon: GlobeIcon, title: "Curaduría", desc: "Estándares de ingeniería y diseño." },
  ];

  return (
    <MainLayout>
      <div className="bg-[var(--page-bg)] text-white min-h-screen">
        {/* Hero */}
        <section className="relative pt-24 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[var(--page-bg)]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0066FF]/40 to-transparent" />
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#0066FF]/6 blur-[120px]" />
          </div>
          <div className="container-section relative z-10">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#4D94FF] mb-4">
                Programa de socios
              </p>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white">
                Asóciate con{" "}
                <span className="bg-gradient-to-r from-[#0066FF] to-[#4D94FF] bg-clip-text text-transparent">
                  ARQOVEX
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-400 max-w-xl leading-relaxed">
                Forma parte de la infraestructura donde el diseño arquitectónico y la gestión inmobiliaria se unen. Publica tus proyectos y llega a más clientes.
              </p>
              <a
                href="#formulario"
                className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 bg-[#0066FF] text-white font-semibold rounded-lg hover:bg-[#0052cc] transition-colors"
              >
                Solicitar ingreso
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="py-10 border-y border-white/[0.06]">
          <div className="container-section">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "V.2026", label: "Innovación continua" },
                { value: "100%", label: "Digital" },
                { value: "TECH", label: "Estándar técnico" },
                { value: "RD + LATAM", label: "Cobertura" },
              ].map((s) => (
                <div key={s.value}>
                  <div className="font-display text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 md:py-32">
          <div className="container-section">
            <div className="max-w-2xl mb-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4D94FF] mb-3">
                Ventajas
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
                Infraestructura para{" "}
                <span className="bg-gradient-to-r from-[#0066FF] to-[#4D94FF] bg-clip-text text-transparent">
                  profesionales
                </span>
              </h2>
              <p className="mt-4 text-gray-400 leading-relaxed">
                No somos un portal más. Es el sistema donde tu firma gana visibilidad y el mercado encuentra proyectos curados.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.title}
                    className="bg-[#050810]/95 p-6 md:p-8 group hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#0066FF]/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-[#4D94FF]" />
                    </div>
                    <h3 className="font-display font-semibold text-white mb-2">{b.title}</h3>
                    <p className="text-sm text-gray-500">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="py-20 border-y border-white/[0.06]">
          <div className="container-section max-w-2xl text-center">
            <p className="font-display text-xl md:text-2xl text-white/90 leading-snug">
              &quot;ARQOVEX es el curador de la arquitectura moderna del Caribe para el mundo.&quot;
            </p>
            <p className="mt-6 text-sm text-gray-500 uppercase tracking-widest">
              ARQOVEX · Built for professionals
            </p>
          </div>
        </section>

        {/* Form */}
        <section id="formulario" className="py-24 md:py-32">
          <div className="container-section max-w-xl">
            <div className="mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4D94FF] mb-2">
                Solicitud
              </p>
              <h2 className="font-display text-3xl font-bold text-white">
                Portal de aspirantes
              </h2>
              <p className="mt-2 text-gray-500 text-sm">
                Proceso de selección. Completa los pasos y envíanos tu perfil.
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-10 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-2">
                  Solicitud recibida
                </h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8">
                  Revisaremos tu perfil en las próximas 48 horas. Te contactaremos por los canales que indicaste.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0066FF] text-white font-semibold rounded-lg hover:bg-[#0052cc] transition-colors"
                >
                  Ir a mi dashboard
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-10">
                {/* Stepper */}
                <div className="flex justify-between mb-10 relative">
                  <div className="absolute left-0 right-0 top-5 h-px bg-white/[0.06] -z-0" />
                  {steps.map((s) => (
                    <div key={s.id} className="flex flex-col items-center gap-2 relative z-10">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                          step >= s.id
                            ? "bg-[#0066FF] border-[#0066FF] text-white"
                            : "bg-[var(--page-bg)] border-white/10 text-gray-500"
                        }`}
                      >
                        {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                      </div>
                      <span className={`text-xs font-medium ${step >= s.id ? "text-[#4D94FF]" : "text-gray-500"}`}>
                        {s.title}
                      </span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="s1"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        className="space-y-6"
                      >
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">Nombre o firma</label>
                          <input
                            type="text"
                            placeholder="Ej: Axel Perez Architects"
                            value={formData.nombre_completo}
                            onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">Cédula</label>
                          <input
                            type="text"
                            placeholder="Ej: 001-1234567-8"
                            value={formData.cedula}
                            onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">Teléfono / WhatsApp</label>
                          <input
                            type="tel"
                            placeholder="+1 (809) 000-0000"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">Visión profesional</label>
                          <textarea
                            placeholder="Describe tu trayectoria y por qué quieres asociarte..."
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0066FF]/60 focus:bg-white/[0.08] transition-all min-h-[120px] resize-y"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleNext}
                          className="w-full py-3.5 bg-[#0066FF] text-white font-semibold rounded-lg hover:bg-[#0052cc] transition-colors flex items-center justify-center gap-2"
                        >
                          Siguiente
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="s2"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        className="space-y-6"
                      >
                        <p className="text-sm text-gray-500 text-center mb-4">
                          Enlaces a tu presencia digital (opcionales)
                        </p>
                        {[
                          { icon: Instagram, name: "instagram", label: "Instagram" },
                          { icon: Linkedin, name: "linkedin", label: "LinkedIn" },
                          { icon: Facebook, name: "facebook", label: "Facebook o web" },
                        ].map((s) => (
                          <div key={s.name} className="relative">
                            <s.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type="url"
                              placeholder={s.label}
                              value={formData[s.name as keyof typeof formData]}
                              onChange={(e) => setFormData({ ...formData, [s.name]: e.target.value })}
                              className="input-field pl-12"
                            />
                          </div>
                        ))}
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={handleBack}
                            className="flex-1 py-3.5 border border-white/10 text-gray-400 font-semibold rounded-lg hover:bg-white/5 transition-colors"
                          >
                            Atrás
                          </button>
                          <button
                            type="button"
                            onClick={handleNext}
                            className="flex-1 py-3.5 bg-[#0066FF] text-white font-semibold rounded-lg hover:bg-[#0052cc] transition-colors"
                          >
                            Siguiente
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="s3"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        className="space-y-6"
                      >
                        <div className="p-6 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/20 text-center">
                          <p className="text-sm text-white/90">
                            Al enviar aceptas los términos de uso y la política de privacidad de ARQOVEX.
                          </p>
                        </div>
                        {error && (
                          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                          </div>
                        )}
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleBack}
                            disabled={loading}
                            className="flex-1 py-3.5 border border-white/10 text-gray-400 font-semibold rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
                          >
                            Editar
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3.5 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar solicitud"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* CTA strip */}
        <section className="py-12 border-t border-white/[0.06]">
          <div className="container-section text-center">
            <p className="text-sm text-gray-500">
              ¿Dudas? Escríbenos a{" "}
              <a href="mailto:Arqovex@gmail.com" className="text-[#4D94FF] hover:text-white transition-colors">
                Arqovex@gmail.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
