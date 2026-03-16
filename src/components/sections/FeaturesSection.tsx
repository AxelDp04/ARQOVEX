import {
  Download,
  ShieldCheck,
  Headphones,
  Zap,
  Ruler,
  Globe,
} from "lucide-react";

const features = [
  { num: "01", icon: Download, title: "Descarga instantánea", description: "Acceso a tus planos tras la compra. Sin esperas ni trámites extra." },
  { num: "02", icon: ShieldCheck, title: "Planos certificados", description: "Documentación técnica bajo estándares de ingeniería." },
  { num: "03", icon: Ruler, title: "Totalmente editables", description: "AutoCAD y PDF para adaptar cada proyecto a tu necesidad." },
  { num: "04", icon: Headphones, title: "Soporte especializado", description: "Equipo técnico para consultas sobre los planos." },
  { num: "05", icon: Zap, title: "Proyectos a medida", description: "Diseñamos el plano que necesitas desde cero." },
  { num: "06", icon: Globe, title: "Cobertura regional", description: "República Dominicana y Latinoamérica. Normativas locales." },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[var(--page-bg)]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#0066FF]/[0.04] rounded-full blur-[100px] pointer-events-none" />
      <div className="container-section relative z-10">
        <div className="max-w-2xl mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4D94FF] mb-3">
            Servicios
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Infraestructura para la{" "}
            <span className="bg-gradient-to-r from-[#0066FF] to-[#4D94FF] bg-clip-text text-transparent">
              arquitectura profesional
            </span>
          </h2>
          <p className="mt-4 text-gray-400 text-lg leading-relaxed">
            Disrupción digital y precisión técnica en la distribución de diseño arquitectónico.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.num}
                className="group bg-[#050810]/95 backdrop-blur-sm p-8 transition-all duration-300 hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs font-mono text-gray-500">{f.num}</span>
                  <div className="w-10 h-10 rounded-lg bg-[#0066FF]/10 flex items-center justify-center group-hover:bg-[#0066FF]/20 transition-colors">
                    <Icon className="w-5 h-5 text-[#4D94FF]" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
