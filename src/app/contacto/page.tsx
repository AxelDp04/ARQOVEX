"use client";

import { useEffect, useState } from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Loader2, 
  CheckCircle, 
  MessageCircle, 
  Building2, 
  Home, 
  Paintbrush, 
  Layout, 
  PlusCircle, 
  ArrowRight, 
  ArrowLeft,
  Ruler,
  Layers,
  ClipboardEdit,
  Quote,
  CalendarDays
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import StepCard from "@/components/solicitudes/StepCard";
import ProjectBriefSummary from "@/components/solicitudes/ProjectBriefSummary";
import PlanoCard from "@/components/ui/PlanoCard";
import { createClient } from "@/lib/supabase/client";
import type { Plano } from "@/types";

const CATEGORIAS = [
  { id: "viv-unifamiliar", title: "Residencial", desc: "Viviendas unifamiliares y villas", icon: Home },
  { id: "comercial", title: "Comercial", desc: "Locales, plazas y oficinas", icon: Building2 },
  { id: "remodelacion", title: "Remodelación", desc: "Renovación de espacios existentes", icon: Paintbrush },
  { id: "interiorismo", title: "Interiorismo", desc: "Diseño de interiores y mobiliario", icon: Layout },
  { id: "otro", title: "Otros", desc: "Consultoría técnica y otros", icon: PlusCircle },
];

const ESTILOS = [
  { id: "moderno", title: "Moderno / Minimalista", desc: "Líneas puras y funcionalidad extrema" },
  { id: "industrial", title: "Industrial", desc: "Materiales crudos y estructuras vistas" },
  { id: "tropical", title: "Tropical Moderno", desc: "Integración con la naturaleza y frescura" },
  { id: "clasico", title: "Clásico Contemporáneo", desc: "Elegancia atemporal con toques modernos" },
];

const contactInfo = [
  { icon: MapPin, label: "Ubicación", value: "República Dominicana y Latinoamérica" },
  { icon: Phone, label: "Teléfono", value: "+1 (829) 650-3337" },
  { icon: Mail, label: "Email", value: "Arqovex@gmail.com" },
  { icon: Clock, label: "Horario", value: "Lun – Vie: 8am – 6pm (VET)" },
];

