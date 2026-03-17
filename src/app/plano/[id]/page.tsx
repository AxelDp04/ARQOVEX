"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    Heart, Download, Check, ArrowLeft, Star,
    Maximize2, BedDouble, Bath, Layers, FileCheck, ShieldCheck, Ruler, Loader2, ChevronLeft, ChevronRight, Car, MessageCircle, X, ChevronDown, User, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import CalculadoraHipotecaria from "@/components/ui/CalculadoraHipotecaria";
import ReviewSection from "@/components/ui/ReviewSection";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Plano } from "@/types";
import PayPalButton from "@/components/ui/PayPalButton";
import CitasForm from "@/components/ui/CitasForm";

function formatPrice(price: number): string {
    return "US$ " + new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
    }).format(price);
}

// Fallback sample data matching catalog
const samplePlanos: Record<string, Plano> = {
    "s0": { id: "s0", tipo_propiedad: "Plano Arquitectónico", titulo: "Residencia Contemporánea", descripcion: "Diseño moderno con amplios espacios abiertos.", precio: 299, metros_cuadrados: 180, habitaciones: 3, banos: 2, pisos: 1, categoria_id: "m", imagen_url: "", estilo: "Contemporáneo", destacado: true, disponible: true, created_at: new Date().toISOString() },
};

const faqs = [
    {
        id: "faq-1",
        pregunta: "¿Qué incluye el set de planos?",
        respuesta: "El set incluye planos arquitectónicos completos: plantas amuebladas y dimensionadas, elevaciones (fachadas), secciones (cortes), planos de techos y detalles constructivos básicos. Se entregan en formato PDF de alta resolución y archivos editables DWG (AutoCAD)."
    },
    {
        id: "faq-2",
        pregunta: "¿Cómo recibo mi compra?",
        respuesta: "Una vez confirmado el pago a través de nuestra asistencia por WhatsApp, el sistema habilitará automáticamente la descarga en tu panel de usuario. También recibirás un enlace de respaldo en tu correo electrónico de registro."
    },
    {
        id: "faq-3",
        pregunta: "¿Puedo solicitar modificaciones?",
        respuesta: "¡Sí! Ofrecemos servicios de personalización. Si el diseño te gusta pero necesitas ajustar dimensiones o distribución, nuestro equipo técnico puede realizar las modificaciones requeridas por un costo adicional ajustado a la complejidad del cambio."
    }
];

