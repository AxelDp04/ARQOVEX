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
            label: isAdmin ? "Admin" : (isSocio ? "Portal" : "Socio"), 
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
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--page-bg)]/80 backdrop-blur-xl border-t border-white/5 pb-safe pb-2">
            <div className="flex items-center justify-around h-16">
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
                                className="flex flex-col items-center justify-center w-full gap-1 text-gray-400"
                            >
                                <div className="p-2 rounded-xl bg-green-500/10 text-green-500">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                            </a>
                        );
                    }

                    return (
                        <Link
                            key={idx}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full gap-1 transition-all duration-300 ${
                                isActive ? "text-brand-blue" : "text-gray-500"
                            }`}
                        >
                            <div className={`p-2 rounded-xl transition-all duration-300 ${
                                isActive ? "bg-brand-blue/10 scale-110" : "bg-transparent"
                            }`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
