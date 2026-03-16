import Link from "next/link";
import { ArrowRight, Ruler } from "lucide-react";

export default function CTASection() {
    return (
        <section className="relative py-24 overflow-hidden">
            <div className="container-section">
                <div className="relative rounded-3xl overflow-hidden">
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 via-brand-slate to-brand-blue-dark/15" />
                    <div className="absolute inset-0 border border-brand-blue/20 rounded-3xl" />

                    {/* Glow effects */}
                    <div className="absolute top-0 left-1/4 w-80 h-80 bg-brand-blue/25 rounded-full blur-[80px]" />
                    <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-brand-blue-dark/30 rounded-full blur-[60px]" />

                    {/* Grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                        }}
                    />

                    {/* Content */}
                    <div className="relative z-10 py-20 px-8 md:px-16 text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/15 border border-brand-blue/30 text-brand-blue-light text-[10px] font-black uppercase tracking-[0.2em] mx-auto">
                            <Ruler className="w-4 h-4" />
                            Ingeniería a Medida
                        </div>

                        <h2 className="font-display text-4xl md:text-5xl xl:text-6xl font-black text-white leading-tight max-w-3xl mx-auto">
                            ¿Tienes un proyecto{" "}
                            <span className="bg-gradient-to-r from-brand-blue-light to-white bg-clip-text text-transparent">
                                en mente?
                            </span>
                        </h2>

                        <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
                            Si la infraestructura que buscas no está en nuestro catálogo, ejecutamos tu visión técnica desde cero. Unimos precisión y trascendencia.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                            <Link
                                href="/contacto"
                                className="btn-primary text-base px-10 py-4 shadow-blue-glow"
                            >
                                Hablar con Ingeniería
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/catalogo"
                                className="btn-ghost text-base px-8 py-4"
                            >
                                Ver Catálogo Completo
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
