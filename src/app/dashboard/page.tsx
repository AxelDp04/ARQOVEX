"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ShoppingBag, User, LogOut, Download, Loader2, ShieldCheck, Plus, Box, UploadCloud, ArrowUpRight, BarChart, TrendingUp, DollarSign, CheckCircle2, Building2, Clock, Home, CreditCard, FileText, Printer, X, Receipt } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PlanoCard from "@/components/ui/PlanoCard";
import ProjectStatusCard from "@/components/marketplace/ProjectStatusCard";
import dynamic from "next/dynamic";

const PartnerUploadModal = dynamic(() => import("@/components/marketplace/PartnerUploadModal"), { ssr: false });
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Plano, Perfil } from "@/types";

type Tab = "adquisiciones" | "favoritos" | "perfil" | "vault" | "historial";

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<Tab>("adquisiciones");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get("tab") as Tab;
            if (tab && ["adquisiciones", "favoritos", "perfil"].includes(tab)) {
                setActiveTab(tab);
            }
        }
    }, []);

    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [loading, setLoading] = useState(true);
    const [favoritos, setFavoritos] = useState<Plano[]>([]);
    const [adquisiciones, setAdquisiciones] = useState<Plano[]>([]);
    const [misProyectos, setMisProyectos] = useState<Plano[]>([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [planoEnEdicion, setPlanoEnEdicion] = useState<Plano | null>(null);
    const [statsSocio, setStatsSocio] = useState({ ventas: 0, ingresos: 0, leads: 0 });
    const [dashboardMode, setDashboardMode] = useState<'arquitectura' | 'inmobiliaria'>('arquitectura');
    const [ventasHistory, setVentasHistory] = useState<any[]>([]);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState<any>(null);

    // Sync mode with profile or localStorage
    useEffect(() => {
        if (perfil?.categoria_socio === 'mixto') {
            const savedMode = localStorage.getItem('arqovex_dashboard_mode') as 'arquitectura' | 'inmobiliaria';
            if (savedMode) setDashboardMode(savedMode);
        } else if (perfil?.categoria_socio) {
            setDashboardMode(perfil.categoria_socio as 'arquitectura' | 'inmobiliaria');
        }
    }, [perfil]);

    const fetchMisProyectos = useCallback(async (uid: string) => {
        // Fetch Proyectos
        const { data: proyectosData } = await supabase
            .from("planos")
            .select("*, categoria:categorias(*)")
            .eq("vendedor_id", uid);

        if (proyectosData) {
            setMisProyectos(proyectosData);
        }

        // Fetch Sales/Analytics for Partner
        const { data: ventasData } = await supabase
            .from("ventas_planos")
            .select("precio_pagado")
            .in("plano_id", proyectosData?.map(p => p.id) || []);

        const totalIngresos = ventasData?.reduce((acc, curr) => acc + (curr.precio_pagado || 0), 0) || 0;

        setStatsSocio({
            ventas: ventasData?.length || 0,
            ingresos: totalIngresos,
            leads: (proyectosData?.length || 0) * 3 // Mock leads for visual effect
        });
    }, [supabase]);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }
            setUser(user);

            // Fetch favoritos
            try {
                const { data: favData, error: favError } = await supabase
                    .from("favoritos")
                    .select("*, plano:planos(*, categoria:categorias(*), galeria:galeria_propiedades(imagen_url))")
                    .eq("user_id", user.id);

                if (favError) {
                    console.error("Supabase Error [Favoritos]:", favError.message, favError.details);
                    setFavoritos([]); // No fallback data, just empty array
                } else {
                    const favPlanos = (favData?.map((f: { plano: Plano | null }) => f.plano).filter(Boolean) as Plano[]) || [];
                    setFavoritos(favPlanos); // Only use real data
                }
            } catch (err) {
                console.error("Fetch Exception [Favoritos]:", err);
                setFavoritos([]); // No fallback data, just empty array
            }

            // Fetch adquisiciones from both tables
            try {
                const { data: adqData } = await supabase
                    .from("adquisiciones")
                    .select("*, plano:planos(*, categoria:categorias(*), galeria:galeria_propiedades(imagen_url))")
                    .eq("user_id", user.id)
                    .eq("estado", "completado");

                const { data: ventasData } = await supabase
                    .from("ventas_planos")
                    .select("*, plano:planos(*, categoria:categorias(*), galeria:galeria_propiedades(imagen_url))")
                    .eq("usuario_id", user.id)
                    .eq("descarga_habilitada", true);

                const legacyPlanos = (adqData?.map((a: { plano: Plano | null }) => a.plano).filter(Boolean) as Plano[]) || [];
                const newPlanos = (ventasData?.map((v: { plano: Plano | null }) => v.plano).filter(Boolean) as Plano[]) || [];

                // Merge and remove duplicates by ID
                const allPlanos = [...legacyPlanos, ...newPlanos];
                const uniquePlanos = Array.from(new Map(allPlanos.map(item => [item.id, item])).values());

                setAdquisiciones(uniquePlanos);

                // Fetch Sales History (New)
                const { data: historyData } = await supabase
                    .from("ventas_planos")
                    .select("*, plano:planos(titulo, id)")
                    .eq("usuario_id", user.id)
                    .order("created_at", { ascending: false });

                if (historyData) {
                    setVentasHistory(historyData);
                }
            } catch (err) {
                console.error("Fetch Exception [Adquisiciones/History]:", err);
                setAdquisiciones([]);
            }

            // Fetch Perfil & Socio Status
            try {
                const { data: perfilData } = await supabase
                    .from("perfiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (perfilData) {
                    setPerfil(perfilData);

                    if (perfilData.es_socio) {
                        await fetchMisProyectos(user.id);
                    }
                }
            } catch (err) {
                console.error("Fetch Exception [Perfil/Socio]:", err);
            }

            setLoading(false);
        };
        init();
    }, [router, supabase, fetchMisProyectos]);

    const handleRemoveFavorito = async (planoId: string) => {
        if (!user) return;
        await supabase.from("favoritos").delete().eq("user_id", user.id).eq("plano_id", planoId);
        setFavoritos((prev) => prev.filter((p) => p.id !== planoId));
    };

    const handleDownload = async (plano: Plano) => {
        if (!plano.url_archivo) {
            alert("Este archivo aún no está disponible para descarga.");
            return;
        }

        // url_archivo is the path in 'planos-privados'
        const { data, error } = await supabase
            .storage
            .from('planos-privados')
            .createSignedUrl(plano.url_archivo, 60); // 60 seconds link

        if (error) {
            console.error("Error creating signed URL:", error);
            alert("No se pudo obtener el enlace de descarga. Contacta a soporte.");
            return;
        }

        if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank');
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center pt-24">
                    <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
                </div>
            </MainLayout>
        );
    }

    const tabs: { id: Tab; icon: React.ElementType; label: string; count?: number }[] = [
        { id: "adquisiciones", icon: ShoppingBag, label: "Mis Planos", count: adquisiciones.length },
        { id: "historial", icon: CreditCard, label: "Pagos y Facturas" },
        { id: "favoritos", icon: Heart, label: "Favoritos", count: favoritos.length },
        { id: "perfil", icon: User, label: "Mi Perfil" },
    ];

    if (perfil?.es_socio) {
        const effectiveMode = perfil.categoria_socio === 'mixto' ? dashboardMode : perfil.categoria_socio;
        tabs.push({ 
            id: "vault", 
            icon: effectiveMode === 'inmobiliaria' ? Home : ShieldCheck, 
            label: effectiveMode === 'inmobiliaria' ? "Mi Agencia" : "Portal de Socios", 
            count: misProyectos.length 
        });
    }

    return (
        <MainLayout>
            <div className="pt-24 pb-16 min-h-screen">
                <div className="container-section">
                    {/* Header */}
                    <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="font-display text-3xl font-bold text-white">
                                    Hola, {user?.user_metadata?.full_name?.split(" ")[0] || "Usuario"} 👋
                                </h1>
                                {perfil?.es_socio && (
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${perfil.categoria_socio === 'inmobiliaria' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/20'}`}>
                                        {perfil.categoria_socio || 'arquitectura'}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-500 text-sm">{user?.email}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {perfil?.categoria_socio === 'mixto' && activeTab === 'vault' && (
                                <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                                    <button 
                                        onClick={() => {
                                            setDashboardMode('arquitectura');
                                            localStorage.setItem('arqovex_dashboard_mode', 'arquitectura');
                                        }}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dashboardMode === 'arquitectura' ? 'bg-[#0066FF] text-white shadow-blue-glow' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Arquitectura
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setDashboardMode('inmobiliaria');
                                            localStorage.setItem('arqovex_dashboard_mode', 'inmobiliaria');
                                        }}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dashboardMode === 'inmobiliaria' ? 'bg-amber-500 text-white shadow-amber-500/20 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Inmobiliaria
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-sm text-gray-400 hover:text-red-400 hover:border-red-500/20 transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        {[
                            { label: "Planos Adquiridos", value: adquisiciones.length, icon: ShoppingBag },
                            { label: "Favoritos Guardados", value: favoritos.length, icon: Heart },
                            { label: "Cuenta Verificada", value: "✓", icon: User },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="glass-card p-5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-5 h-5 text-brand-blue" />
                                </div>
                                <div>
                                    <div className="font-display text-2xl font-bold text-white">{value}</div>
                                    <div className="text-xs text-gray-500">{label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-8 glass-card p-1 w-full sm:w-fit rounded-xl overflow-x-auto scrollbar-hide flex-nowrap">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-none ${activeTab === tab.id
                                        ? "bg-brand-blue text-white shadow-blue-glow"
                                        : "text-gray-400 hover:text-white"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="whitespace-nowrap">{tab.label}</span>
                                    {tab.count !== undefined && (
                                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id ? "bg-white/20" : "bg-white/10"}`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    {activeTab === "adquisiciones" && (
                        <div>
                            {adquisiciones.length === 0 ? (
                                <div className="text-center py-24 space-y-4">
                                    <div className="text-5xl">📐</div>
                                    <h3 className="font-display text-xl text-white">Aún no tienes planos adquiridos</h3>
                                    <p className="text-gray-500">Explora nuestro catálogo y encuentra el plano perfecto.</p>
                                    <Link href="/catalogo" className="btn-primary inline-flex mt-4">Ver Catálogo</Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {adquisiciones.map((plano) => (
                                        <div key={plano.id} className="relative">
                                            <PlanoCard plano={plano} />
                                            <button
                                                onClick={() => handleDownload(plano)}
                                                className="absolute bottom-16 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue/20 border border-brand-blue/30 text-xs text-brand-blue-light hover:bg-brand-blue/30 transition-colors"
                                            >
                                                <Download className="w-3 h-3" /> Descargar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "historial" && (
                        <div className="animate-fade-in space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-display text-2xl font-bold text-white">Historial de Transacciones</h2>
                                    <p className="text-gray-500 text-sm">Gestiona tus pagos y descarga tus facturas oficiales.</p>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    Pagos Protegidos por SSL & PayPal
                                </div>
                            </div>

                            {ventasHistory.length === 0 ? (
                                <div className="text-center py-24 glass-card border-dashed">
                                    <Receipt className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                    <h3 className="font-display text-xl text-white">No hay transacciones registradas</h3>
                                    <p className="text-gray-500">Cuando realices una compra, aparecerá aquí.</p>
                                </div>
                            ) : (
                                <div className="glass-card overflow-hidden border-white/5">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Factura</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Proyecto</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Fecha</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Monto</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Estado</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.03]">
                                                {ventasHistory.map((venta) => (
                                                    <tr key={venta.id} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs font-mono font-bold text-brand-blue">{venta.factura_numero || `INV-${venta.id.slice(0, 8)}`}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-bold text-white group-hover:text-brand-blue transition-colors">
                                                                {venta.plano?.titulo || "Plan Arquitectónico"}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 font-mono">ID: {venta.paypal_order_id || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-xs text-gray-400">
                                                                {new Date(venta.created_at).toLocaleDateString("es-DO", { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-black text-white italic">${venta.monto_usd || venta.precio_pagado} USD</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                                                                venta.estado_pago === 'COMPLETADO' 
                                                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                                                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                            }`}>
                                                                {venta.estado_pago || 'PAGADO'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedVenta(venta);
                                                                    setShowInvoiceModal(true);
                                                                }}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue/10 border border-brand-blue/20 text-[10px] font-bold text-brand-blue hover:bg-brand-blue hover:text-white transition-all"
                                                            >
                                                                <FileText className="w-3 h-3" /> Ver Factura
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "favoritos" && (
                        <div>
                            {favoritos.length === 0 ? (
                                <div className="text-center py-24 space-y-4">
                                    <div className="text-5xl">❤️</div>
                                    <h3 className="font-display text-xl text-white">No tienes favoritos guardados</h3>
                                    <p className="text-gray-500">Guarda los planos que más te gusten para encontrarlos fácil.</p>
                                    <Link href="/catalogo" className="btn-secondary inline-flex mt-4">Explorar Catálogo</Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {favoritos.map((plano) => (
                                        <PlanoCard
                                            key={plano.id}
                                            plano={plano}
                                            isFavorito={true}
                                            onToggleFavorito={handleRemoveFavorito}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "perfil" && (
                        <div className="max-w-lg">
                            <ProfileEditor user={user} supabase={supabase} />
                        </div>
                    )}

                    {activeTab === "vault" && perfil?.es_socio && (
                        <div className="space-y-12 animate-fade-in relative">
                            {/* NEW: Priority Payout Configuration at the TOP - SOLO ARQUITECTURA / MODO ARQUITECTURA */}
                            {dashboardMode === 'arquitectura' && (
                                <section className="relative">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                <DollarSign className="w-6 h-6 text-emerald-400" />
                                            </div>
                                            <div>
                                                <h2 className="font-display text-2xl font-bold text-white tracking-tight">Configuración de Cobros</h2>
                                                <p className="text-gray-500 text-sm">Gestiona dónde y cómo recibirás tus pagos por cada venta.</p>
                                            </div>
                                        </div>
                                        {!perfil.metodo_pago && (
                                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                                                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Configuración Sugerida</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="max-w-3xl">
                                        <PayoutEditor user={user} supabase={supabase} />
                                    </div>
                                </section>
                            )}

                            <div className="h-px w-full bg-white/[0.03] shadow-[0_1px_0_0_rgba(255,255,255,0.01)]"></div>

                            {/* Partner Sales Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass-card p-6 bg-brand-gradient border-none overflow-hidden relative group">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-white/70 text-xs font-bold uppercase tracking-widest">Ingresos Totales</h3>
                                            <TrendingUp className="w-4 h-4 text-white/50" />
                                        </div>
                                        <div className="text-4xl font-black text-white italic tracking-tighter">${statsSocio.ingresos.toLocaleString()}</div>
                                        <div className="text-[10px] text-white/50 mt-4 uppercase tracking-tighter flex items-center gap-1">
                                            <ArrowUpRight className="w-3 h-3" /> +12% rendimiento este mes
                                        </div>
                                    </div>
                                </div>
                                <div className="glass-card p-6 border-white/5 group hover:border-brand-blue/30 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">Planos Vendidos</h3>
                                        <ShoppingBag className="w-4 h-4 text-brand-blue/50" />
                                    </div>
                                    <div className="text-3xl font-bold text-white tracking-tighter">{statsSocio.ventas}</div>
                                    <div className="flex items-center gap-1 mt-4">
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-brand-blue rounded-full" style={{ width: '65%' }}></div>
                                        </div>
                                        <span className="text-[10px] text-brand-blue font-bold whitespace-nowrap">65% Meta</span>
                                    </div>
                                </div>
                                <div className="glass-card p-6 border-white/5 group hover:border-brand-blue/30 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">Leads Activos</h3>
                                        <BarChart className="w-4 h-4 text-brand-blue/50" />
                                    </div>
                                    <div className="text-3xl font-bold text-white tracking-tighter">{statsSocio.leads}</div>
                                    <div className="text-[10px] text-gray-500 mt-4 flex items-center gap-2">
                                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="uppercase tracking-tighter">Monitoreo en tiempo real</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8 border-t border-white/5">
                                <div>
                                    <h2 className="font-display text-2xl font-bold text-white flex items-center gap-3">
                                        {dashboardMode === 'inmobiliaria' ? (
                                            <><Building2 className="w-6 h-6 text-amber-500" /> Mi Inventario Inmobiliario</>
                                        ) : (
                                            <><Box className="w-6 h-6 text-brand-blue" /> Mi Inventario de Planos</>
                                        )}
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {dashboardMode === 'inmobiliaria' 
                                            ? "Sube y gestiona tus propiedades en venta o alquiler." 
                                            : "Sube y gestiona tus diseños arquitectónicos y modelos 3D."}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className={`btn-primary flex items-center gap-2 whitespace-nowrap border-none shadow-2xl transition-all ${dashboardMode === 'inmobiliaria' ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-brand-gradient shadow-blue-glow'}`}
                                >
                                    <Plus className="w-4 h-4" />
                                    {dashboardMode === 'inmobiliaria' ? "Publicar Inmueble" : "Publicar Diseño"}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {misProyectos.length === 0 ? (
                                    <div className="col-span-full py-20 text-center glass-card border-dashed">
                                        <UploadCloud className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-500 max-w-xs mx-auto">Tu bóveda está vacía. Comienza a publicar para habilitar tu inventario.</p>
                                        <button onClick={() => setShowUploadModal(true)} className="text-brand-blue font-bold mt-4 hover:underline">
                                            Subir mi primer proyecto
                                        </button>
                                    </div>
                                ) : (
                                    misProyectos.map(plano => (
                                        <ProjectStatusCard
                                            key={plano.id}
                                            plano={plano}
                                            onEdit={() => {
                                                setPlanoEnEdicion(plano);
                                                setShowUploadModal(true);
                                            }}
                                            categoriaSocio={dashboardMode}
                                            onDelete={async () => {
                                                if (confirm("¿Estás completamente seguro de que deseas eliminar este proyecto? Esta acción es irreversible.")) {
                                                    const { error } = await supabase.from("planos").delete().eq("id", plano.id);
                                                    if (error) {
                                                        alert("Error al eliminar: " + error.message);
                                                    } else {
                                                        fetchMisProyectos(user!.id);
                                                    }
                                                }
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {user && (
                    <PartnerUploadModal
                        isOpen={showUploadModal}
                        onClose={() => {
                            setShowUploadModal(false);
                            setPlanoEnEdicion(null);
                        }}
                        onSuccess={() => {
                            fetchMisProyectos(user.id);
                            setShowUploadModal(false);
                            setPlanoEnEdicion(null);
                        }}
                        userId={user.id}
                        plano={planoEnEdicion}
                        categoriaSocio={dashboardMode}
                    />
                )}

                {/* MODAL DE FACTURA SPECTACULAR */}
                {showInvoiceModal && selectedVenta && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowInvoiceModal(false)}></div>
                        
                        <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
                            {/* Toolbar */}
                            <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Previsualización de Factura</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => window.print()}
                                        className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                                        title="Imprimir"
                                    >
                                        <Printer className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => setShowInvoiceModal(false)}
                                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Factura Content - Printable Area */}
                            <div id="printable-invoice" className="p-8 md:p-12 text-gray-800 bg-white min-h-[600px] flex flex-col">
                                {/* Header Factura */}
                                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                                    <div className="space-y-4">
                                        <img src="/Logo.png" alt="ARQOVEX" className="h-10 w-auto brightness-0" />
                                        <div className="text-xs text-gray-500 leading-relaxed">
                                            <p className="font-bold text-gray-900">ARQOVEX INTERNACIONAL S.R.L</p>
                                            <p>Santo Domingo, República Dominicana</p>
                                            <p>info@arqovex.com | www.arqovex.com</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h1 className="text-4xl font-black text-gray-900 italic tracking-tighter mb-1">FACTURA</h1>
                                        <p className="text-brand-blue font-mono font-bold">{selectedVenta.factura_numero || `INV-${selectedVenta.id.slice(0, 8)}`}</p>
                                        <div className="mt-4 text-xs text-gray-500">
                                            <p>Fecha de Emisión: <span className="text-gray-900 font-bold">{new Date(selectedVenta.created_at).toLocaleDateString()}</span></p>
                                            <p>Método: <span className="text-gray-900 font-bold">PayPal / Tarjeta</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bill To / Ship To */}
                                <div className="grid grid-cols-2 gap-8 mb-12 py-8 border-y border-gray-100">
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Cliente</h4>
                                        <p className="font-bold text-gray-900">{perfil?.nombre_completo || user?.user_metadata?.full_name || 'Usuario Arqovex'}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Estado del Pago</h4>
                                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                                            {selectedVenta.estado_pago || 'Completado'}
                                        </span>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="flex-grow">
                                    <table className="w-full mb-8">
                                        <thead>
                                            <tr className="border-b-2 border-gray-900">
                                                <th className="py-4 text-left text-[10px] font-black uppercase">Descripción del Producto</th>
                                                <th className="py-4 text-center text-[10px] font-black uppercase">Cant.</th>
                                                <th className="py-4 text-right text-[10px] font-black uppercase">Precio</th>
                                                <th className="py-4 text-right text-[10px] font-black uppercase">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            <tr>
                                                <td className="py-6">
                                                    <p className="font-bold text-gray-900">{selectedVenta.plano?.titulo || "Plan Arquitectónico Digital"}</p>
                                                    <p className="text-[10px] text-gray-500 mt-1">Licencia de uso profesional - Descarga digital inmediata.</p>
                                                </td>
                                                <td className="py-6 text-center font-medium">1</td>
                                                <td className="py-6 text-right font-medium">${(selectedVenta.monto_usd || selectedVenta.precio_pagado).toFixed(2)}</td>
                                                <td className="py-6 text-right font-bold text-gray-900">${(selectedVenta.monto_usd || selectedVenta.precio_pagado).toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-end pt-8 border-t-2 border-gray-900">
                                    <div className="w-full max-w-[240px] space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span className="font-bold text-gray-900">${(selectedVenta.monto_usd || selectedVenta.precio_pagado).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Impuestos (ITBIS 0%)</span>
                                            <span className="font-bold text-gray-900">$0.00</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                            <span className="text-xs font-black uppercase">Total Pagado</span>
                                            <span className="text-2xl font-black text-brand-blue italic">${(selectedVenta.monto_usd || selectedVenta.precio_pagado).toFixed(2)} USD</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Factura */}
                                <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                                    <p className="text-[10px] text-gray-400 font-medium max-w-sm mx-auto">
                                        Gracias por confiar en Arqovex. Esta es una factura generada digitalmente y es válida como comprobante de pago internacional.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

function PayoutEditor({ user, supabase }: { user: import("@supabase/supabase-js").User | null, supabase: ReturnType<typeof import("@/lib/supabase/client").createClient> }) {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [perfil, setPerfil] = useState<Perfil | null>(null);

    // Payout Fields
    const [metodoPago, setMetodoPago] = useState<'paypal' | 'transferencia_local'>('paypal');
    const [paypalEmail, setPaypalEmail] = useState("");
    const [bancoNombre, setBancoNombre] = useState("");
    const [bancoCuenta, setBancoCuenta] = useState("");
    const [cedula, setCedula] = useState("");

    // NEW: Contact info for admin
    const [contactoTelefono, setContactoTelefono] = useState("");
    const [contactoEmail, setContactoEmail] = useState("");

    const loadPerfil = useCallback(async () => {
        if (!user?.id) return;
        const { data, error } = await supabase.from("perfiles").select("*").eq("id", user.id).maybeSingle();
        if (!error && data) {
            setPerfil(data);
            if (data.metodo_pago) setMetodoPago(data.metodo_pago);
            if (data.paypal_email) setPaypalEmail(data.paypal_email);
            if (data.banco_nombre) setBancoNombre(data.banco_nombre);
            if (data.banco_numero_cuenta) setBancoCuenta(data.banco_numero_cuenta);
            if (data.cedula_identidad) setCedula(data.cedula_identidad);
            if (data.telefono) setContactoTelefono(data.telefono);
            if (data.email) setContactoEmail(data.email);

            // If already has method, go to summary mode unless user explicitly clicked edit
            if (data.metodo_pago && !editMode) {
                // Keep editMode false
            } else if (!data.metodo_pago) {
                setEditMode(true);
            }
        }
    }, [user, supabase, editMode]);

    useEffect(() => {
        loadPerfil();
    }, [loadPerfil]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        setSaving(true);
        const { error } = await supabase.from("perfiles").update({
            metodo_pago: metodoPago,
            paypal_email: metodoPago === 'paypal' ? paypalEmail.trim() : null,
            banco_nombre: metodoPago === 'transferencia_local' ? bancoNombre : null,
            banco_numero_cuenta: metodoPago === 'transferencia_local' ? bancoCuenta : null,
            cedula_identidad: metodoPago === 'transferencia_local' ? cedula : null,
            telefono: contactoTelefono.trim(),
            email: contactoEmail.trim() || user.email,
        }).eq("id", user.id);

        setSaving(false);
        if (!error) {
            setSaved(true);
            setEditMode(false);
            loadPerfil();
            setTimeout(() => setSaved(false), 3000);
        } else {
            setLoadError("Error al guardar: " + error.message);
        }
    };

    const handleClear = async () => {
        if (!confirm("¿Deseas eliminar tu configuración de cobro? Tendrás que configurarla de nuevo para recibir pagos.")) return;
        setSaving(true);
        const { error } = await supabase.from("perfiles").update({
            metodo_pago: null,
            paypal_email: null,
            banco_nombre: null,
            banco_numero_cuenta: null,
            cedula_identidad: null
        }).eq("id", user?.id);
        setSaving(false);
        if (!error) {
            setEditMode(true);
            loadPerfil();
        }
    };

    // Summary View (Read-only status)
    if (perfil?.metodo_pago && !editMode) {
        return (
            <div className="bg-emerald-500/[0.03] border border-emerald-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 group hover:bg-emerald-500/[0.05] transition-all duration-500">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 animate-pulse border border-emerald-500/10">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="flex-grow text-center md:text-left space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md">VINCULADO</span>
                        <h3 className="text-xl font-bold text-white">Cuenta de Cobro Lista</h3>
                    </div>
                    <p className="text-gray-400 text-sm max-w-sm">
                        Tus ganancias se enviarán a través de <span className="text-white font-bold">{perfil.metodo_pago === 'paypal' ? 'PayPal' : 'Banco Local'}</span> ({perfil.metodo_pago === 'paypal' ? perfil.paypal_email : perfil.banco_nombre}).
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-[11px] text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" /> Registro Seguro</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-500/50" /> Pagos Verificados</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <button onClick={() => setEditMode(true)} className="btn-ghost py-2.5 px-6 text-xs font-bold border-white/5 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                        <Plus className="w-3.5 h-3.5 rotate-45" /> Editar Datos
                    </button>
                    <button onClick={handleClear} className="text-[10px] text-gray-600 hover:text-red-400 transition-colors uppercase font-black text-center mt-1">
                        Desvincular Cuenta
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="glass-card p-8 space-y-8 border-brand-blue/20 relative overflow-hidden group shadow-2xl">
            {/* Visual background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* Section 1: Payment Method */}
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h4 className="text-xs font-black text-brand-blue uppercase tracking-[0.2em]">1. Selección de Cobro</h4>
                        <p className="text-[11px] text-gray-500">¿Cómo prefieres recibir tus ingresos?</p>
                    </div>

                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10">
                        <button
                            type="button"
                            onClick={() => setMetodoPago('paypal')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${metodoPago === 'paypal' ? 'bg-brand-blue text-white shadow-blue-glow translate-y-[-1px]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Box className="w-4 h-4" /> PAYPAL (USD)
                        </button>
                        <button
                            type="button"
                            onClick={() => setMetodoPago('transferencia_local')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${metodoPago === 'transferencia_local' ? 'bg-brand-blue text-white shadow-blue-glow translate-y-[-1px]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Building2 className="w-4 h-4" /> BANCO LOCAL (RD)
                        </button>
                    </div>

                    {metodoPago === 'paypal' ? (
                        <div className="space-y-2 animate-fade-in">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Email de PayPal Empresa *</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-blue/50 italic text-sm">@</span>
                                <input
                                    type="email"
                                    value={paypalEmail}
                                    onChange={(e) => setPaypalEmail(e.target.value)}
                                    required={metodoPago === 'paypal'}
                                    placeholder="correo@ejemplo.com"
                                    className="input-field py-4 pl-10 bg-black/40 border-white/5"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 animate-fade-in">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Institución Financiera * (Ej: Banreservas)</label>
                                <input
                                    type="text"
                                    value={bancoNombre}
                                    onChange={(e) => setBancoNombre(e.target.value)}
                                    required={metodoPago === 'transferencia_local'}
                                    placeholder="Nombre del Banco"
                                    className="input-field py-4 bg-black/40 border-white/5"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Número de Cuenta *</label>
                                    <input
                                        type="text"
                                        value={bancoCuenta}
                                        onChange={(e) => setBancoCuenta(e.target.value)}
                                        required={metodoPago === 'transferencia_local'}
                                        placeholder="000-000000-0"
                                        className="input-field py-4 bg-black/40 border-white/5 font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Identificación (Cédula) *</label>
                                    <input
                                        type="text"
                                        value={cedula}
                                        onChange={(e) => setCedula(e.target.value)}
                                        required={metodoPago === 'transferencia_local'}
                                        placeholder="000-0000000-0"
                                        className="input-field py-4 bg-black/40 border-white/5 font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 2: Contact Info */}
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h4 className="text-xs font-black text-brand-blue uppercase tracking-[0.2em]">2. Contacto de Seguridad</h4>
                        <p className="text-[11px] text-gray-500">¿Cómo te contactamos ante dudas con el pago?</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Teléfono de Enlace Directo *</label>
                            <input
                                type="tel"
                                value={contactoTelefono}
                                onChange={(e) => setContactoTelefono(e.target.value)}
                                required
                                placeholder="+1 (809) 000-0000"
                                className="input-field py-4 bg-black/40 border-white/5"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Correo de Verificación *</label>
                            <input
                                type="email"
                                value={contactoEmail}
                                onChange={(e) => setContactoEmail(e.target.value)}
                                required
                                placeholder="tu-correo@confirmacion.com"
                                className="input-field py-4 bg-black/40 border-white/5"
                            />
                        </div>
                        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            <p className="text-[10px] text-emerald-400/80 leading-relaxed">
                                Arqovex procesa tus pagos de forma estrictamente privada. Tu información de contacto es utilizada exclusivamente para coordinar transferencias exitosas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5 relative z-10">
                <p className="text-[11px] text-gray-600 text-center md:text-left italic">
                    Al guardar, confirmas que los datos ingresados son correctos y habilitas el flujo de cobros.
                </p>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {perfil?.metodo_pago && (
                        <button type="button" onClick={() => setEditMode(false)} className="btn-ghost py-3 px-6 text-xs text-gray-500">
                            Cancelar
                        </button>
                    )}
                    <button type="submit" disabled={saving} className="btn-primary flex-1 md:flex-none py-4 px-10 bg-emerald-600 text-xs font-black border-none hover:bg-emerald-500 shadow-emerald-500/20 shadow-2xl transition-all flex items-center justify-center gap-3">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <><CheckCircle2 className="w-5 h-5" /> VINCULAR MI CUENTA DE COBRO</>
                        )}
                    </button>
                </div>
            </div>

            {saved && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="text-center space-y-4 p-8 glass-card border-emerald-500/50">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                        <h3 className="text-xl font-black text-white uppercase tracking-[0.2em]">¡Cuenta Vinculada!</h3>
                        <p className="text-gray-400 text-sm">Tus datos de cobro han sido registrados con éxito.</p>
                    </div>
                </div>
            )}
            {loadError && <p className="text-xs text-red-500 text-center font-bold italic mt-4">{loadError}</p>}
        </form>
    );
}

function ProfileEditor({ user, supabase }: { user: import("@supabase/supabase-js").User | null, supabase: ReturnType<typeof import("@/lib/supabase/client").createClient> }) {
    const [nombre, setNombre] = useState(user?.user_metadata?.full_name || "");
    const [telefono, setTelefono] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [perfil, setPerfil] = useState<Perfil | null>(null);

    // Payout Fields
    const [metodoPago, setMetodoPago] = useState<'paypal' | 'transferencia_local'>('paypal');
    const [paypalEmail, setPaypalEmail] = useState("");
    const [bancoNombre, setBancoNombre] = useState("");
    const [bancoCuenta, setBancoCuenta] = useState("");
    const [cedula, setCedula] = useState("");

    useEffect(() => {
        const loadPerfil = async () => {
            if (!user?.id) return;
            const { data, error } = await supabase.from("perfiles").select("*").eq("id", user.id).maybeSingle();
            if (!error && data) {
                setPerfil(data);
                if (data.nombre_completo) setNombre(data.nombre_completo);
                if (data.telefono) setTelefono(data.telefono);
                if (data.metodo_pago) setMetodoPago(data.metodo_pago);
                if (data.paypal_email) setPaypalEmail(data.paypal_email);
                if (data.banco_nombre) setBancoNombre(data.banco_nombre);
                if (data.banco_numero_cuenta) setBancoCuenta(data.banco_numero_cuenta);
                if (data.cedula_identidad) setCedula(data.cedula_identidad);
            } else if (error) {
                setLoadError("No se pudo cargar tu perfil.");
            }
        };
        loadPerfil();
    }, [user, supabase]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        setSaving(true);
        const { error } = await supabase.from("perfiles").upsert({
            id: user.id,
            nombre_completo: nombre.trim(),
            email: user.email?.trim(),
            telefono: telefono.trim() || null,
            metodo_pago: metodoPago,
            paypal_email: metodoPago === 'paypal' ? paypalEmail.trim() : null,
            banco_nombre: metodoPago === 'transferencia_local' ? bancoNombre : null,
            banco_numero_cuenta: metodoPago === 'transferencia_local' ? bancoCuenta : null,
            cedula_identidad: metodoPago === 'transferencia_local' ? cedula : null,
        }, { onConflict: "id" });
        setSaving(false);
        if (!error) {
            setSaved(true);
            setEditMode(false);
            setTimeout(() => setSaved(false), 3000);
        } else {
            setLoadError("Error al guardar: " + error.message);
        }
    };

    const initial = (nombre || user?.email || "U").charAt(0).toUpperCase();

    return (
        <div className="glass-card p-8 space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-brand-gradient flex items-center justify-center text-2xl font-bold text-white shadow-blue-glow">
                    {initial}
                </div>
                <div>
                    <h3 className="font-display text-xl font-bold text-white">{nombre || "Sin nombre"}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
            </div>
            {loadError && <p className="text-sm text-red-400">{loadError}</p>}
            {!editMode ? (
                <div className="space-y-3">
                    {[
                        { label: "Email", value: user?.email || "-" },
                        { label: "Nombre", value: nombre || "No especificado" },
                        { label: "Teléfono", value: telefono || "No especificado" },
                        { label: "Miembro desde", value: user?.created_at ? new Date(user.created_at).toLocaleDateString("es-DO", { year: "numeric", month: "long" }) : "-" },
                        ...(perfil?.es_socio ? [{
                            label: "Categoría",
                            value: perfil.categoria_socio || 'arquitectura'
                        }] : []),
                        ...(perfil?.es_socio && perfil.categoria_socio === 'arquitectura' ? [{
                            label: "Método de Pago",
                            value: perfil.metodo_pago === 'paypal' ? `PayPal (${perfil.paypal_email})` : `${perfil.banco_nombre} (Cuenta: ${perfil.banco_numero_cuenta})`
                        }] : [])
                    ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between py-3 border-b border-white/[0.05]">
                            <span className="text-sm text-gray-500">{label}</span>
                            <span className="text-sm text-white font-medium text-right">{value}</span>
                        </div>
                    ))}
                    <button onClick={() => setEditMode(true)} className="btn-primary w-full py-3 mt-4">
                        Editar Perfil
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nombre Completo *</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            placeholder="Tu nombre completo"
                            className="input-field py-3"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Teléfono (Opcional)</label>
                        <input
                            type="tel"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            placeholder="+1 (809) 000-0000"
                            className="input-field py-3"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={saving} className="btn-primary flex-1 py-3">
                            {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Guardar Cambios"}
                        </button>
                        <button type="button" onClick={() => setEditMode(false)} className="btn-ghost flex-1 py-3">
                            Cancelar
                        </button>
                    </div>

                    {perfil?.es_socio && (
                        <div className="pt-6 border-t border-white/[0.05]">
                            <h4 className="text-xs font-bold text-brand-blue uppercase tracking-widest mb-4">Información de Cobro</h4>
                            <PayoutEditor user={user} supabase={supabase} />
                        </div>
                    )}

                    {saved && <p className="text-sm text-green-400 text-center">✓ ¡Perfil actualizado con éxito!</p>}
                </form>
            )}
        </div>
    );
}
