import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        name: "Carlos Rodríguez",
        role: "Constructor Independiente",
        location: "Santo Domingo, RD",
        rating: 5,
        text: "ARQOVEX me ahorró meses de trabajo. Los planos son increíblemente detallados y el soporte técnico es excepcional. Construí mi casa en tiempo récord.",
        avatar: "CR",
    },
    {
        name: "María González",
        role: "Arquitecta",
        location: "Santo Domingo, RD",
        rating: 5,
        text: "Como profesional, valoro la calidad técnica de los planos. ARQOVEX ofrece diseños que cumplen con todas las normativas y son fácilmente adaptables.",
        avatar: "MG",
    },
    {
        name: "Andrés Martínez",
        role: "Inversionista Inmobiliario",
        location: "Punta Cana, RD",
        rating: 5,
        text: "Compré 3 planos diferentes para mis proyectos de desarrollo. El retorno de inversión fue inmediato. La relación calidad-precio no tiene comparación.",
        avatar: "AM",
    },
];

export default function TestimonialsSection() {
    return (
        <section className="relative py-24 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container-section relative z-10">
                {/* Header */}
                <div className="text-center space-y-4 mb-16">
                    <div className="badge-blue mx-auto w-fit">Testimonios</div>
                    <h2 className="section-title">
                        Lo que dicen{" "}
                        <span className="bg-gradient-to-r from-brand-blue to-brand-blue-light bg-clip-text text-transparent">
                            nuestros clientes
                        </span>
                    </h2>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={testimonial.name}
                            className="glass-card-hover p-7 flex flex-col gap-5"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Quote icon */}
                            <Quote className="w-8 h-8 text-brand-blue/40" />

                            {/* Stars */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            {/* Text */}
                            <p className="text-gray-400 text-sm leading-relaxed flex-1">
                                &quot;{testimonial.text}&quot;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-white">{testimonial.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {testimonial.role} · {testimonial.location}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
