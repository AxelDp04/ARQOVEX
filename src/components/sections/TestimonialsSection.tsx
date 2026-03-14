

export default function TestimonialsSection() {
    return (
        <section className="relative py-24 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container-section relative z-10">
                {/* Header */}
                <div className="text-center space-y-4 mb-16">
                    <div className="badge-blue mx-auto w-fit">Visión ARQOVEX</div>
                    <h2 className="section-title">
                        Compromiso con la{" "}
                        <span className="bg-gradient-to-r from-brand-blue to-brand-blue-light bg-clip-text text-transparent">
                            excelencia arquitectónica
                        </span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Transformamos ideas en infraestructura trascendente, combinando innovación técnica 
                        con visión de futuro para crear espacios que inspiran y perduran.
                    </p>
                </div>
            </div>
        </section>
    );
}
