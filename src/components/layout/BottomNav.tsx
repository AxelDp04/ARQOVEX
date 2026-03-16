"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutGrid, 
    Building2, 
    Home, 
    MessageCircle, 
    User,
    Shield,
    Ruler,
    X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAILS = ['axelp7223@gmail.com', 'arqovex@gmail.com', 'robertoficial69@hotmail.com'];

export default function BottomNav() {
    const pathname = usePathname();
    const [isSocio, setIsSocio] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showCatalogSelector, setShowCatalogSelector] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsAuthenticated(true);
                const userEmail = user.email?.toLowerCase();
                
                if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
                    setIsAdmin(true);
                }

                const { data: profile } = await supabase
                    .from('perfiles')
                    .select('es_socio, es_admin')
                    .eq('id', user.id)
                    .maybeSingle();
                
                if (profile) {
                    setIsSocio(profile.es_socio === true);
                    if (profile.es_admin === true) {
                        setIsAdmin(true);
                    }
                }
            }
        };
        checkUser();
    }, [supabase]);

    const navItems = [
        { 
            icon: Home, 
            label: "Inicio", 
            href: "/", 
            active: pathname === "/"
        },
        { 
            icon: LayoutGrid, 
            label: "Catálogo", 
            onClick: () => setShowCatalogSelector(true),
            active: pathname === "/catalogo",
            isAction: true
        },
        { 
            icon: isAdmin ? Shield : User, 
            label: isAdmin ? "Admin" : (isSocio ? "Portal" : "Socio"), 
            href: isAdmin ? "/admin" : (isAuthenticated ? (isSocio ? "/dashboard?tab=perfil" : "/vender-con-nosotros") : "/auth/login"),
            active: pathname === "/admin" || pathname === "/vender-con-nosotros" || (pathname === "/dashboard")
        },
        { 
            icon: MessageCircle, 
            label: "WhatsApp", 
            href: `https://wa.me/18296503337?text=${encodeURIComponent('Hola ARQOVEX, quisiera solicitar información profesional.')}`, 
            isExternal: true 
        }
    ];

    return (
        <>
            {/* Catalog Selector - Gala Experience */}
            {showCatalogSelector && (
                <div className="md:hidden fixed inset-0 z-[60] animate-fade-in">
                    <div 
                        className="absolute inset-0 bg-[#020408]/80 backdrop-blur-md"
                        onClick={() => setShowCatalogSelector(false)}
                    />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-sm">
                        <div className="glass-card border-white/10 p-6 shadow-[0_0_50px_rgba(0,102,255,0.2)] animate-slide-up">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-white font-display font-bold text-xl uppercase tracking-tighter">Explorar Catálogo</h3>
                                    <p className="text-[10px] text-brand-blue-light font-bold uppercase tracking-widest mt-1">Selector de Gala</p>
                                </div>
                                <button 
                                    onClick={() => setShowCatalogSelector(false)}
                                    className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Link 
                                    href="/catalogo?seccion=planos"
                                    onClick={() => setShowCatalogSelector(false)}
                                    className="group flex flex-col items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-brand-blue/40 transition-all duration-300"
                                >
                                    <div className="p-4 rounded-xl bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all shadow-blue-glow">
                                        <Ruler className="w-8 h-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold text-xs uppercase">Planos</p>
                                        <p className="text-[8px] text-gray-500 uppercase mt-1">Arquitectura</p>
                                    </div>
                                </Link>

                                <Link 
                                    href="/catalogo?seccion=inmobiliaria"
                                    onClick={() => setShowCatalogSelector(false)}
                                    className="group flex flex-col items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-brand-blue/40 transition-all duration-300"
                                >
                                    <div className="p-4 rounded-xl bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all shadow-blue-glow">
                                        <Building2 className="w-8 h-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold text-xs uppercase">Inmuebles</p>
                                        <p className="text-[8px] text-gray-500 uppercase mt-1">Exclusivos</p>
                                    </div>
                                </Link>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5 text-center">
                                <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em]">ARQOVEX Digital Ecosystem</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation Main */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[380px] z-50 pointer-events-none">
                <div className="bg-[#050810]/80 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-0.5 py-1.5 flex items-center justify-between h-14 pointer-events-auto">
                    {navItems.map((item, idx) => {
                        const Icon = item.icon;
                        const isActive = item.active;

                        const content = (
                            <>
                                <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                                    isActive 
                                        ? "bg-brand-blue/15 shadow-[0_0_15px_rgba(0,102,255,0.2)]" 
                                        : "bg-transparent group-hover:bg-white/5"
                                }`}>
                                    <Icon className={`w-4.5 h-4.5 transition-transform duration-300 ${isActive ? "scale-110" : ""}`} />
                                </div>
                                <span className={`text-[8px] font-bold uppercase tracking-tighter truncate w-full text-center px-1 transition-colors ${
                                    isActive ? "text-brand-blue" : ""
                                }`}>{item.label}</span>
                            </>
                        );

                        if (item.isExternal) {
                            return (
                                <a
                                    key={idx}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center justify-center flex-1 gap-1 text-gray-400 group active:scale-95 transition-transform"
                                >
                                    <div className="p-1.5 rounded-xl bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                                        <Icon className="w-4.5 h-4.5" />
                                    </div>
                                    <span className="text-[8px] font-bold uppercase tracking-tighter truncate w-full text-center px-1">{item.label}</span>
                                </a>
                            );
                        }

                        if (item.isAction) {
                            return (
                                <button
                                    key={idx}
                                    onClick={item.onClick}
                                    className={`flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-300 group ${
                                        isActive ? "text-brand-blue" : "text-gray-500"
                                    } active:scale-95`}
                                >
                                    {content}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={idx}
                                href={item.href || "#"}
                                className={`flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-300 group ${
                                    isActive ? "text-brand-blue" : "text-gray-500"
                                } active:scale-95`}
                            >
                                {content}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
