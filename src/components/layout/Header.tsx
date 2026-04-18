"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, Heart, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LOGO_SRC } from "@/lib/constants";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
    { href: "/catalogo?seccion=planos", label: "Arquitectura" },
    { href: "/catalogo?seccion=inmobiliaria", label: "Inmobiliaria" },
    { href: "/vender-con-nosotros", label: "Asóciate" },
    { href: "/contacto", label: "Contacto" },
];

const ADMIN_EMAILS = ['axelp7223@gmail.com', 'arqovex@gmail.com', 'robertoficial69@hotmail.com'];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSocio, setIsSocio] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const checkProfile = async (userId: string) => {
            try {
                const { data, error } = await supabase.from('perfiles').select('es_admin, es_socio').eq('id', userId).maybeSingle();
                if (!error && data) {
                    setIsAdmin(data.es_admin === true);
                    setIsSocio(data.es_socio === true);
                }
            } catch (err) {
                console.error("Profile check Exception:", err);
            }
        };

        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            if (data.user) {
                const userEmail = data.user.email?.toLowerCase();
                if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
                    setIsAdmin(true);
                }
                checkProfile(data.user.id);
            }
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                const userEmail = currentUser.email?.toLowerCase();
                if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
                    setIsAdmin(true);
                }
                checkProfile(currentUser.id);
            } else {
                setIsAdmin(false);
                setIsSocio(false);
            }
        });
        return () => listener.subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsUserMenuOpen(false);
        window.location.href = "/";
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? "bg-[var(--page-bg)]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
                : "bg-transparent"
                }`}
        >
            <div className="container-section">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-0 group">
                        <div className="relative w-9 h-9 md:w-11 md:h-11 transition-transform duration-300 group-hover:scale-110">
                            <Image
                                src={LOGO_SRC}
                                alt="ARQOVEX Logo"
                                fill
                                sizes="100vw"
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="font-display text-xl md:text-2xl font-bold tracking-tight">
                            <span className="text-white">ARQ</span>
                            <span className="text-brand-blue">OVEX</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isAssociateLink = link.href === "/vender-con-nosotros";
                            const dynamicLabel = (isAssociateLink && isSocio) ? "Portal de Socios" : link.label;
                            const dynamicHref = (isAssociateLink && isSocio) ? "/dashboard?tab=vault" : link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={dynamicHref}
                                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                                >
                                    {dynamicLabel}
                                </Link>
                            );
                        })}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 px-5 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600 hover:from-amber-500 hover:to-amber-700 rounded-xl transition-all duration-300 ml-2 shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] scale-105"
                            >
                                <Shield className="w-3.5 h-3.5 fill-slate-950" />
                                PANEL ADMIN
                            </Link>
                        )}
                    </nav>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card hover:border-brand-blue/30 transition-all duration-200"
                                >
                                    <div className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm text-gray-300 max-w-[120px] truncate">{user.email}</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-52 glass-card border border-white/10 rounded-xl overflow-hidden shadow-card z-50">
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            <LayoutDashboard className="w-4 h-4 text-brand-blue" />
                                            Mi Dashboard
                                        </Link>
                                        {isAdmin && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-amber-400 hover:bg-amber-400/10 transition-colors"
                                            >
                                                <Shield className="w-4 h-4 fill-amber-400/20" />
                                                PANEL CONTROL
                                            </Link>
                                        )}
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            <Heart className="w-4 h-4 text-brand-blue" />
                                            Mis Favoritos
                                        </Link>
                                        <div className="h-px bg-white/5 mx-3" />
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/auth/login" className="btn-ghost text-sm px-4 py-2">
                                    Iniciar Sesión
                                </Link>
                                <Link href="/auth/registro" className="btn-primary text-sm px-5 py-2.5">
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-[var(--page-bg)]/98 backdrop-blur-xl border-t border-white/[0.06]">
                    <div className="container-section py-4 space-y-1">
                        {navLinks.map((link) => {
                            const isAssociateLink = link.href === "/vender-con-nosotros";
                            const dynamicLabel = (isAssociateLink && isSocio) ? "Portal de Socios" : link.label;
                            const dynamicHref = (isAssociateLink && isSocio) ? "/dashboard?tab=vault" : link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={dynamicHref}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    {dynamicLabel}
                                </Link>
                            );
                        })}
                        <div className="h-px bg-white/5 my-2" />
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    <LayoutDashboard className="w-4 h-4 text-brand-blue" />
                                    Mi Dashboard
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-amber-400 bg-amber-400/5 font-bold rounded-xl transition-colors border border-amber-400/20"
                                    >
                                        <Shield className="w-4 h-4 fill-amber-400/20" />
                                        PANEL ADMINISTRACIÓN
                                    </Link>
                                )}
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/5 rounded-xl transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Cerrar Sesión
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2 pt-2">
                                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="btn-ghost text-center">
                                    Iniciar Sesión
                                </Link>
                                <Link href="/auth/registro" onClick={() => setIsMenuOpen(false)} className="btn-primary text-center">
                                    Registrarse Gratis
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
