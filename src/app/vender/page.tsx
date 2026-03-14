"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    User, 
    Building2, 
    MessageCircle, 
    ChevronRight, 
    ChevronLeft, 
    CheckCircle, 
    Loader2, 
    MapPin, 
    DollarSign,
    ShieldCheck,
    Bed,
    Bath,
    Car,
    Square,
    UploadCloud,
    X,
    FileImage
} from "lucide-react";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import { createClient } from "@/lib/supabase/client";

export default function VenderPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fotos, setFotos] = useState<File[]>([]);
    
    const [formData, setFormData] = useState({
        nombre_completo: "",
        cedula: "",
        telefono: "",
        tipo_propiedad: "Casa",
        ubicacion: "",
        precio_deseado: "",
        habitaciones: "",
        banos: "",
        parqueos: "",
        metros_cuadrados: "",
        descripcion: ""
    });

    const supabase = createClient();

    const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (fotos.length < 3) {
            alert("Es obligatorio subir al menos 3 fotos (Fachada, Sala, Cocina) para completar la solicitud.");
            return;
        }

        setLoading(true);

        try {
            // 1. Upload photos to 'planos-files' bucket
            const uploadedUrls: string[] = [];
            for (const file of fotos) {
                const fileExt = file.name.split('.').pop();
                const fileName = `solicitudes/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('planos-files')
                    .upload(fileName, file, { cacheControl: '3600', upsert: false });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('planos-files')
                    .getPublicUrl(fileName);
                
                uploadedUrls.push(publicUrl);
            }

            // 2. Insert into solicitudes_socios
            const { error } = await supabase
                .from("solicitudes_socios")
                .insert([{
                    nombre_completo: formData.nombre_completo,
                    cedula: formData.cedula,
                    telefono: formData.telefono,
                    tipo_propiedad: formData.tipo_propiedad,
                    ubicacion: formData.ubicacion,
                    precio: Number(formData.precio_deseado.replace(/[^0-9.]/g, '')),
                    habitaciones: formData.habitaciones ? Number(formData.habitaciones) : null,
                    banos: formData.banos ? Number(formData.banos) : null,
                    parqueos: formData.parqueos ? Number(formData.parqueos) : null,
                    metros_cuadrados: formData.metros_cuadrados ? Number(formData.metros_cuadrados) : null,
                    descripcion: formData.descripcion,
                    fotos_urls: uploadedUrls,
                    estado: 'pendiente'
                }]);

            if (error) {
                console.error("Supabase Submission Error:", error);
                throw error;
            }
            setSuccess(true);
        } catch (err: unknown) {
            const error = err as { message?: string; details?: string; hint?: string; code?: string };
            console.error("Detailed Submission Error:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            alert(`Hubo un error al enviar tu solicitud: ${error.message || 'Error desconocido'}. Por favor, contáctanos por WhatsApp.`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFotos(prev => {
                const combined = [...prev, ...selectedFiles];
                return combined.slice(0, 10); // Max 10 photos
            });
        }
    };

    const removeFoto = (index: number) => {
        setFotos(prev => prev.filter((_, i) => i !== index));
    };


    return (
        <MainLayout>
            <div className="pt-24 pb-16 min-h-screen bg-brand-slate-deeper relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] -z-0" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-blue-dark/5 rounded-full blur-[100px] -z-0" />

                <div className="container-section relative z-10 max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center space-y-4 mb-12">
                        <div className="badge-blue mx-auto w-fit uppercase tracking-widest">Inmobiliaria</div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
                            Vender con <span className="bg-brand-gradient bg-clip-text text-transparent">ARQOVEX</span>
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Convierte tu propiedad en una oportunidad. Solicita una evaluación técnica hoy mismo.
                        </p>
                    </div>

                    <div className="glass-card p-8 md:p-12 relative overflow-hidden border-white/10">
                        {success ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-6 py-8"
                            >
                                <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-green-400" />
                                </div>
                                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">¡Solicitud Enviada!</h2>
                                <p className="text-gray-400 leading-relaxed max-w-md mx-auto italic">
                                    &quot;Gracias por confiar en ARQOVEX. Un asesor revisará tu solicitud y te contactará en breve para coordinar la visita técnica.&quot;
                                </p>
                                <button 
                                    onClick={() => window.location.href = "/"}
                                    className="btn-primary mt-8 px-10 py-4 shadow-blue-glow-lg"
                                >
                                    Volver al Inicio
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                {/* Progress Bar */}
                                <div className="flex items-center justify-between mb-12 relative">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 -z-10" />
                                    <div 
                                        className="absolute top-1/2 left-0 h-0.5 bg-brand-gradient -translate-y-1/2 -z-10 transition-all duration-500" 
                                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                                    />
                                    {[1, 2, 3].map((s) => (
                                        <div 
                                            key={s}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all duration-300 ${
                                                step >= s 
                                                ? "bg-brand-blue text-white shadow-blue-glow scale-110" 
                                                : "bg-brand-slate border border-white/10 text-gray-500"
                                            }`}
                                        >
                                            {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8 min-h-[400px] flex flex-col justify-between">
                                    <AnimatePresence mode="wait">
                                        {step === 1 && (
                                            <motion.div
                                                key="step1"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                                                    <User className="w-6 h-6 text-brand-blue" />
                                                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">PASO 1: Identidad</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Nombre Completo</label>
                                                        <input 
                                                            required
                                                            type="text" 
                                                            value={formData.nombre_completo}
                                                            onChange={e => setFormData({...formData, nombre_completo: e.target.value})}
                                                            placeholder="Ej. Juan Pérez"
                                                            className="input-field py-4 text-base"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Cédula (Solo números)</label>
                                                        <input 
                                                            required
                                                            type="text" 
                                                            value={formData.cedula}
                                                            onChange={e => setFormData({...formData, cedula: e.target.value})}
                                                            placeholder="00100000000"
                                                            className="input-field py-4 text-base"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Teléfono / WhatsApp</label>
                                                    <input 
                                                        required
                                                        type="tel" 
                                                        value={formData.telefono}
                                                        onChange={e => setFormData({...formData, telefono: e.target.value})}
                                                        placeholder="+1 829 000 0000"
                                                        className="input-field py-4 text-base"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 2 && (
                                            <motion.div
                                                key="step2"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                                                    <Building2 className="w-6 h-6 text-brand-blue" />
                                                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">PASO 2: La Propiedad</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Tipo de Propiedad</label>
                                                        <select 
                                                            required
                                                            value={formData.tipo_propiedad}
                                                            onChange={e => setFormData({...formData, tipo_propiedad: e.target.value})}
                                                            className="input-field py-4 text-base"
                                                        >
                                                            <option value="Casa">Casa</option>
                                                            <option value="Apartamento">Apartamento</option>
                                                            <option value="Solar / Terreno">Solar / Terreno</option>
                                                            <option value="Local Comercial">Local Comercial</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Precio Deseado (US$)</label>
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                            <input 
                                                                required
                                                                type="text" 
                                                                value={formData.precio_deseado}
                                                                onChange={e => setFormData({...formData, precio_deseado: e.target.value})}
                                                                placeholder="150,000"
                                                                className="input-field py-4 pl-10 text-base"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Habitaciones</label>
                                                        <div className="relative">
                                                            <Bed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                            <input 
                                                                required
                                                                type="number" 
                                                                value={formData.habitaciones}
                                                                onChange={e => setFormData({...formData, habitaciones: e.target.value})}
                                                                placeholder="3"
                                                                className="input-field py-4 pl-10 text-base"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Baños</label>
                                                        <div className="relative">
                                                            <Bath className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                            <input 
                                                                required
                                                                type="number" 
                                                                value={formData.banos}
                                                                onChange={e => setFormData({...formData, banos: e.target.value})}
                                                                placeholder="2"
                                                                className="input-field py-4 pl-10 text-base"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Parqueos</label>
                                                        <div className="relative">
                                                            <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                            <input 
                                                                required
                                                                type="number" 
                                                                value={formData.parqueos}
                                                                onChange={e => setFormData({...formData, parqueos: e.target.value})}
                                                                placeholder="2"
                                                                className="input-field py-4 pl-10 text-base"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Metros Cuadrados (m²)</label>
                                                        <div className="relative">
                                                            <Square className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                            <input 
                                                                required
                                                                type="number" 
                                                                value={formData.metros_cuadrados}
                                                                onChange={e => setFormData({...formData, metros_cuadrados: e.target.value})}
                                                                placeholder="250"
                                                                className="input-field py-4 pl-10 text-base"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Ubicación (Sector y Ciudad)</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                        <input 
                                                            required
                                                            type="text" 
                                                            value={formData.ubicacion}
                                                            onChange={e => setFormData({...formData, ubicacion: e.target.value})}
                                                            placeholder="Ej. Piantini, Santo Domingo"
                                                            className="input-field py-4 pl-10 text-base"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 3 && (
                                            <motion.div
                                                key="step3"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                                                    <MessageCircle className="w-6 h-6 text-brand-blue" />
                                                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">PASO 3: Fotos y Detalles</h3>
                                                </div>
                                                
                                                <div className="space-y-4 pt-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center justify-between">
                                                        <span>Fotos Obligatorias (Mín. 3, Máx. 10)</span>
                                                        <span className="text-brand-blue">{fotos.length}/10</span>
                                                    </label>
                                                    <div className="p-6 rounded-xl border border-dashed border-white/20 hover:border-brand-blue/50 transition-colors bg-white/5 flex flex-col items-center justify-center text-center cursor-pointer relative">
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            multiple 
                                                            onChange={handleFileChange}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                            disabled={fotos.length >= 10}
                                                        />
                                                        <UploadCloud className="w-10 h-10 text-brand-blue mb-4" />
                                                        {fotos.length < 10 ? (
                                                            <>
                                                                <p className="text-sm text-white font-medium mb-1">Haz clic o arrastra hasta 10 imágenes aquí</p>
                                                                <p className="text-xs text-gray-500 max-w-[200px]">Solo formatos PNG, JPG o WEBP (Máx. 5MB c/u)</p>
                                                            </>
                                                        ) : (
                                                            <p className="text-sm text-green-400 font-medium">Has alcanzado el límite de 10 fotos.</p>
                                                        )}
                                                    </div>

                                                    {/* Image Previews */}
                                                    {fotos.length > 0 && (
                                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                            {fotos.map((foto, idx) => (
                                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group bg-black/40">
                                                                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                                                                        <FileImage className="w-8 h-8 text-white/20" />
                                                                    </div>
                                                                    <Image 
                                                                        src={URL.createObjectURL(foto)} 
                                                                        alt={`Preview ${idx + 1}`} 
                                                                        fill 
                                                                        className="object-cover"
                                                                    />
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => removeFoto(idx)}
                                                                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[9px] text-center text-white truncate backdrop-blur-md">
                                                                        {idx === 0 ? "Fachada" : idx === 1 ? "Sala" : idx === 2 ? "Cocina" : `Foto ${idx + 1}`}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2 mt-6">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Descripción Adicional (Opcional)</label>
                                                    <textarea 
                                                        value={formData.descripcion}
                                                        onChange={e => setFormData({...formData, descripcion: e.target.value})}
                                                        placeholder="Háblanos un poco más sobre tu propiedad..."
                                                        className="input-field min-h-[100px] py-4 text-base resize-none"
                                                    />
                                                </div>
                                                <div className="p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/20 flex gap-4 items-start">
                                                    <ShieldCheck className="w-6 h-6 text-brand-blue flex-shrink-0" />
                                                    <p className="text-xs text-gray-500 leading-relaxed italic">
                                                        Al enviar esta solicitud, aceptas que las fotos subirán a nuestra base de datos para evaluación técnica.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Footer Actions */}
                                    <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-auto">
                                        <button 
                                            type="button" 
                                            onClick={prevStep} 
                                            disabled={step === 1 || loading}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-sm font-bold transition-all ${step === 1 ? "opacity-0 invisible" : "text-gray-400 hover:text-white hover:border-white/20"}`}
                                        >
                                            <ChevronLeft className="w-4 h-4" /> Anterior
                                        </button>

                                        {step < 3 ? (
                                            <button 
                                                type="button" 
                                                onClick={nextStep}
                                                className="btn-primary px-8 py-3 bg-brand-gradient border-none group"
                                            >
                                                Siguiente
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        ) : (
                                            <button 
                                                type="submit" 
                                                disabled={loading}
                                                className="btn-primary px-10 py-3 bg-brand-gradient border-none shadow-blue-glow group"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                    <>
                                                        Enviar Solicitud
                                                        <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
