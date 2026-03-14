import MainLayout from "@/components/layout/MainLayout";
import Image from "next/image";
import { Cpu, Rocket, Shield, Phone, Mail, MapPin, Globe } from "lucide-react";

export default function SobreNosotrosPage() {
    return (
        <MainLayout>
            <div className="pt-24 min-h-screen">
                {/* Hero Section */}
                <section className="py-20 bg-gradient-to-b from-brand-slate-deeper to-brand-slate relative overflow-hidden">
                    <div className="absolute inset-0 bg-hero-pattern opacity-10" />
                    <div className="container-section relative z-10 text-center space-y-6">
                        <div className="badge-blue mx-auto w-fit uppercase tracking-widest">Nuestra Esencia</div>
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-white">
                            Innovación Arquitectónica <br />
                            <span className="bg-brand-gradient bg-clip-text text-transparent">desde el Corazón de RD</span>
                        </h1>
                        <p className="max-w-3xl mx-auto text-gray-400 text-lg leading-relaxed">
                            ARQOVEX nació con una visión clara: democratizar el acceso a planos arquitectónicos de alta gama,
                            fusionando el arte del diseño tradicional con las tecnologías digitales más avanzadas del mercado.
                        </p>
                    </div>
                </section>

                {/* History Section */}
                <section className="py-24 container-section grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-3xl font-display font-bold text-white">Nuestra Historia</h2>
                        <div className="space-y-4 text-gray-400 leading-relaxed">
                            <p>
                                Fundada en la República Dominicana, ARQOVEX surge como respuesta a la necesidad de agilizar
                                los procesos de diseño y construcción en la región. Entendemos que el hogar no es solo una estructura,
                                sino el lienzo donde se proyectan los sueños de cada familia.
                            </p>
                            <p>
                                A lo largo de nuestra trayectoria, hemos evolucionado de ser un estudio de diseño local a
                                convertirnos en una plataforma digital líder que conecta a constructores, inversionistas y
                                particulares con diseños de clase mundial listos para ser ejecutados.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 glass-card border-none bg-white/[0.03]">
                                <div className="text-3xl font-bold text-brand-blue">200+</div>
                                <div className="text-sm text-gray-500 uppercase tracking-tighter">Proyectos Listos</div>
                            </div>
                            <div className="p-6 glass-card border-none bg-white/[0.03]">
                                <div className="text-3xl font-bold text-brand-blue">100%</div>
                                <div className="text-sm text-gray-500 uppercase tracking-tighter">Digital & Seguro</div>
                            </div>
                        </div>
                    </div>
                    <div className="relative w-full h-[300px] lg:h-[400px] rounded-3xl overflow-hidden glass-card p-2 border-white/10">
                        <Image
                            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"
                            alt="Arquitectura moderna y vanguardista - ARQOVEX"
                            fill
                            className="object-cover rounded-2xl hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </section>

                {/* Tech Leadership */}
                <section className="py-24 bg-brand-slate-deeper relative">
                    <div className="container-section">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-3xl font-display font-bold text-white">Liderazgo Tecnológico</h2>
                            <p className="text-gray-500 max-w-2xl mx-auto">
                                No solo diseñamos espacios, creamos ecosistemas inteligentes que optimizan cada centímetro de construcción.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: Cpu, title: "Optimización por Software", desc: "Cada plano es verificado mediante algoritmos de eficiencia estructural." },
                                { icon: Rocket, title: "Entrega Instantánea", desc: "Plataforma automatizada para que obtengas tus documentos en segundos." },
                                { icon: Shield, title: "Protección Intelectual", desc: "Sistemas de encriptación de última generación para tus adquisiciones." }
                            ].map((item, i) => (
                                <div key={i} className="p-8 glass-card-hover space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                                        <item.icon className="w-6 h-6 text-brand-blue" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Developer Profile Section */}
                <section className="py-24 bg-brand-gradient/5">
                    <div className="container-section">
                        <div className="glass-card p-8 md:p-16 relative overflow-hidden border-white/5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center relative z-10">
                                <div className="lg:col-span-2 text-center lg:text-left space-y-6">
                                    <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto lg:mx-0 rounded-3xl overflow-hidden border-2 border-brand-blue/30 p-2 glass-card shadow-blue-glow-lg">
                                        <div className="w-full h-full bg-brand-slate-deep flex items-center justify-center rounded-2xl overflow-hidden relative">
                                            {/* Foto de Perfil SDE */}
                                            <Image
                                                src="/axel-perfil.png"
                                                alt="Axel Perez - Software Engineer"
                                                fill
                                                className="object-cover hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-brand-slate-deeper/80 to-transparent" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-display font-bold text-white">Ing. Axel Perez</h3>
                                        <p className="text-brand-blue font-medium">Arquitecto de Sistemas ARQOVEX</p>
                                    </div>
                                </div>
                                <div className="lg:col-span-3 space-y-8">
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-display font-bold text-white">El Ingeniero detrás de la Plataforma</h2>
                                        <p className="text-gray-400 italic">&quot;Mi objetivo es transformar la forma en que interactuamos con la arquitectura a través del código.&quot;</p>
                                        <p className="text-gray-400 leading-relaxed">
                                            Ingeniero en Sistemas Computacionales de 21 años, residente en Santo Domingo Este. Axel es el motor tecnológico
                                            de ARQOVEX, especializado en la creación de ecosistemas digitales de alta complejidad. Su enfoque combina el
                                            desarrollo web de vanguardia con la optimización de procesos para el sector inmobiliario internacional.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <Phone className="w-4 h-4 text-brand-blue" />
                                            +1 809-828-5104
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <Mail className="w-4 h-4 text-brand-blue" />
                                            axelp7223@gmail.com
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <MapPin className="w-4 h-4 text-brand-blue" />
                                            Santo Domingo Este, RD
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <Globe className="w-4 h-4 text-brand-blue" />
                                            Software Engineer (21 años)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