export default function PlanoDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [plano, setPlano] = useState<Plano | null>(null);
    const [galeriaUrls, setGaleriaUrls] = useState<string[]>([]);
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [isFavorito, setIsFavorito] = useState(false);
    const [isAcquired, setIsAcquired] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [userContext, setUserContext] = useState<SupabaseUser | null>(null);
    const [avgRating, setAvgRating] = useState<number | null>(null);
    const [numResenas, setNumResenas] = useState(0);
    const [activeFaqId, setActiveFaqId] = useState<string | null>(null);

    // Lightbox State
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const supabase = createClient();
    const id = params.id as string;

    useEffect(() => {
        const fetchDetail = async () => {
            // Get user
            const { data: { user } } = await supabase.auth.getUser();
            setUserContext(user);

            // Get plano
            try {
                const { data, error } = await supabase
                    .from("planos")
                    .select("*, categoria:categorias(*)")
                    .eq("id", id)
                    .single();

                if (error || !data) {
                    if (error) console.error("Supabase Error [PlanoDetail]:", error.message, error.details);
                    setPlano(samplePlanos[id] || samplePlanos["s0"]);
                } else {
                    setPlano(data as Plano);
                    // Fetch Gallery
                    const { data: galeriaData, error: galError } = await supabase
                        .from("galeria_propiedades")
                        .select("imagen_url")
                        .eq("plano_id", id)
                        .order("orden");

                    if (galError) console.error("Supabase Error [Gallery]:", galError.message, galError.details);

                    if (galeriaData && galeriaData.length > 0) {
                        setGaleriaUrls([data.imagen_url, ...galeriaData.map((g: { imagen_url: string }) => g.imagen_url)]);
                    } else {
                        setGaleriaUrls([data.imagen_url]);
                    }

                    // Fetch Average Rating
                    const { data: resData } = await supabase
                        .from("resenas")
                        .select("estrellas")
                        .eq("plano_id", id)
                        .eq("aprobado", true);

                    if (resData && resData.length > 0) {
                        const sum = resData.reduce((acc, curr) => acc + curr.estrellas, 0);
                        setAvgRating(sum / resData.length);
                        setNumResenas(resData.length);
                    }
                }

                // Check user states if logged in
                if (user && (data || samplePlanos[id])) {
                    const planoId = data?.id || id;

                    const { data: favs, error: favError } = await supabase.from("favoritos").select("id").eq("user_id", user.id).eq("plano_id", planoId);
                    if (favError) console.error("Supabase Error [CheckFav]:", favError.message);
                    if (favs && favs.length > 0) setIsFavorito(true);

                    if (data?.tipo_propiedad === "Plano Arquitectónico") {
                        // Check both legacy "adquisiciones" and new "ventas_planos"
                        const { data: adqs } = await supabase.from("adquisiciones").select("id").eq("user_id", user.id).eq("plano_id", planoId).eq("estado", "completado");
                        const { data: ventas } = await supabase.from("ventas_planos").select("id").eq("usuario_id", user.id).eq("plano_id", planoId).eq("descarga_habilitada", true);
                        
                        if ((adqs && adqs.length > 0) || (ventas && ventas.length > 0)) {
                            setIsAcquired(true);
                        }
                    }
                }
            } catch (err) {
                console.error("Detail Fetch Exception:", err);
                setPlano(samplePlanos[id] || samplePlanos["s0"]);
            }

            setLoading(false);
        };

        if (id) fetchDetail();
    }, [id, supabase]);

    const toggleFavorito = async () => {
        if (!userContext) {
            router.push("/auth/login");
            return;
        }

        setActionLoading(true);
        if (isFavorito) {
            await supabase.from("favoritos").delete().eq("user_id", userContext.id).eq("plano_id", id);
            setIsFavorito(false);
        } else {
            await supabase.from("favoritos").insert({ user_id: userContext.id, plano_id: id });
            setIsFavorito(true);
        }
        setActionLoading(false);
    };

    const handleDownload = async () => {
        if (!plano || !plano.url_archivo) {
            alert("Este archivo aún no está disponible para descarga.");
            return;
        }

        setActionLoading(true);
        const { data, error } = await supabase
            .storage
            .from('planos-privados')
            .createSignedUrl(plano.url_archivo, 60);

        if (error) {
            console.error("Error creating signed URL:", error);
            alert("No se pudo obtener el enlace de descarga. Contacta a soporte.");
        } else if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank');
        }
        setActionLoading(false);
    };

    const nextImage = () => {
        setActiveImgIndex((prev) => (prev + 1) % galeriaUrls.length);
    };

    const prevImage = () => {
        setActiveImgIndex((prev) => (prev - 1 + galeriaUrls.length) % galeriaUrls.length);
    };

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setIsLightboxOpen(true);
    };

    const nextLightbox = () => {
        setLightboxIndex((prev) => (prev + 1) % galeriaUrls.length);
    };

    const prevLightbox = () => {
        setLightboxIndex((prev) => (prev - 1 + galeriaUrls.length) % galeriaUrls.length);
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

    if (!plano) return null;

    const hasDiscount = plano.precio_original && plano.precio_original > plano.precio;
    const discountPercent = hasDiscount
        ? Math.round(((plano.precio_original! - plano.precio) / plano.precio_original!) * 100)
        : 0;

    const isPlano = plano.tipo_propiedad === "Plano Arquitectónico";
    const isTerreno = plano.tipo_propiedad === "Terreno / Solar";

    const getWhatsAppUrl = () => {
        const phone = "18296503337";
        const message = isPlano
            ? `Hola ARQOVEX, me interesa adquirir el plano: ${plano.titulo} - ID: ${plano.id}. ¿Cuáles son los pasos para el pago?`
            : `Hola, deseo información sobre la propiedad: ${plano.titulo} - ID: ${plano.id}.`;
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    };

    return (
        <MainLayout>
            <div className="pt-24 pb-20 min-h-screen">
                <div className="container-section">

                    <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" /> Volver al catálogo
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left: Images & Info */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* Main Image Carousel */}
                            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden glass-card group cursor-zoom-in" onClick={() => openLightbox(activeImgIndex)}>
                                {galeriaUrls.length > 0 && galeriaUrls[activeImgIndex] ? (
                                    <Image src={galeriaUrls[activeImgIndex]} alt={plano.titulo} fill className="object-cover transition-opacity duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-metal-gradient flex items-center justify-center">
                                        <Layers className="w-16 h-16 text-gray-600" />
                                    </div>
                                )}

                                {hasDiscount && (
                                    <div className="absolute top-4 left-4 badge bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-bold z-10">
                                        -{discountPercent}% Descuento
                                    </div>
                                )}

                                <button
                                    onClick={toggleFavorito}
                                    disabled={actionLoading}
                                    className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 z-10 ${isFavorito
                                        ? "bg-red-500/20 border border-red-500/30 text-red-400"
                                        : "bg-black/60 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                                        }`}
                                >
                                    <Heart className={`w-5 h-5 transition-all ${isFavorito ? "fill-current scale-110" : "scale-100"}`} />
                                </button>

                                {/* Controls */}
                                {galeriaUrls.length > 1 && (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 backdrop-blur-md">
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 backdrop-blur-md">
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                            {galeriaUrls.map((_, idx) => (
                                                <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === activeImgIndex ? "w-6 bg-brand-blue" : "w-2 bg-white/50"}`} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Carousel Thumbnails */}
                            {galeriaUrls.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                    {galeriaUrls.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setActiveImgIndex(idx); openLightbox(idx); }}
                                            className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === activeImgIndex ? "border-brand-blue" : "border-transparent opacity-60 hover:opacity-100"}`}
                                        >
                                            <Image src={img} alt="Thumbnail" fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Virtual Tour Video Section */}
                            {plano.video_url && (
                                <div className="space-y-4">
                                    <h2 className="font-display text-xl font-bold text-white flex items-center gap-3">
                                        <Maximize2 className="w-5 h-5 text-brand-blue" />
                                        Tour Virtual de la Propiedad
                                    </h2>
                                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden glass-card border-brand-blue/20 shadow-blue-glow-sm">
                                        {plano.video_url.includes('youtube.com') || plano.video_url.includes('youtu.be') ? (
                                            <iframe 
                                                src={`https://www.youtube.com/embed/${(() => {
                                                    const url = plano.video_url;
                                                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
                                                    const match = url.match(regExp);
                                                    return (match && match[2].length === 11) ? match[2] : url.split('/').pop();
                                                })()}`}
                                                className="absolute inset-0 w-full h-full border-0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        ) : plano.video_url.includes('instagram.com') ? (
                                            <iframe 
                                                src={`${plano.video_url.split('?')[0]}reel/embed`} 
                                                className="absolute inset-0 w-full h-full border-0"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <video 
                                                src={plano.video_url} 
                                                controls 
                                                playsInline
                                                preload="metadata"
                                                className="absolute inset-0 w-full h-full object-cover"
                                                poster={plano.imagen_url}
                                            >
                                                Tu navegador no soporta la reproducción de video.
                                            </video>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 italic text-center">Video de alta definición de la propiedad</p>
                                </div>
                            )}

                            {/* Interactive Map Section */}
                            {plano.iframe_mapa && (
                                <div className="space-y-4">
                                    <h2 className="font-display text-xl font-bold text-white flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-brand-blue" />
                                        Ubicación Interactiva
                                    </h2>
                                    <div 
                                        className="w-full rounded-2xl overflow-hidden glass-card border-brand-blue/20 shadow-blue-glow-sm aspect-video mb-4 [&>iframe]:w-full [&>iframe]:h-full"
                                        dangerouslySetInnerHTML={{ __html: plano.iframe_mapa.includes('<iframe') ? plano.iframe_mapa : `<iframe src="${plano.iframe_mapa}" class="w-full h-full border-0"></iframe>` }}
                                    />
                                    <p className="text-[10px] text-gray-500 italic text-center">Mapa interactivo preciso de la zona</p>
                                </div>
                            )}

                            {/* Specs Bar */}
                            <div className={`glass-card p-6 grid grid-cols-2 ${isTerreno ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-6`}>
                                <div className="flex flex-col items-center justify-center text-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                                        <Maximize2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-display font-bold text-white leading-none">{plano.metros_cuadrados} m²</div>
                                        <div className="text-xs text-gray-500 mt-1">Área {isTerreno && "Total"}</div>
                                    </div>
                                </div>

                                {!isTerreno && (
                                    <>
                                        <div className="flex flex-col items-center justify-center text-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                                                <BedDouble className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-display font-bold text-white leading-none">{plano.habitaciones}</div>
                                                <div className="text-xs text-gray-500 mt-1">Habitaciones</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center text-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                                                <Bath className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-display font-bold text-white leading-none">{plano.banos}</div>
                                                <div className="text-xs text-gray-500 mt-1">Baños</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center text-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                                                {plano.parqueos && plano.parqueos > 0 ? <Car className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="font-display font-bold text-white leading-none">{plano.parqueos && plano.parqueos > 0 ? plano.parqueos : plano.pisos}</div>
                                                <div className="text-xs text-gray-500 mt-1">{plano.parqueos && plano.parqueos > 0 ? "Parqueos" : "Pisos"}</div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {isTerreno && (
                                    <>
                                        <div className="flex flex-col items-center justify-center text-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                <Ruler className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-display font-bold text-white leading-none">{plano.metros_frente} m</div>
                                                <div className="text-xs text-gray-500 mt-1">Metros de Frente</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center text-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                <Ruler className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-display font-bold text-white leading-none">{plano.metros_fondo} m</div>
                                                <div className="text-xs text-gray-500 mt-1">Metros de Fondo</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <h2 className="font-display text-2xl font-bold text-white">Acerca de esta publicación</h2>
                                <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed text-sm md:text-base whitespace-pre-line">
                                    <p>{plano.descripcion}</p>
                                </div>
                            </div>

                            {/* Review Section */}
                            <div className="pt-8">
                                <ReviewSection planoId={id} userId={userContext?.id} />
                            </div>
                        </div>

                        {/* Right: Checkout card */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-28 glass-card p-6 md:p-8 space-y-6 border-brand-blue/10 shadow-blue-glow-lg">
                                <div>
                                    <div className="flex gap-2 mb-3">
                                        <div className="badge-metal">{plano.tipo_propiedad || "Plano Arquitectónico"}</div>
                                        {plano.modalidad && plano.modalidad !== "Ninguna" && (
                                            <div className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                En {plano.modalidad}
                                            </div>
                                        )}
                                        <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-400 font-medium flex items-center gap-1.5 shrink-0">
                                            <User className="w-3 h-3 text-brand-blue" />
                                            {plano.autor_nombre ? `Publicado por: ${plano.autor_nombre}` : "Propiedad Exclusiva ARQOVEX"}
                                        </div>
                                    </div>
                                    <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-2 leading-tight break-words whitespace-pre-wrap">
                                        {plano.titulo}
                                    </h1>

                                    {/* Location Text & Map Link */}
                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                        {plano.ubicacion && (
                                            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                                                <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                                                <span>{plano.ubicacion}</span>
                                            </div>
                                        )}
                                        {plano.enlace_mapa && (
                                            <Link 
                                                href={plano.enlace_mapa} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-[10px] font-bold text-brand-blue hover:text-white transition-colors flex items-center gap-1 bg-brand-blue/10 px-2 py-1 rounded-md border border-brand-blue/20"
                                            >
                                                Ver en Google Maps
                                                <Maximize2 className="w-3 h-3" />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-4 border-y border-white/[0.06]">
                                    <div className="flex items-center gap-3">
                                        <span className="font-display text-4xl font-black text-white">
                                            {formatPrice(plano.precio)}
                                        </span>
                                        {hasDiscount && (
                                            <span className="text-lg text-gray-500 line-through">
                                                {formatPrice(plano.precio_original!)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Rating Summary */}
                                    {avgRating && (
                                        <div className="flex flex-col items-end">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} className={`w-3.5 h-3.5 ${Math.round(avgRating) >= s ? "fill-yellow-400 text-yellow-400" : "text-gray-700"}`} />
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-medium">({numResenas} opiniones)</span>
                                        </div>
                                    )}
                                </div>

                                {/* Dynamic Action */}
                                <div id="comprar" className="scroll-mt-28">
                                {isPlano ? (
                                    isAcquired ? (
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center space-y-2">
                                                <Check className="w-6 h-6 text-green-400 mx-auto" />
                                                <div className="text-sm font-semibold text-white">Adquisición verificada</div>
                                                <div className="text-xs text-green-400">Tu descarga está disponible</div>
                                            </div>
                                            <button 
                                                onClick={handleDownload}
                                                disabled={actionLoading}
                                                className="btn-primary w-full py-4 bg-brand-gradient flex items-center justify-center gap-2"
                                            >
                                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                                Descargar Archivo Técnico
                                            </button>
                                            <Link href="/dashboard" className="btn-ghost w-full">Mi Panel de Archivos</Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <ul className="space-y-3 mb-6">
                                                {[
                                                    { icon: Ruler, text: "Archivos editables AutoCAD (.DWG)" },
                                                    { icon: FileCheck, text: "Planos en PDF alta resolución" },
                                                    { icon: ShieldCheck, text: "Certificación arquitectónica" },
                                                    { icon: MessageCircle, text: "Asistencia directa personalizada" },
                                                ].map((item, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                                                        <item.icon className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                                                        <span>{item.text}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {userContext ? (
                                                <div className="space-y-4">
                                                    <PayPalButton 
                                                        planoId={plano.id} 
                                                        monto={plano.precio} 
                                                        userId={userContext.id}
                                                        onSuccess={() => {
                                                            setIsAcquired(true);
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => setShowWhatsAppModal(true)}
                                                        className="btn-ghost w-full text-xs text-gray-500 hover:text-white"
                                                    >
                                                        ¿Problemas con el pago? Consultar por WhatsApp
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <Link
                                                        href={`/auth/login?returnTo=/plano/${plano.id}`}
                                                        className="btn-primary w-full py-4 text-base shadow-blue-glow group"
                                                    >
                                                        <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                        Inicia sesión para comprar
                                                    </Link>
                                                    <p className="text-xs text-center text-gray-500">
                                                        Necesitas una cuenta para acceder a tus descargas.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    <div className="space-y-6">
                                        {/* Luxury Appointment Form */}
                                        <CitasForm 
                                            propiedadId={plano.id} 
                                            propiedadTitulo={plano.titulo} 
                                        />

                                        <div className="relative my-6">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-white/5"></div>
                                            </div>
                                            <div className="relative flex justify-center text-[10px] uppercase">
                                                <span className="bg-[#090b14] px-2 text-gray-600 font-medium tracking-widest">O contáctanos directamente</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowWhatsAppModal(true)}
                                            className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold text-gray-400 hover:text-white transition-colors border border-white/5 rounded-xl hover:bg-white/5"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            Consultar por WhatsApp
                                        </button>

                                        <div className="pt-4 space-y-3">
                                            {[
                                                { icon: ShieldCheck, text: "Intermediación Inmobiliaria Segura" },
                                                { icon: Check, text: "Asistencia para trámites y financiamiento" },
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-500 list-none">
                                                    <item.icon className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                                    <span>{item.text}</span>
                                                </li>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                </div>

                                {/* Mortgage Calculator Section */}
                                <CalculadoraHipotecaria precioProperty={plano.precio} />

                                {/* FAQ Accordion Section */}
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        Preguntas Frecuentes
                                    </h3>
                                    <div className="space-y-3">
                                        {faqs.map((faq) => (
                                            <div key={faq.id} className="glass-card border-white/5 overflow-hidden">
                                                <button
                                                    onClick={() => setActiveFaqId(activeFaqId === faq.id ? null : faq.id)}
                                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                                                >
                                                    <span className="text-sm font-medium text-gray-200">{faq.pregunta}</span>
                                                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${activeFaqId === faq.id ? "rotate-180" : ""}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {activeFaqId === faq.id && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        >
                                                            <div className="p-4 pt-0 text-xs text-gray-400 leading-relaxed border-t border-white/5">
                                                                {faq.respuesta}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </div>

            {/* Instruction Modal */}
            {showWhatsAppModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card max-w-md w-full p-8 space-y-6 relative border-brand-blue/30 shadow-blue-glow-lg animate-scale-up">
                        <button
                            onClick={() => setShowWhatsAppModal(false)}
                            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center mx-auto">
                                <ShieldCheck className="w-8 h-8 text-brand-blue" />
                            </div>
                            <h3 className="font-display text-2xl font-bold text-white">Solicitud de Compra Segura</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Para garantizar tu seguridad y brindarte una atención personalizada, la transacción se realiza vía contacto directo.
                            </p>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/10">
                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                <div className="w-2 h-2 rounded-full bg-brand-blue" />
                                <span>Recibirás los detalles de pago de inmediato</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                <div className="w-2 h-2 rounded-full bg-brand-blue" />
                                <span>Asistencia técnica durante el proceso</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                <div className="w-2 h-2 rounded-full bg-brand-blue" />
                                <span>Acceso instantáneo tras confirmar el pago</span>
                            </div>
                        </div>

                        <Link
                            href={getWhatsAppUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowWhatsAppModal(false)}
                            className="btn-primary w-full py-4 group bg-brand-gradient"
                        >
                            Continuar a WhatsApp
                            <MessageCircle className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <p className="text-[10px] text-center text-gray-600 uppercase tracking-widest font-medium">
                            ARQOVEX Premium Support
                        </p>
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        {/* Header/Close */}
                        <div className="flex justify-between items-center p-6 relative z-10 w-full">
                            <div className="text-white font-medium text-sm">
                                {lightboxIndex + 1} / {galeriaUrls.length} — {plano.titulo}
                            </div>
                            <button
                                onClick={() => setIsLightboxOpen(false)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Main Image */}
                        <div className="flex-1 relative flex items-center justify-center p-4 md:p-10">
                            <motion.div
                                key={lightboxIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="relative w-full h-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Image
                                    src={galeriaUrls[lightboxIndex]}
                                    alt={plano.titulo}
                                    fill
                                    className="object-contain"
                                    quality={100}
                                />
                            </motion.div>

                            {/* Navigation Arrows */}
                            {galeriaUrls.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
                                        className="absolute left-4 md:left-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm shadow-xl"
                                    >
                                        <ChevronLeft className="w-8 h-8" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
                                        className="absolute right-4 md:right-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm shadow-xl"
                                    >
                                        <ChevronRight className="w-8 h-8" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails Strip */}
                        <div className="p-6 overflow-x-auto whitespace-nowrap bg-black/40 border-t border-white/5 flex gap-4 justify-center" onClick={(e) => e.stopPropagation()}>
                            {galeriaUrls.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setLightboxIndex(idx)}
                                    className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${idx === lightboxIndex ? "border-brand-blue scale-110 shadow-blue-glow" : "border-transparent opacity-40 hover:opacity-100"}`}
                                >
                                    <Image src={img} alt="Thumb" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </MainLayout>
    );
}
