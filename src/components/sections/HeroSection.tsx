import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, ChevronDown } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-brand-slate-deeper">
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />
                {/* Blue radial glows */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/8 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-blue-dark/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-[80px]" />
            </div>

            {/* Content */}
            <div className="container-section relative z-10 pt-28 pb-16">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Text Content */}
                    <div className="space-y-8 animate-slide-up">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/25 text-brand-blue-light text-sm font-medium uppercase tracking-[0.1em]">
                            <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                            Ecosistema de Innovación Arquitectónica
                        </div>

                        {/* Headline */}
                        <div className="space-y-2">
                            <h1 className="font-display text-5xl md:text-6xl xl:text-7xl font-black text-white leading-none tracking-tight">
                                Planos para el
                            </h1>
                            <h1 className="font-display text-5xl md:text-6xl xl:text-7xl font-black leading-none tracking-tight">
                                <span className="bg-gradient-to-r from-brand-blue via-brand-blue-light to-white bg-clip-text text-transparent">
                                    Futuro
                                </span>
                            </h1>
                        </div>

                        {/* Philosophy */}
                        <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-lg">
                            Diseñamos la infraestructura de la civilización con eficiencia y trascendencia. 
                            El punto de origen para la arquitectura disruptiva.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/catalogo"
                                className="btn-primary text-base px-8 py-4 shadow-blue-glow"
                            >
                                Explorar Catálogo
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/contacto"
                                className="btn-secondary text-base px-8 py-4"
                            >
                                <Play className="w-4 h-4" />
                                Proyecto Personalizado
                            </Link>
                        </div>

                        {/* Social proof */}
                        <div className="flex items-center gap-6 pt-2">
                            <div className="text-center">
                                <div className="font-display text-2xl font-bold text-white">V.2026</div>
                                <div className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">Próximo Horizonte</div>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <div className="font-display text-2xl font-bold text-white">100%</div>
                                <div className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">Infraestructura Directa</div>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <div className="font-display text-2xl font-bold text-white">TECH</div>
                                <div className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">Curaduría de Ingeniería</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Visual */}
                    <div className="relative flex justify-center lg:justify-end animate-fade-in animation-delay-400">


                        {/* Main logo showcase */}
                        <div className="relative">
                            <div className="w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-3xl bg-gradient-to-br from-brand-blue/10 to-brand-blue-dark/5 border border-brand-blue/15 flex items-center justify-center glow-blue">
                                <div className="relative w-48 h-48 md:w-64 md:h-64 animate-float animation-delay-600">
                                    <Image
                                        src="/Logo.png"
                                        alt="ARQOVEX"
                                        fill
                                        className="object-contain drop-shadow-[0_0_40px_rgba(0,102,255,0.4)]"
                                        priority
                                    />
                                </div>
                            </div>
                            {/* Background glow behind the card */}
                            <div className="absolute inset-0 bg-brand-blue/20 rounded-3xl blur-3xl -z-10 scale-90" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 animate-bounce">
                <span className="text-xs uppercase tracking-widest">Explorar</span>
                <ChevronDown className="w-4 h-4" />
            </div>
        </section>
    );
}
