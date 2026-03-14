"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Upload, Image as ImageIcon, FileText, CheckCircle,
    Loader2, AlertCircle, Save, ArrowLeft, X, Images,
    Edit, Trash2, AlertTriangle, Star, MessageSquare,
    Building2, PenTool, Bed, Bath, Car, Square, MessageCircle,
    ShieldCheck, Instagram, Facebook, Linkedin, User as UserIcon,
    ExternalLink, ThumbsUp, ThumbsDown, ClipboardCheck, Users
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { createClient } from "@/lib/supabase/client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Categoria, Plano, Resena, SolicitudSocio, SolicitudVendedor } from "@/types";
import Image from "next/image";
// import { sendPropertyNotification } from "@/app/actions/email";

export default function AdminPage() {
    const router = useRouter();
    const supabase = createClient();

    // Auth state
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Form state
    const [formMode, setFormMode] = useState<'none' | 'inmobiliaria' | 'plano'>('none');
    const [formData, setFormData] = useState({
        titulo: "",
        descripcion: "",
        ubicacion: "",
        precio: "",
        tipo_propiedad: "Plano Arquitectónico",
        modalidad: "Ninguna",
        metros_cuadrados: "",
        habitaciones: "",
        banos: "",
        pisos: "1",
        parqueos: "",
        metros_frente: "",
        metros_fondo: "",
        estilo: "Moderno",
        categoria_id: "",
        estado_proyecto: "En Planos"
    });

    // Files state
    const [imagen, setImagen] = useState<File | null>(null);
    const [galeria, setGaleria] = useState<File[]>([]);
    const [archivoPlano, setArchivoPlano] = useState<File | null>(null);

    // UI state
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [planos, setPlanos] = useState<Plano[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [categorias, setCategorias] = useState<Categoria[]>([]);

    // Reviews & Solicitudes State
    const [resenas, setResenas] = useState<Resena[]>([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [solicitudes, setSolicitudes] = useState<SolicitudSocio[]>([]);
    const [solicitudLoading, setSolicitudLoading] = useState(false);
    const [solicitudesVendedores, setSolicitudesVendedores] = useState<SolicitudVendedor[]>([]);
    const [vendedorLoading, setVendedorLoading] = useState(false);
    
    const [activeTab, setActiveTab] = useState<'inventory' | 'reviews' | 'solicitudes' | 'partners' | 'moderation'>('inventory');
    const [isAdmin, setIsAdmin] = useState(false);

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
            .select(`
                id,
                created_at,
                nombre_completo,
                cedula,
                telefono,
                tipo_propiedad,
                ubicacion,
                precio,
                habitaciones,
                banos,
                parqueos,
                metros_cuadrados,
                descripcion,
                estado,
                fotos_urls
            `)
            .order("created_at", { ascending: false });

        console.log("====== DEBUG FETCH SOLICITUDES ======");
        console.log("Data:", data);
        console.log("Error:", error);
        console.log("=====================================");

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

    const approveAndAutoPublish = async (solicitud: SolicitudSocio) => {
        setSolicitudLoading(true);
        try {
            let defaultCategoriaId = categorias.length > 0 ? categorias[0].id : null;
            const inmoCat = categorias.find(c => c.nombre.toLowerCase().includes("inmobiliari") || c.nombre.toLowerCase().includes("propiedad"));
            if (inmoCat) defaultCategoriaId = inmoCat.id;

            const baseImageUrl = solicitud.fotos_urls && solicitud.fotos_urls.length > 0 ? solicitud.fotos_urls[0] : "";
            
            const { data: planoData, error: planoError } = await supabase
                .from("planos")
                .insert([{
                    titulo: `${solicitud.tipo_propiedad} en ${solicitud.ubicacion}`,
                    descripcion: solicitud.descripcion || `Propiedad tipo ${solicitud.tipo_propiedad} ubicada en ${solicitud.ubicacion}.`,
                    precio: solicitud.precio,
                    tipo_propiedad: solicitud.tipo_propiedad,
                    habitaciones: solicitud.habitaciones || 0,
                    banos: solicitud.banos || 0,
                    parqueos: solicitud.parqueos || 0,
                    metros_cuadrados: solicitud.metros_cuadrados || 0,
                    imagen_url: baseImageUrl,
                    autor_nombre: solicitud.nombre_completo,
                    categoria_id: defaultCategoriaId,
                    estado_proyecto: "Publicada",
                    modalidad: "Venta",
                    disponible: true,
                    destacado: false,
                    estilo: "Contemporáneo",
                    pisos: 1
                }])
                .select()
                .single();

            if (planoError) throw planoError;

            if (solicitud.fotos_urls && solicitud.fotos_urls.length > 1) {
                const galeriaInserts = solicitud.fotos_urls.slice(1).map((url, idx) => ({
                    plano_id: planoData.id,
                    imagen_url: url,
                    orden: idx
                }));
                const { error: galError } = await supabase.from("galeria_propiedades").insert(galeriaInserts);
                if (galError) console.error("Error inserting gallery:", galError);
            }

            await supabase.from("solicitudes_socios").update({ estado: 'contactado' }).eq("id", solicitud.id);
            
            // --- NOTIFICACIÓN POR CORREO (NEWSLETTER) (PAUSED - Waiting for official domain) ---
            /*
            try {
                const { data: subscribers } = await supabase.from('newsletter').select('email');
                if (subscribers && subscribers.length > 0) {
                    const emailList = subscribers.map(s => s.email);
                    await sendPropertyNotification(emailList, {
                        titulo: planoData.titulo,
                        precio: planoData.precio,
                        imagen_url: planoData.imagen_url,
                        tipo: planoData.tipo_propiedad
                    });
                }
            } catch (emailErr) {
                console.error("Error sending newsletter notifications:", emailErr);
                // No detenemos el flujo principal si los correos fallan
            }
            */
            // ------------------------------------------

            alert(`¡Propiedad auto-publicada con éxito y notificaciones enviadas!`);
            fetchSolicitudes();
            fetchPlanos();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error auto-publishing:", error);
            alert("Error al auto-publicar la propiedad: " + error.message);
        } finally {
            setSolicitudLoading(false);
        }
    };

    const checkAuthAndData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/auth/login");
            return;
        }

        const isHardcodedAdmin = user.email?.toLowerCase() === 'robertoficial69@hotmail.com' || 
                                 user.email?.toLowerCase() === 'axelp7223@gmail.com';
        setIsAdmin(isHardcodedAdmin);

        if (!isHardcodedAdmin) {
            const { data: perfil } = await supabase.from("perfiles").select("es_admin").eq("id", user.id).maybeSingle();
            if (!perfil || !perfil.es_admin) {
                router.push("/");
                return;
            }
        }
        const { data: cats, error: catError } = await supabase.from("categorias").select("*");
        if (catError) {
            console.error("Supabase Error [AdminFetchCats]:", catError.message);
        } else if (cats && cats.length > 0) {
            setCategorias(cats);
            if (!isEditing) {
                setFormData(prev => ({ ...prev, categoria_id: cats[0].id, estilo: cats[0].nombre }));
            }
        }

        setIsCheckingAuth(false);
        fetchPlanos();
    }, [router, supabase, isEditing, fetchPlanos]);

    useEffect(() => {
        checkAuthAndData();
        fetchResenas();
        fetchSolicitudes();
        fetchSolicitudesVendedores();
    }, [checkAuthAndData, fetchResenas, fetchSolicitudes, fetchSolicitudesVendedores]);

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
        } catch (err) {
            console.error("Exception approving/replying review:", err);
        }
        setReviewLoading(false);
    };

    const deleteReview = async (id: string) => {
        if (!confirm("¿Seguro que quieres eliminar esta reseña?")) return;
        setReviewLoading(true);
        const { error } = await supabase.from("resenas").delete().eq("id", id);
        if (error) console.error("Error deleting review:", error.message);
        else fetchResenas();
        setReviewLoading(false);
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

    const approveSocio = async (solicitudId: string) => {
        if (!confirm("¿Confirma la aprobación de este socio profesional? Esto le dará acceso al panel de vendedor.")) return;
        setVendedorLoading(true);
        try {
            const { error } = await supabase.rpc('sistema_aprobar_socio', { solicitud_id: solicitudId });
            if (error) throw error;
            alert("Socio aprobado con éxito.");
            fetchSolicitudesVendedores();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error approving socio:", error.message);
            alert("Error al aprobar socio: " + error.message);
        } finally {
            setVendedorLoading(false);
        }
    };

    const rejectSocio = async (solicitudId: string) => {
        if (!confirm("¿Seguro que quieres rechazar esta solicitud?")) return;
        setVendedorLoading(true);
        try {
            const { error } = await supabase.from("solicitudes_vendedores").update({ estado: 'rechazado' }).eq("id", solicitudId);
            if (error) throw error;
            fetchSolicitudesVendedores();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Error rejecting socio:", error.message);
        } finally {
            setVendedorLoading(false);
        }
    };

    const updatePlanoModeracion = async (planoId: string, nuevoEstado: 'publicado' | 'rechazado') => {
        setLoading(true);
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
            alert("Error al moderar proyecto: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImagen(e.target.files[0]);
        }
    };

    const handleGaleriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setGaleria(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeGaleriaImg = (index: number) => {
        setGaleria(prev => prev.filter((_, i) => i !== index));
    };

    const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setArchivoPlano(e.target.files[0]);
        }
    };

    const generateFileName = (file: File) => {
        const ext = file.name.split('.').pop();
        return `${Math.random().toString(36).substring(2)}-${Date.now()}.${ext}`;
    };

    const handleEdit = (plano: Plano) => {
        setEditingId(plano.id);
        setIsEditing(true);
        setFormData({
            titulo: plano.titulo,
            descripcion: plano.descripcion,
            ubicacion: plano.ubicacion || "",
            precio: plano.precio.toString(),
            tipo_propiedad: plano.tipo_propiedad || "Plano Arquitectónico",
            modalidad: plano.modalidad || "Ninguna",
            metros_cuadrados: plano.metros_cuadrados.toString(),
            habitaciones: (plano.habitaciones || 0).toString(),
            banos: (plano.banos || 0).toString(),
            pisos: (plano.pisos || 0).toString(),
            parqueos: (plano.parqueos || 0).toString(),
            metros_frente: (plano.metros_frente || 0).toString(),
            metros_fondo: (plano.metros_fondo || 0).toString(),
            estilo: plano.estilo,
            categoria_id: plano.categoria_id,
            estado_proyecto: plano.estado_proyecto || "En Planos"
        });
        // Reset files for new uploads
        setImagen(null);
        setGaleria([]);
        setArchivoPlano(null);
        setFormMode(plano.tipo_propiedad === "Plano Arquitectónico" ? "plano" : "inmobiliaria");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            titulo: "",
            descripcion: "",
            ubicacion: "",
            precio: "",
            tipo_propiedad: "Plano Arquitectónico",
            modalidad: "Ninguna",
            metros_cuadrados: "",
            habitaciones: "",
            banos: "",
            pisos: "1",
            parqueos: "",
            metros_frente: "",
            metros_fondo: "",
            estilo: "Moderno",
            categoria_id: categorias.length > 0 ? categorias[0].id : "",
            estado_proyecto: "En Planos"
        });
        setImagen(null);
        setGaleria([]);
        setArchivoPlano(null);
        setFormMode('none');
    };

    const confirmDelete = async () => {
        if (!showDeleteConfirm) return;
        setIsDeleting(true);

        try {
            // 1. Get plano data for file paths
            const { data: plano } = await supabase
                .from("planos")
                .select("*")
                .eq("id", showDeleteConfirm)
                .single();

            if (plano) {
                const p = plano as Plano;
                // 2. Delete from storage buckets
                // Extract filename from URL
                const getPath = (url: string) => url.split('/').pop();

                if (p.imagen_url) {
                    await supabase.storage.from("planos-files").remove([getPath(p.imagen_url)!]);
                }
                if (p.url_archivo) {
                    await supabase.storage.from("planos-privados").remove([getPath(p.url_archivo)!]);
                }

                // 3. Delete gallery images
                const { data: gallery } = await supabase
                    .from("galeria_propiedades")
                    .select("imagen_url")
                    .eq("plano_id", showDeleteConfirm);

                if (gallery && gallery.length > 0) {
                    const galleryPaths = gallery.map((g: { imagen_url: string }) => getPath(g.imagen_url)!);
                    await supabase.storage.from("planos-files").remove(galleryPaths);
                }
            }

            // 4. Delete from DB (Relactions will handle CASCADE if configured, but let's be explicit if needed)
            // galeria_propiedades should have CASCADE on plano_id
            const { error: delError } = await supabase
                .from("planos")
                .delete()
                .eq("id", showDeleteConfirm);

            if (delError) throw delError;

            setPlanos(planos.filter(p => p.id !== showDeleteConfirm));
            setShowDeleteConfirm(null);
        } catch (err: unknown) {
            console.error(err);
            const msg = err instanceof Error ? err.message : "Error desconocido";
            setError("Error al eliminar: " + msg);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isPlano = formData.tipo_propiedad === "Plano Arquitectónico";
        const isTerreno = formData.tipo_propiedad === "Terreno / Solar";

        // Only require files if not editing
        if (!isEditing && !imagen) {
            setError("Debes subir la imagen de portada.");
            return;
        }

        if (!isEditing && isPlano && !archivoPlano) {
            setError("Debes subir el archivo descargable para un Plano Arquitectónico.");
            return;
        }

        setLoading(true);
        setError(null);
        setUploadProgress(10);

        try {
            // 1. Get current item if editing
            let currentPlano: Plano | null = null;
            if (isEditing && editingId) {
                const { data } = await supabase.from('planos').select('*').eq('id', editingId).single();
                currentPlano = data as Plano;
            }

            // 2. Upload Cover Img if provided
            let imagen_url = currentPlano?.imagen_url;
            if (imagen) {
                const imgFileName = `portadas/${generateFileName(imagen)}`;
                const { error: imgError } = await supabase.storage
                    .from('planos-files')
                    .upload(imgFileName, imagen, { cacheControl: '3600', upsert: false });

                if (imgError) throw new Error(`Error subiendo portada: ${imgError.message}`);

                const { data: { publicUrl } } = supabase.storage
                    .from('planos-files')
                    .getPublicUrl(imgFileName);
                imagen_url = publicUrl;
            }
            setUploadProgress(30);

            // 3. Upload Document if provided
            let url_archivo = currentPlano?.url_archivo;
            if (isPlano && archivoPlano) {
                const docFileName = `documentos/${generateFileName(archivoPlano)}`;
                const { error: docError } = await supabase.storage
                    .from('planos-privados')
                    .upload(docFileName, archivoPlano, { cacheControl: '3600', upsert: false });

                if (docError) {
                    const { error: docError2 } = await supabase.storage
                        .from('planos-files')
                        .upload(docFileName, archivoPlano, { cacheControl: '3600', upsert: false });
                    if (docError2) throw new Error(`Error archivo: ${docError2.message}`);
                    url_archivo = supabase.storage.from('planos-files').getPublicUrl(docFileName).data.publicUrl;
                } else {
                    url_archivo = docFileName;
                }
            }
            setUploadProgress(50);

            // 4. Setup Record Data
            const planoData: Record<string, unknown> = {
                titulo: formData.titulo,
                descripcion: formData.descripcion,
                ubicacion: formData.ubicacion,
                precio: parseFloat(formData.precio),
                tipo_propiedad: formData.tipo_propiedad,
                modalidad: formData.modalidad,
                metros_cuadrados: parseInt(formData.metros_cuadrados) || 0,
                habitaciones: isTerreno ? 0 : (parseInt(formData.habitaciones) || 0),
                banos: isTerreno ? 0 : (parseFloat(formData.banos) || 0),
                pisos: isTerreno ? 0 : (parseInt(formData.pisos) || 0),
                parqueos: isTerreno ? 0 : (parseInt(formData.parqueos) || 0),
                metros_frente: isTerreno ? (parseFloat(formData.metros_frente) || 0) : null,
                metros_fondo: isTerreno ? (parseFloat(formData.metros_fondo) || 0) : null,
                estilo: formData.estilo,
                categoria_id: formData.categoria_id || null,
                imagen_url: imagen_url,
                url_archivo: url_archivo,
                estado_proyecto: formData.estado_proyecto,
                disponible: true,
            };

            let finalId = editingId;
            if (isEditing && editingId) {
                const { error: upError } = await supabase.from('planos').update(planoData).eq('id', editingId);
                if (upError) throw upError;
            } else {
                const { data, error: dbError } = await supabase.from('planos').insert([{ ...planoData, destacado: false }]).select('id').single();
                if (dbError) throw dbError;
                finalId = data.id;
            }

            setUploadProgress(70);

            // 5. Upload Gallery Images
            if (galeria.length > 0 && finalId) {
                const step = 20 / galeria.length;
                for (let i = 0; i < galeria.length; i++) {
                    const galFile = galeria[i];
                    const gFileName = `galeria/${finalId}/${generateFileName(galFile)}`;

                    const { error: gErr } = await supabase.storage
                        .from('planos-files')
                        .upload(gFileName, galFile, { cacheControl: '3600' });

                    if (!gErr) {
                        const { data: { publicUrl: gUrl } } = supabase.storage
                            .from('planos-files').getPublicUrl(gFileName);

                        await supabase.from('galeria_propiedades').insert([{
                            plano_id: finalId,
                            imagen_url: gUrl,
                            orden: i + (currentPlano?.imagenes?.length || 0)
                        }]);
                    }
                    setUploadProgress(prev => prev + step);
                }
            }

            setUploadProgress(100);
            setSuccess(true);
            setIsEditing(false);
            setEditingId(null);
            fetchPlanos();

            // Reset form
            setFormData({
                titulo: "", descripcion: "", ubicacion: "", precio: "", tipo_propiedad: "Plano Arquitectónico", modalidad: "Ninguna",
                metros_cuadrados: "", habitaciones: "", banos: "", pisos: "1", parqueos: "", metros_frente: "", metros_fondo: "",
                estilo: categorias.length > 0 ? categorias[0].nombre : "Moderno",
                categoria_id: categorias.length > 0 ? categorias[0].id : "",
                estado_proyecto: "En Planos"
            });
            setImagen(null);
            setGaleria([]);
            setArchivoPlano(null);
            setFormMode('none');

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Ocurrió un error inesperado al procesar.";
            setError(errorMessage);
            setUploadProgress(0);
        } finally {
            setLoading(false);
        }
    };

    if (isCheckingAuth) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
                </div>
            </MainLayout>
        );
    }

    const isPlano = formData.tipo_propiedad === "Plano Arquitectónico";
    const isTerreno = formData.tipo_propiedad === "Terreno / Solar";

    return (
        <MainLayout>
            <div className="pt-24 pb-16 min-h-screen">
                <div className="container-section max-w-4xl">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <div className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30 mb-3">
                                Control Inmobiliario
                            </div>
                            <h1 className="font-display text-3xl font-bold text-white mb-2">
                                {isEditing ? `Editando: ${formData.titulo}` : "Control de Ingeniería"}
                            </h1>
                            <p className="text-gray-500">
                                Gestión de infraestructura técnica y control de calidad.
                            </p>
                        </div>
                        <button onClick={() => router.push('/catalogo')} className="btn-ghost text-sm">
                            <ArrowLeft className="w-4 h-4" /> Ver Catálogo
                        </button>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex gap-4 mb-10">
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold transition-all border ${activeTab === 'inventory' ? 'bg-brand-blue border-brand-blue text-white shadow-blue-glow' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-white'}`}
                        >
                            <Images className="w-5 h-5" />
                            <div className="text-left">
                                <div className="text-xs">Inventario</div>
                                <div className="text-[8px] opacity-50 font-normal uppercase tracking-tighter">Gestión Técnica</div>
                            </div>
                        </button>
                        {isAdmin && (
                            <>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold transition-all border ${activeTab === 'reviews' ? 'bg-brand-blue border-brand-blue text-white shadow-blue-glow' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="text-xs">Reseñas</div>
                                        <div className="text-[8px] opacity-50 font-normal uppercase tracking-tighter">Control de Calidad</div>
                                    </div>
                                    {resenas.filter(r => !r.aprobado).length > 0 && (
                                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] animate-pulse">
                                            {resenas.filter(r => !r.aprobado).length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('solicitudes')}
                                    className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold transition-all border ${activeTab === 'solicitudes' ? 'bg-brand-blue border-brand-blue text-white shadow-blue-glow' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <Building2 className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="text-xs">Solicitudes</div>
                                        <div className="text-[8px] opacity-50 font-normal uppercase tracking-tighter">Filtro Partners</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('partners')}
                                    className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold transition-all border ${activeTab === 'partners' ? 'bg-brand-blue border-brand-blue text-white shadow-blue-glow' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <Users className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="text-xs">Partners</div>
                                        <div className="text-[8px] opacity-50 font-normal uppercase tracking-tighter">Directorio & Rendimiento</div>
                                    </div>
                                    {solicitudesVendedores.filter(s => s.estado === 'pendiente').length > 0 && (
                                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-orange-600 text-white text-[10px] animate-pulse">
                                            {solicitudesVendedores.filter(s => s.estado === 'pendiente').length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('moderation')}
                                    className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold transition-all border ${activeTab === 'moderation' ? 'bg-brand-blue border-brand-blue text-white shadow-blue-glow' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <ClipboardCheck className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="text-xs">Moderación</div>
                                        <div className="text-[8px] opacity-50 font-normal uppercase tracking-tighter">Embudo Aprobación</div>
                                    </div>
                                    {planos.filter(p => p.estado_revision === 'en_revision').length > 0 && (
                                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-yellow-600 text-white text-[10px] animate-pulse">
                                            {planos.filter(p => p.estado_revision === 'en_revision').length}
                                        </span>
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                    {activeTab === 'inventory' ? (
                        <div className="space-y-16">
                            <div className="glass-card p-6 md:p-8">
                                {success ? (
                                    <div className="text-center py-12 space-y-6">
                                        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                                            <CheckCircle className="w-10 h-10 text-green-400" />
                                        </div>
                                        <div>
                                            <h2 className="font-display text-2xl font-bold text-white mb-2">
                                                {isEditing ? "¡Actualización exitosa!" : "¡Elemento registrado con éxito!"}
                                            </h2>
                                            <p className="text-gray-400">
                                                {isEditing ? "Los cambios se han guardado correctamente." : "La publicación ya está disponible en el ecosistema ARQOVEX."}
                                            </p>
                                        </div>
                                        <button onClick={() => { setSuccess(false); fetchPlanos(); }} className="btn-primary mt-4">
                                            {isEditing ? "Volver al panel" : "Subir otra publicación"}
                                        </button>
                                    </div>
                                ) : formMode === 'none' && !isEditing ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
                                        <button
                                            onClick={() => {
                                                setFormData({ ...formData, tipo_propiedad: "Apartamento" });
                                                setFormMode('inmobiliaria');
                                            }}
                                            className="group flex flex-col items-center justify-center p-12 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-brand-blue/50 hover:bg-brand-blue/10 transition-all text-center"
                                        >
                                            <div className="w-20 h-20 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                                <Building2 className="w-10 h-10 text-brand-blue" />
                                            </div>
                                            <h3 className="font-display text-2xl font-bold text-white mb-2">NUEVA PROPIEDAD INMOBILIARIA</h3>
                                            <p className="text-gray-400">Publicar apartamentos, casas, villas o terrenos</p>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setFormData({ ...formData, tipo_propiedad: "Plano Arquitectónico" });
                                                setFormMode('plano');
                                            }}
                                            className="group flex flex-col items-center justify-center p-12 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all text-center"
                                        >
                                            <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                                <PenTool className="w-10 h-10 text-orange-400" />
                                            </div>
                                            <h3 className="font-display text-2xl font-bold text-white mb-2">NUEVO PLANO ARQUITECTÓNICO</h3>
                                            <p className="text-gray-400">Publicar diseños, fachadas y documentos técnicos</p>
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-12 animate-fade-in">
                                        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-8">
                                            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-3">
                                                {formMode === 'inmobiliaria' || (isEditing && formData.tipo_propiedad !== "Plano Arquitectónico") ? <Building2 className="w-6 h-6 text-brand-blue" /> : <PenTool className="w-6 h-6 text-orange-400" />}
                                                {formMode === 'inmobiliaria' || (isEditing && formData.tipo_propiedad !== "Plano Arquitectónico") ? "Formulario Inmobiliario" : "Formulario de Planos"}
                                            </h2>
                                            {!isEditing && (
                                                <button type="button" onClick={() => setFormMode('none')} className="btn-ghost py-2 px-4 text-sm text-gray-400 hover:text-white">
                                                    <ArrowLeft className="w-4 h-4 mr-2 inline" /> Volver al Menú
                                                </button>
                                            )}
                                        </div>
                                        {/* Propiedad Info */}
                                        <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-8">
                                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-brand-blue" />
                                                </div>
                                                <h3 className="text-xl font-bold text-white">Clasificación y Estado</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {!isPlano && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Tipo de Propiedad</label>
                                                            <select
                                                                required value={formData.tipo_propiedad}
                                                                onChange={e => setFormData({ ...formData, tipo_propiedad: e.target.value })}
                                                                className="input-field py-4 text-base"
                                                            >
                                                                <option value="Apartamento">Apartamento</option>
                                                                <option value="Casa Individual">Casa Individual</option>
                                                                <option value="Villa / Residencia">Villa / Residencia</option>
                                                                <option value="Proyecto Comercial">Proyecto Comercial</option>
                                                                <option value="Terreno / Solar">Terreno / Solar</option>
                                                            </select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Modalidad</label>
                                                            <select
                                                                required value={formData.modalidad}
                                                                onChange={e => setFormData({ ...formData, modalidad: e.target.value })}
                                                                className="input-field py-4 text-base"
                                                            >
                                                                <option value="Ninguna">Ninguna</option>
                                                                <option value="Venta">Venta</option>
                                                                <option value="Alquiler">Alquiler</option>
                                                                <option value="Venta / Alquiler">Venta / Alquiler</option>
                                                            </select>
                                                        </div>
                                                    </>
                                                )}

                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Estado del Proyecto</label>
                                                    <select
                                                        required value={formData.estado_proyecto}
                                                        onChange={e => setFormData({ ...formData, estado_proyecto: e.target.value as 'En Planos' | 'En Construcción' | 'Listo para entrega' })}
                                                        className="input-field py-4 text-base"
                                                    >
                                                        <option value="En Planos">En Planos</option>
                                                        <option value="En Construcción">En Construcción</option>
                                                        <option value="Listo para Entrega">Listo para Entrega</option>
                                                        <option value="Vendido">Vendido</option>
                                                    </select>
                                                </div>

                                                {categorias.length > 0 && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{isPlano ? "Estilo Arquitectónico" : "Estilo / Categoría"}</label>
                                                        <select
                                                            required value={formData.categoria_id}
                                                            onChange={e => {
                                                                const cat = categorias.find(c => c.id === e.target.value);
                                                                setFormData({ ...formData, categoria_id: e.target.value, estilo: cat?.nombre || "Moderno" })
                                                            }}
                                                            className="input-field py-4 text-base"
                                                        >
                                                            {categorias.map(c => (
                                                                <option key={c.id} value={c.id}>{c.nombre}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Título de la Publicación</label>
                                                    <input
                                                        type="text" required value={formData.titulo}
                                                        onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                                        className="input-field py-4 text-lg font-medium" placeholder={isPlano ? "Ej: Plano Casa Modelo Coral" : "Ej: Residencia Moderna Vista al Mar"}
                                                    />
                                                </div>

                                                {!isPlano && (
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Ubicación</label>
                                                        <input
                                                            type="text" value={formData.ubicacion}
                                                            onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                                                            className="input-field py-4 text-lg font-medium" placeholder="Ej: Punta Cana, República Dominicana"
                                                        />
                                                    </div>
                                                )}

                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Descripción Detallada</label>
                                                    <textarea
                                                        required rows={5} value={formData.descripcion}
                                                        onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                                        className="input-field resize-none py-4" placeholder="Describe los detalles de la propiedad o plano..."
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        {/* Dynamic Specs */}
                                        <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-8">
                                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                                                    <Upload className="w-5 h-5 text-brand-blue" />
                                                </div>
                                                <h3 className="text-xl font-bold text-white">Especificaciones Técnicas</h3>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{isPlano ? "Precio del Diseño (USD)" : "Precio (USD)"}</label>
                                                    <input
                                                        type="number" required min="0" step="0.01" value={formData.precio}
                                                        onChange={e => setFormData({ ...formData, precio: e.target.value })}
                                                        className="input-field py-4" placeholder="199.99"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{isPlano ? "Metros de construcción estimados" : "Área Total (m²)"}</label>
                                                    <input
                                                        type="number" required min="1" value={formData.metros_cuadrados}
                                                        onChange={e => setFormData({ ...formData, metros_cuadrados: e.target.value })}
                                                        className="input-field py-4" placeholder="150"
                                                    />
                                                </div>

                                                {!isTerreno && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Habitaciones</label>
                                                            <input
                                                                type="number" required min="0" value={formData.habitaciones}
                                                                onChange={e => setFormData({ ...formData, habitaciones: e.target.value })}
                                                                className="input-field py-4" placeholder="3"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Baños</label>
                                                            <input
                                                                type="number" required min="0" step="0.5" value={formData.banos}
                                                                onChange={e => setFormData({ ...formData, banos: e.target.value })}
                                                                className="input-field py-4" placeholder="2"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Parqueos</label>
                                                            <input
                                                                type="number" required min="0" value={formData.parqueos}
                                                                onChange={e => setFormData({ ...formData, parqueos: e.target.value })}
                                                                className="input-field py-4" placeholder="2"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Pisos</label>
                                                            <input
                                                                type="number" required min="1" value={formData.pisos}
                                                                onChange={e => setFormData({ ...formData, pisos: e.target.value })}
                                                                className="input-field py-4" placeholder="1"
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                {isTerreno && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Frente (mts)</label>
                                                            <input
                                                                type="number" required min="0" step="0.01" value={formData.metros_frente}
                                                                onChange={e => setFormData({ ...formData, metros_frente: e.target.value })}
                                                                className="input-field py-4" placeholder="15"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Fondo (mts)</label>
                                                            <input
                                                                type="number" required min="0" step="0.01" value={formData.metros_fondo}
                                                                onChange={e => setFormData({ ...formData, metros_fondo: e.target.value })}
                                                                className="input-field py-4" placeholder="30"
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </section>

                                        {/* Media Assets */}
                                        <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-8">
                                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                                    <ImageIcon className="w-5 h-5 text-emerald-400" />
                                                </div>
                                                <h3 className="text-xl font-bold text-white">Multimedia y Archivos</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                {/* Imagen Principal */}
                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                        {isPlano ? "Imagen Render Principal" : "Foto de Portada (Fachada)"} <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-8 hover:border-brand-blue/50 transition-all bg-white/[0.02] text-center cursor-pointer group min-h-[160px] flex items-center justify-center">
                                                        <input type="file" accept="image/*" onChange={handleImagenChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                        {imagen ? (
                                                            <div className="relative w-full aspect-video rounded-lg overflow-hidden ring-2 ring-brand-blue">
                                                                <Image src={URL.createObjectURL(imagen)} alt="Preview" fill className="object-cover" />
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Upload className="w-8 h-8 text-white" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2 text-gray-500 group-hover:text-brand-blue">
                                                                <Upload className="w-8 h-8 mx-auto opacity-30 group-hover:opacity-100" />
                                                                <div className="text-sm font-medium">Click para subir imagen de portada</div>
                                                                <div className="text-[10px] uppercase">JPG, PNG o WEBP (Recomendado 1200x800)</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Archivo PDF */}
                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                        {isPlano ? "Archivo Técnico Completo (ZIP/PDF/DWG)" : "Documento Adicional (Opcional)"} {isPlano && !isEditing && <span className="text-red-500">*</span>}
                                                    </label>
                                                    <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-8 hover:border-orange-500/50 transition-all bg-white/[0.02] text-center cursor-pointer group min-h-[160px] flex items-center justify-center">
                                                        <input type="file" accept=".pdf,.zip,.rar" onChange={handleArchivoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                        {archivoPlano ? (
                                                            <div className="flex flex-col items-center gap-3 text-orange-400 animate-in fade-in slide-in-from-bottom-2">
                                                                <FileText className="w-12 h-12" />
                                                                <div className="text-sm font-bold truncate max-w-full px-4">{archivoPlano.name}</div>
                                                                <div className="text-[10px] uppercase font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">Listo para subir</div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2 text-gray-500 group-hover:text-orange-500">
                                                                <FileText className="w-8 h-8 mx-auto opacity-30 group-hover:opacity-100" />
                                                                <div className="text-sm font-medium">Subir archivo técnico (PDF/ZIP)</div>
                                                                <div className="text-[10px] uppercase">Contenido protegido y privado</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Galeria */}
                                                <div className={`space-y-3 ${isPlano ? 'md:col-span-2' : 'md:col-span-1'}`}>
                                                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2 text-emerald-400">
                                                        {isPlano ? "Plano de Planta (Vista Previa Artística) / Galería" : "Galería de Interiores (Sala, Cocina, Cuartos)"}
                                                    </label>
                                                    <div className="relative border-2 border-dashed border-emerald-500/20 rounded-2xl p-10 hover:border-emerald-500/50 transition-all bg-emerald-500/[0.02] text-center cursor-pointer group flex items-center justify-center min-h-[120px]">
                                                        <input
                                                            type="file" accept="image/*" multiple onChange={handleGaleriaChange}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                        />
                                                        <div className="space-y-2 text-emerald-300/50 group-hover:text-emerald-300">
                                                            <Images className="w-8 h-8 mx-auto opacity-30 group-hover:opacity-100" />
                                                            <div className="text-sm font-medium">Añadir múltiples fotos a la galería</div>
                                                        </div>
                                                    </div>

                                                    {galeria.length > 0 && (
                                                        <div className="mt-6 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 pb-2">
                                                            {galeria.map((file, idx) => (
                                                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-white/[0.02] border border-white/5 group ring-1 ring-white/10 hover:ring-brand-blue/50 transition-all">
                                                                    <Image src={URL.createObjectURL(file)} alt={`Preview ${idx}`} fill className="object-cover" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); removeGaleriaImg(idx); }}
                                                                        className="absolute top-1 right-1 bg-red-600/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg"
                                                                    >
                                                                        <X className="w-3 h-3 text-white" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </section>

                                        {loading && (
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm font-semibold">
                                                    <span className="text-brand-blue flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Procesando y Subiendo Archivos...
                                                    </span>
                                                    <span className="text-white">{Math.round(uploadProgress)}%</span>
                                                </div>
                                                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                                                    <div
                                                        className="h-full bg-brand-gradient rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(45,108,223,0.5)]"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {error && (
                                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                                                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                                <p className="font-medium">{error}</p>
                                            </div>
                                        )}

                                        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
                                            <button type="submit" disabled={loading} className={`btn-primary flex-1 py-5 text-xl tracking-tight shadow-xl ${isEditing ? 'from-emerald-600 to-teal-700 shadow-emerald-500/20' : 'shadow-brand-blue/20'}`}>
                                                {loading ? (
                                                    <span className="flex items-center gap-3"><Loader2 className="w-6 h-6 animate-spin" /> {isEditing ? "Guardando..." : "Publicando..."}</span>
                                                ) : (
                                                    <span className="flex items-center gap-3">
                                                        {isEditing ? <CheckCircle className="w-6 h-6" /> : <Save className="w-6 h-6" />}
                                                        {isEditing ? "Guardar Cambios" : "Publicar Proyecto"}
                                                    </span>
                                                )}
                                            </button>
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={cancelEdit}
                                                    className="btn-ghost py-5 px-10 text-gray-500 hover:text-white border border-transparent hover:border-white/10"
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Inventory List */}
                            {!isEditing && !success && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-3">
                                            <Images className="w-6 h-6 text-brand-blue" />
                                            Inventario Actual
                                        </h2>
                                        <span className="badge bg-brand-blue/10 text-brand-blue border-brand-blue/20">
                                            {planos.length} Items Publicados
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {planos.map(plano => (
                                            <div key={plano.id} className="glass-card p-4 flex items-center gap-5 group hover:border-brand-blue/30 transition-all">
                                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                                    <Image src={plano.imagen_url} alt={plano.titulo} fill className="object-cover" />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <h4 className="text-white font-bold truncate">{plano.titulo}</h4>
                                                    <p className="text-xs text-brand-blue font-medium">{plano.tipo_propiedad} • {plano.estilo}</p>
                                                    <p className="text-sm text-gray-500 font-display">${plano.precio.toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(plano)}
                                                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(plano.id)}
                                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'reviews' ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-3">
                                    <MessageSquare className="w-6 h-6 text-brand-blue" />
                                    Reseñas de Usuarios
                                </h2>
                                <span className="badge bg-brand-blue/10 text-brand-blue border-brand-blue/20">
                                    {resenas.length} Comentarios Totales
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {resenas.map(r => (
                                    <div key={r.id} className={`glass-card p-6 flex flex-col md:flex-row gap-6 border-white/5 ${!r.aprobado ? 'border-l-4 border-l-red-500 bg-red-500/5' : 'hover:border-brand-blue/30'} transition-all`}>
                                        <div className="flex-grow space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-white text-lg">{r.usuario?.nombre_completo || "Usuario"}</span>
                                                    <span className="text-xs text-brand-blue-light font-medium flex items-center gap-2">
                                                        {r.usuario?.email || "Sin correo"} {" • "} {r.usuario?.telefono || "Sin teléfono"}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <Star key={s} className={`w-3 h-3 ${r.estrellas >= s ? "fill-yellow-400 text-yellow-400" : "text-gray-700"}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 tracking-wider">
                                                        {new Date(r.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-black/20 p-3 rounded-lg border border-white/5 inline-block mb-2">
                                                <span className="text-[10px] uppercase tracking-widest text-brand-blue-light font-bold mb-1 block">En Propiedad:</span>
                                                <p className="text-sm font-semibold text-white">{r.plano?.titulo || "Propiedad Desconocida"}</p>
                                            </div>
                                            <p className="text-gray-300 text-base italic leading-relaxed pt-2 border-t border-white/5">&quot;{r.comentario}&quot;</p>
                                            
                                            <div className="pt-4 border-t border-white/10 mt-4">
                                                <label className="text-[10px] uppercase font-bold text-brand-blue mb-2 block">
                                                    Respuesta del Administrador
                                                </label>
                                                <textarea
                                                    id={`reply-${r.id}`}
                                                    defaultValue={r.respuesta_admin || ""}
                                                    placeholder="Escribe tu respuesta pública aquí..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-brand-blue/50 min-h-[80px] transition-colors resize-none overflow-hidden"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex md:flex-col justify-start gap-3 min-w-[140px] pt-2">
                                            <button
                                                onClick={async () => {
                                                    const reply = (document.getElementById(`reply-${r.id}`) as HTMLTextAreaElement)?.value;
                                                    await approveReviewWithReply(r.id, reply);
                                                }}
                                                disabled={reviewLoading}
                                                className={`flex-1 btn-primary py-3 px-4 text-xs ${!r.aprobado ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-none shadow-emerald-500/20' : 'bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue-light border border-brand-blue/30'}`}
                                            >
                                                {!r.aprobado ? <><CheckCircle className="w-4 h-4 mr-2" /> Aprobar y Responder</> : <><MessageCircle className="w-4 h-4 mr-2" /> Guardar Respuesta</>}
                                            </button>
                                            <button
                                                onClick={() => deleteReview(r.id)}
                                                disabled={reviewLoading}
                                                className="flex-1 btn-ghost py-2 px-4 text-xs text-red-500 border-red-500/20 hover:bg-red-500/10"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" /> Borrar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {resenas.length === 0 && (
                                    <div className="text-center py-20 glass-card border-dashed">
                                        <MessageSquare className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                                        <p className="text-gray-500">Aún no hay reseñas para moderar.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : activeTab === 'solicitudes' ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-3">
                                    <Building2 className="w-6 h-6 text-brand-blue" />
                                    Solicitudes de Evaluación
                                </h2>
                                <span className="badge bg-brand-blue/10 text-brand-blue border-brand-blue/20">
                                    {solicitudes.length} Pendientes
                                </span>
                            </div>

                            <div className="grid gap-6">
                                {solicitudes.length === 0 ? (
                                    <div className="glass-card p-12 text-center text-gray-500">
                                        No hay solicitudes registradas aún.
                                    </div>
                                ) : (
                                    solicitudes.map((s) => (
                                        <div key={s.id} className="glass-card p-6 md:p-8 flex flex-col md:flex-row gap-8 hover:border-brand-blue/30 transition-all">
                                            <div className="flex-1 space-y-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">{s.nombre_completo}</h3>
                                                        <div className="flex gap-4 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {s.cedula}</span>
                                                            <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {s.telefono}</span>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                        s.estado === 'pendiente' ? 'bg-brand-blue/20 text-brand-blue-light border border-brand-blue/30' :
                                                        s.estado === 'contactado' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                        'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    }`}>
                                                        {s.estado}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                                    <div>
                                                        <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Tipo</span>
                                                        <p className="text-sm text-white font-medium">{s.tipo_propiedad}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Precio Deseado</span>
                                                        <p className="text-sm text-brand-blue-light font-bold">US$ {s.precio}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Ubicación</span>
                                                        <p className="text-sm text-white truncate">{s.ubicacion}</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1 flex items-center gap-1"><Bed className="w-3 h-3" /> Hab</span>
                                                        <p className="text-sm text-white font-medium">{s.habitaciones || '-'}</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1 flex items-center gap-1"><Bath className="w-3 h-3" /> Baños</span>
                                                        <p className="text-sm text-white font-medium">{s.banos || '-'}</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1 flex items-center gap-1"><Car className="w-3 h-3" /> Parq</span>
                                                        <p className="text-sm text-white font-medium">{s.parqueos || '-'}</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1 flex items-center gap-1"><Square className="w-3 h-3" /> Área</span>
                                                        <p className="text-sm text-white font-medium">{s.metros_cuadrados ? `${s.metros_cuadrados}m²` : '-'}</p>
                                                    </div>
                                                </div>

                                                {s.descripcion && (
                                                    <div className="space-y-2">
                                                        <span className="text-[10px] text-gray-500 uppercase font-bold block">Descripción Adicional</span>
                                                        <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-brand-blue/20 pl-4">
                                                            &quot;{s.descripcion}&quot;
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {s.fotos_urls && s.fotos_urls.length > 0 && (
                                                    <div className="space-y-2 mt-4">
                                                         <span className="text-[10px] text-gray-500 uppercase font-bold block">Fotos de la Propiedad ({s.fotos_urls.length})</span>
                                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                            {s.fotos_urls.map((url, i) => (
                                                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-brand-blue/50 transition-colors block">
                                                                    <Image src={url} alt={`Foto ${i+1}`} fill className="object-cover" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="text-[10px] text-gray-600 uppercase font-bold mt-4">
                                                    Recibida el: {new Date(s.created_at).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div className="flex md:flex-col gap-3 justify-end md:w-56">
                                                {s.estado === 'pendiente' && (
                                                    <>
                                                        <button 
                                                            onClick={() => approveAndAutoPublish(s)}
                                                            className="btn-primary w-full py-3 text-xs flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 border-none shadow-emerald-500/20"
                                                            disabled={solicitudLoading}
                                                        >
                                                            <Upload className="w-4 h-4" /> Aprobar y Publicar
                                                        </button>
                                                        <button 
                                                            onClick={() => updateSolicitudEstado(s.id, 'contactado')}
                                                            className="w-full py-3 text-xs flex justify-center items-center gap-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
                                                            disabled={solicitudLoading}
                                                        >
                                                            <CheckCircle className="w-4 h-4" /> Marcar Contactado
                                                        </button>
                                                    </>
                                                )}
                                                <button 
                                                    onClick={() => deleteSolicitud(s.id)}
                                                    className="btn-ghost w-full py-3 text-xs text-red-400 border-red-500/20 hover:bg-red-500/10 flex justify-center items-center gap-2"
                                                    disabled={solicitudLoading}
                                                >
                                                    <Trash2 className="w-4 h-4" /> Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : activeTab === 'partners' ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-3">
                                    <ShieldCheck className="w-6 h-6 text-brand-blue" />
                                    Solicitudes de Partners
                                </h2>
                                <span className="badge bg-brand-blue/10 text-brand-blue border-brand-blue/20">
                                    {solicitudesVendedores.length} Solicitudes Totales
                                </span>
                            </div>

                            <div className="grid gap-6">
                                {solicitudesVendedores.length === 0 ? (
                                    <div className="glass-card p-12 text-center text-gray-500">
                                        No hay solicitudes de partners aún.
                                    </div>
                                ) : (
                                    solicitudesVendedores.map((s) => (
                                        <div key={s.id} className="glass-card p-6 md:p-8 flex flex-col md:flex-row gap-8 hover:border-brand-blue/30 transition-all">
                                            <div className="flex-1 space-y-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">{s.nombre_completo}</h3>
                                                        <div className="flex gap-4 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> {s.telefono}</span>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                        s.estado === 'pendiente' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                        s.estado === 'aprobado' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                        'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    }`}>
                                                        {s.estado}
                                                    </div>
                                                </div>

                                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                                    <h4 className="text-[10px] text-gray-500 uppercase font-bold mb-3 tracking-widest">Bio Profesional</h4>
                                                    <p className="text-sm text-gray-300 leading-relaxed italic">&quot;{s.bio || 'Sin bio proporcionada.'}&quot;</p>
                                                </div>

                                                <div className="flex flex-wrap gap-4">
                                                    {s.social_links?.instagram && (
                                                        <a href={s.social_links.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-2 px-4 rounded-lg bg-pink-500/10 text-pink-500 border border-pink-500/20 hover:bg-pink-500/20 transition-all text-sm">
                                                            <Instagram className="w-4 h-4" /> Instagram
                                                        </a>
                                                    )}
                                                    {s.social_links?.facebook && (
                                                        <a href={s.social_links.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-2 px-4 rounded-lg bg-blue-600/10 text-blue-500 border border-blue-600/20 hover:bg-blue-600/20 transition-all text-sm">
                                                            <Facebook className="w-4 h-4" /> Facebook
                                                        </a>
                                                    )}
                                                    {s.social_links?.linkedin && (
                                                        <a href={s.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-2 px-4 rounded-lg bg-blue-700/10 text-blue-400 border border-blue-700/20 hover:bg-blue-700/20 transition-all text-sm">
                                                            <Linkedin className="w-4 h-4" /> LinkedIn
                                                        </a>
                                                    )}
                                                </div>
                                                
                                                <div className="text-[10px] text-gray-600 uppercase font-bold">
                                                    Recibida el: {new Date(s.created_at).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div className="flex md:flex-col gap-3 justify-end md:w-56">
                                                {s.estado === 'pendiente' && (
                                                    <>
                                                        <button 
                                                            onClick={() => approveSocio(s.id)}
                                                            className="btn-primary w-full py-3 text-xs flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 border-none shadow-emerald-500/20"
                                                            disabled={vendedorLoading}
                                                        >
                                                            <CheckCircle className="w-4 h-4" /> Aceptar Socio
                                                        </button>
                                                        <button 
                                                            onClick={() => rejectSocio(s.id)}
                                                            className="w-full py-3 text-xs flex justify-center items-center gap-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/5 transition-colors"
                                                            disabled={vendedorLoading}
                                                        >
                                                            <ThumbsDown className="w-4 h-4" /> Rechazar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : activeTab === 'moderation' ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-3">
                                    <ClipboardCheck className="w-6 h-6 text-brand-blue" />
                                    Control de Calidad (Moderación)
                                </h2>
                                <span className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                    {planos.filter(p => p.estado_revision === 'en_revision').length} Proyectos en Revisión
                                </span>
                            </div>

                            <div className="flex flex-col gap-6">
                                {planos.filter(p => p.estado_revision === 'en_revision').length === 0 ? (
                                    <div className="glass-card p-12 text-center text-gray-500 border-dashed">
                                        No hay proyectos pendientes de revisión técnica.
                                    </div>
                                ) : (
                                    planos.filter(p => p.estado_revision === 'en_revision').map((p) => (
                                        <div key={p.id} className="glass-card overflow-hidden flex flex-col md:flex-row gap-6 hover:border-brand-blue/30 transition-all">
                                            <div className="relative w-full md:w-64 h-48">
                                                <Image src={p.imagen_url} alt={p.titulo} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 p-6 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white">{p.titulo}</h3>
                                                        <p className="text-xs text-brand-blue-light font-medium uppercase tracking-widest">{p.tipo_propiedad}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-white">US$ {p.precio}</p>
                                                        <p className="text-[10px] text-gray-500">{p.metros_cuadrados}m²</p>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-400 line-clamp-2 italic">&quot;{p.descripcion}&quot;</p>

                                                <div className="flex gap-4 items-center pt-2">
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-white/5 py-1 px-3 rounded-full border border-white/10 uppercase tracking-tighter">
                                                        <UserIcon className="w-3 h-3" /> Vendedor ID: {p.vendedor_id?.substring(0,8)}...
                                                    </div>
                                                    <button 
                                                        onClick={() => router.push(`/plano/${p.id}`)}
                                                        className="text-[10px] text-brand-blue hover:text-white transition-colors flex items-center gap-1 uppercase font-bold"
                                                    >
                                                        Ver Vista Previa <ExternalLink className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-6 bg-white/[0.02] border-l border-white/5 flex flex-col gap-3 justify-center md:w-56">
                                                <button 
                                                    onClick={() => updatePlanoModeracion(p.id, 'publicado')}
                                                    className="btn-primary w-full py-3 text-xs bg-brand-gradient border-none"
                                                >
                                                    <ThumbsUp className="w-4 h-4 mr-2" /> Aprobar y Publicar
                                                </button>
                                                <button 
                                                    onClick={() => updatePlanoModeracion(p.id, 'rechazado')}
                                                    className="w-full py-3 text-xs flex justify-center items-center gap-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/5 transition-colors"
                                                >
                                                    <ThumbsDown className="w-4 h-4 mr-2" /> Rechazar
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center text-gray-500">
                            Pestaña no encontrada o en desarrollo.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Confirmación Borrado */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-brand-slate-deeper/80 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteConfirm(null)} />
                    <div className="glass-card max-w-md w-full p-8 relative z-10 border-red-500/30 animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white text-center mb-2">Eliminar Propiedad</h3>
                        <p className="text-gray-400 text-center mb-8">
                            ¿Estás seguro de eliminar esta propiedad? Esta acción borrará permanentemente los datos y archivos asociados en la nube. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button
                                disabled={isDeleting}
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors border border-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={isDeleting}
                                onClick={confirmDelete}
                                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                {isDeleting ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
