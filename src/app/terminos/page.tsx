import MainLayout from "@/components/layout/MainLayout";
import { FileText, ShieldAlert, Gavel, FileCheck } from "lucide-react";

export default function TerminosPage() {
    return (
        <MainLayout>
            <div className="pt-24 min-h-screen container-section pb-20">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="text-center space-y-4 py-16">
                        <FileText className="w-12 h-12 text-brand-blue mx-auto opacity-50" />
                        <h1 className="text-4xl font-display font-bold text-white">Términos y Condiciones</h1>
                        <p className="text-gray-500">Última actualización: 10 de Marzo, 2026</p>
                    </div>

                    <div className="glass-card p-8 md:p-12 space-y-10 bg-white/[0.02]">
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 text-white font-bold text-xl">
                                <Gavel className="w-6 h-6 text-brand-blue" />
                                <h2>1. Aceptación de los Términos</h2>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                Al acceder o utilizar la plataforma ARQOVEX, usted acepta estar sujeto a estos Términos y Condiciones.
                                La plataforma funciona como un mercado digital de planos arquitectónicos y servicios inmobiliarios
                                en la República Dominicana y el mercado internacional.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 text-white font-bold text-xl">
                                <ShieldAlert className="w-6 h-6 text-brand-blue" />
                                <h2>2. Propiedad Intelectual</h2>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                Todos los planos, diseños, renders, logotipos y contenido textual expuesto en ARQOVEX son propiedad intelectual exclusiva de ARQOVEX y sus arquitectos asociados. La compra de un plano otorga una &quot;Licencia de Uso Único&quot;
                                para la construcción de una propiedad, quedando estrictamente prohibida su reventa o distribución sin autorización.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 text-white font-bold text-xl">
                                <FileCheck className="w-6 h-6 text-brand-blue" />
                                <h2>3. Responsabilidad Técnica</h2>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                Si bien nuestros planos cumplen con altos estándares arquitectónicos, es responsabilidad del comprador
                                asegurar que el diseño sea revisado y sellado por un profesional local colegiado (CODIA en República Dominicana)
                                para su aprobación ante las autoridades municipales correspondientes.
                            </p>
                        </section>

                        <section className="space-y-4 pt-8 border-t border-white/10">
                            <p className="text-sm text-gray-600 italic">
                                Para cualquier consulta legal sobre estos términos, puede contactarse con nuestro equipo a través de
                                los canales de soporte oficiales o enviando un mensaje vía WhatsApp.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
