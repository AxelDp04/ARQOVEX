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
                
                // Hardcoded admin check
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
                    // Also check DB flag for admin
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
            label: isAdmin ? "Admin" : (isSocio ? "Portal" : "Asóciate"), 
            href: isAdmin ? "/admin" : (isAuthenticated ? (isSocio ? "/dashboard?tab=vault" : "/vender-con-nosotros") : "/auth/login"),
            active: pathname === "/admin" || pathname === "/vender-con-nosotros" || (pathname === "/dashboard")
        },
        { 
            icon: MessageCircle, 
            label: "WhasApp", 
            href: `https://wa.me/18296503337?text=${encodeURIComponent('Hola ARQOVEX, quisiera solicitar información profesional.')}`, 
            isExternal: true 
        }
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-lg z-50 pointer-events-none">
            <div className="bg-[#050810]/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-2 py-2 flex items-center justify-around h-16 pointer-events-auto">
                {navItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = item.active;

                    if (item.isExternal) {
                        return (
                            <a
                                key={idx}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center w-full gap-1 text-gray-400 group active:scale-95 transition-transform"
                            >
                                <div className="p-2 rounded-2xl bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-tight">{item.label}</span>
                            </a>
                        );
                    }

                    return (
                        <Link
                            key={idx}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full gap-1 transition-all duration-300 group ${
                                isActive ? "text-brand-blue" : "text-gray-500"
                            } active:scale-95`}
                        >
                            <div className={`p-2 rounded-2xl transition-all duration-300 ${
                                isActive 
                                    ? "bg-brand-blue/15 shadow-[0_0_15px_rgba(0,102,255,0.2)]" 
                                    : "bg-transparent group-hover:bg-white/5"
                            }`}>
                                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : ""}`} />
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-tight transition-colors ${
                                isActive ? "text-brand-blue" : ""
                            }`}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
