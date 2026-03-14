"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ShoppingBag, User, LogOut, Download, Loader2, ShieldCheck, Plus, Box, UploadCloud, ArrowUpRight, BarChart, TrendingUp } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PlanoCard from "@/components/ui/PlanoCard";
import ProjectStatusCard from "@/components/marketplace/ProjectStatusCard";
import PartnerUploadModal from "@/components/marketplace/PartnerUploadModal";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Plano, Perfil } from "@/types";

type Tab = "adquisiciones" | "favoritos" | "perfil" | "vault";

// Sample fallback data
const sampleFavoritos: Plano[] = [
    { id: "f1", titulo: "Residencia Contemporánea 180m²", descripcion: "Diseño moderno con amplios espacios.", precio: 299, metros_cuadrados: 180, habitaciones: 3, banos: 2, pisos: 1, categoria_id: "m", imagen_url: "", estilo: "Contemporáneo", destacado: true, disponible: true, created_at: new Date().toISOString(), categoria: { id: "m", nombre: "Moderno", slug: "moderno" } },
];

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
                    setFavoritos(sampleFavoritos);
                } else {
                    const favPlanos = (favData?.map((f: { plano: Plano | null }) => f.plano).filter(Boolean) as Plano[]) || [];
                    setFavoritos(favPlanos.length ? favPlanos : sampleFavoritos);
                }
            } catch (err) {
                console.error("Fetch Exception [Favoritos]:", err);
                setFavoritos(sampleFavoritos);
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
            } catch (err) {
                console.error("Fetch Exception [Adquisiciones]:", err);
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
        { id: "favoritos", icon: Heart, label: "Favoritos", count: favoritos.length },
        { id: "perfil", icon: User, label: "Mi Perfil" },
    ];

    if (perfil?.es_socio) {
        tabs.push({ id: "vault", icon: ShieldCheck, label: "The Vault", count: misProyectos.length });
    }

    return (
        <MainLayout>
            <div className="pt-24 pb-16 min-h-screen">
                <div className="container-section">
                    {/* Header */}
                    <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="font-display text-3xl font-bold text-white">
                                Hola, {user?.user_metadata?.full_name?.split(" ")[0] || "Usuario"} 👋
                            </h1>
                            <p className="text-gray-500 text-sm">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-sm text-gray-400 hover:text-red-400 hover:border-red-500/20 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                        </button>
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
                    <div className="flex gap-1 mb-8 glass-card p-1 w-fit rounded-xl">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                        ? "bg-brand-blue text-white shadow-blue-glow"
                                        : "text-gray-400 hover:text-white"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
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
                        <div className="space-y-8 animate-fade-in">
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
                                        <Box className="w-6 h-6 text-brand-blue" />
                                        Mi Inventario (Subadmin)
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">Sube y gestiona tus propiedades o planos arquitectónicos.</p>
                                </div>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="btn-primary flex items-center gap-2 whitespace-nowrap bg-brand-gradient border-none shadow-blue-glow"
                                >
                                    <Plus className="w-4 h-4" />
                                    Publicar Proyecto
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
                                            onDelete={async () => {
                                                if(confirm("¿Estás completamente seguro de que deseas eliminar este proyecto? Esta acción es irreversible.")) {
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
                    />
                )}
            </div>
        </MainLayout>
    );
}

function ProfileEditor({ user, supabase }: { user: import("@supabase/supabase-js").User | null, supabase: ReturnType<typeof import("@/lib/supabase/client").createClient> }) {
    const [nombre, setNombre] = useState(user?.user_metadata?.full_name || "");
    const [telefono, setTelefono] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const loadPerfil = async () => {
            if (!user?.id) return;
            const { data, error } = await supabase.from("perfiles").select("nombre_completo, telefono").eq("id", user.id).maybeSingle();
            if (!error && data) {
                if (data.nombre_completo) setNombre(data.nombre_completo);
                if (data.telefono) setTelefono(data.telefono);
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
                    ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between py-3 border-b border-white/[0.05]">
                            <span className="text-sm text-gray-500">{label}</span>
                            <span className="text-sm text-white font-medium">{value}</span>
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
                    {saved && <p className="text-sm text-green-400 text-center">✓ ¡Perfil actualizado con éxito!</p>}
                </form>
            )}
        </div>
    );
}
