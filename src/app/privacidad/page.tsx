import MainLayout from "@/components/layout/MainLayout";
import { ShieldCheck, Eye, Lock, Database } from "lucide-react";

export default function PrivacidadPage() {
    return (
        <MainLayout>
            <div className="pt-24 min-h-screen container-section pb-20">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="text-center space-y-4 py-16">
                        <ShieldCheck className="w-12 h-12 text-brand-blue mx-auto opacity-50" />
                        <h1 className="text-4xl font-display font-bold text-white">Política de Privacidad</h1>
                        <p className="text-gray-500">Su seguridad es nuestra prioridad.</p>
                    </div>

                    <div className="glass-card p-8 md:p-12 space-y-10 bg-white/[0.02]">
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 text-white font-bold text-xl">
                                <Database className="w-6 h-6 text-brand-blue" />
                                <h2>Recolección de Información</h2>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                En ARQOVEX recolectamos información básica necesaria para procesar sus solicitudes y compras, tales como:
                                nombre, correo electrónico, teléfono y datos de facturación. No almacenamos información sensible de tarjetas
                                de crédito, ya que los procesos de pago son gestionados por proveedores certificados (Stripe/PayPal/WhatsApp Business).
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 text-white font-bold text-xl">
                                <Eye className="w-6 h-6 text-brand-blue" />
                                <h2>Uso de los Datos</h2>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                Sus datos personales se utilizan exclusivamente para:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Gestión de su cuenta y catálogo de planos adquiridos.</li>
                                    <li>Enviarle soporte técnico sobre sus archivos.</li>
                                    <li>Notificarle sobre actualizaciones en los diseños o nuevos lanzamientos.</li>
                                </ul>
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 text-white font-bold text-xl">
                                <Lock className="w-6 h-6 text-brand-blue" />
                                <h2>Seguridad y Almacenamiento</h2>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                Implementamos protocolos SSL de encriptado y almacenamiento seguro en Supabase. Sus planos adquiridos
                                están protegidos y solo son accesibles a través de enlaces firmados temporalmente para evitar
                                la piratería y el acceso no autorizado.
                            </p>
                        </section>

                        <section className="space-y-4 pt-8 border-t border-white/10">
                            <p className="text-sm text-gray-600 italic">
                                ARQOVEX cumple con las regulaciones de protección de datos vigentes en la República Dominicana y se
                                compromete a no vender su información a terceros bajo ninguna circunstancia.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
