import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[var(--page-bg)]">
      <div className="container-section">
        <div className="relative rounded-2xl overflow-hidden bg-[#050810] border border-white/[0.06]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-80" />
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-[#0066FF]/15 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 py-16 px-6 md:py-20 md:px-12 text-center">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight max-w-2xl mx-auto">
              ¿Tienes un proyecto en mente?
            </h2>
            <p className="mt-4 text-gray-400 max-w-lg mx-auto leading-relaxed">
              Si no encuentras lo que buscas en catálogo, lo diseñamos desde cero con precisión y estándares técnicos.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0066FF] text-white font-semibold rounded-lg hover:bg-[#0052cc] hover:shadow-[0_0_30px_rgba(0,102,255,0.3)] transition-all duration-300"
              >
                Hablar con un arquitecto
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-gray-400 font-semibold rounded-lg hover:text-white transition-colors"
              >
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
