import { ShieldCheck, Palette, Headphones, Download } from "lucide-react";

const stats = [
  { icon: ShieldCheck, label: "Normativa local", sub: "Cumplimiento legal" },
  { icon: Palette, label: "Catálogo curado", sub: "Arquitectura de vanguardia" },
  { icon: Headphones, label: "Soporte directo", sub: "Asesoría profesional" },
  { icon: Download, label: "Entrega inmediata", sub: "Descarga digital" },
];

export default function StatsSection() {
  return (
    <section className="relative py-12 border-y border-white/[0.06] bg-[var(--page-bg)]">
      <div className="container-section">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-4 md:flex-1 md:justify-center md:border-l md:border-white/[0.06] md:first:border-0"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#4D94FF]" />
                </div>
                <div>
                  <div className="font-display font-semibold text-white">{stat.label}</div>
                  <div className="text-sm text-gray-500">{stat.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
