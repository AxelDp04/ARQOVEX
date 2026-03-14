"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
    ShieldCheck, ArrowRight, CheckCircle2, 
    Instagram, Facebook, Linkedin, User, Globe,
    ChevronRight, Loader2, 
    ArrowUpRight, Signature as SignatureIcon,
    Gem, Quote
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ArqovexLogo = () => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
    >
        <div className="flex flex-col items-center">
            <span className="text-white font-black text-4xl tracking-[0.3em] italic">ARQOVEX</span>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent mt-2"></div>
            <span className="text-white/40 text-[8px] font-bold tracking-[0.5em] mt-2 uppercase">Elite Partnership</span>
        </div>
    </motion.div>
);

const TeamCredits = () => (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mt-12 py-8 border-t border-white/5">
        <div className="text-center md:text-left">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Dirección General</p>
            <p className="text-white font-display text-lg italic tracking-tight">Robert Carrasco</p>
        </div>
        <div className="w-[1px] h-8 bg-white/10 hidden md:block"></div>
        <div className="text-center md:text-right">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Desarrollo e Ingeniería</p>
            <p className="text-white font-display text-lg italic tracking-tight">Ing. Axel Perez</p>
        </div>
    </div>
);

export default function VenderConNosotrosPage() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { scrollY } = useScroll();
    
    const yHero = useTransform(scrollY, [0, 800], [0, 300]);
    const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);
    const scaleHero = useTransform(scrollY, [0, 400], [1, 1.1]);

    const [formData, setFormData] = useState({
        nombre_completo: "",
        telefono: "",
        bio: "",
        instagram: "",
        facebook: "",
        linkedin: ""
    });

    const steps = [
        { id: 1, title: "Perfil", icon: User },
        { id: 2, title: "Social", icon: Globe },
        { id: 3, title: "Finalizar", icon: ShieldCheck }
    ];

    const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                router.push("/auth/login?returnTo=/vender-con-nosotros");
                return;
            }

            const { error: insertError } = await supabase
                .from("solicitudes_vendedores")
                .insert([{
                    usuario_id: user.id,
                    nombre_completo: formData.nombre_completo,
                    telefono: formData.telefono,
                    bio: formData.bio,
                    social_links: {
                        instagram: formData.instagram,
                        facebook: formData.facebook,
                        linkedin: formData.linkedin
                    }
                }]);

            if (insertError) throw insertError;

            setSubmitted(true);
        } catch (err: unknown) {
            const error = err as Error;
            console.error(error);
            setError(error.message || "Error al enviar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="bg-[#020308] text-white selection:bg-brand-blue selection:text-white">
                {/* Hero Stage - High Impact */}
                <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                    <motion.div style={{ y: yHero, opacity: opacityHero, scale: scaleHero }} className="absolute inset-0 z-0">
                        <Image 
                            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000"
                            alt="Luxury Architecture"
                            fill
                            className="object-cover opacity-40 grayscale-[40%]"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#020308]/60 via-[#020308]/80 to-[#020308]"></div>
                    </motion.div>

                    <div className="container-section relative z-10 text-center space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-card border-white/10 text-brand-blue-light text-[10px] font-black tracking-[0.4em] uppercase"
                        >
                            <Gem className="w-4 h-4 animate-pulse" />
                            Elite Partner Program
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, filter: "blur(20px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            transition={{ duration: 1.5, delay: 0.2 }}
                            className="font-display text-7xl md:text-[120px] font-black leading-[0.85] tracking-tighter"
                        >
                            <span className="block italic">DISRUPCIÓN</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-blue to-white/40">TÉCNICA.</span>
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="max-w-2xl mx-auto text-xl text-gray-400 font-light leading-relaxed"
                        >
                            No somos una inmobiliaria más. Somos la infraestructura tecnológica 
                            donde el diseño arquitectónico trasciende hacia el futuro digital.
                        </motion.p>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1 }}
                            className="flex flex-col items-center gap-8 pt-8"
                        >
                            <button 
                                onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}
                                className="group relative px-12 py-6 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-brand-blue hover:text-white transition-all duration-500 rounded-full"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Iniciar Alianza <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </span>
                            </button>
                            <ArqovexLogo />
                        <TeamCredits />
                        </motion.div>
                    </div>

                    {/* Scrolling indicator */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
                        <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-white to-transparent"></div>
                        <span className="text-[8px] uppercase tracking-[0.5em] font-bold">Scroll to Explore</span>
                    </div>
                </section>

                {/* Stats & Credibility */}
                <section className="py-32 relative border-y border-white/5">
                    <div className="container-section grid grid-cols-1 md:grid-cols-4 gap-12">
                        {[
                            { label: "Pipeline Innovación", value: "2026", sub: "Visionary Horizon" },
                            { label: "Nodos de Red", value: "100%", sub: "Disponibilidad Cloud" },
                            { label: "Visibilidad Directa", value: "+10k", sub: "Inversionistas mes" },
                            { label: "Estándar Técnico", value: "ELITE", sub: "Curaduría Profesional" }
                        ].map((stat, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center group"
                            >
                                <div className="text-4xl font-black text-white italic tracking-tighter mb-2 group-hover:text-brand-blue transition-colors">{stat.value}</div>
                                <div className="text-[10px] text-brand-blue-light font-bold uppercase tracking-widest mb-1">{stat.label}</div>
                                <div className="text-[10px] text-gray-600 uppercase font-medium">{stat.sub}</div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Main Content - Benefits with Parallax */}
                <section className="py-40 bg-[#05060b]">
                    <div className="container-section">
                        <div className="flex flex-col lg:flex-row gap-24 items-center mb-40">
                            <div className="flex-1 space-y-8">
                                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                                    INFRAESTRUCTURA <br /><span className="text-brand-blue">DISRUPTIVA.</span>
                                </h2>
                                <p className="text-lg text-gray-400 font-light leading-relaxed">
                                    ARQOVEX no es un portal de ventas, es el sistema operativo de tu firma. Una infraestructura diseñada para la eficiencia técnica y la expansión global inmediata.
                                </p>
                                <ul className="space-y-6">
                                    {[
                                        "Arquitectura de datos optimizada para conversión.",
                                        "Infraestructura cloud de alta disponibilidad.",
                                        "Visibilidad directa ante el mercado internacional.",
                                        "Curaduría técnica de nivel ingeniería."
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-4 text-sm font-bold uppercase tracking-wide text-white/80">
                                            <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20">
                                                <CheckCircle2 className="w-3 h-3 text-brand-blue" />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex-1 relative group">
                                <div className="absolute -inset-10 bg-brand-blue/20 blur-[120px] opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                <div className="relative glass-card-heavy p-2 rounded-[3rem] overflow-hidden border-white/10">
                                    <Image 
                                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200" 
                                        alt="Modern Building"
                                        width={800}
                                        height={600}
                                        className="rounded-[2.8rem] grayscale hover:grayscale-0 transition-all duration-1000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Reviewer / Testimonial Section */}
                <section className="py-40 relative bg-[#020308] overflow-hidden">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="container-section max-w-5xl mx-auto text-center relative z-10">
                        <Quote className="w-16 h-16 text-brand-blue/20 mx-auto mb-10" />
                        <h3 className="text-3xl md:text-5xl font-serif italic text-white/90 leading-tight mb-12">
                            &quot;ARQOVEX no es solo una plataforma de venta; es el curador definitivo de la arquitectura moderna del Caribe para el mundo.&quot;
                        </h3>
                        <div className="space-y-4">
                            <div className="font-black text-xl tracking-widest uppercase text-brand-blue">ARQOVEX ENGINE</div>
                            <div className="text-[10px] text-white/40 font-bold tracking-[0.5em] uppercase">Built for Disruption</div>
                            <ArqovexLogo />
                        </div>
                    </div>
                </section>

                {/* Application Portal - 3 Step Form */}
                <section id="apply-form" className="py-40 relative">
                    <div className="container-section max-w-4xl">
                        <div className="text-center mb-20 space-y-6">
                            <h2 className="text-5xl font-black uppercase tracking-tighter">PORTAL DE ASPIRANTES</h2>
                            <p className="text-gray-500 uppercase tracking-[0.3em] text-[10px] font-black">Proceso de Selección Riguroso</p>
                        </div>

                        {submitted ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card-heavy p-20 text-center space-y-8"
                            >
                                <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                                </div>
                                <h3 className="text-4xl font-black uppercase italic italic tracking-tighter">Solicitud en Auditoría.</h3>
                                <p className="text-gray-400 max-w-md mx-auto font-light lg:text-lg">
                                    Hemos recibido tus credenciales. Axel Perez y el equipo técnico revisarán tu portafolio en las próximas 48 horas.
                                </p>
                                <button onClick={() => router.push("/dashboard")} className="btn-primary px-12 py-5 font-black uppercase tracking-widest flex items-center gap-3 mx-auto mt-8">
                                    Ir a mi Dashboard <ArrowUpRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ) : (
                            <div className="relative">
                                {/* Form Background Glow */}
                                <div className="absolute -inset-2 bg-gradient-to-r from-brand-blue/20 to-purple-600/20 blur-3xl opacity-20"></div>
                                
                                <div className="relative bg-[#080912] border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl">
                                    {/* Stepper Status */}
                                    <div className="flex justify-between items-center mb-16 relative">
                                        <div className="absolute h-[2px] bg-white/5 left-0 right-0 top-1/2 -translate-y-1/2 -z-10"></div>
                                        {steps.map((s) => (
                                            <div key={s.id} className="flex flex-col items-center gap-3">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 border-2 ${step >= s.id ? 'bg-brand-blue border-brand-blue text-white shadow-[0_0_20px_rgba(45,108,223,0.4)] rotate-[45deg]' : 'bg-[#020308] border-white/10 text-gray-700'}`}>
                                                    <div className="rotate-[-45deg]">
                                                        {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-brand-blue-light' : 'text-gray-700'}`}>{s.title}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-12">
                                        <AnimatePresence mode="wait">
                                            {step === 1 && (
                                                <motion.div
                                                    key="s1"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-8"
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] uppercase font-black text-brand-blue-light tracking-widest ml-1">Nombre o Firma</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="EJ: AXEL PEREZ ARCHITECTS"
                                                                value={formData.nombre_completo}
                                                                onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
                                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:border-brand-blue focus:outline-none transition-all placeholder:text-gray-700 font-bold uppercase tracking-tight"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] uppercase font-black text-brand-blue-light tracking-widest ml-1">Contacto Directo</label>
                                                            <input 
                                                                type="tel" 
                                                                placeholder="WHATSAPP / CELULAR"
                                                                value={formData.telefono}
                                                                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:border-brand-blue focus:outline-none transition-all placeholder:text-gray-700 font-bold"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] uppercase font-black text-brand-blue-light tracking-widest ml-1">Visión Profesional</label>
                                                        <textarea 
                                                            placeholder="DESCRIBE TU TRAYECTORIA Y POR QUÉ BUSCAS ESTA ALIANZA..."
                                                            value={formData.bio}
                                                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-6 min-h-[160px] focus:border-brand-blue focus:outline-none transition-all placeholder:text-gray-700 font-medium text-gray-300"
                                                            required
                                                        />
                                                    </div>
                                                    <button type="button" onClick={handleNext} className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] text-sm rounded-2xl hover:bg-brand-blue hover:text-white transition-all duration-300 flex items-center justify-center gap-3 group">
                                                        Siguiente Nivel <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                </motion.div>
                                            )}

                                            {step === 2 && (
                                                <motion.div
                                                    key="s2"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-8"
                                                >
                                                    <p className="text-gray-500 text-center font-bold uppercase text-[10px] tracking-widest">
                                                        Presencia Digital Obligatoria
                                                    </p>
                                                    <div className="space-y-6">
                                                        {[
                                                            { icon: Instagram, name: 'instagram', label: 'Portfolio Instagram' },
                                                            { icon: Linkedin, name: 'linkedin', label: 'LinkedIn Professional' },
                                                            { icon: Facebook, name: 'facebook', label: 'Web o Facebook' }
                                                        ].map((s) => (
                                                            <div key={s.name} className="relative group">
                                                                <s.icon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 group-focus-within:text-brand-blue transition-colors" />
                                                                <input 
                                                                    type="text" 
                                                                    placeholder={s.label.toUpperCase()}
                                                                    value={formData[s.name as keyof typeof formData]}
                                                                    onChange={(e) => setFormData({...formData, [s.name]: e.target.value})}
                                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-16 py-6 focus:border-brand-blue focus:outline-none transition-all placeholder:text-gray-700 font-bold"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <button type="button" onClick={handleBack} className="flex-1 py-6 border border-white/5 rounded-2xl font-black uppercase tracking-widest text-xs text-gray-600 hover:text-white hover:bg-white/5 transition-all">
                                                            Atrás
                                                        </button>
                                                        <button type="button" onClick={handleNext} className="flex-[2] py-6 bg-brand-blue text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-brand-blue-light transition-all shadow-blue-glow">
                                                            Validar Identidad
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {step === 3 && (
                                                <motion.div
                                                    key="s3"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-12 text-center"
                                                >
                                                    <div className="p-12 rounded-[2.5rem] bg-brand-gradient flex flex-col items-center gap-6 relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none"></div>
                                                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xl border border-white/30">
                                                            <SignatureIcon className="w-10 h-10 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Cerrar Compromiso</h3>
                                                            <p className="text-white/60 text-xs mt-3 font-bold uppercase tracking-widest">Al enviar, aceptas los términos de exclusividad de ARQOVEX.</p>
                                                        </div>
                                                    </div>

                                                    {error && (
                                                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest">
                                                            {error}
                                                        </div>
                                                    )}

                                                    <div className="flex gap-4">
                                                        <button 
                                                            type="button" 
                                                            onClick={handleBack}
                                                            disabled={loading}
                                                            className="flex-1 py-6 border border-white/5 rounded-2xl font-black uppercase tracking-widest text-xs text-gray-600"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button 
                                                            type="submit" 
                                                            disabled={loading}
                                                            className="flex-[2] py-6 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-brand-blue hover:text-white transition-all duration-500 disabled:opacity-50"
                                                        >
                                                            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-black" /> : "FIRMAr Y ENVIAR"}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Exclusive Banner */}
                <section className="py-20 bg-brand-blue overflow-hidden relative group">
                    <div className="flex whitespace-nowrap animate-marquee">
                        {[1,2,3,4,5,6].map(i => (
                            <span key={i} className="text-white font-black text-6xl md:text-9xl uppercase tracking-tighter opacity-10 mx-8">
                                ARQOVEX ELITE • PARTNER PROGRAM • LIMITLESS VISION •
                            </span>
                        ))}
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
