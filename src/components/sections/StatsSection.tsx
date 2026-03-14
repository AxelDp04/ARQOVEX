import { Users, FileCheck, Award, Clock } from "lucide-react";

const stats = [
    {
        icon: FileCheck,
        value: "200+",
        label: "Planos Disponibles",
        description: "Desde casas mínimas hasta mansiones",
    },
    {
        icon: Users,
        value: "500+",
        label: "Clientes Satisfechos",
        description: "En República Dominicana y Latinoamérica",
    },
    {
        icon: Award,
        value: "12+",
        label: "Años de Experiencia",
        description: "En diseño arquitectónico",
    },
    {
        icon: Clock,
        value: "24h",
        label: "Entrega Express",
        description: "Acceso inmediato al comprar",
    },
];

export default function StatsSection() {
    return (
        <section className="relative py-16 overflow-hidden">
            <div className="container-section">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className="glass-card p-6 text-center group hover:border-brand-blue/30 transition-all duration-300"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-blue/20 transition-colors">
                                    <Icon className="w-5 h-5 text-brand-blue" />
                                </div>
                                <div className="font-display text-3xl font-black text-white mb-1">{stat.value}</div>
                                <div className="text-sm font-semibold text-gray-300 mb-1">{stat.label}</div>
                                <div className="text-xs text-gray-600">{stat.description}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
