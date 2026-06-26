"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2,
    ArrowLeft, X, Images,
    Trash2, Star, MessageSquare,
    Building2, Bed, Bath, Car, Maximize2,
    ShieldCheck, 
    ClipboardCheck, Users,
    Plus, Upload, Save, AlertCircle, MapPin, FileText, FileUp,
    Pencil, Eye, EyeOff,
    DollarSign, CheckCircle2, Clock, LayoutDashboard, ExternalLink, TrendingUp, Receipt, Printer
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PartnerUploadModal from "@/components/marketplace/PartnerUploadModal";
import { createClient } from "@/lib/supabase/client";
import { LOGO_SRC } from "@/lib/constants";
import { isAdminEmail } from "@/lib/security/admin";
import type { Categoria, Plano, Resena, SolicitudSocio, SolicitudVendedor, Perfil, Payout } from "@/types";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";

type Tab = 'dashboard' | 'planos' | 'socios' | 'auditoria' | 'comunidad' | 'pagos' | 'ventas';

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
    const [activeTab, setActiveTab] = useState<Tab>("planos");
    const [planos, setPlanos] = useState<Plano[]>([]);
    const [resenas, setResenas] = useState<Resena[]>([]);
    const [reviewLoading, setReviewLoading] = useState(false);

    // Estado para Evidencia de Pago
    const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
    const [payoutForEvidence, setPayoutForEvidence] = useState<Payout | null>(null);
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [evidenceNotes, setEvidenceNotes] = useState("");
    const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [activeVoucher, setActiveVoucher] = useState<Payout | null>(null);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [payoutLoading, setPayoutLoading] = useState(false);
    const [solicitudes, setSolicitudes] = useState<SolicitudSocio[]>([]);
    const [solicitudLoading, setSolicitudLoading] = useState(false);
    const [solicitudesVendedores, setSolicitudesVendedores] = useState<SolicitudVendedor[]>([]);
    const [vendedorLoading, setVendedorLoading] = useState(false);
    const [sociosAprobados, setSociosAprobados] = useState<SolicitudVendedor[]>([]);
    const [perfiles, setPerfiles] = useState<Perfil[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [ventasGlobales, setVentasGlobales] = useState<any[]>([]);
    const [ventasLoading, setVentasLoading] = useState(false);
    const [selectedAdminVenta, setSelectedAdminVenta] = useState<any>(null);
    const [showAdminInvoice, setShowAdminInvoice] = useState(false);

    // Simplied Upload Form State
    const [showSimpleForm, setShowSimpleForm] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPlanoForEdit, setSelectedPlanoForEdit] = useState<Plano | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const MAX_SUPABASE_SIZE = 48 * 1024 * 1024; // 48MB limit
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
        tipo_propiedad: "Plano Arquitectónico",
        categoria_id: "",
        video_url: "",
        enlace_mapa: "",
        iframe_mapa: "",
        url_archivo_externo: ""
    });
    const [portadaFile, setPortadaFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [displayPrecio, setDisplayPrecio] = useState("");

    // Form formatting helpers
    const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Permite números y un solo punto decimal
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setDisplayPrecio(val);
            const num = parseFloat(val);
            setSimplePlano(prev => ({...prev, precio: isNaN(num) ? "0" : val}));
        }
    };

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

    const fetchPayouts = useCallback(async () => {
        setPayoutLoading(true);
        try {
            // Intento 1: Con toda la información unida (Venta, Plano Completo, Comprador Detallado)
            const { data, error } = await supabase
                .from('payouts_queue')
                .select(`
                    *, 
                    vendedor:perfiles(*), 
                    venta:ventas_planos!fk_payout_to_venta(
                        *, 
                        plano:planos(
                            titulo, seccion, tipo_propiedad, 
                            metros_cuadrados, habitaciones, banos, parqueos
                        ), 
                        usuario:perfiles(nombre_completo, email, telefono)
                    )
                `)
                .order('created_at', { ascending: false });
            
            if (error) {
                // Fallback: Solo pagos y vendedores (sin datos de venta detallados)
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('payouts_queue')
                    .select('*, vendedor:perfiles(*)')
                    .order('created_at', { ascending: false });
                
                if (fallbackError) throw fallbackError;
                setPayouts(fallbackData as Payout[]);
            } else if (data) {
                setPayouts(data as Payout[]);
            }
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Supabase Error [AdminFetchPayouts]:", error.message);
        } finally {
            setPayoutLoading(false);
        }
    }, [supabase]);

    const fetchVentasGlobales = useCallback(async () => {
        setVentasLoading(true);
        try {
            const { data, error } = await supabase
                .from("ventas_planos")
                .select("*, plano:planos(titulo, id), usuario:perfiles(nombre_completo, email)")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setVentasGlobales(data || []);
        } catch (err) {
            console.error("Error fetching global sales:", err);
        } finally {
            setVentasLoading(false);
        }
    }, [supabase]);


    const updateSocioCategoria = async (socio: SolicitudVendedor, nuevaCategoria: 'arquitectura' | 'inmobiliaria' | 'mixto') => {
        setVendedorLoading(true);
        try {
            // Update the profile
            const { error: profileError } = await supabase
                .from('perfiles')
                .update({ categoria_socio: nuevaCategoria })
                .eq('id', socio.usuario_id);

            if (profileError) throw profileError;

            // Update the application record
            const { error: solicitudError } = await supabase
                .from('solicitudes_vendedores')
                .update({ categoria_socio: nuevaCategoria })
                .eq('id', socio.id);

            if (solicitudError) throw solicitudError;

            fetchSociosAprobados();
        } catch (err: unknown) {
            const error = err as Error;
            alert("Error al actualizar categoría: " + error.message);
        } finally {
            setVendedorLoading(false);
        }
    };

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
            .select("*")
            .eq("estado", "aprobado")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching approved partners:", error.message);
        } else {
            setSociosAprobados(data || []);
        }
    }, [supabase]);

    const fetchPerfiles = useCallback(async () => {
        const { data, error } = await supabase
            .from("perfiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase Error [AdminFetchPerfiles]:", error.message);
        } else if (data) {
            setPerfiles(data);
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

    const approveSocio = async (solicitud: SolicitudVendedor, categoriaForzada?: 'arquitectura' | 'inmobiliaria' | 'mixto') => {
        setVendedorLoading(true);
        setConfirmAction(null);
        const finalCategoria = categoriaForzada || solicitud.categoria_socio || 'arquitectura';
        
        try {
            // Step 1: Update the application state to 'aprobado' AND potentially its category
            const { error: estadoError } = await supabase
                .from("solicitudes_vendedores")
                .update({ 
                    estado: 'aprobado',
                    categoria_socio: finalCategoria
                })
                .eq("id", solicitud.id);
            
            if (estadoError) throw estadoError;
            
            // Step 2: Promote the user in 'perfiles' by setting es_socio = true
            if (solicitud.usuario_id) {
                const { error: perfilError } = await supabase
                    .from("perfiles")
                    .update({ 
                        es_socio: true,
                        categoria_socio: finalCategoria
                    })
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
                .update({ 
                    estado_revision: nuevoEstado,
                    disponible: nuevoEstado === 'publicado' ? true : undefined 
                })
                .eq("id", planoId);
            
            if (error) throw error;
            alert(`Proyecto ${nuevoEstado === 'publicado' ? 'activado' : 'ocultado'} con éxito.`);
            fetchPlanos();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error moderating project:", error.message);
            alert("Error al moderar proyecto: " + error.message);
        }
    };

    const toggleFeaturedPlano = async (planoId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("planos")
                .update({ destacado: !currentStatus })
                .eq("id", planoId);
            
            if (error) throw error;
            alert(`Proyecto ${!currentStatus ? 'destacado' : 'quitado de destacados'} con éxito.`);
            fetchPlanos();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error toggling featured status:", error.message);
            alert("Error al actualizar estado destacado: " + error.message);
        }
    };

    const deletePlano = async (id: string) => {
        if (!confirm("¿Seguro que quieres eliminar este proyecto permanentemente? Esta acción no se puede deshacer.")) return;
        try {
            const { error } = await supabase.from("planos").delete().eq("id", id);
            if (error) throw error;
            alert("Proyecto eliminado con éxito.");
            fetchPlanos();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error deleting project:", error.message);
            alert("Error al eliminar proyecto: " + error.message);
        }
    };

    const handleEditPlano = (plano: Plano) => {
        setSelectedPlanoForEdit(plano);
        setIsEditModalOpen(true);
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

    const cleanupCompletedPayouts = async () => {
        const completedCount = payouts.filter(p => p.estado === 'completado').length;
        if (completedCount === 0) {
            alert("No hay pagos completados para limpiar.");
            return;
        }

        if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente ${completedCount} registros de pagos ya completados?`)) return;
        
        setPayoutLoading(true);
        try {
            const { error } = await supabase
                .from("payouts_queue")
                .delete()
                .eq("estado", 'completado');
            
            if (error) throw error;
            alert("Limpieza de pagos realizada con éxito.");
            fetchPayouts();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error cleaning up payouts:", error.message);
            alert("Error al limpiar cola de pagos: " + error.message);
        } finally {
            setPayoutLoading(false);
        }
    };

    const uploadPayoutEvidence = async (payoutId: string, file: File, notes: string) => {
        setIsUploadingEvidence(true);
        try {
            // 1. Subir el archivo al nuevo bucket 'payout-receipts'
            const fileExt = file.name.split('.').pop();
            const filePath = `${payoutId}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('payout-receipts')
                .upload(filePath, file);
            
            if (uploadError) throw uploadError;

            // 2. Obtener la URL pública
            const { data: { publicUrl } } = supabase.storage.from('payout-receipts').getPublicUrl(filePath);

            // 3. Actualizar el registro en payouts_queue
            const { error: updateError } = await supabase
                .from("payouts_queue")
                .update({ 
                    estado: 'completado',
                    comprobante_url: publicUrl,
                    notas_admin: notes,
                    fecha_pago_realizada: new Date().toISOString()
                })
                .eq("id", payoutId);

            if (updateError) throw updateError;

            alert("Pago completado y evidencia guardada con éxito.");
            setIsEvidenceModalOpen(false);
            setPayoutForEvidence(null);
            setEvidenceFile(null);
            setEvidenceNotes("");
            fetchPayouts();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error al procesar evidencia de pago:", error.message);
            alert("Error al finalizar el pago: " + error.message);
        } finally {
            setIsUploadingEvidence(false);
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
        const isAdmin = isAdminFromProfile || isAdminEmail(user.email);

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
        fetchPerfiles();
        fetchPerfiles();
        fetchPayouts();
        fetchVentasGlobales();
    }, [router, supabase, fetchPerfiles, fetchPlanos, fetchResenas, fetchSociosAprobados, fetchSolicitudes, fetchSolicitudesVendedores, fetchPayouts, fetchVentasGlobales]);

    const fetchCategorias = useCallback(async () => {
        const { data } = await supabase.from("categorias").select("*");
        if (data && data.length > 0) {
            setCategorias(data as Categoria[]);
            // Initialize simplePlano with the first category ID if empty
            setSimplePlano(prev => ({
                ...prev,
                categoria_id: prev.categoria_id || data[0].id
            }));
        }
    }, [supabase]);

    useEffect(() => {
        checkAuthAndData();
        fetchCategorias();

        if (!isCheckingAuth) {
            fetchResenas();
            fetchPayouts();

            // Realtime setup for payouts
            const channel = supabase.channel('admin_payouts')
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'payouts_queue' 
                }, (payload) => {
                    fetchPayouts();
                    // Optional: You could show a notification here if you had a toast system
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [isCheckingAuth, checkAuthAndData, fetchCategorias, fetchResenas, fetchPayouts, supabase]);

    if (isCheckingAuth) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
                </div>
            </MainLayout>
        );
    }

    const tabs = [
        { id: 'planos', icon: Images, label: 'Gestión', subLabel: 'Propiedades y Planos' },
        { id: 'socios', icon: Users, label: 'Socios', subLabel: 'Aprobaciones y Activos', count: solicitudes.filter(s => s.estado === 'pendiente').length + solicitudesVendedores.filter(s => s.estado === 'pendiente').length },
        { id: 'auditoria', icon: ClipboardCheck, label: 'Auditoría', subLabel: 'Calidad y Moderación', count: resenas.filter(r => !r.aprobado).length + planos.filter(p => p.estado_revision === 'en_revision').length },
        { id: 'comunidad', icon: Users, label: 'Comunidad', subLabel: 'Usuarios y Roles', count: perfiles.length },
        { id: 'ventas', icon: DollarSign, label: 'Ventas', subLabel: 'Historial de Plataforma', count: ventasGlobales.length },
        { id: 'pagos', icon: ClipboardCheck, label: 'Payouts', subLabel: 'Liquidación a Socios', count: payouts.filter(p => p.estado === 'pendiente').length },
    ];

    return (
        <MainLayout>
            <div className="pt-24 pb-16 min-h-screen print:hidden">
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

                    {/* Tabs Navigation - Mobile Scroll Enhancement */}
                    <div className="flex gap-2 md:gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as Tab)}
                                    className={`flex-none md:flex-1 flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 px-4 md:px-6 rounded-2xl font-bold transition-all border relative ${isActive ? 'bg-brand-blue border-brand-blue text-white shadow-blue-glow' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="text-[10px] md:text-xs uppercase">{tab.label}</div>
                                        <div className="hidden md:block text-[8px] opacity-50 font-normal uppercase tracking-tighter">{tab.subLabel}</div>
                                    </div>
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className={`absolute -top-1 -right-1 w-5 h-5 ${isActive ? 'bg-white text-brand-blue' : 'bg-brand-blue text-white'} text-[10px] font-black flex items-center justify-center rounded-full shadow-lg border-2 border-[#020408]`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'planos' && (
                        <div className="space-y-8 animate-fade-in">

                            {/* Upload Form - outside glass-card so mx-auto actually works */}
                            {showSimpleForm && (
                                <div className="glass-card p-6 animate-fade-in">
                                    <div className="flex items-center justify-between gap-3 mb-8 border-b border-white/10 pb-4">
                                        <div className="flex items-center gap-3">
                                            <Upload className="w-6 h-6 text-brand-blue" />
                                            <h3 className="text-xl font-bold text-white uppercase tracking-widest">Publicar Proyecto</h3>
                                        </div>
                                        
                                            {/* Destination Selector */}
                                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                                                <button 
                                                    onClick={() => setSimplePlano({...simplePlano, seccion: 'planos', tipo_propiedad: 'Plano Arquitectónico'})}
                                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${simplePlano.seccion === 'planos' ? 'bg-brand-blue text-white shadow-blue-glow' : 'text-gray-500 hover:text-white'}`}
                                                >
                                                    ARQUITECTURA
                                                </button>
                                                <button 
                                                    onClick={() => setSimplePlano({...simplePlano, seccion: 'inmobiliaria', tipo_propiedad: 'Casa'})}
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
                                                    value={simplePlano.precio}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        // Permite números y un solo punto decimal
                                                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                            setSimplePlano({...simplePlano, precio: val});
                                                        }
                                                    }}
                                                    className="input-field py-4 font-mono text-brand-blue font-bold" placeholder="150,000"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                                                    <option value="">Seleccionar...</option>
                                                    {categorias.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Tipo de Propiedad</label>
                                                <select 
                                                    value={simplePlano.tipo_propiedad}
                                                    onChange={e => setSimplePlano({...simplePlano, tipo_propiedad: e.target.value})}
                                                    className="input-field py-4 appearance-none"
                                                >
                                                    {simplePlano.seccion === 'planos' ? (
                                                        <>
                                                            <option>Plano Arquitectónico</option>
                                                            <option>Proyecto 3D</option>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <option>Casa</option>
                                                            <option>Apartamento</option>
                                                            <option>Local Comercial</option>
                                                            <option>Terreno / Solar</option>
                                                        </>
                                                    )}
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
                                                        onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            if (file && file.size > MAX_SUPABASE_SIZE) {
                                                                alert("La imagen de portada excede los 50MB. Por favor optimízala.");
                                                                return;
                                                            }
                                                            setPortadaFile(file || null);
                                                        }}
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

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                                    <Upload className="w-3 h-3" /> Tour Virtual (Video link opcional)
                                                </label>
                                                <input 
                                                    value={simplePlano.video_url}
                                                    onChange={e => setSimplePlano({...simplePlano, video_url: e.target.value})}
                                                    className="input-field py-4" placeholder="YouTube, Instagram, etc."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                                    <FileUp className="w-3 h-3" /> O Subir Video (MP4/WebM)
                                                </label>
                                                <div className="relative group h-[58px]">
                                                    <div className="input-field flex items-center justify-center gap-2 cursor-pointer group-hover:border-brand-blue/50 transition-all truncate px-4">
                                                        <Upload className="w-4 h-4 text-brand-blue" />
                                                        <span className="text-xs">{videoFile ? videoFile.name : "Seleccionar Video"}</span>
                                                    </div>
                                                    <input 
                                                        type="file" accept="video/*" 
                                                        onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            if (file && file.size > MAX_SUPABASE_SIZE) {
                                                                alert("El video excede los 50MB. Súbelo a YouTube/Drive y pega el link.");
                                                                return;
                                                            }
                                                            setVideoFile(file || null);
                                                        }}
                                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                                    <MapPin className="w-3 h-3" /> Enlace Google Maps
                                                </label>
                                                <input 
                                                    value={simplePlano.enlace_mapa}
                                                    onChange={e => setSimplePlano({...simplePlano, enlace_mapa: e.target.value})}
                                                    className="input-field py-4" placeholder="https://maps.app.goo.gl/..."
                                                />
                                                <p className="text-[9px] text-gray-500 italic">Busca en Maps &gt; Compartir &gt; Copiar enlace</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                                    <MapPin className="w-3 h-3" /> Iframe Mapa Embed
                                                </label>
                                                <input 
                                                    value={simplePlano.iframe_mapa}
                                                    onChange={e => setSimplePlano({...simplePlano, iframe_mapa: e.target.value})}
                                                    className="input-field py-4" placeholder="Copia el código <iframe>"
                                                />
                                                <p className="text-[9px] text-gray-500 italic">Maps &gt; Compartir &gt; Insertar mapa &gt; Copiar HTML</p>
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
                                                                if (files.some(f => f.size > MAX_SUPABASE_SIZE)) {
                                                                    alert("Algunas imágenes de la galería exceden los 50MB.");
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
                                                    <div className="relative group min-h-[58px]">
                                                        <div className={`input-field h-full flex flex-col items-center justify-center gap-2 border-dashed transition-all cursor-pointer ${pdfFile ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/20 hover:border-amber-500/50'}`}>
                                                            {pdfFile ? (
                                                                <>
                                                                    <FileUp className="w-6 h-6 text-amber-500" />
                                                                    <p className="text-[10px] text-amber-500 font-bold truncate max-w-[200px]">{pdfFile.name}</p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FileText className="w-6 h-6 text-gray-500" />
                                                                    <p className="text-[10px] text-gray-500 font-bold uppercase text-center">Subir Archivo de Diseño <br/> (PDF / ZIP / DWG)</p>
                                                                </>
                                                            )}
                                                        </div>
                                                        <input 
                                                            type="file" accept=".pdf,.zip,.dwg,application/pdf,application/zip,application/x-dwg,image/dwg" 
                                                            onChange={e => {
                                                                const file = e.target.files?.[0];
                                                                if (file && file.size > MAX_SUPABASE_SIZE) {
                                                                    alert(`⚠️ ARCHIVO MUY PESADO (${(file.size / 1048576).toFixed(1)}MB). Supabase limita a 50MB. Usa la opción de "Link Externo" abajo.`);
                                                                    return;
                                                                }
                                                                setPdfFile(file || null);
                                                                if (file) setSimplePlano(prev => ({...prev, url_archivo_externo: ""}));
                                                            }}
                                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                                        />
                                                    </div>
                                                    
                                                    {/* Enlace Externo Section */}
                                                    <div className="pt-2 space-y-2">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                            <ExternalLink className="w-3 h-3 text-brand-blue" /> O Enlace Externo (Drive/Mega)
                                                        </label>
                                                        <input 
                                                            value={simplePlano.url_archivo_externo}
                                                            onChange={e => {
                                                                setSimplePlano({...simplePlano, url_archivo_externo: e.target.value});
                                                                if (e.target.value) setPdfFile(null);
                                                            }}
                                                            className="input-field py-2 text-xs" placeholder="https://drive.google.com/..."
                                                        />
                                                    </div>
                                                    <p className="text-[9px] text-gray-500 uppercase font-medium italic">Acceso restringido hasta confirmación de pago.</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-center gap-4 border-t border-white/10 pt-6">
                                            <button 
                                                onClick={async () => {
                                                    if (!simplePlano.titulo || !portadaFile || !simplePlano.precio || !simplePlano.categoria_id) {
                                                        alert("Faltan datos obligatorios (Título, Precio, Categoría, Imagen de Portada)");
                                                        return;
                                                    }
                                                    if (galleryFiles.length < 3) {
                                                        alert("Debes subir al menos 3 fotos para la galería.");
                                                        return;
                                                    }
                                                    if (simplePlano.seccion === 'planos' && !pdfFile && !simplePlano.url_archivo_externo) {
                                                        alert("Para proyectos de ARQUITECTURA es obligatorio subir el Plano Técnico o un Link Externo.");
                                                        return;
                                                    }

                                                    setUploadLoading(true);
                                                    try {
                                                        const userId = user?.id;

                                                        // 1. Upload Portada
                                                        const portadaExt = portadaFile.name.split('.').pop();
                                                        const portadaPath = `proyectos/admin/${Date.now()}-portada.${portadaExt}`;
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

                                                        // 2.5 Upload Video File (Optional)
                                                        let finalVideoUrl = simplePlano.video_url;
                                                        if (videoFile) {
                                                            const videoExt = videoFile.name.split('.').pop();
                                                            const videoPath = `videos/${Date.now()}-tour.${videoExt}`;
                                                            const { error: uploadVideoError } = await supabase.storage
                                                                .from('planos-files')
                                                                .upload(videoPath, videoFile);
                                                            
                                                            if (uploadVideoError) throw uploadVideoError;
                                                            const { data: { publicUrl: uploadedVideoUrl } } = supabase.storage.from('planos-files').getPublicUrl(videoPath);
                                                            finalVideoUrl = uploadedVideoUrl;
                                                        }

                                                        // 3. Insert into planos
                                                        const { url_archivo_externo: adminExtLink, ...cleanSimplePlano } = simplePlano;

                                                        const { data: insertData, error: insertError } = await supabase
                                                            .from('planos')
                                                            .insert([{
                                                                ...cleanSimplePlano,
                                                                precio: Number(simplePlano.precio),
                                                                metros_cuadrados: Number(simplePlano.metros_cuadrados),
                                                                habitaciones: Number(simplePlano.habitaciones),
                                                                banos: Number(simplePlano.banos),
                                                                parqueos: Number(simplePlano.parqueos),
                                                                vendedor_id: userId,
                                                                imagen_url: portadaUrl,
                                                                video_url: finalVideoUrl,
                                                                url_archivo: pdfFile ? pdfPath : adminExtLink, // Private path or external URL
                                                                estado_revision: 'publicado',
                                                                disponible: true,
                                                                estilo: 'Contemporáneo',
                                                                pisos: 1
                                                            }])
                                                            .select();

                                                        if (insertError) throw insertError;
                                                        const newPlano = insertData?.[0];

                                                        // 4. Upload Gallery and Link
                                                        if (galleryFiles.length > 0 && newPlano) {
                                                            const galleryPromises = galleryFiles.map(async (file, idx) => {
                                                                const ext = file.name.split('.').pop();
                                                                const path = `galeria/admin/${newPlano.id}/${idx}-${Date.now()}.${ext}`;
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
                                                            tipo_propiedad: "Plano Arquitectónico",
                                                            categoria_id: categorias[0]?.id || "",
                                                            video_url: "",
                                                            enlace_mapa: "",
                                                            iframe_mapa: "",
                                                            url_archivo_externo: ""
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
                                            <div className="flex items-center gap-2 text-xs text-gray-500 italic">
                                                <AlertCircle className="w-4 h-4 text-brand-blue" />
                                                Se publicará instantáneamente en el catálogo.
                                            </div>
                                        </div>
                                </div>
                            )}

                            {/* Gestión de Planos Grid */}
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
                                                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                                                    <button
                                                        onClick={() => toggleFeaturedPlano(plano.id, !!plano.destacado)}
                                                        className={`btn-ghost text-xs py-2 px-3 flex items-center gap-1.5 ${plano.destacado ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-gray-400 hover:bg-white/10'}`}
                                                        title={plano.destacado ? "Quitar de destacados" : "Marcar como destacado"}
                                                    >
                                                        <Star className={`w-3.5 h-3.5 ${plano.destacado ? 'fill-yellow-400' : ''}`} />
                                                        {plano.destacado ? 'Destacado' : 'Destacar'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditPlano(plano)}
                                                        className="btn-ghost text-xs py-2 px-3 text-brand-blue flex items-center gap-1.5 hover:bg-brand-blue/10"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => updatePlanoModeracion(plano.id, plano.estado_revision === 'rechazado' ? 'publicado' : 'rechazado')}
                                                        className={`btn-ghost text-xs py-2 px-3 flex items-center gap-1.5 ${plano.estado_revision === 'rechazado' ? 'text-green-400 hover:bg-green-400/10' : 'text-orange-400 hover:bg-orange-400/10'}`}
                                                    >
                                                        {plano.estado_revision === 'rechazado' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                        {plano.estado_revision === 'rechazado' ? 'Mostrar' : 'Ocultar'}
                                                    </button>
                                                    <button
                                                        onClick={() => deletePlano(plano.id)}
                                                        className="btn-ghost text-xs py-2 px-3 text-red-400 flex items-center gap-1.5 hover:bg-red-400/10"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Borrar
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
                                                <div className="mb-3">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${solicitud.categoria_socio === 'inmobiliaria' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/20'}`}>
                                                        {solicitud.categoria_socio || 'arquitectura'}
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
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => approveSocio(solicitud, 'arquitectura')}
                                                                            disabled={vendedorLoading}
                                                                            className="flex-1 text-[10px] py-2 px-1 bg-[#0066FF] text-white rounded-lg font-bold hover:bg-blue-600 transition-all"
                                                                        >
                                                                            Arq.
                                                                        </button>
                                                                        <button
                                                                            onClick={() => approveSocio(solicitud, 'inmobiliaria')}
                                                                            disabled={vendedorLoading}
                                                                            className="flex-1 text-[10px] py-2 px-1 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-500 transition-all"
                                                                        >
                                                                            Inm.
                                                                        </button>
                                                                        <button
                                                                            onClick={() => approveSocio(solicitud, 'mixto')}
                                                                            disabled={vendedorLoading}
                                                                            className="flex-1 text-[10px] py-2 px-1 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-500 transition-all"
                                                                        >
                                                                            Mixto
                                                                        </button>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => rejectSocio(solicitud)}
                                                                            disabled={vendedorLoading}
                                                                            className="flex-1 text-xs py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-400"
                                                                        >
                                                                            Rechazar Solicitud
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setConfirmAction(null)}
                                                                            className="px-4 py-2 text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg"
                                                                        >
                                                                            X
                                                                        </button>
                                                                    </div>
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
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                                                socio.categoria_socio === 'mixto' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                                socio.categoria_socio === 'inmobiliaria' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                                                'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/20'
                                                            }`}>
                                                                {socio.categoria_socio || 'arquitectura'}
                                                            </span>
                                                            
                                                            <select 
                                                                value={socio.categoria_socio || 'arquitectura'}
                                                                onChange={(e) => updateSocioCategoria(socio, e.target.value as 'arquitectura' | 'inmobiliaria' | 'mixto')}
                                                                className="bg-black/40 border border-white/10 rounded px-2 py-0.5 text-[10px] text-gray-400 focus:border-brand-blue outline-none"
                                                            >
                                                                <option value="arquitectura">Cambiar a Arquitectura</option>
                                                                <option value="inmobiliaria">Cambiar a Inmobiliaria</option>
                                                                <option value="mixto">Convertir a Mixto (Dual)</option>
                                                            </select>
                                                        </div>
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
                    {activeTab === 'comunidad' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                    <h2 className="font-display text-xl font-bold text-white flex items-center gap-3">
                                        <Users className="w-6 h-6 text-brand-blue" />
                                        Usuarios y Comunidad
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <span className="badge bg-brand-blue/10 text-brand-blue border-brand-blue/20">
                                            {perfiles.length} Usuarios Activos
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {perfiles.map((p) => (
                                        <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20 overflow-hidden relative">
                                                    {p.avatar_url ? (
                                                        <Image 
                                                            src={p.avatar_url} 
                                                            alt={p.nombre_completo} 
                                                            fill 
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <Users className="w-6 h-6 text-brand-blue opacity-50" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-sm">{p.nombre_completo || "Usuario sin nombre"}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {p.es_admin || p.role === 'admin' ? (
                                                            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-md font-bold uppercase">Admin</span>
                                                        ) : p.es_socio ? (
                                                            <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-md font-bold uppercase">Socio Profesional</span>
                                                        ) : (
                                                            <span className="text-[10px] bg-white/5 text-gray-400 border border-white/10 px-1.5 py-0.5 rounded-md font-bold uppercase">Usuario</span>
                                                        )}
                                                        <span className="text-[10px] text-gray-600">•</span>
                                                        <span className="text-[10px] text-gray-500">Unido: {new Date(p.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {p.telefono && (
                                                    <p className="text-[10px] text-gray-500">{p.telefono}</p>
                                                )}
                                                {p.bio && (
                                                    <p className="text-[10px] text-brand-blue-light max-w-[150px] truncate">{p.bio}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {perfiles.length === 0 && (
                                    <div className="text-center py-12 text-gray-500 font-display">
                                        No se encontraron registros de comunidad.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'ventas' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Dashboard Financiero Admin */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="glass-card p-6 bg-brand-gradient border-none relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                                        <TrendingUp className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Ingresos Brutos</h3>
                                    <div className="text-3xl font-black text-white italic tracking-tighter">
                                        ${ventasGlobales.reduce((acc, v) => acc + (v.monto_usd || v.precio_pagado || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="glass-card p-6 border-white/5">
                                    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Comisiones ARQOVEX (15%)</h3>
                                    <div className="text-2xl font-black text-brand-blue italic tracking-tighter">
                                        ${(ventasGlobales.reduce((acc, v) => acc + (v.monto_usd || v.precio_pagado || 0), 0) * 0.15).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="glass-card p-6 border-white/5">
                                    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total de Ventas</h3>
                                    <div className="text-2xl font-black text-white italic tracking-tighter">
                                        {ventasGlobales.length} <span className="text-xs font-normal text-gray-500 uppercase not-italic ml-2">Transacciones</span>
                                    </div>
                                </div>
                                <div className="glass-card p-6 border-white/5">
                                    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Ventas de este Mes</h3>
                                    <div className="text-2xl font-black text-emerald-400 italic tracking-tighter">
                                        {ventasGlobales.filter(v => new Date(v.created_at).getMonth() === new Date().getMonth()).length}
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-0 overflow-hidden border-white/5">
                                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                    <h2 className="font-display text-xl font-bold text-white flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-brand-blue" />
                                        Registro Maestro de Ventas
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={fetchVentasGlobales}
                                            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Loader2 className={`w-4 h-4 ${ventasLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/[0.02] border-b border-white/5">
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Factura</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Cliente / Comprador</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Producto</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Fecha</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Monto Bruto</th>
                                                <th className="px-6 py-4 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.03]">
                                            {ventasGlobales.map((venta) => (
                                                <tr key={venta.id} className="hover:bg-white/[0.01] transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-mono font-bold text-brand-blue">
                                                            {venta.factura_numero || `ARQ-${venta.id.slice(0, 8).toUpperCase()}`}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-white">{venta.usuario?.nombre_completo || "Desconocido"}</div>
                                                        <div className="text-[10px] text-gray-500">{venta.usuario?.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-300">{venta.plano?.titulo || "Proyecto"}</div>
                                                        <div className="text-[9px] text-brand-blue-light font-mono italic">Ref: {venta.paypal_order_id || 'S/R'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-500">
                                                        {new Date(venta.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-black text-white italic">
                                                            ${(v => (v.monto_usd || v.precio_pagado || 0))(venta).toFixed(2)} USD
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedAdminVenta(venta);
                                                                setShowAdminInvoice(true);
                                                            }}
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-blue/10 border border-brand-blue/20 text-[10px] font-bold text-brand-blue hover:bg-brand-blue hover:text-white transition-all"
                                                        >
                                                            <Receipt className="w-3 h-3" /> Factura
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {ventasGlobales.length === 0 && (
                                        <div className="py-20 text-center text-gray-500 font-display italic">
                                            No se han registrado ventas aún en la plataforma.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pagos' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="w-6 h-6 text-brand-blue" />
                                        <h2 className="font-display text-xl font-bold text-white">Cola de Pagos a Arquitectos</h2>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={cleanupCompletedPayouts}
                                            className="btn-ghost text-xs py-1.5 px-3 text-red-400 border-red-500/20 hover:bg-red-500/10 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Limpiar Completados
                                        </button>
                                        <span className="badge bg-brand-blue/10 text-brand-blue border-brand-blue/20">
                                            {payouts.filter(p => p.estado === 'pendiente').length} Pendientes
                                        </span>
                                    </div>
                                </div>

                                {payoutLoading && payouts.length === 0 ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
                                    </div>
                                ) : payouts.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 font-display italic">
                                        No hay registros de pagos en la cola o todas las ventas han sido liquidadas.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {payouts.map((p) => {
                                            // Handle potential legacy data or missing fields safely
                                            const metodo = p.metodo_usado || {};
                                            return (
                                                <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:border-brand-blue/20 transition-all group">
                                                    <div className="flex-grow space-y-4">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="text-lg font-bold text-white group-hover:text-brand-blue transition-colors">
                                                                    {p.vendedor?.nombre_completo || "Socio de ARQOVEX"}
                                                                </h3>
                                                                <p className="text-sm font-black text-emerald-400 tracking-tighter">Monto: ${p.monto_payout.toFixed(2)} USD</p>
                                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1 flex items-center gap-2">
                                                                    <LayoutDashboard className="w-3 h-3" /> 
                                                                    Producto: {p.venta?.plano?.titulo || "Proyecto Vendido"}
                                                                </p>
                                                            </div>
                                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${
                                                                p.estado === 'pendiente' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                                p.estado === 'completado' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                            }`}>
                                                                {p.estado.toUpperCase()}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest block">Método del Socio</label>
                                                                <p className="text-xs text-white font-bold flex items-center gap-2">
                                                                    {metodo.metodo === 'paypal' ? (
                                                                        <><CheckCircle2 className="w-3 h-3 text-blue-400" /> PAYPAL BUSINESS</>
                                                                    ) : (
                                                                        <><Building2 className="w-3 h-3 text-amber-400" /> TRANSFERENCIA LOCAL (RD)</>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest block">
                                                                    {metodo.metodo === 'paypal' ? 'CORREO ELECTRÓNICO' : 'Nº DE CUENTA'}
                                                                </label>
                                                                <p className="text-sm text-brand-blue font-black font-mono tracking-tighter">
                                                                    {metodo.metodo === 'paypal' ? metodo.paypal : metodo.cuenta}
                                                                </p>
                                                            </div>
                                                            {metodo.metodo === 'transferencia_local' && (
                                                                <>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest block">Entidad Bancaria</label>
                                                                        <p className="text-xs text-white/90 font-medium uppercase">{metodo.banco}</p>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest block">Documento Identidad</label>
                                                                        <p className="text-xs text-white/90 font-mono italic">{metodo.cedula}</p>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Desglose Financiero */}
                                                        <div className="mt-4 p-5 bg-white/[0.03] rounded-2xl border border-white/5 shadow-xl transition-all hover:bg-white/[0.05]">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] flex items-center gap-2">
                                                                    <DollarSign className="w-3 h-3 text-brand-blue" /> Desglose de Operación
                                                                </h4>
                                                                <span className="text-[9px] text-gray-700 italic font-mono uppercase">Ref: {p.venta_id?.slice(0, 8) || 'Manual'}</span>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-3 gap-0 border border-white/5 rounded-xl overflow-hidden divide-x divide-white/5">
                                                                <div className="p-3 bg-black/20 text-center">
                                                                    <p className="text-[8px] text-gray-500 font-bold uppercase mb-1">Venta Total</p>
                                                                    <p className="text-sm font-black text-white">${p.venta?.monto_usd?.toFixed(2) || "0.00"}</p>
                                                                </div>
                                                                <div className="p-3 bg-white/[0.01] text-center">
                                                                    <p className="text-[8px] text-brand-blue-light font-bold uppercase mb-1">ARQOVEX (15%)</p>
                                                                    <p className="text-sm font-black text-brand-blue-light">-${((p.venta?.monto_usd || 0) * 0.15).toFixed(2)}</p>
                                                                </div>
                                                                <div className="p-3 bg-emerald-500/[0.02] text-center">
                                                                    <p className="text-[8px] text-emerald-500 font-bold uppercase mb-1">Socio (85%)</p>
                                                                    <p className="text-sm font-black text-emerald-400">${p.monto_payout.toFixed(2)}</p>
                                                                </div>
                                                            </div>

                                                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
                                                                        <Users className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5" >Comprador</p>
                                                                        <p className="text-xs text-white font-bold">{p.venta?.usuario?.nombre_completo || "Cliente de ARQOVEX"}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Contacto</p>
                                                                    <p className="text-[10px] text-brand-blue-light font-mono select-all hover:text-white transition-colors">
                                                                        {p.venta?.usuario?.email || "anonimo@arqovex.com"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col justify-center gap-3 md:w-56 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                                                        {p.estado === 'pendiente' ? (
                                                            <button
                                                                onClick={() => {
                                                                    setPayoutForEvidence(p);
                                                                    setIsEvidenceModalOpen(true);
                                                                }}
                                                                className="btn-primary py-3 text-[10px] font-black tracking-tighter flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 border-none shadow-emerald-500/10 group-hover:scale-[1.02] transition-transform"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" /> NOTIFICAR PAGO ENVIADO
                                                            </button>
                                                        ) : p.estado === 'completado' && p.comprobante_url ? (
                                                            <button
                                                                onClick={() => {
                                                                    setActiveVoucher(p);
                                                                    setIsVoucherModalOpen(true);
                                                                }}
                                                                className="btn-ghost py-3 text-[10px] font-black tracking-tighter flex items-center justify-center gap-2 text-brand-blue border-brand-blue/20 hover:bg-brand-blue/5 transition-all"
                                                            >
                                                                <FileText className="w-4 h-4" /> VER RECIBO DE PAGO
                                                            </button>
                                                        ) : (
                                                            <div className="py-3 text-[10px] text-gray-500 text-center font-bold opacity-50">
                                                                PAGO LIQUIDADO
                                                            </div>
                                                        )}
                                                        <div className="mt-auto space-y-1">
                                                            <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                                                                <Clock className="w-2.5 h-2.5" /> {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}
                                                            </div>
                                                            <div className="text-[8px] text-gray-700 italic text-center">ID Venta: {p.venta_id?.slice(0, 8) || 'Manual'}...</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Edición Reutilizado */}
            {user && (
                <div className="print:hidden">
                    <PartnerUploadModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setSelectedPlanoForEdit(null);
                        }}
                        onSuccess={() => {
                            fetchPlanos();
                            setIsEditModalOpen(false);
                            setSelectedPlanoForEdit(null);
                        }}
                        userId={user.id}
                        plano={selectedPlanoForEdit}
                        categoriaSocio={selectedPlanoForEdit?.tipo_propiedad?.toLowerCase().includes('inmueble') || selectedPlanoForEdit?.tipo_propiedad?.toLowerCase().includes('propiedad') ? 'inmobiliaria' : 'arquitectura'}
                    />
                </div>
            )}

            {/* Modal: Subir Evidencia de Pago */}
            {isEvidenceModalOpen && payoutForEvidence && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in print:hidden">
                    <div className="glass-card w-full max-w-lg p-8 space-y-6 relative border-brand-blue/30 shadow-2xl shadow-brand-blue/10">
                        <button onClick={() => setIsEvidenceModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto border border-brand-blue/20">
                                <DollarSign className="w-8 h-8 text-brand-blue" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-white">Finalizar Pago a Socio</h2>
                            <p className="text-sm text-gray-400">Adjunta el comprobante para cerrar este registro oficialmente.</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500 uppercase font-bold tracking-widest">Socio</span>
                                <span className="text-white font-bold">{payoutForEvidence.vendedor?.nombre_completo}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500 uppercase font-bold tracking-widest">Monto a Enviar</span>
                                <span className="text-emerald-400 font-black">${payoutForEvidence.monto_payout.toFixed(2)} USD</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Subir Comprobante (Captura/PDF)</label>
                                <div className="relative group">
                                    <div className={`input-field min-h-[80px] flex flex-col items-center justify-center gap-2 border-dashed transition-all cursor-pointer ${evidenceFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/20 hover:border-brand-blue/50'}`}>
                                        {evidenceFile ? (
                                            <>
                                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                                <p className="text-[10px] text-emerald-500 font-bold truncate max-w-[250px]">{evidenceFile.name}</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-6 h-6 text-gray-500" />
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Seleccionar archivo</p>
                                            </>
                                        )}
                                    </div>
                                    <input 
                                        type="file" accept="image/*,.pdf" 
                                        onChange={e => setEvidenceFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Notas Adicionales (Opcional)</label>
                                <textarea 
                                    value={evidenceNotes}
                                    onChange={e => setEvidenceNotes(e.target.value)}
                                    placeholder="Ej: Transferencia vía PayPal completada. Referencia #12345"
                                    className="input-field py-3 min-h-[80px] text-sm resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button 
                                onClick={() => setIsEvidenceModalOpen(false)}
                                className="flex-1 btn-ghost py-4 text-xs font-bold uppercase"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => {
                                    if (!evidenceFile) {
                                        alert("Por favor sube una captura del comprobante.");
                                        return;
                                    }
                                    uploadPayoutEvidence(payoutForEvidence.id, evidenceFile, evidenceNotes);
                                }}
                                disabled={isUploadingEvidence}
                                className="flex-[2] btn-primary py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 border-none"
                            >
                                {isUploadingEvidence ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                                    </>
                                ) : (
                                    <>Finalizar Pago</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Ver Recibo (Voucher) - NIVEL DIOS */}
            {isVoucherModalOpen && activeVoucher && (
                <div id="printable-receipt" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in print:bg-white print:p-0">
                    <div className="bg-white text-black w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-gray-100 print:shadow-none print:rounded-none">
                        
                        {/* Cabecera Técnica del Voucher */}
                        <div className="bg-[#001D3D] p-8 text-white relative overflow-hidden">
                            {/* Decoración de fondo */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                            
                            <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 relative">
                                            <Image src={LOGO_SRC} alt="ARQOVEX" fill className="object-contain" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-display text-2xl font-black tracking-tighter leading-none">ARQO<span className="text-brand-blue">VEX</span></span>
                                            <span className="text-[8px] uppercase tracking-[0.4em] font-normal text-gray-400">Plataforma Tecnológica</span>
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-2xl font-display font-black uppercase tracking-tighter italic leading-none text-white">Recibo Oficial</h2>
                                        <p className="text-[9px] text-brand-blue font-black uppercase tracking-[0.4em]">Payout Voucher</p>
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 inline-block">
                                        <p className="text-[9px] text-brand-blue font-black uppercase tracking-widest mb-1">ID Transacción</p>
                                        <p className="text-base font-mono font-bold">{activeVoucher.id.toUpperCase()}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Fecha de Emisión</p>
                                        <p className="text-xs font-bold">{activeVoucher.fecha_pago_realizada ? new Date(activeVoucher.fecha_pago_realizada).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date(activeVoucher.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 print:p-6 space-y-8 print:space-y-4 custom-scrollbar max-h-[65vh] overflow-y-auto print:max-h-none print:overflow-visible">
                            
                            {/* Sección 1: Participantes (Comprador y Vendedor) */}
                            <div className="grid grid-cols-2 gap-8 print:gap-4 border-b border-gray-100 pb-4 print:pb-2">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-brand-blue">
                                        <Users className="w-4 h-4" />
                                        <label className="text-[9px] font-black uppercase tracking-widest block">Beneficiario (Socio)</label>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-xl text-slate-900">{activeVoucher.vendedor?.nombre_completo}</p>
                                        <p className="text-xs text-gray-500 font-medium">Doc: {activeVoucher.metodo_usado?.cedula || "Identidad Verificada"}</p>
                                        <p className="text-xs text-brand-blue font-black mt-2 bg-brand-blue/5 px-3 py-1 rounded-full w-fit">
                                            {activeVoucher.metodo_usado?.metodo?.toUpperCase()}: {activeVoucher.metodo_usado?.paypal || activeVoucher.metodo_usado?.cuenta}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4 text-right">
                                    <div className="flex items-center gap-2 text-gray-400 justify-end">
                                        <label className="text-[9px] font-black uppercase tracking-widest block">Cliente (Comprador)</label>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-lg text-slate-700">{activeVoucher.venta?.usuario?.nombre_completo || "Cliente Verificado"}</p>
                                        <p className="text-xs text-gray-500">{activeVoucher.venta?.usuario?.email}</p>
                                        <p className="text-xs text-gray-500">{activeVoucher.venta?.usuario?.telefono || "Telf. Protegido"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sección 2: Detalles del Producto Adquirido */}
                            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-brand-blue" /> Detalles del Producto
                                    </h4>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${activeVoucher.venta?.plano?.seccion === 'inmobiliaria' ? 'bg-amber-100 text-amber-700' : 'bg-brand-blue/10 text-brand-blue'}`}>
                                        {activeVoucher.venta?.plano?.seccion?.toUpperCase() || 'ARQUITECTURA'}
                                    </span>
                                </div>
                                
                                <div className="flex gap-8 items-start">
                                    <div className="flex-grow space-y-4">
                                        <div>
                                            <p className="text-lg font-black text-slate-800 leading-tight">{activeVoucher.venta?.plano?.titulo}</p>
                                            <p className="text-xs text-gray-500 mt-1">{activeVoucher.venta?.plano?.tipo_propiedad || "Plano Arquitectónico Premium"}</p>
                                        </div>
                                        
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                                                <Maximize2 className="w-3 h-3 text-brand-blue" />
                                                <span className="text-[10px] font-bold text-slate-600">{activeVoucher.venta?.plano?.metros_cuadrados}m²</span>
                                            </div>
                                            {activeVoucher.venta?.plano?.habitaciones && (
                                                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                                                    <Bed className="w-3 h-3 text-brand-blue" />
                                                    <span className="text-[10px] font-bold text-slate-600">{activeVoucher.venta?.plano?.habitaciones} Hab.</span>
                                                </div>
                                            )}
                                            {activeVoucher.venta?.plano?.parqueos && (
                                                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                                                    <Car className="w-3 h-3 text-brand-blue" />
                                                    <span className="text-[10px] font-bold text-slate-600">{activeVoucher.venta?.plano?.parqueos} Pq.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">ID Producto</p>
                                        <p className="text-[10px] font-mono font-bold text-slate-700">{activeVoucher.venta?.plano_id?.slice(0, 18).toUpperCase() || "CATALOG-REF-001"}</p>
                                        {activeVoucher.venta?.paypal_order_id && (
                                            <>
                                                <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-3 mb-1">Referencia PayPal</p>
                                                <p className="text-[10px] font-mono font-bold text-brand-blue">{activeVoucher.venta.paypal_order_id}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sección 3: Liquidación Financiera Metódica */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-brand-blue">
                                    <DollarSign className="w-4 h-4" />
                                    <label className="text-[9px] font-black uppercase tracking-widest block">Resumen Financiero de Liquidación</label>
                                </div>
                                
                                <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                                <th className="px-6 py-2 text-left">Concepto / Descripción</th>
                                                <th className="px-6 py-2 text-center">Porcentaje (%)</th>
                                                <th className="px-6 py-2 text-right">Monto (USD)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            <tr>
                                                <td className="px-6 py-2 font-bold text-slate-700">Precio de Venta</td>
                                                <td className="px-6 py-2 text-center font-medium text-gray-400">100%</td>
                                                <td className="px-6 py-2 text-right font-bold text-slate-900">${activeVoucher.venta?.monto_usd?.toFixed(2) || "0.00"}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-2">
                                                    <p className="font-bold text-brand-blue">Tarifa ARQOVEX</p>
                                                </td>
                                                <td className="px-6 py-2 text-center font-bold text-brand-blue">15.00%</td>
                                                <td className="px-6 py-2 text-right font-bold text-brand-blue">-${((activeVoucher.venta?.monto_usd || 0) * 0.15).toFixed(2)}</td>
                                            </tr>
                                            <tr className="bg-emerald-500/[0.03]">
                                                <td className="px-6 py-3">
                                                    <p className="font-black text-emerald-600 uppercase tracking-tighter">LIQUIDACIÓN AL SOCIO</p>
                                                </td>
                                                <td className="px-6 py-3 text-center font-black text-emerald-600">85.00%</td>
                                                <td className="px-6 py-3 text-right font-black text-emerald-600 text-lg">${activeVoucher.monto_payout.toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Evidencia de Transferencia */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Image src={LOGO_SRC} alt="ARQOVEX" width={14} height={14} className="opacity-30" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Evidencia de Payout</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Pago Verificado</span>
                                    </div>
                                </div>
                                {activeVoucher.comprobante_url ? (
                                    <div className="flex gap-6 items-center">
                                        <div className="w-20 h-20 bg-white border border-slate-200 rounded-2xl overflow-hidden relative group cursor-pointer shadow-md">
                                            <Image src={activeVoucher.comprobante_url} alt="Comprobante" fill className="object-cover" />
                                            <a href={activeVoucher.comprobante_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <ExternalLink className="w-6 h-6 text-white" />
                                            </a>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                Digital Receipt ID Verified
                                            </p>
                                            <div className="bg-white p-4 rounded-2xl border border-slate-200 max-w-[400px]">
                                                <p className="text-[10px] text-slate-500 italic leading-relaxed">
                                                    &quot;{activeVoucher.notas_admin || "Transacción completada exitosamente según las políticas vigentes de ARQOVEX."}&quot;
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-400 text-xs italic">No se adjuntó comprobante visual. Verificado por auditoría interna.</div>
                                )}
                            </div>

                            {/* Footer del Documento */}
                            <div className="flex flex-col items-center gap-4 pt-6 border-t border-gray-100">
                                
                                <div className="flex justify-between w-full items-center print:hidden">
                                    <div className="flex items-center gap-3 text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                                        Certified by ARQOVEX Finance Dept.
                                    </div>
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                window.print();
                                            }} 
                                            className="px-8 py-3 rounded-full border border-slate-200 text-xs font-black uppercase tracking-tighter hover:bg-slate-50 transition-all flex items-center gap-2"
                                        >
                                            Imprimir Documento
                                        </button>
                                        <button 
                                            onClick={() => setIsVoucherModalOpen(false)} 
                                            className="px-8 py-3 rounded-full bg-[#001D3D] text-white text-xs font-black uppercase tracking-tighter hover:bg-black transition-all shadow-xl shadow-blue-900/10"
                                        >
                                            Cerrar Recibo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de Factura Administrativa */}
            {showAdminInvoice && selectedAdminVenta && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in print:bg-white print:p-0">
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-scale-in print:shadow-none print:rounded-none">
                        {/* Toolbar - Oculto en impresión */}
                        <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b border-gray-200 print:hidden">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-brand-blue" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Validación de Venta ARQOVEX</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => window.print()} className="p-2 rounded-lg hover:bg-gray-200 text-gray-600"><Printer className="w-5 h-5" /></button>
                                <button onClick={() => setShowAdminInvoice(false)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><X className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Contenido Factura */}
                        <div className="p-10 text-gray-800 bg-white min-h-[600px] flex flex-col">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <Image src={LOGO_SRC} alt="ARQOVEX" width={150} height={40} className="brightness-0 mb-4" />
                                    <div className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-wider font-bold">
                                        <p>Plataforma de Ingeniería Global</p>
                                        <p>RNC: 132-XXXXX-X</p>
                                        <p>Santo Domingo, Rep. Dom.</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h1 className="text-4xl font-black text-gray-900 italic tracking-tighter mb-1">FACTURA</h1>
                                    <p className="text-brand-blue font-mono font-bold">{selectedAdminVenta.factura_numero || `ARQ-${selectedAdminVenta.id.slice(0, 8).toUpperCase()}`}</p>
                                    <div className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        <p>Fecha: <span className="text-gray-900">{new Date(selectedAdminVenta.created_at).toLocaleDateString()}</span></p>
                                        <p>Ref: <span className="text-gray-900">{selectedAdminVenta.paypal_order_id || 'TRANS-DIRECTA'}</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-12 py-8 border-y border-gray-100">
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Comprador</h4>
                                    <p className="font-bold text-gray-900 text-lg">{selectedAdminVenta.usuario?.nombre_completo || "Usuario Verificado"}</p>
                                    <p className="text-xs text-gray-500 font-medium">{selectedAdminVenta.usuario?.email}</p>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Estado de Pago</h4>
                                    <div className="flex justify-end">
                                        <span className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest">
                                            {selectedAdminVenta.estado_pago || 'Pagado'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-grow">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-900">
                                            <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest">Descripción del Ítem</th>
                                            <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest">Total Bruto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr>
                                            <td className="py-8">
                                                <p className="font-black text-gray-900 text-xl tracking-tighter leading-none">{selectedAdminVenta.plano?.titulo || "Licencia Arqovex"}</p>
                                                <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">Adquisición de propiedad digital / Licencia de uso</p>
                                            </td>
                                            <td className="py-8 text-right font-black text-2xl italic text-gray-900">
                                                ${(selectedAdminVenta.monto_usd || selectedAdminVenta.precio_pagado || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end pt-12 mt-12 border-t-2 border-gray-900">
                                <div className="w-full max-w-[280px] space-y-4">
                                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                                        <span>Subtotal Operación</span>
                                        <span className="text-gray-900">${(selectedAdminVenta.monto_usd || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4 px-5 bg-brand-blue rounded-2xl text-white shadow-xl shadow-brand-blue/20">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total Cobrado</span>
                                        <span className="text-3xl font-black italic tracking-tighter leading-none">${(selectedAdminVenta.monto_usd || 0).toFixed(2)} <span className="text-xs not-italic font-normal opacity-70">USD</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center opacity-50 grayscale">
                                <p className="text-[8px] font-bold uppercase tracking-widest">Sello Digital de Validación ARQOVEX SRL</p>
                                <p className="text-[8px] font-mono font-bold tracking-tighter">HASH-AUTH: {selectedAdminVenta.id.toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
