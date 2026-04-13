"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Plus, Upload, Save, AlertCircle, MapPin, FileText, FileUp,
    Pencil, CheckCircle, X, Images, ArrowLeft, ArrowRight, Loader2,
    DollarSign
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Categoria, Plano } from "@/types";

interface PartnerUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
    plano?: Plano | null; // Added for edit mode
    categoriaSocio: 'arquitectura' | 'inmobiliaria';
}



export default function PartnerUploadModal({ isOpen, onClose, onSuccess, userId, plano, categoriaSocio }: PartnerUploadModalProps) {
    const supabase = createClient();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    
    const isEditMode = !!plano;

    // Form State
    const [formData, setFormData] = useState({
        titulo: "",
        descripcion: "",
        precio: 0,
        metros_cuadrados: 0,
        habitaciones: 0,
        banos: 0,
        pisos: 0,
        categoria_id: "",
        estilo: "Contemporáneo",
        tipo_propiedad: "Plano Arquitectónico",
        video_url: "",
        enlace_mapa: "",
        iframe_mapa: ""
    });

    const [portada, setPortada] = useState<File | null>(null);
    const [imgPrincipalPreview, setImgPrincipalPreview] = useState<string>("");
    const [displayPrecio, setDisplayPrecio] = useState<string>("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [galeria, setGaleria] = useState<File[]>([]);
    const [archivoTecnico, setArchivoTecnico] = useState<File | null>(null);

    // Initialize form if editing
    useEffect(() => {
        if (plano && isOpen) {
            setFormData({
                titulo: plano.titulo || "",
                descripcion: plano.descripcion || "",
                precio: plano.precio || 0,
                metros_cuadrados: plano.metros_cuadrados || 0,
                habitaciones: plano.habitaciones || 0,
                banos: plano.banos || 0,
                pisos: plano.pisos || 0,
                categoria_id: plano.categoria_id || "",
                estilo: plano.estilo || "Contemporáneo",
                tipo_propiedad: plano.tipo_propiedad || "Plano Arquitectónico",
                video_url: plano.video_url || "",
                enlace_mapa: plano.enlace_mapa || "",
                iframe_mapa: plano.iframe_mapa || ""
            });
            setImgPrincipalPreview(plano.imagen_url || "");
            setDisplayPrecio(plano.precio ? plano.precio.toLocaleString("en-US") : "");
            setStep(1);
        } else if (!plano && isOpen) {
            // Reset for new project
            setFormData({
                titulo: "",
                descripcion: "",
                precio: 0,
                metros_cuadrados: 0,
                habitaciones: 0,
                banos: 0,
                pisos: 0,
                categoria_id: "",
                estilo: "Contemporáneo",
                tipo_propiedad: "Plano Arquitectónico",
                video_url: "",
                enlace_mapa: "",
                iframe_mapa: ""
            });
            setImgPrincipalPreview("");
            setDisplayPrecio("");
            setPortada(null);
            setVideoFile(null);
            setGaleria([]);
            setArchivoTecnico(null);
            setStep(1);
        }
    }, [plano, isOpen]);

    useEffect(() => {
        const fetchCats = async () => {
            const { data } = await supabase.from("categorias").select("*");
            if (data && data.length > 0) {
                setCategorias(data);
                if (!formData.categoria_id) {
                    setFormData(prev => ({ ...prev, categoria_id: data[0].id }));
                }
            }
        };
        fetchCats();
    }, [supabase, formData.categoria_id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ["metros_cuadrados", "habitaciones", "banos", "pisos"].includes(name) 
                ? Number(value) 
                : value
        }));
    };

    const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        if (!rawValue) {
            setDisplayPrecio("");
            setFormData(prev => ({...prev, precio: 0}));
            return;
        }
        const num = parseInt(rawValue, 10);
        setDisplayPrecio(num.toLocaleString("en-US"));
        setFormData(prev => ({...prev, precio: num}));
    };

    const validateImageResolution = (file: File) => {
        return new Promise<{ width: number; height: number }>((resolve) => {
            const img = new globalThis.Image();
            img.onload = () => {
                const results = { width: img.naturalWidth, height: img.naturalHeight };
                URL.revokeObjectURL(img.src);
                resolve(results);
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const handleImgPrincipalChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const dims = await validateImageResolution(file);
            
            if (dims.width < 1200) {
                alert(`⚠️ AVISO DE CALIDAD: La imagen de portada es algo pequeña (${dims.width}px). Para una nitidez cristalina en ARQOVEX, recomendamos al menos 1600px.`);
            }
            
            setPortada(file);
            setImgPrincipalPreview(URL.createObjectURL(file));
        }
    };

    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0]);
        }
    };

    const handleGaleriaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setGaleria((prev: File[]) => [...prev, ...files]);
            
            if (files.length > 0) {
                const dims = await validateImageResolution(files[0]);
                if (dims.width < 1200) {
                    alert("⚠️ AVISO DE GALERÍA: Algunas imágenes tienen baja resolución. Recomendamos fotos HD para destacar tu proyecto.");
                }
            }
        }
    };

    const handleArchivoTecnicoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setArchivoTecnico(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!isEditMode && !portada) throw new Error("La imagen principal es obligatoria.");
            if (!formData.categoria_id) throw new Error("Debes seleccionar una categoría.");
            if (!isEditMode && (galeria.length < 3 || galeria.length > 10)) {
                throw new Error("Debes subir entre 3 y 10 fotos para la galería.");
            }

            // Arquitectos must upload technical file (Strictly mandatory for designs)
            if (!isEditMode && categoriaSocio === 'arquitectura' && !archivoTecnico) {
                throw new Error("Como arquitecto, DEBES subir el archivo técnico (PDF o ZIP de los planos) para finalizar la publicación.");
            }

            let portadaUrl = plano?.imagen_url || "";
            let archivoPath = plano?.url_archivo || "";

            // 1. Upload Principal Image if changed
            if (portada) {
                const imgPath = `proyectos/${userId}/${Date.now()}-${portada.name}`;
                const { error: uploadImgError } = await supabase.storage
                    .from("planos-files")
                    .upload(imgPath, portada);
                
                if (uploadImgError) throw uploadImgError;
                const { data: { publicUrl } } = supabase.storage.from("planos-files").getPublicUrl(imgPath);
                portadaUrl = publicUrl;
            }

            // 1.5 Handle Video Upload
            let videoUrl = formData.video_url;
            if (videoFile) {
                const ext = videoFile.name.split('.').pop();
                const path = `videos/${userId}/${Date.now()}.${ext}`;
                const { error: uploadVideoError } = await supabase.storage.from('planos-files').upload(path, videoFile);
                if (uploadVideoError) throw uploadVideoError;
                const { data: { publicUrl } } = supabase.storage.from('planos-files').getPublicUrl(path);
                videoUrl = publicUrl;
            }

            // 2. Upload Technical File if changed
            if (archivoTecnico) {
                archivoPath = `privado/${userId}/${Date.now()}-${archivoTecnico.name}`;
                const { error: uploadFileError } = await supabase.storage.from("planos-privados").upload(archivoPath, archivoTecnico);
                if (uploadFileError) throw uploadFileError;
            }

            // 3. Insert or Update planos
            const dataToSave = {
                ...formData,
                imagen_url: portadaUrl,
                video_url: videoUrl,
                url_archivo: archivoPath,
                vendedor_id: userId,
                estado_revision: isEditMode ? (plano.estado_revision === 'rechazado' ? 'publicado' : plano.estado_revision) : "en_revision",
                destacado: plano?.destacado ?? false,
                disponible: plano?.disponible ?? true
            };

            if (isEditMode) {
                const { error: updateError } = await supabase
                    .from("planos")
                    .update(dataToSave)
                    .eq("id", plano.id);
                if (updateError) throw updateError;
            } else {
                const { data: newPlanoData, error: insertError } = await supabase
                    .from("planos")
                    .insert([dataToSave])
                    .select();
                
                if (insertError) throw insertError;
                const newPlano = newPlanoData?.[0];

                if (galeria.length > 0 && newPlano) {
                    const galleryPromises = galeria.map(async (file, idx) => {
                        const path = `galeria/${newPlano.id}/${idx}-${file.name}`;
                        await supabase.storage.from("planos-files").upload(path, file);
                        const { data: { publicUrl } } = supabase.storage.from("planos-files").getPublicUrl(path);
                        return { plano_id: newPlano.id, imagen_url: publicUrl };
                    });
                    const galleryResults = await Promise.all(galleryPromises);
                    await supabase.from("galeria_propiedades").insert(galleryResults);
                }
            }

            onSuccess();
            onClose();
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || "Error al procesar el proyecto.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-[#060810]/95 backdrop-blur-xl" 
                />
                
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-brand-slate-deep border border-white/10 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden mx-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center shadow-blue-glow">
                                {isEditMode ? <Pencil className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                                    {isEditMode ? (categoriaSocio === 'inmobiliaria' ? "Editar Propiedad" : "Editar Diseño") : (categoriaSocio === 'inmobiliaria' ? "Publicar Propiedad" : "Publicar Diseño")}
                                </h2>
                                <p className="text-xs text-gray-500 font-medium">
                                    {isEditMode ? (categoriaSocio === 'inmobiliaria' ? "Actualizar Inmueble" : "Actualizar Plano") : (categoriaSocio === 'inmobiliaria' ? "Nueva Propiedad" : "Nuevo Diseño")} • Paso {step} de 4
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-white/5 relative">
                        <motion.div 
                            className="h-full bg-brand-blue shadow-[0_0_15px_rgba(45,108,223,0.5)]"
                            animate={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>

                    <div className="p-8 max-h-[70vh] overflow-y-auto">
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* STEP 1: BASIC INFO */}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">
                                            {categoriaSocio === 'inmobiliaria' ? "Nombre de la Propiedad" : "Título del Diseño"}
                                        </label>
                                        <input 
                                            name="titulo" value={formData.titulo} onChange={handleInputChange}
                                            placeholder={categoriaSocio === 'inmobiliaria' ? "Ej: Apartamento en Piantini - Vista al Mar" : "Ej: Villa Esmeralda - Premium Edition"} 
                                            className="input-field py-4"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Precio de Venta (US$)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input 
                                                type="text" name="precio" 
                                                value={displayPrecio} 
                                                onChange={handlePrecioChange}
                                                placeholder="0"
                                                className="input-field py-4 pl-12"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">
                                        {categoriaSocio === 'inmobiliaria' ? "Descripción del Inmueble" : "Resumen del Diseño"}
                                    </label>
                                    <textarea 
                                        name="descripcion" value={formData.descripcion} onChange={handleInputChange}
                                        rows={4} 
                                        placeholder={categoriaSocio === 'inmobiliaria' ? "Describe las amenidades, ubicación y detalles únicos..." : "Describe la visión arquitectónica de este diseño..."} 
                                        className="input-field py-4 resize-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Categoría</label>
                                        <select 
                                            name="categoria_id" value={formData.categoria_id} onChange={handleInputChange}
                                            className="input-field py-4 appearance-none"
                                            required
                                        >
                                            <option value="">Seleccionar...</option>
                                            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Estilo Predominante</label>
                                        <select 
                                            name="estilo" value={formData.estilo} onChange={handleInputChange}
                                            className="input-field py-4 appearance-none"
                                        >
                                            <option>Contemporáneo</option>
                                            <option>Minimalista</option>
                                            <option>Clásico</option>
                                            <option>Tropical Moderno</option>
                                            <option>Industrial</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Tipo de Producto</label>
                                        <select 
                                            name="tipo_propiedad" value={formData.tipo_propiedad} onChange={handleInputChange}
                                            className="input-field py-4 appearance-none"
                                        >
                                            <option>Plano Arquitectónico</option>
                                            <option>Proyecto 3D</option>
                                            <option>Casa</option>
                                            <option>Apartamento</option>
                                            <option>Local Comercial</option>
                                            <option>Terreno / Solar</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: TECHNICAL DETAILS */}
                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Área (m²)</label>
                                        <input 
                                            type="number" 
                                            name="metros_cuadrados" 
                                            value={formData.metros_cuadrados === 0 ? "" : formData.metros_cuadrados} 
                                            onChange={handleInputChange} 
                                            placeholder="0"
                                            className="input-field py-4" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Habitaciones</label>
                                        <input 
                                            type="number" 
                                            name="habitaciones" 
                                            value={formData.habitaciones === 0 ? "" : formData.habitaciones} 
                                            onChange={handleInputChange} 
                                            placeholder="0"
                                            className="input-field py-4" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Baños</label>
                                        <input 
                                            type="number" 
                                            name="banos" 
                                            value={formData.banos === 0 ? "" : formData.banos} 
                                            onChange={handleInputChange} 
                                            placeholder="0"
                                            className="input-field py-4" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Niveles / Pisos</label>
                                        <input 
                                            type="number" 
                                            name="pisos" 
                                            value={formData.pisos === 0 ? "" : formData.pisos} 
                                            onChange={handleInputChange} 
                                            placeholder="0"
                                            className="input-field py-4" 
                                        />
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                    <div className="flex items-center gap-3 text-emerald-400">
                                        <CheckCircle className="w-5 h-5" />
                                        <h4 className="font-bold text-white text-sm">Control de Calidad</h4>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        {categoriaSocio === 'inmobiliaria' 
                                            ? "ARQOVEX mantiene estándares premium. Asegúrate de incluir la ubicación exacta y detalles verídicos de la propiedad."
                                            : "ARQOVEX mantiene estándares premium. Asegúrate de que las dimensiones sean reales y los servicios de infraestructura estén contemplados."}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: MULTIMEDIA */}
                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Imagen de Portada (HD)</label>
                                        <div className="relative group aspect-video rounded-2xl border-2 border-dashed border-white/10 hover:border-brand-blue/50 overflow-hidden transition-all bg-white/[0.02]">
                                            {imgPrincipalPreview ? (
                                                <>
                                                    <Image src={imgPrincipalPreview} alt="Preview" fill className="object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Pencil className="w-6 h-6 text-white" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                                                    <Upload className="w-8 h-8 mb-2 opacity-50" />
                                                    <p className="text-xs font-medium">Click para subir portada</p>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleImgPrincipalChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    </div>

                                    {!isEditMode && (
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Galería (Mín. 3 fotos)</label>
                                            <div className="relative aspect-video rounded-2xl border-2 border-dashed border-white/10 hover:border-emerald-500/50 flex flex-col items-center justify-center text-gray-500 bg-white/[0.02] transition-all">
                                                <Images className="w-8 h-8 mb-2 opacity-50" />
                                                <p className="text-xs font-medium">Fotos de interiores / Renderings</p>
                                                <span className="text-[10px] mt-2 badge bg-emerald-500/10 text-emerald-400 border-none">{galeria.length} seleccionadas</span>
                                                <input type="file" accept="image/*" multiple onChange={handleGaleriaChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Video Section */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block flex items-center gap-2">
                                                Tour Virtual (Link)
                                                <span className="text-[8px] text-gray-500 font-normal normal-case">(YouTube/IG)</span>
                                            </label>
                                            <div className="relative">
                                                <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input 
                                                    name="video_url" 
                                                    value={formData.video_url} 
                                                    onChange={handleInputChange}
                                                    placeholder="URL del video..." 
                                                    className="input-field py-4 pl-12"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block flex items-center gap-2">
                                                O Subir Archivo
                                                <span className="text-[8px] text-gray-500 font-normal normal-case">(MP4/WebM)</span>
                                            </label>
                                            <div className="relative group h-[58px]">
                                                <div className="input-field h-full flex items-center justify-center gap-2 border-dashed border-white/20 hover:border-brand-blue/50 transition-all cursor-pointer bg-white/[0.01] px-4">
                                                    <FileUp className="w-4 h-4 text-gray-500" />
                                                    <span className="text-[10px] font-bold text-gray-400 truncate">
                                                        {videoFile ? videoFile.name : "Seleccionar Video"}
                                                    </span>
                                                </div>
                                                <input 
                                                    type="file" 
                                                    accept="video/*" 
                                                    onChange={handleVideoFileChange} 
                                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-gray-500 italic">Puedes subir un video directamente o pegar un link de YouTube/Instagram.</p>
                                </div>

                                {/* Map Section */}
                                <div className="space-y-6 pt-6 border-t border-white/5">
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block flex items-center gap-2">
                                            Enlace de Google Maps (Link Directo)
                                            <span className="text-[8px] text-gray-500 font-normal normal-case">(Opcional)</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input 
                                                name="enlace_mapa" 
                                                value={formData.enlace_mapa} 
                                                onChange={handleInputChange}
                                                placeholder="https://maps.app.goo.gl/..." 
                                                className="input-field py-4 pl-12"
                                            />
                                        </div>
                                        <div className="bg-brand-blue/5 p-3 rounded-lg border border-brand-blue/10">
                                            <p className="text-[9px] text-gray-400 leading-relaxed">
                                                <strong className="text-brand-blue">Instrucciones:</strong> Abre Google Maps &gt; Busca la ubicación &gt; Clic en <strong>Compartir</strong> &gt; <strong>Copiar enlace</strong> y pégalo arriba.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block flex items-center gap-2">
                                            Mapa Interactivo (Iframe Embed)
                                            <span className="text-[8px] text-gray-500 font-normal normal-case">(Opcional - Avanzado)</span>
                                        </label>
                                        <textarea 
                                            name="iframe_mapa" 
                                            value={formData.iframe_mapa} 
                                            onChange={handleInputChange}
                                            rows={2}
                                            placeholder="Copia aquí el código iframe de Google Maps" 
                                            className="input-field py-3 text-[10px] font-mono"
                                        />
                                        <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                                            <p className="text-[9px] text-gray-400 leading-relaxed">
                                                <strong className="text-emerald-400">¿Cómo obtener el código?:</strong> Clic en <strong>Compartir</strong> &gt; Selecciona la pestaña <strong>Insertar un mapa</strong> &gt; Clic en <strong>Copiar HTML</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className={`text-[10px] uppercase font-bold tracking-widest block ${categoriaSocio === 'arquitectura' ? 'text-red-400 animate-pulse' : 'text-gray-400'}`}>
                                        {categoriaSocio === 'arquitectura' ? "Archivo Técnico (PLANOS PDF/ZIP - OBLIGATORIO)" : "Documentación Adicional (Opcional)"}
                                    </label>
                                    <div className={`p-4 rounded-xl border flex items-center justify-between ${categoriaSocio === 'arquitectura' ? 'bg-orange-500/5 border-orange-500/10' : 'bg-white/5 border-white/10'}`}>
                                        <div className="flex items-center gap-3">
                                            <FileText className={`w-6 h-6 ${categoriaSocio === 'arquitectura' ? 'text-orange-400' : 'text-gray-400'}`} />
                                            <div>
                                                <p className="text-sm font-bold text-white">{archivoTecnico ? archivoTecnico.name : (categoriaSocio === 'arquitectura' ? "Subir Planos (.zip / .pdf)" : "Subir Folleto / Legal")}</p>
                                                <p className="text-[10px] text-gray-500 uppercase">
                                                    {categoriaSocio === 'arquitectura' ? "Solo el comprador final tendrá acceso." : "Archivos privados para gestión administrativa."}
                                                </p>
                                                {isEditMode && plano.url_archivo && !archivoTecnico && (
                                                    <p className="text-[10px] text-emerald-500">Archivo actual conservado.</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <button className="btn-ghost py-2 px-4 text-xs font-bold border-orange-500/20 text-orange-400 hover:bg-orange-500/10">
                                                {archivoTecnico ? "Cambiar" : "Elegir Archivo"}
                                            </button>
                                            <input type="file" onChange={handleArchivoTecnicoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: REVIEW & CONFIRM */}
                        {step === 4 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div className="p-8 rounded-3xl bg-brand-gradient flex flex-col items-center text-center space-y-4 shadow-xl">
                                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <CheckCircle className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Todo listo para enviar</h3>
                                        <p className="text-white/70 text-sm max-w-sm mx-auto">
                                            Tu proyecto será enviado a nuestro equipo técnico para revisión. Una vez aprobado, se publicará en el catálogo oficial de ARQOVEX.
                                        </p>
                                    </div>
                                    <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 w-full max-w-md">
                                        <h4 className="text-[11px] font-bold text-orange-400 uppercase tracking-widest mb-1">Aviso Comercial: Comisión del 15%</h4>
                                        <p className="text-xs text-white/80 leading-relaxed">
                                            Al publicar este proyecto en ARQOVEX, aceptas que la plataforma retendrá el <strong className="text-white">15%</strong> de la tarifa de venta final por concepto de infraestructura tecnológica, soporte y procesamiento de pagos seguros a través de PayPal. El <strong className="text-white">85%</strong> restante será transferido directamente a tu cuenta.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="glass-card p-6 border-white/5">
                                        <h4 className="text-[10px] uppercase font-bold text-brand-blue mb-4">Resumen Técnico</h4>
                                        <ul className="space-y-3">
                                            <li className="flex justify-between text-sm"><span className="text-gray-500">PROYECTO:</span> <span className="text-white font-medium">{formData.titulo}</span></li>
                                            <li className="flex justify-between text-sm"><span className="text-gray-500">PRECIO:</span> <span className="text-brand-blue-light font-bold">US$ {formData.precio.toLocaleString("en-US")}</span></li>
                                            <li className="flex justify-between text-sm"><span className="text-gray-500">SUPERFICIE:</span> <span className="text-white font-medium">{formData.metros_cuadrados}m²</span></li>
                                        </ul>
                                    </div>
                                    <div className="glass-card p-6 border-white/5">
                                        <h4 className="text-[10px] uppercase font-bold text-brand-blue mb-4">Estatus de Archivos</h4>
                                        <ul className="space-y-3">
                                            <li className="flex justify-between text-sm">
                                                <span className="text-gray-500">PORTADA:</span> 
                                                <span className={imgPrincipalPreview ? "text-emerald-400" : "text-red-400"}>
                                                    {imgPrincipalPreview ? "✓ LISTO" : "X PENDIENTE"}
                                                </span>
                                            </li>
                                            {!isEditMode && <li className="flex justify-between text-sm"><span className="text-gray-500">GALERÍA:</span> <span className="text-emerald-400">{galeria.length} FOTOS</span></li>}
                                            <li className="flex justify-between text-sm">
                                                <span className="text-gray-500">TÉCNICO:</span> 
                                                <span className={(archivoTecnico || (isEditMode && plano.url_archivo)) ? "text-emerald-400" : "text-gray-500"}>
                                                    {(archivoTecnico || (isEditMode && plano.url_archivo)) ? "✓ LISTO" : "NO INCLUIDO"}
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between gap-4">
                        <button 
                            onClick={() => setStep(s => Math.max(1, s - 1))}
                            disabled={step === 1 || loading}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${step === 1 ? 'opacity-0' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <ArrowLeft className="w-4 h-4" /> Anterior
                        </button>
                        
                        {step < 4 ? (
                            <button 
                                onClick={() => setStep(s => Math.min(4, s + 1))}
                                className="btn-primary px-8 py-3 flex items-center gap-2"
                            >
                                Continuar <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button 
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary px-10 py-4 text-lg bg-brand-gradient border-none shadow-blue-glow flex items-center gap-3"
                            >
                                {loading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                                ) : (
                                    <><Save className="w-5 h-5" /> {isEditMode ? "Guardar Cambios" : "Subir Proyecto"}</>
                                )}
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
