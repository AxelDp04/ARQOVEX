import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Instagram, Facebook, Linkedin, ArrowRight } from "lucide-react";

const footerLinks = {
    plataforma: [
        { label: "Proyectos Arquitectónicos", href: "/catalogo?seccion=planos" },
        { label: "Inmobiliaria Premium", href: "/catalogo?seccion=inmobiliaria" },
        { label: "Asóciate con Nosotros", href: "/vender-con-nosotros" },
        { label: "Portal de Socios", href: "/dashboard" },
    ],
    empresa: [
        { label: "Sobre Nosotros", href: "/nosotros" },
        { label: "Blog Arquitectónico", href: "/blog" },
        { label: "Términos de Uso", href: "/terminos" },
        { label: "Política de Privacidad", href: "/privacidad" },
    ],
};

const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/arqovex_?igsh=MWcwc2o5emFmaTNvaA%3D%3D&utm_source=qr", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
];

const contactInfo = [
    { icon: MapPin, text: "República Dominicana & Latinoamérica", href: null },
    { icon: Phone, text: "+1 (829) 650-3337", href: "https://wa.me/18296503337" },
    { icon: Mail, text: "Arqovex@gmail.com", href: "mailto:Arqovex@gmail.com" },
];

export default function Footer() {
    return (
        <footer className="relative bg-brand-slate-deeper border-t border-white/[0.06] overflow-hidden">
            {/* Radial glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-blue/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="container-section py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-1 space-y-5">
                        <Link href="/" className="flex items-center gap-3 w-fit">
                            <div className="relative w-10 h-10">
                                <Image src="/Logo.png" alt="ARQOVEX" fill sizes="100vw" className="object-contain" />
                            </div>
                            <span className="font-display text-2xl font-bold">
                                <span className="text-white">ARQO</span>
                                <span className="text-brand-blue">VEX</span>
                            </span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed italic">
                            &quot;La arquitectura es la infraestructura de la civilización, diseñada para la eficiencia y la trascendencia.&quot;
                        </p>
                        <div className="flex items-center gap-3">
                            {socialLinks.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-gray-400 hover:text-brand-blue hover:border-brand-blue/30 transition-all duration-200"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Plataforma Links */}
                    <div className="space-y-4">
                        <h4 className="font-display text-sm font-semibold text-white uppercase tracking-widest">
                            Plataforma
                        </h4>
                        <ul className="space-y-2">
                            {footerLinks.plataforma.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-brand-blue-light transition-colors duration-200 group"
                                    >
                                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Empresa Links */}
                    <div className="space-y-4">
                        <h4 className="font-display text-sm font-semibold text-white uppercase tracking-widest">
                            Empresa
                        </h4>
                        <ul className="space-y-2">
                            {footerLinks.empresa.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-brand-blue-light transition-colors duration-200 group"
                                    >
                                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="font-display text-sm font-semibold text-white uppercase tracking-widest">
                            Contacto
                        </h4>
                        <ul className="space-y-3">
                            {contactInfo.map(({ icon: Icon, text, href }) => (
                                <li key={text} className="flex items-start gap-3 text-sm text-gray-400">
                                    <Icon className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
                                    {href ? (
                                        <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors">
                                            {text}
                                        </a>
                                    ) : (
                                        <span>{text}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <a
                            href="https://wa.me/18296503337"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-blue-light transition-colors mt-2"
                        >
                            Contactar por WhatsApp
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs text-gray-500">
                            © {new Date().getFullYear()} ARQOVEX. Todos los derechos reservados.
                        </p>
                        <p className="text-xs text-gray-400/60 font-light">
                            Dirección: Robert Carrasco | Desarrollo: Ing. Axel Perez | <a href="https://wa.me/18098285104" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue-light transition-colors">+1 809-828-5104</a>
                        </p>
                    </div>
                    <p className="text-xs text-gray-400">
                        Disrupción técnica y visión arquitectónica. ARQOVEX FUTURE
                    </p>
                </div>
            </div>
        </footer>
    );
}
