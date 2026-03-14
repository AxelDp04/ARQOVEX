"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, Upload, CheckCircle, AlertCircle, Loader2, Save, 
    Images, FileText, ArrowRight, ArrowLeft, 
    DollarSign, Pencil, Plus
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
}



export default function PartnerUploadModal({ isOpen, onClose, onSuccess, userId, plano }: PartnerUploadModalProps) {
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
        pisos: 1,
        categoria_id: "",
        estilo: "Contemporáneo",
        tipo_propiedad: "Plano Arquitectónico"
    });

    const [imgPrincipal, setImgPrincipal] = useState<File | null>(null);
    const [imgPrincipalPreview, setImgPrincipalPreview] = useState<string>("");
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
                pisos: plano.pisos || 1,
                categoria_id: plano.categoria_id || "",
                estilo: plano.estilo || "Contemporáneo",
                tipo_propiedad: plano.tipo_propiedad || "Plano Arquitectónico"
            });
            setImgPrincipalPreview(plano.imagen_url || "");
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
                pisos: 1,
                categoria_id: "",
                estilo: "Contemporáneo",
                tipo_propiedad: "Plano Arquitectónico"
            });
            setImgPrincipalPreview("");
            setImgPrincipal(null);
            setGaleria([]);
            setArchivoTecnico(null);
            setStep(1);
        }
    }, [plano, isOpen]);

    useEffect(() => {
        const fetchCats = async () => {
            const { data } = await supabase.from("categorias").select("*");
            if (data) setCategorias(data);
        };
        fetchCats();
    }, [supabase]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ["precio", "metros_cuadrados", "habitaciones", "banos", "pisos"].includes(name) 
                ? Number(value) 
                : value
        }));
    };

    const handleImgPrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setImgPrincipal(file);
            setImgPrincipalPreview(URL.createObjectURL(file));
        }
    };

    const handleGaleriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setGaleria(prev => [...prev, ...Array.from(e.target.files!)]);
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
            if (!isEditMode && !imgPrincipal) throw new Error("La imagen principal es obligatoria.");
            if (!formData.categoria_id) throw new Error("Debes seleccionar una categoría.");
            if (!isEditMode && (galeria.length < 3 || galeria.length > 10)) {
                throw new Error("Debes subir entre 3 y 10 fotos para la galería del proyecto.");
            }

            let imgUrl = plano?.imagen_url || "";
            let archivoPath = plano?.url_archivo || "";

            // 1. Upload Principal Image if changed
            if (imgPrincipal) {
                const imgPath = `proyectos/${userId}/${Date.now()}-${imgPrincipal.name}`;
                const { error: uploadImgError } = await supabase.storage
                    .from("planos-files")
                    .upload(imgPath, imgPrincipal);
                
                if (uploadImgError) throw uploadImgError;
                const { data: { publicUrl } } = supabase.storage.from("planos-files").getPublicUrl(imgPath);
                imgUrl = publicUrl;
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
                imagen_url: imgUrl,
                url_archivo: archivoPath,
                vendedor_id: userId,
                estado_revision: isEditMode ? (plano.estado_revision === 'rechazado' ? 'publicado' : plano.estado_revision) : "publicado",
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
                const { data: newPlano, error: insertError } = await supabase
                    .from("planos")
                    .insert([dataToSave])
                    .select()
                    .single();
                
                if (insertError) throw insertError;

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
                    className="fixed inset-0 bg-brand-slate-deeper/90 backdrop-blur-md" 
                />
                
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-brand-slate-deep border border-white/10 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center shadow-blue-glow">
                                {isEditMode ? <Pencil className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                                    {isEditMode ? "Editar en The Vault" : "Publicar en The Vault"}
                                </h2>
                                <p className="text-xs text-gray-500 font-medium">
                                    {isEditMode ? "Actualizar Proyecto" : "Nuevo Proyecto"} • Paso {step} de 4
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
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Título del Proyecto</label>
                                        <input 
                                            name="titulo" value={formData.titulo} onChange={handleInputChange}
                                            placeholder="Ej: Villa Esmeralda - Premium Edition" 
                                            className="input-field py-4"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Precio de Venta (US$)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input 
                                                type="number" name="precio" value={formData.precio} onChange={handleInputChange}
                                                className="input-field py-4 pl-12"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Resumen del Proyecto</label>
                                    <textarea 
                                        name="descripcion" value={formData.descripcion} onChange={handleInputChange}
                                        rows={4} placeholder="Describe la visión de este diseño..." 
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
                                            <option>Inmobiliaria (Casa/Villa)</option>
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
                                        <input type="number" name="metros_cuadrados" value={formData.metros_cuadrados} onChange={handleInputChange} className="input-field py-4" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Habitaciones</label>
                                        <input type="number" name="habitaciones" value={formData.habitaciones} onChange={handleInputChange} className="input-field py-4" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Baños</label>
                                        <input type="number" name="banos" value={formData.banos} onChange={handleInputChange} className="input-field py-4" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-brand-blue tracking-widest block">Niveles / Pisos</label>
                                        <input type="number" name="pisos" value={formData.pisos} onChange={handleInputChange} className="input-field py-4" />
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                    <div className="flex items-center gap-3 text-emerald-400">
                                        <CheckCircle className="w-5 h-5" />
                                        <h4 className="font-bold text-white text-sm">Control de Calidad</h4>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        ARQOVEX mantiene estándares premium. Asegúrate de que las dimensiones sean reales y los servicios de infraestructura estén contemplados.
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

                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase font-bold text-orange-400 tracking-widest block">Archivo Técnico (Protegido)</label>
                                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-6 h-6 text-orange-400" />
                                            <div>
                                                <p className="text-sm font-bold text-white">{archivoTecnico ? archivoTecnico.name : "Subir Archivo (.zip / .pdf)"}</p>
                                                <p className="text-[10px] text-gray-500 uppercase">Solo el comprador final tendrá acceso.</p>
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
                                        <h3 className="text-2xl font-bold text-white">Todo listo para publicar</h3>
                                        <p className="text-white/70 text-sm max-w-sm mx-auto">
                                            Al ser Socio Certificado, tu proyecto se publicará automáticamente e instantáneamente en el catálogo oficial de ARQOVEX.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="glass-card p-6 border-white/5">
                                        <h4 className="text-[10px] uppercase font-bold text-brand-blue mb-4">Resumen Técnico</h4>
                                        <ul className="space-y-3">
                                            <li className="flex justify-between text-sm"><span className="text-gray-500">PROYECTO:</span> <span className="text-white font-medium">{formData.titulo}</span></li>
                                            <li className="flex justify-between text-sm"><span className="text-gray-500">PRECIO:</span> <span className="text-brand-blue-light font-bold">US$ {formData.precio}</span></li>
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
