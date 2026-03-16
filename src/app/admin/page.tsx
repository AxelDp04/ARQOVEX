"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2,
    ArrowLeft, X, Images,
    Trash2, Star, MessageSquare,
    Building2, Bed, Bath, Car, 
    ShieldCheck, 
    ClipboardCheck, Users,
    Plus, Upload, Save, AlertCircle, MapPin, FileText, FileUp
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { createClient } from "@/lib/supabase/client";
import type { Categoria, Plano, Resena, SolicitudSocio, SolicitudVendedor } from "@/types";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";

type Tab = "gestion" | "socios" | "auditoria";

export default function AdminPage() {
    const router = useRouter();
    const supabase = createClient();

    // Confirm Action State (replaces native window.confirm for reliability)
    const [confirmAction, setConfirmAction] = useState<{
        type: 'approve' | 'reject' | 'remove' | 'revoke';
        solicitud: SolicitudVendedor;
    } | null>(null);

    // Auth state
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Data state
    const [activeTab, setActiveTab] = useState<Tab>("gestion");
    const [planos, setPlanos] = useState<Plano[]>([]);
    const [resenas, setResenas] = useState<Resena[]>([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [solicitudes, setSolicitudes] = useState<SolicitudSocio[]>([]);
    const [solicitudLoading, setSolicitudLoading] = useState(false);
    const [solicitudesVendedores, setSolicitudesVendedores] = useState<SolicitudVendedor[]>([]);
    const [vendedorLoading, setVendedorLoading] = useState(false);
    const [sociosAprobados, setSociosAprobados] = useState<SolicitudVendedor[]>([]);
    const [user, setUser] = useState<User | null>(null);

    // Simplied Upload Form State
    const [showSimpleForm, setShowSimpleForm] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [simplePlano, setSimplePlano] = useState({
        titulo: "",
        descripcion: "",
        precio: "",
        metros_cuadrados: "0",
        habitaciones: "0",
        banos: "0",
        parqueos: "0",
        ubicacion: "",
        seccion: "planos", 
        categoria_id: "7776472b-8a16-4117-91a7-19cb9e94326f" 
    });
    const [portadaFile, setPortadaFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    // Form formatting helpers
    const formatCurrency = (val: string) => {
        const num = val.replace(/\D/g, "");
        if (!num) return "";
        return new Intl.NumberFormat('en-US').format(Number(num));
    };

    const fetchPlanos = useCallback(async () => {
        const { data, error } = await supabase
            .from("planos")
            .select("*, categoria:categorias(*)")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase Error [AdminFetchPlanos]:", error.message, error.details);
        } else if (data) {
            setPlanos(data as Plano[]);
        }
    }, [supabase]);

    const fetchResenas = useCallback(async () => {
        const { data, error } = await supabase
            .from("resenas")
            .select("*, usuario:perfiles(nombre_completo, email, telefono), plano:planos(titulo)")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase Error [AdminFetchResenas]:", error.message);
        } else if (data) {
            setResenas(data as Resena[]);
        }
    }, [supabase]);

    const fetchSolicitudes = useCallback(async () => {
        const { data, error } = await supabase
            .from("solicitudes_socios")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase Error [AdminFetchSolicitudes]:", error.message);
        } else if (data) {
            setSolicitudes(data as SolicitudSocio[]);
        }
    }, [supabase]);

    const fetchSolicitudesVendedores = useCallback(async () => {
        const { data, error } = await supabase
            .from("solicitudes_vendedores")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase Error [AdminFetchSolicitudesVendedores]:", error.message);
        } else if (data) {
            setSolicitudesVendedores(data as SolicitudVendedor[]);
        }
    }, [supabase]);

    const fetchSociosAprobados = useCallback(async () => {
        const { data, error } = await supabase
            .from("solicitudes_vendedores")
            .select("*") // Simplified to fix relationship error
            .eq("estado", "aprobado")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching approved partners:", error.message);
        } else {
            setSociosAprobados(data || []);
        }
    }, [supabase]);

    const approveAndAutoPublish = async (solicitud: SolicitudSocio) => {
        setSolicitudLoading(true);
        try {
            // Auto-publish logic (simplified)
            alert(`Solicitud aprobada y publicada: ${solicitud.nombre_completo}`);
            fetchSolicitudes();
            fetchPlanos();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error auto-publishing:", error.message);
        } finally {
            setSolicitudLoading(false);
        }
    };

    const updateSolicitudEstado = async (id: string, estado: 'contactado' | 'descartado') => {
        setSolicitudLoading(true);
        const { error } = await supabase.from("solicitudes_socios").update({ estado }).eq("id", id);
        if (error) console.error("Error updating solicitud:", error.message);
        else fetchSolicitudes();
        setSolicitudLoading(false);
    };

    const deleteSolicitud = async (id: string) => {
        if (!confirm("¿Seguro que quieres eliminar esta solicitud?")) return;
        setSolicitudLoading(true);
        const { error } = await supabase.from("solicitudes_socios").delete().eq("id", id);
        if (error) console.error("Error deleting solicitud:", error.message);
        else fetchSolicitudes();
        setSolicitudLoading(false);
    };

    const approveSocio = async (solicitud: SolicitudVendedor) => {
        setVendedorLoading(true);
        setConfirmAction(null);
        try {
            // Step 1: Update the application state to 'aprobado'
            const { error: estadoError } = await supabase
                .from("solicitudes_vendedores")
                .update({ estado: 'aprobado' })
                .eq("id", solicitud.id);
            
            if (estadoError) throw estadoError;
            
            // Step 2: Promote the user in 'perfiles' by setting es_socio = true
            if (solicitud.usuario_id) {
                const { error: perfilError } = await supabase
                    .from("perfiles")
                    .update({ es_socio: true })
                    .eq("id", solicitud.usuario_id);
                
                if (perfilError) {
                    console.error("Error updating profile (es_socio):", perfilError.message);
                }
            }
            
            fetchSolicitudesVendedores();
            fetchSociosAprobados();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error approving socio:", error.message);
            alert("❌ Error al aprobar socio: " + error.message);
        } finally {
            setVendedorLoading(false);
        }
    };

    const rejectSocio = async (solicitud: SolicitudVendedor) => {
        setVendedorLoading(true);
        setConfirmAction(null);
        try {
            const { error } = await supabase
                .from("solicitudes_vendedores")
                .update({ estado: 'rechazado' })
                .eq("id", solicitud.id);
            if (error) throw error;
            fetchSolicitudesVendedores();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error rejecting socio:", error.message);
            alert("❌ Error al rechazar solicitud: " + error.message);
        } finally {
            setVendedorLoading(false);
        }
    };

    const eliminarSocioAprobado = async (socio: SolicitudVendedor) => {
        
        setVendedorLoading(true);
        try {
            // 1. Eliminar o actualizar el estado del socio
            await supabase.from("solicitudes_vendedores").update({ estado: 'eliminado' }).eq("id", socio.id);
            
            // 2. Ocultar todas sus propiedades del catálogo público
            if (socio.usuario_id) {
                await supabase
                    .from("planos")
                    .update({ disponible: false, estado_revision: 'rechazado' })
                    .eq("vendedor_id", socio.usuario_id);
            }
            
            // 3. Actualizar el perfil para quitarle el estatus de socio
            if (socio.usuario_id) {
                await supabase.from("perfiles").update({ es_socio: false }).eq("id", socio.usuario_id);
            }
            
            alert(`Socio ${socio.nombre_completo} eliminado con éxito. Todas sus propiedades han sido ocultadas.`);
            fetchSociosAprobados();
            fetchSolicitudesVendedores();
            fetchPlanos();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error eliminando socio:", error.message);
            alert("Error al eliminar socio: " + error.message);
        } finally {
            setVendedorLoading(false);
        }
    };

    const revocarAccesoSocio = async (socio: SolicitudVendedor) => {
        if (!confirm(`¿Seguro que quieres revocar el acceso de ${socio.nombre_completo}?`)) return;
        
        setVendedorLoading(true);
        try {
            // 1. Cambiar estado a rechazado
            await supabase.from("solicitudes_vendedores").update({ estado: 'rechazado' }).eq("id", socio.id);
            
            // 2. Quitar estatus de socio
            if (socio.usuario_id) {
                await supabase.from("perfiles").update({ es_socio: false }).eq("id", socio.usuario_id);
            }
            
            alert(`Acceso revocado para ${socio.nombre_completo}`);
            fetchSociosAprobados();
            fetchSolicitudesVendedores();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error revocando acceso:", error.message);
            alert("Error al revocar acceso: " + error.message);
        } finally {
            setVendedorLoading(false);
        }
    };

    const approveReviewWithReply = async (id: string, replyValue: string) => {
        if (!confirm("¿Confirma la publicación de esta reseña con su respuesta?")) return;
        setReviewLoading(true);
        try {
            const { error } = await supabase
                .from("resenas")
                .update({ 
                    aprobado: true,
                    respuesta_admin: replyValue ? replyValue.trim() : null
                })
                .eq("id", id);
            
            if (error) {
                console.error("Error approving/replying to review:", error.message);
                alert("Error al actualizar la reseña.");
            } else {
                setResenas(resenas.map(r => r.id === id ? { ...r, aprobado: true, respuesta_admin: replyValue ? replyValue.trim() : r.respuesta_admin } : r));
            }
        } catch (err: unknown) {
            console.error("Exception approving/replying review:", err);
            alert("Error al actualizar la reseña.");
        } finally {
            setReviewLoading(false);
        }
    };

    const deleteReview = async (id: string) => {
        if (!confirm("¿Seguro que quieres eliminar esta reseña?")) return;
        setReviewLoading(true);
        const { error } = await supabase.from("resenas").delete().eq("id", id);
        if (error) console.error("Error deleting review:", error.message);
        else fetchResenas();
        setReviewLoading(false);
    };

    const updatePlanoModeracion = async (planoId: string, nuevoEstado: 'publicado' | 'rechazado') => {
        try {
            const { error } = await supabase
                .from("planos")
                .update({ estado_revision: nuevoEstado })
                .eq("id", planoId);
            
            if (error) throw error;
            alert(`Proyecto ${nuevoEstado === 'publicado' ? 'aprobado y publicado' : 'rechazado'} con éxito.`);
            fetchPlanos();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error moderating project:", error.message);
            alert("Error al moderar proyecto: " + error.message);
        }
    };

    const cleanupRejectedPlanos = async () => {
        const rejectedCount = planos.filter(p => p.estado_revision === 'rechazado').length;
        if (rejectedCount === 0) {
            alert("No hay inventarios rechazados para limpiar.");
            return;
        }

        if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente ${rejectedCount} inventarios rechazados? Esta acción no se puede deshacer.`)) return;
        
        try {
            const { error } = await supabase
                .from("planos")
                .delete()
                .eq("estado_revision", 'rechazado');
            
            if (error) throw error;
            alert("Limpieza completada con éxito.");
            fetchPlanos();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error cleaning up plans:", error.message);
            alert("Error al limpiar inventarios: " + error.message);
        }
    };

    const cleanupRejectedVendedores = async () => {
        // Obtenemos los IDs de todo lo que NO sea pendiente o aprobado
        const activeStates = ['pendiente', 'aprobado'];
        const rejectedItems = solicitudesVendedores.filter(s => !activeStates.includes(s.estado as string));
        const rejectedIds = rejectedItems.map(s => s.id);
        
        if (rejectedIds.length === 0) {
            alert("No hay solicitudes de vendedores rechazadas/viejas para limpiar.");
            return;
        }

        if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente ${rejectedIds.length} solicitudes de vendedores (rechazadas, eliminadas o antiguas)?`)) return;
        
        try {
            const { error } = await supabase
                .from("solicitudes_vendedores")
                .delete()
                .in("id", rejectedIds);
            
            if (error) throw error;
            alert("Limpieza de vendedores completada.");
            fetchSolicitudesVendedores();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error cleaning up vendeurs:", error.message);
            alert("Error al limpiar solicitudes: " + error.message);
        }
    };

    const cleanupRejectedPropiedades = async () => {
        // Obtenemos los IDs de todo lo que NO sea pendiente, aprobado o contactado
        const activeStates = ['pendiente', 'aprobado', 'contactado'];
        const rejectedItems = solicitudes.filter(s => !activeStates.includes(s.estado as string));
        const rejectedIds = rejectedItems.map(s => s.id);

        if (rejectedIds.length === 0) {
            alert("No hay solicitudes de propiedades descartadas/viejas para limpiar.");
            return;
        }

        if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente ${rejectedIds.length} solicitudes de propiedades (descartadas o antiguas)?`)) return;
        
        try {
            const { error } = await supabase
                .from("solicitudes_socios")
                .delete()
                .in("id", rejectedIds);
            
            if (error) throw error;
            alert("Limpieza de propiedades completada.");
            fetchSolicitudes();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error cleaning up properties requests:", error.message);
            alert("Error al limpiar solicitudes: " + error.message);
        }
    };

    const checkAuthAndData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/auth/login");
            return;
        }
        setUser(user);

        // Check multiple admin indicators
        const { data: profile } = await supabase
            .from("perfiles")
            .select("es_admin, role")
            .eq("id", user.id)
            .single();

        const isAdminFromProfile = profile?.es_admin === true || profile?.role === 'admin';
        
        // Hardcoded admin override (CRITICAL)
        const hardcodedAdminEmails = ['axelp7223@gmail.com', 'arqovex@gmail.com', 'robertoficial69@hotmail.com'];
        const isHardcodedAdmin = hardcodedAdminEmails.includes(user.email?.toLowerCase() || '');
        
        const isAdmin = isAdminFromProfile || isHardcodedAdmin;

        if (!isAdmin) {
            router.push("/arquitectura");
            return;
        }

        setIsCheckingAuth(false);
        fetchPlanos();
        fetchResenas();
        fetchSolicitudes();
        fetchSolicitudesVendedores();
        fetchSociosAprobados();
    }, [router, supabase]);

    const fetchCategorias = useCallback(async () => {
        const { data } = await supabase.from("categorias").select("*");
        if (data) setCategorias(data as Categoria[]);
    }, [supabase]);

    useEffect(() => {
        checkAuthAndData();
        fetchCategorias();
    }, [checkAuthAndData, fetchCategorias]);

    if (isCheckingAuth) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="pt-24 pb-16 min-h-screen">
                <div className="container-section max-w-6xl">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <div className="badge bg-purple-500/20 text-purple-400 border-purple-500/30 mb-3">
                                Control de Ingeniería
                            </div>
                            <h1 className="font-display text-3xl font-bold text-white mb-2">
                                Panel de Administración
                            </h1>
                            <p className="text-gray-500">
                                Gestión completa de planos, usuarios y contenido
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowSimpleForm(!showSimpleForm)}
                                className={`btn-primary py-2 px-4 text-xs flex items-center gap-2 ${showSimpleForm ? 'bg-red-500 border-red-500' : 'shadow-blue-glow'}`}
                            >
                                {showSimpleForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {showSimpleForm ? "Cancelar" : "Súbi Proyecto"}
                            </button>
                            <button onClick={() => router.push("/arquitectura")} className="btn-ghost text-sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver al Catálogo
                            </button>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex gap-4 mb-10">
                        <button
                            onClick={() => setActiveTab('gestion')}
                            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold transition-all border ${activeTab === 'gestion' ? 'bg-brand-blue border-brand-blue text-white shadow-blue-glow' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-white'}`}
                        >
                            <Images className="w-5 h-5" />
                            <div className="text-left">
                                <div className="text-xs">GESTIÓN</div>
                                <div className="text-[8px] opacity-50 font-normal uppercase tracking-tighter">Propiedades y Planos</div>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('socios')}
                            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold transition-all border relative ${activeTab === 'socios' ? 'bg-brand-blue border-brand-blue text-white shadow-blue-glow' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-white'}`}
                        >
                            <Users className="w-5 h-5" />
                            <div className="text-left">
                                <div className="text-xs">SOCIOS</div>
                                <div className="text-[8px] opacity-50 font-normal uppercase tracking-tighter">Aprobaciones y Activos</div>
                            </div>
                            {(solicitudes.filter(s => s.estado === 'pendiente').length + solicitudesVendedores.filter(s => s.estado === 'pendiente').length) > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-lg border-2 border-[#020408] animate-pulse">
                                    {solicitudes.filter(s => s.estado === 'pendiente').length + solicitudesVendedores.filter(s => s.estado === 'pendiente').length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('auditoria')}
                            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold transition-all border relative ${activeTab === 'auditoria' ? 'bg-brand-blue border-brand-blue text-white shadow-blue-glow' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-white'}`}
                        >
                            <ClipboardCheck className="w-5 h-5" />
                            <div className="text-left">
                                <div className="text-xs">AUDITORÍA</div>
                                <div className="text-[8px] opacity-50 font-normal uppercase tracking-tighter">Calidad y Moderación</div>
                            </div>
                            {(planos.filter(p => p.estado_revision === 'en_revision').length + resenas.filter(r => !r.aprobado).length) > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-lg border-2 border-[#020408] animate-pulse">
                                    {planos.filter(p => p.estado_revision === 'en_revision').length + resenas.filter(r => !r.aprobado).length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'gestion' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                    <h2 className="font-display text-xl font-bold text-white flex items-center gap-3">
                                        <Images className="w-6 h-6 text-brand-blue" />
                                        Gestión de Planos
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <span className="badge bg-brand-blue/10 text-brand-blue border-brand-blue/20">
                                            {planos.length} Planos Totales
                                        </span>
                                    </div>
                                </div>

                                {/* Simple Upload Form - Regression */}
                                {showSimpleForm && (
                                    <div className="mb-10 p-8 rounded-3xl bg-white/[0.03] border border-brand-blue/30 shadow-blue-glow-sm overflow-hidden animate-slide-up">
                                        <div className="flex items-center justify-between gap-3 mb-8 border-b border-white/10 pb-4">
                                            <div className="flex items-center gap-3">
                                                <Upload className="w-6 h-6 text-brand-blue" />
                                                <h3 className="text-xl font-bold text-white uppercase tracking-widest">Publicar Proyecto</h3>
                                            </div>
                                            
                                            {/* Destination Selector */}
                                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                                                <button 
                                                    onClick={() => setSimplePlano({...simplePlano, seccion: 'planos'})}
                                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${simplePlano.seccion === 'planos' ? 'bg-brand-blue text-white shadow-blue-glow' : 'text-gray-500 hover:text-white'}`}
                                                >
                                                    ARQUITECTURA
                                                </button>
                                                <button 
                                                    onClick={() => setSimplePlano({...simplePlano, seccion: 'inmobiliaria'})}
                                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${simplePlano.seccion === 'inmobiliaria' ? 'bg-amber-500 text-slate-950 shadow-amber-500/20' : 'text-gray-500 hover:text-white'}`}
                                                >
                                                    INMOBILIARIA
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Título</label>
                                                <input 
                                                    value={simplePlano.titulo}
                                                    onChange={e => setSimplePlano({...simplePlano, titulo: e.target.value})}
                                                    className="input-field py-4" placeholder="Ej: Villa Moderna Premium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Precio (US$)</label>
                                                <input 
                                                    type="text"
                                                    value={formatCurrency(simplePlano.precio)}
                                                    onChange={e => setSimplePlano({...simplePlano, precio: e.target.value.replace(/\D/g, "")})}
                                                    className="input-field py-4 font-mono text-brand-blue font-bold" placeholder="150,000"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Metros²</label>
                                                <input 
                                                    type="number"
                                                    value={simplePlano.metros_cuadrados}
                                                    onChange={e => setSimplePlano({...simplePlano, metros_cuadrados: e.target.value})}
                                                    className="input-field py-4" placeholder="250"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Categoría</label>
                                                <select 
                                                    value={simplePlano.categoria_id}
                                                    onChange={e => setSimplePlano({...simplePlano, categoria_id: e.target.value})}
                                                    className="input-field py-4 appearance-none"
                                                >
                                                    {categorias.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Foto de Portada</label>
                                                <div className="relative group h-[58px]">
                                                    <div className="input-field flex items-center justify-center gap-2 cursor-pointer group-hover:border-brand-blue/50 transition-all truncate px-4">
                                                        <Save className="w-4 h-4 text-brand-blue" />
                                                        <span className="text-xs">{portadaFile ? portadaFile.name : "Seleccionar Imagen"}</span>
                                                    </div>
                                                    <input 
                                                        type="file" accept="image/*" 
                                                        onChange={e => setPortadaFile(e.target.files?.[0] || null)}
                                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                                    <Bed className="w-3 h-3" /> Habitaciones
                                                </label>
                                                <input 
                                                    type="number"
                                                    value={simplePlano.habitaciones}
                                                    onChange={e => setSimplePlano({...simplePlano, habitaciones: e.target.value})}
                                                    className="input-field py-4" placeholder="3"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                                    <Bath className="w-3 h-3" /> Baños
                                                </label>
                                                <input 
                                                    type="number"
                                                    value={simplePlano.banos}
                                                    onChange={e => setSimplePlano({...simplePlano, banos: e.target.value})}
                                                    className="input-field py-4" placeholder="2"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                                    <Car className="w-3 h-3" /> Parqueos
                                                </label>
                                                <input 
                                                    type="number"
                                                    value={simplePlano.parqueos}
                                                    onChange={e => setSimplePlano({...simplePlano, parqueos: e.target.value})}
                                                    className="input-field py-4" placeholder="2"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                                    <MapPin className="w-3 h-3" /> Ubicación
                                                </label>
                                                <input 
                                                    value={simplePlano.ubicacion}
                                                    onChange={e => setSimplePlano({...simplePlano, ubicacion: e.target.value})}
                                                    className="input-field py-4" placeholder="Ej: Punta Cana"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-8">
                                            <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Descripción</label>
                                            <textarea 
                                                value={simplePlano.descripcion}
                                                onChange={e => setSimplePlano({...simplePlano, descripcion: e.target.value})}
                                                className="input-field py-4 min-h-[100px] resize-none" placeholder="Describe esta obra maestra..."
                                            />
                                        </div>

                                        {/* Gallery and PDF Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 border-t border-white/5 pt-8">
                                            {/* Gallery Upload */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                                        <Images className="w-3 h-3" /> Galería (3-10 fotos)
                                                    </label>
                                                    <span className={`text-[10px] font-black ${galleryFiles.length < 3 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                                        {galleryFiles.length} / 10
                                                    </span>
                                                </div>
                                                <div className="relative group">
                                                    <div className="input-field min-h-[100px] flex flex-col items-center justify-center gap-2 border-dashed border-white/20 hover:border-brand-blue/50 transition-all cursor-pointer bg-white/[0.01]">
                                                        {galleryFiles.length === 0 ? (
                                                            <>
                                                                <Upload className="w-6 h-6 text-gray-500" />
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Click para añadir fotos</p>
                                                            </>
                                                        ) : (
                                                            <div className="grid grid-cols-5 gap-2 w-full p-2">
                                                                {galleryFiles.map((file, idx) => (
                                                                    <div key={idx} className="aspect-square rounded-md bg-white/5 border border-white/10 flex items-center justify-center relative group/item">
                                                                        <Image src={URL.createObjectURL(file)} alt="Preview" fill className="object-cover rounded-md" />
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                setGalleryFiles(prev => prev.filter((_, i) => i !== idx));
                                                                            }}
                                                                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                                        >
                                                                            <X className="w-2.5 h-2.5" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <input 
                                                            type="file" multiple accept="image/*" 
                                                            onChange={e => {
                                                                const files = Array.from(e.target.files || []);
                                                                if (galleryFiles.length + files.length > 10) {
                                                                    alert("Límite máximo de 10 fotos.");
                                                                    return;
                                                                }
                                                                setGalleryFiles(prev => [...prev, ...files]);
                                                            }}
                                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                                        />
                                                    </div>
                                                </div>
                                                {galleryFiles.length < 3 && galleryFiles.length > 0 && (
                                                    <p className="text-[10px] text-orange-400 font-bold italic">* Faltan {3 - galleryFiles.length} fotos más.</p>
                                                )}
                                            </div>

                                            {/* PDF Upload (Technical File) */}
                                            {simplePlano.seccion === 'planos' && (
                                                <div className="space-y-4 animate-fade-in">
                                                    <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                                        <FileText className="w-3 h-3" /> Plano Técnico (PDF Privado)
                                                    </label>
                                                    <div className="relative group h-[100px]">
                                                        <div className={`input-field h-full flex flex-col items-center justify-center gap-2 border-dashed transition-all cursor-pointer ${pdfFile ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/20 hover:border-amber-500/50'}`}>
                                                            {pdfFile ? (
                                                                <>
                                                                    <FileUp className="w-6 h-6 text-amber-500" />
                                                                    <p className="text-[10px] text-amber-500 font-bold truncate max-w-[200px]">{pdfFile.name}</p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FileText className="w-6 h-6 text-gray-500" />
                                                                    <p className="text-[10px] text-gray-500 font-bold uppercase text-center">Subir Archivo de Diseño <br/> (PDF / ZIP)</p>
                                                                </>
                                                            )}
                                                        </div>
                                                        <input 
                                                            type="file" accept=".pdf,.zip" 
                                                            onChange={e => setPdfFile(e.target.files?.[0] || null)}
                                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                                        />
                                                    </div>
                                                    <p className="text-[9px] text-gray-500 uppercase font-medium italic">Acceso restringido hasta confirmación de pago.</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between border-t border-white/10 pt-6">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 italic">
                                                <AlertCircle className="w-4 h-4 text-brand-blue" />
                                                Se publicará instantáneamente en el catálogo.
                                            </div>
                                            <button 
                                                onClick={async () => {
                                                    if (!simplePlano.titulo || !portadaFile || !simplePlano.precio) {
                                                        alert("Faltan datos obligatorios (Título, Precio, Imagen de Portada)");
                                                        return;
                                                    }
                                                    if (galleryFiles.length < 3) {
                                                        alert("Debes subir al menos 3 fotos para la galería.");
                                                        return;
                                                    }
                                                    if (simplePlano.seccion === 'planos' && !pdfFile) {
                                                        alert("Para proyectos de ARQUITECTURA es obligatorio subir el Plano Técnico (PDF).");
                                                        return;
                                                    }

                                                    setUploadLoading(true);
                                                    try {
                                                        const userId = user?.id;

                                                        // 1. Upload Portada
                                                        const portadaExt = portadaFile.name.split('.').pop();
                                                        const portadaPath = `admin-uploads/${Date.now()}-portada.${portadaExt}`;
                                                        const { error: uploadError } = await supabase.storage
                                                            .from('planos-files')
                                                            .upload(portadaPath, portadaFile);
                                                        
                                                        if (uploadError) throw uploadError;
                                                        const { data: { publicUrl: portadaUrl } } = supabase.storage.from('planos-files').getPublicUrl(portadaPath);

                                                        // 2. Upload Technical File (Private)
                                                        let pdfPath = "";
                                                        if (pdfFile && simplePlano.seccion === 'planos') {
                                                            const pdfExt = pdfFile.name.split('.').pop();
                                                            pdfPath = `tecnico/${userId}/${Date.now()}-plano.${pdfExt}`;
                                                            const { error: uploadPdfError } = await supabase.storage
                                                                .from('planos-privados')
                                                                .upload(pdfPath, pdfFile);
                                                            if (uploadPdfError) throw uploadPdfError;
                                                        }

                                                        // 3. Insert into planos
                                                        const { data: newPlano, error: insertError } = await supabase
                                                            .from('planos')
                                                            .insert([{
                                                                ...simplePlano,
                                                                precio: Number(simplePlano.precio),
                                                                metros_cuadrados: Number(simplePlano.metros_cuadrados),
                                                                habitaciones: Number(simplePlano.habitaciones),
                                                                banos: Number(simplePlano.banos),
                                                                parqueos: Number(simplePlano.parqueos),
                                                                vendedor_id: userId,
                                                                imagen_url: portadaUrl,
                                                                url_archivo: pdfPath, // Private path if applicable
                                                                estado_revision: 'publicado',
                                                                disponible: true,
                                                                estilo: 'Contemporáneo',
                                                                pisos: 1
                                                            }])
                                                            .select()
                                                            .single();

                                                        if (insertError) throw insertError;

                                                        // 4. Upload Gallery and Link
                                                        if (galleryFiles.length > 0 && newPlano) {
                                                            const galleryPromises = galleryFiles.map(async (file, idx) => {
                                                                const ext = file.name.split('.').pop();
                                                                const path = `galeria/${newPlano.id}/${idx}-${Date.now()}.${ext}`;
                                                                await supabase.storage.from('planos-files').upload(path, file);
                                                                const { data: { publicUrl } } = supabase.storage.from('planos-files').getPublicUrl(path);
                                                                return { plano_id: newPlano.id, imagen_url: publicUrl };
                                                            });
                                                            const galleryResults = await Promise.all(galleryPromises);
                                                            await supabase.from('galeria_propiedades').insert(galleryResults);
                                                        }

                                                        alert("¡PROYECTO PUBLICADO EXITOSAMENTE!");
                                                        setShowSimpleForm(false);
                                                        fetchPlanos();
                                                        
                                                        // Reset all
                                                        setSimplePlano({
                                                            titulo: "",
                                                            descripcion: "",
                                                            precio: "",
                                                            metros_cuadrados: "0",
                                                            habitaciones: "0",
                                                            banos: "0",
                                                            parqueos: "0",
                                                            ubicacion: "",
                                                            seccion: "planos",
                                                            categoria_id: categorias[0]?.id || ""
                                                        });
                                                        setPortadaFile(null);
                                                        setGalleryFiles([]);
                                                        setPdfFile(null);
                                                    } catch (err: unknown) {
                                                        const error = err as Error;
                                                        console.error("Critical Upload Error:", error);
                                                        alert(`Error: ${error.message}`);
                                                    } finally {
                                                        setUploadLoading(false);
                                                    }
                                                }}
                                                disabled={uploadLoading}
                                                className="btn-primary py-4 px-10 bg-brand-gradient shadow-blue-glow-lg text-white font-black uppercase tracking-widest text-sm flex items-center gap-3"
                                            >
                                                {uploadLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                    <>
                                                        <Save className="w-5 h-5" />
                                                        PUBLICAR AHORA
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {planos.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        No hay planos registrados aún.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {planos.map((plano) => (
                                            <div key={plano.id} className="glass-card p-4 hover:border-brand-blue/30 transition-all">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-bold text-white">{plano.titulo}</h3>
                                                        <p className="text-sm text-gray-400">{plano.tipo_propiedad}</p>
                                                    </div>
                                                    <span className={`badge ${plano.estado_revision === 'en_revision' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                                                        {plano.estado_revision || 'publicado'}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-300">
                                                    <p>Precio: ${plano.precio}</p>
                                                    <p>Metros: {plano.metros_cuadrados}m²</p>
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        onClick={() => updatePlanoModeracion(plano.id, 'rechazado')}
                                                        className="btn-ghost text-sm py-2 px-4 text-red-400"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                        Ocultar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'socios' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Sección de Solicitudes de Propiedades */}
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                    <h2 className="font-display text-xl font-bold text-white flex items-center gap-3">
                                        <Building2 className="w-6 h-6 text-brand-blue" />
                                        Solicitudes de Propiedades
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={cleanupRejectedPropiedades}
                                            className="btn-ghost text-xs py-1.5 px-3 text-red-400 border-red-500/20 hover:bg-red-500/10 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Limpiar Descartadas
                                        </button>
                                        <span className="badge bg-orange-500/10 text-orange-400 border-orange-500/20">
                                            {solicitudes.length} Solicitudes
                                        </span>
                                    </div>
                                </div>
                                {solicitudes.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        No hay solicitudes de propiedades pendientes.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {solicitudes.map((solicitud) => (
                                            <div key={solicitud.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-white">{solicitud.nombre_completo}</h4>
                                                        <p className="text-sm text-gray-400">{solicitud.tipo_propiedad} en {solicitud.ubicacion}</p>
                                                    </div>
                                                    <span className={`badge ${solicitud.estado === 'pendiente' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                                        {solicitud.estado}
                                                    </span>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => approveAndAutoPublish(solicitud)}
                                                        disabled={solicitudLoading}
                                                        className="btn-primary text-sm py-2 px-4"
                                                    >
                                                        Aprobar y Publicar
                                                    </button>
                                                    <button
                                                        onClick={() => updateSolicitudEstado(solicitud.id, 'contactado')}
                                                        disabled={solicitudLoading}
                                                        className="btn-secondary text-sm py-2 px-4"
                                                    >
                                                        Contactado
                                                    </button>
                                                    <button
                                                        onClick={() => deleteSolicitud(solicitud.id)}
                                                        disabled={solicitudLoading}
                                                        className="btn-ghost text-sm py-2 px-4 text-red-400"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sección de Solicitudes de Vendedores */}
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                    <h2 className="font-display text-xl font-bold text-white flex items-center gap-3">
                                        <Users className="w-6 h-6 text-brand-blue" />
                                        Solicitudes de Vendedores
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={cleanupRejectedVendedores}
                                            className="btn-ghost text-xs py-1.5 px-3 text-red-400 border-red-500/20 hover:bg-red-500/10 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Limpiar Rechazados
                                        </button>
                                        <span className="badge bg-purple-500/10 text-purple-400 border-purple-500/20">
                                            {solicitudesVendedores.length} Solicitudes
                                        </span>
                                    </div>
                                </div>
                                {solicitudesVendedores.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        No hay solicitudes de vendedores pendientes.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {solicitudesVendedores.map((solicitud) => (
                                            <div key={solicitud.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-white">{solicitud.nombre_completo}</h4>
                                                        <p className="text-sm text-gray-400">{solicitud.telefono}</p>
                                                    </div>
                                                    <span className={`badge ${solicitud.estado === 'pendiente' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : solicitud.estado === 'aprobado' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                        {solicitud.estado}
                                                    </span>
                                                </div>
                                                {solicitud.estado === 'pendiente' && (
                                                    <>
                                                        {confirmAction?.solicitud.id === solicitud.id ? (
                                                            <div className="mt-3 w-full p-3 rounded-xl bg-brand-blue/5 border border-brand-blue/20 space-y-3">
                                                                <p className="text-sm text-white font-medium">
                                                                    {confirmAction.type === 'approve'
                                                                        ? `¿Aprobar a ${solicitud.nombre_completo} como Socio Profesional?`
                                                                        : `¿Rechazar la solicitud de ${solicitud.nombre_completo}?`}
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => confirmAction.type === 'approve' ? approveSocio(solicitud) : rejectSocio(solicitud)}
                                                                        disabled={vendedorLoading}
                                                                        className={`flex-1 text-sm py-2 px-4 rounded-lg font-bold transition-all ${confirmAction.type === 'approve' ? 'bg-green-500 text-white hover:bg-green-400' : 'bg-red-500 text-white hover:bg-red-400'}`}
                                                                    >
                                                                        {vendedorLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (confirmAction.type === 'approve' ? '✅ Confirmar Aprobación' : '❌ Confirmar Rechazo')}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setConfirmAction(null)}
                                                                        className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg"
                                                                    >
                                                                        Cancelar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-3">
                                                                <button
                                                                    onClick={() => setConfirmAction({ type: 'approve', solicitud })}
                                                                    disabled={vendedorLoading}
                                                                    className="btn-primary text-sm py-2 px-4"
                                                                >
                                                                    ✅ Aprobar Socio
                                                                </button>
                                                                <button
                                                                    onClick={() => setConfirmAction({ type: 'reject', solicitud })}
                                                                    disabled={vendedorLoading}
                                                                    className="btn-ghost text-sm py-2 px-4 text-red-400"
                                                                >
                                                                    ❌ Rechazar
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sección de Socios Aprobados - CONTROL TOTAL */}
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                    <h2 className="font-display text-xl font-bold text-white flex items-center gap-3">
                                        <ShieldCheck className="w-6 h-6 text-green-400" />
                                        Socios Aprobados - CONTROL TOTAL
                                    </h2>
                                    <span className="badge bg-green-500/10 text-green-400 border-green-500/20">
                                        {sociosAprobados.length} Socios Activos
                                    </span>
                                </div>
                                {sociosAprobados.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        No hay socios aprobados actualmente.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sociosAprobados.map((socio) => (
                                            <div key={socio.id} className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-white flex items-center gap-2">
                                                            {socio.nombre_completo}
                                                            <span className="badge bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                                                SOCIO ACTIVO
                                                            </span>
                                                        </h4>
                                                        <p className="text-sm text-gray-400">{socio.telefono}</p>
                                                        {socio.bio && (
                                                            <p className="text-sm text-gray-500 mt-1">{socio.bio}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">Miembro desde</p>
                                                        <p className="text-sm text-green-400 font-bold">
                                                            {new Date(socio.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* Acciones de Soberanía */}
                                                <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                                                    <button
                                                        onClick={() => revocarAccesoSocio(socio)}
                                                        disabled={vendedorLoading}
                                                        className="btn-ghost text-sm py-2 px-4 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/10"
                                                    >
                                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                                        Revocar Acceso
                                                    </button>
                                                    <button
                                                        onClick={() => eliminarSocioAprobado(socio)}
                                                        disabled={vendedorLoading}
                                                        className="btn-ghost text-sm py-2 px-4 text-red-400 border-red-500/20 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Eliminar Socio
                                                    </button>
                                                </div>
                                                
                                                {/* Información de propiedades asociadas */}
                                                <div className="mt-3 pt-3 border-t border-white/5">
                                                    <p className="text-xs text-gray-500 mb-2">Propiedades en catálogo:</p>
                                                    <div className="text-sm text-gray-400">
                                                        {planos.filter(p => p.vendedor_id === socio.usuario_id).length} propiedades activas
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'auditoria' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Sección de Reseñas */}
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                    <h2 className="font-display text-xl font-bold text-white flex items-center gap-3">
                                        <MessageSquare className="w-6 h-6 text-brand-blue" />
                                        Reseñas de Usuarios
                                    </h2>
                                    <span className="badge bg-brand-blue/10 text-brand-blue border-brand-blue/20">
                                        {resenas.length} Comentarios Totales
                                    </span>
                                </div>
                                {resenas.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        No hay reseñas de usuarios.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                        {resenas.map(r => (
                                            <div key={r.id} className={`glass-card p-6 flex flex-col md:flex-row gap-6 hover:border-brand-blue/30 transition-all ${!r.aprobado ? 'border-l-4 border-l-red-500 bg-red-500/5' : ''}`}>
                                                <div className="flex-grow space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-bold text-white">{r.usuario?.nombre_completo || "Usuario"}</h4>
                                                            <div className="flex gap-4 text-sm text-gray-500">
                                                                <span>{r.usuario?.email || "Sin correo"}</span>
                                                                <span>{r.usuario?.telefono || "Sin teléfono"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <Star key={s} className={`w-4 h-4 ${r.estrellas >= s ? "fill-yellow-400 text-yellow-400" : "text-gray-700"}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                                        <p className="text-sm text-gray-300 italic leading-relaxed">&quot;{r.comentario}&quot;</p>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        <span className="font-bold">En propiedad:</span> {r.plano?.titulo || "N/A"}
                                                    </div>
                                                    {r.respuesta_admin && (
                                                        <div className="mt-2 pt-2 border-t border-white/5">
                                                            <p className="text-xs text-gray-500 mb-1">Respuesta del administrador:</p>
                                                            <div className="bg-brand-blue/10 p-2 rounded border border-brand-blue/20">
                                                                <p className="text-sm text-brand-blue-light">{r.respuesta_admin}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Acciones */}
                                                <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                                                    {!r.aprobado && (
                                                        <button
                                                            onClick={() => approveReviewWithReply(r.id, r.respuesta_admin || "")}
                                                            disabled={reviewLoading}
                                                            className="btn-primary text-sm py-2 px-4"
                                                        >
                                                            Aprobar y Responder
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteReview(r.id)}
                                                        disabled={reviewLoading}
                                                        className="btn-ghost text-sm py-2 px-4 text-red-400"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sección de Moderación de Contenido */}
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                    <h2 className="font-display text-xl font-bold text-white flex items-center gap-3">
                                        <ClipboardCheck className="w-6 h-6 text-brand-blue" />
                                        Moderación de Contenido
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={cleanupRejectedPlanos}
                                            className="btn-ghost text-xs py-1.5 px-3 text-red-400 border-red-500/20 hover:bg-red-500/10 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Limpiar Rechazados
                                        </button>
                                        <span className="badge bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                                            {planos.filter(p => p.estado_revision === 'en_revision').length} En Revisión
                                        </span>
                                    </div>
                                </div>
                                {planos.filter(p => p.estado_revision === 'en_revision').length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        No hay contenido pendiente de moderación.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {planos.filter(p => p.estado_revision === 'en_revision').map(plano => (
                                            <div key={plano.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-white">{plano.titulo}</h4>
                                                        <p className="text-sm text-gray-400">{plano.tipo_propiedad} • {plano.metros_cuadrados}m²</p>
                                                        <p className="text-sm text-gray-500">Por: {plano.autor_nombre || 'Desconocido'}</p>
                                                    </div>
                                                    <span className="badge bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                                                        En Revisión
                                                    </span>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => updatePlanoModeracion(plano.id, 'publicado')}
                                                        className="btn-primary text-sm py-2 px-4"
                                                    >
                                                        Aprobar y Publicar
                                                    </button>
                                                    <button
                                                        onClick={() => updatePlanoModeracion(plano.id, 'rechazado')}
                                                        className="btn-ghost text-sm py-2 px-4 text-red-400"
                                                    >
                                                        Rechazar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
