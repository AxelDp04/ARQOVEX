import {
    Download,
    ShieldCheck,
    Headphones,
    Zap,
    Ruler,
    Globe,
} from "lucide-react";

const features = [
    {
        icon: Download,
        title: "Descarga Instantánea",
        description:
            "Accede a tus planos inmediatamente después de la compra. Sin esperas, sin formularios adicionales.",
    },
    {
        icon: ShieldCheck,
        title: "Planos Certificados",
        description:
            "Infraestructura técnica curada bajo estándares de ingeniería de precisión.",
    },
    {
        icon: Ruler,
        title: "Totalmente Editables",
        description:
            "Recibe archivos en formato AutoCAD y PDF para que puedas adaptarlos a tus necesidades específicas.",
    },
    {
        icon: Headphones,
        title: "Soporte Especializado",
        description:
            "Nuestro equipo de profesionales está disponible para resolver tus consultas técnicas sobre los planos.",
    },
    {
        icon: Zap,
        title: "Proyectos Personalizados",
        description:
            "¿No encuentras lo que buscas? Diseñamos el plano perfecto a tu medida desde cero.",
    },
    {
        icon: Globe,
        title: "Cobertura Regional",
        description:
            "Operamos en República Dominicana y toda Latinoamérica. Adaptamos nuestros diseños a las normativas locales.",
    },
];

export default function FeaturesSection() {
    return (
        <section className="relative py-24 overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container-section relative z-10">
                {/* Header */}
                <div className="text-center space-y-4 mb-16">
                    <div className="badge-blue mx-auto w-fit uppercase font-black tracking-widest">INGENIERÍA & VALOR</div>
                    <h2 className="section-title">
                        Infraestructura para la{" "}
                        <span className="bg-gradient-to-r from-brand-blue to-brand-blue-light bg-clip-text text-transparent">
                            Arquitectura Pro
                        </span>
                    </h2>
                    <p className="section-subtitle mx-auto text-center">
                        Fusionamos disrupción digital con precisión técnica para establecer el nuevo estándar en la distribución de diseño arquitectónico.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className="glass-card-hover p-7 group"
                                style={{ animationDelay: `${index * 80}ms` }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mb-5 group-hover:bg-brand-blue/20 group-hover:border-brand-blue/40 transition-all duration-300">
                                    <Icon className="w-6 h-6 text-brand-blue group-hover:text-brand-blue-light transition-colors" />
                                </div>
                                <h3 className="font-display text-lg font-semibold text-white mb-2 group-hover:text-brand-blue-light transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