export default function ContactoPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featuredPlans, setFeaturedPlans] = useState<Plano[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from("planos")
        .select(`
          *,
          categoria:categorias(*),
          galeria:galeria_propiedades!fk_galeria_plano(imagen_url)
        `)
        .eq("destacado", true)
        .eq("estado_revision", "publicado")
        .limit(3)
        .order("created_at", { ascending: false });
      
      if (data) setFeaturedPlans(data as Plano[]);
      setPlansLoading(false);
    };
    fetchFeatured();
  }, [supabase]);

  const [form, setForm] = useState({
    categoria: null as string | null,
    area: "150",
    niveles: "1",
    ubicacion: "",
    estilo: null as string | null,
    nombre: "",
    email: "",
    telefono: "",
    mensaje: ""
  });

  const briefItems = [
    { label: "Tipo de Proyecto", value: CATEGORIAS.find(c => c.id === form.categoria)?.title || null },
    { label: "Área Estimada", value: form.area ? `${form.area} m²` : null },
    { label: "Niveles", value: form.niveles ? `${form.niveles} nivel(es)` : null },
    { label: "Estilo", value: ESTILOS.find(e => e.id === form.estilo)?.title || null },
    { label: "Ubicación", value: form.ubicacion || null },
  ];

  const canGoNext = () => {
    if (step === 1) return form.categoria !== null;
    if (step === 2) return form.ubicacion.length > 3;
    if (step === 3) return form.estilo !== null;
    return true;
  };

  const handleNext = () => {
    if (canGoNext()) setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fullMensaje = `
[DETALLES TÉCNICOS]
Tipo: ${briefItems[0].value}
Área: ${briefItems[1].value}
Niveles: ${briefItems[2].value}
Estilo: ${briefItems[3].value}
Ubicación: ${briefItems[4].value}

[MENSAJE ADICIONAL]
${form.mensaje || "Sin mensaje adicional."}
    `.trim();

    try {
      const response = await fetch('/api/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          telefono: form.telefono,
          tipo_servicio: briefItems[0].value,
          mensaje: fullMensaje,
        }),
      });

      if (response.ok) {
        const phone = "18296503337";
        const whatsappMessage = `Hola equipo de ARQOVEX, acabo de enviar una solicitud detallada para un ${briefItems[0].value}. 
Configuración Técnica: ${form.area}m², ${form.niveles} niveles, Estilo ${briefItems[3].value}. 
Ubicación: ${form.ubicacion}. 
Mi nombre es ${form.nombre}.`;
        
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, "_blank");
        setSuccess(true);
      } else {
        const data = await response.json();
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
      <div className="pt-32 pb-20 min-h-screen bg-[#020408] relative overflow-hidden">
        {/* Premium Background Image with Ken Burns Effect */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 0.35,
              transition: { duration: 2, ease: "easeOut" } 
            }}
            className="relative w-full h-full"
          >
            <Image
              src="/contact-premium-bg.png"
              alt="ARQOVEX Premium Environment"
              fill
              className="object-cover grayscale-[30%] contrast-[1.1]"
              priority
            />
          </motion.div>
          {/* Overlays for readability and depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020408] via-[#020408]/60 to-[#020408]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020408] via-transparent to-[#020408]/40" />
          
          {/* Technical Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ 
              backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
              backgroundSize: "60px 60px" 
            }} 
          />
        </div>

        {/* Background Decorative Glows */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/20 to-transparent z-10" />
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-brand-blue/3 blur-[100px] pointer-events-none z-0" />

        <div className="container-section relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-12">
              
              {/* Left Column: Form Flow */}
              <div className="lg:col-span-8 flex flex-col">
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-2 text-brand-blue">
                    <ClipboardEdit className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Portal de Solicitud</span>
                  </div>
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                    {step === 4 ? "Finaliza tu " : "Configura tu "}
                    <span className="bg-gradient-to-r from-brand-blue to-brand-blue-light bg-clip-text text-transparent">
                      proyecto ideal
                    </span>
                  </h1>
                </div>

                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-12 text-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                      </div>
                      <h2 className="font-display text-2xl font-bold text-white mb-4">¡Brief Recibido con Éxito!</h2>
                      <p className="text-gray-400 mb-8 max-w-md mx-auto">
                        Nuestro equipo de ingeniería ha recibido tus especificaciones técnicas. 
                        Un consultor senior revisará tu brief y te contactará en menos de 24 horas.
                      </p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue-dark transition-all"
                      >
                        Nueva Solicitud
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex-1"
                    >
                      {/* Step 1: Category */}
                      {step === 1 && (
                        <div className="space-y-8">
                          <p className="text-gray-400">¿Qué tipo de proyecto tienes en mente?</p>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {CATEGORIAS.map((cat) => (
                              <StepCard
                                key={cat.id}
                                icon={cat.icon}
                                title={cat.title}
                                description={cat.desc}
                                selected={form.categoria === cat.id}
                                onClick={() => setForm({ ...form, categoria: cat.id })}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 2: Technical Specs */}
                      {step === 2 && (
                        <div className="space-y-10">
                          <p className="text-gray-400">Define las dimensiones técnicas de tu proyecto:</p>
                          
                          <div className="space-y-8">
                            <div className="space-y-4">
                              <div className="flex justify-between">
                                <label className="text-sm font-bold text-white flex items-center gap-2">
                                  <Ruler className="w-4 h-4 text-brand-blue" />
                                  Área estimada ($m^2$)
                                </label>
                                <span className="text-brand-blue font-display font-bold">{form.area} $m^2$</span>
                              </div>
                              <input 
                                type="range" 
                                min="50" max="2000" step="10"
                                value={form.area}
                                onChange={(e) => setForm({ ...form, area: e.target.value })}
                                className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                              />
                              <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest">
                                <span>50 m²</span>
                                <span>2000+ m²</span>
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <label className="text-sm font-bold text-white flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-brand-blue" />
                                  Número de niveles
                                </label>
                                <div className="flex gap-2">
                                  {["1", "2", "3", "4+"].map((n) => (
                                    <button
                                      key={n}
                                      onClick={() => setForm({ ...form, niveles: n })}
                                      className={`flex-1 py-3 rounded-xl border transition-all ${
                                        form.niveles === n 
                                          ? "bg-brand-blue border-brand-blue text-white" 
                                          : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                                      }`}
                                    >
                                      {n}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <label className="text-sm font-bold text-white flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-brand-blue" />
                                  Ubicación del terreno
                                </label>
                                <input 
                                  type="text"
                                  placeholder="Ej: Santo Domingo, Las Terrenas..."
                                  value={form.ubicacion}
                                  onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                                  className="input-field py-3.5"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Style */}
                      {step === 3 && (
                        <div className="space-y-8">
                          <p className="text-gray-400">¿Qué identidad arquitectónica prefieres?</p>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {ESTILOS.map((estilo) => (
                              <button
                                key={estilo.id}
                                onClick={() => setForm({ ...form, estilo: estilo.id })}
                                className={`p-6 text-left rounded-2xl border transition-all ${
                                  form.estilo === estilo.id
                                    ? "bg-brand-blue/10 border-brand-blue shadow-[0_0_20px_rgba(0,102,255,0.15)]"
                                    : "bg-white/5 border-white/10 hover:border-white/20"
                                }`}
                              >
                                <h3 className={`font-bold ${form.estilo === estilo.id ? "text-white" : "text-gray-300"}`}>
                                  {estilo.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-2">{estilo.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 4: Contact */}
                      {step === 4 && (
                        <div className="space-y-6">
                          <p className="text-gray-400">Completa tus datos profesionales para recibir la propuesta:</p>
                          <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-5">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nombre Completo</label>
                                <input 
                                  type="text" required
                                  value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                  className="input-field" placeholder="Axel Pérez"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Correo Electrónico</label>
                                <input 
                                  type="email" required
                                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                  className="input-field" placeholder="axel@arqovex.com"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">WhatsApp / Teléfono</label>
                              <input 
                                type="tel" required
                                value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                className="input-field" placeholder="+1 (829) 650-3337"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Notas adicionales (opcional)</label>
                              <textarea 
                                value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                                className="input-field min-h-[120px] resize-none"
                                placeholder="Cuéntanos más detalles..."
                              />
                            </div>

                            {error && (
                              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                              </div>
                            )}

                            <button
                              type="submit"
                              disabled={loading}
                              className="w-full py-4 bg-brand-gradient text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(0,102,255,0.4)] transition-all flex items-center justify-center gap-2 group"
                            >
                              {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <>
                                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                  <span>Enviar Brief de Proyecto</span>
                                </>
                              )}
                            </button>
                          </form>
                        </div>
                      )}

                      {/* Navigation buttons */}
                      {!success && step < 4 && (
                        <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                          {step > 1 ? (
                            <button
                              onClick={handleBack}
                              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              Atrás
                            </button>
                          ) : <div />}

                          <button
                            onClick={handleNext}
                            disabled={!canGoNext()}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                              canGoNext()
                                ? "bg-brand-blue text-white hover:bg-brand-blue-dark"
                                : "bg-white/5 text-gray-600 cursor-not-allowed"
                            }`}
                          >
                            Siguiente
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: Brief Summary */}
              <div className="lg:col-span-4 lg:block hidden">
                <div className="sticky top-32 space-y-6">
                  <ProjectBriefSummary items={briefItems} />
                  
                  <div className="glass-card p-6 border-white/5 bg-white/[0.01]">
                    <h4 className="font-display font-bold text-white text-sm mb-4">Ayuda Directa</h4>
                    <div className="space-y-4">
                      {/* WhatsApp Robert */}
                      <button 
                        onClick={() => {
                          const phone = "18296503337";
                          const msg = "Hola, necesito una asesoría profesional con el equipo de ARQOVEX para mi próximo proyecto.";
                          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
                        }}
                        className="w-full flex items-center gap-4 p-3 rounded-xl bg-brand-blue/10 border border-brand-blue/20 hover:bg-brand-blue/20 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-brand-blue flex items-center justify-center shrink-0">
                          <CalendarDays className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-white">Agendar Cita</p>
                          <p className="text-[10px] text-brand-blue-light font-medium uppercase tracking-wider">Asesoría Profesional ARQOVEX</p>
                        </div>
                      </button>

                      <div className="h-px bg-white/5 my-2" />

                      {contactInfo.map((info) => (
                        <div key={info.label} className="flex gap-3">
                          <info.icon className="w-4 h-4 text-brand-blue flex-shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{info.label}</p>
                            <p className="text-xs text-white mt-0.5">{info.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* New Inspiration Section */}
        <section className="relative pt-32 pb-40 overflow-hidden bg-transparent">
          <div className="container-section relative z-10">
            {/* Motivational Quote */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center mb-32"
            >
              <div className="flex justify-center mb-8">
                <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center">
                  <Quote className="w-6 h-6 text-brand-blue" />
                </div>
              </div>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-8">
                "La arquitectura es el punto de partida para{" "}
                <span className="bg-gradient-to-r from-brand-blue to-brand-blue-light bg-clip-text text-transparent italic">
                  transformar la realidad
                </span>{" "}
                en excelencia."
              </h2>
              <div className="flex items-center justify-center gap-4">
                <div className="w-8 h-px bg-white/20" />
                <p className="text-sm font-bold uppercase tracking-[0.4em] text-gray-500">Filosofía ARQOVEX</p>
                <div className="w-8 h-px bg-white/20" />
              </div>
            </motion.div>

            {/* Featured Designs Heading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-blue">Portafolio Técnico</p>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-white">
                  Diseños que <span className="text-gray-500">marcan el estándar</span>
                </h3>
              </div>
              <Link 
                href="/catalogo"
                className="group flex items-center gap-3 text-sm font-bold text-white hover:text-brand-blue transition-colors"
              >
                Explorar catálogo completo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Designs Grid */}
            {plansLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                {featuredPlans.map((plano, index) => (
                  <motion.div
                    key={plano.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PlanoCard plano={plano} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Motivational Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-32 text-center"
            >
              <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                Cada uno de nuestros proyectos es el resultado de un riguroso proceso de ingeniería y una pasión incondicional por el diseño moderno.
              </p>
              <div className="mt-12">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-8 py-4 border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/5 transition-all"
                >
                  Regresar al portal de solicitud
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
