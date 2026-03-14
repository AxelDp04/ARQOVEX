import { ShieldCheck, Palette, Headphones, Download } from "lucide-react";

const stats = [
    {
        icon: ShieldCheck,
        value: "Normativa Local",
        label: "Cumplimiento Legal",
        description: "Diseños bajo código dominicano",
    },
    {
        icon: Palette,
        value: "Catálogo Curado",
        label: "Exclusividad",
        description: "Arquitectura de vanguardia",
    },
    {
        icon: Headphones,
        value: "Soporte Directo",
        label: "Asesoría Profesional",
        description: "Acompañamiento experto",
    },
    {
        icon: Download,
        value: "Entrega Inmediata",
        label: "Infraestructura Digital",
        description: "Descarga instantánea",
    },
];

export default function StatsSection() {
    return (
        <section className="relative py-16 overflow-hidden">
            <div className="container-section">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.value}
                                className="glass-card p-6 text-center group hover:border-brand-blue/30 transition-all duration-300"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-blue/20 transition-colors">
                                    <Icon className="w-5 h-5 text-brand-blue" />
                                </div>
                                <div className="font-display text-xl font-bold text-white mb-1 leading-tight">{stat.value}</div>
                                <div className="text-sm font-semibold text-gray-400 mb-1">{stat.label}</div>
                                <div className="text-xs text-gray-600">{stat.description}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
