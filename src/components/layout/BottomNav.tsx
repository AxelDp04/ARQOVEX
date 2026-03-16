"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
    LayoutGrid, 
    Building2, 
    Home, 
    MessageCircle, 
    User,
    Shield
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAILS = ['axelp7223@gmail.com', 'arqovex@gmail.com', 'robertoficial69@hotmail.com'];

export default function BottomNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentSeccion = searchParams.get('seccion');
    const [isSocio, setIsSocio] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
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
            icon: Building2, 
            label: "Inmobiliaria", 
            href: "/catalogo?seccion=inmobiliaria",
            active: pathname === "/catalogo" && currentSeccion === 'inmobiliaria'
        },
        { 
            icon: LayoutGrid, 
            label: "Arquitectura", 
            href: "/catalogo?seccion=planos",
            active: pathname === "/catalogo" && currentSeccion === 'planos'
        },
        { 
            icon: Home, 
            label: "Inicio", 
            href: "/", 
            active: pathname === "/"
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
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-[360px] z-50 pointer-events-none">
            <div className="grid grid-cols-5 bg-[#050810]/85 backdrop-blur-3xl border border-white/10 rounded-[1.25rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] px-0 py-1.5 h-14 pointer-events-auto items-center">
                {navItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = item.active;

                    const innerContent = (
                        <>
                            <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                                isActive 
                                    ? "bg-brand-blue/20 shadow-[0_0_15px_rgba(0,102,255,0.3)]" 
                                    : "bg-transparent group-hover:bg-white/5"
                            }`}>
                                <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? "scale-110" : ""}`} />
                            </div>
                            <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-tighter truncate w-full text-center px-0.5 transition-colors ${
                                isActive ? "text-brand-blue" : "text-gray-400"
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
                                className="flex flex-col items-center justify-center gap-0.5 text-gray-500 group active:scale-90 transition-all overflow-hidden"
                            >
                                <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter truncate w-full text-center px-0.5">{item.label}</span>
                            </a>
                        );
                    }

                    return (
                        <Link
                            key={idx}
                            href={item.href || "#"}
                            className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-300 group ${
                                isActive ? "text-brand-blue" : "text-gray-500"
                            } active:scale-90 overflow-hidden`}
                        >
                            {innerContent}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
