"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    BedDouble,
    Bath,
    Maximize2,
    Layers,
    ArrowRight,
    Car,
    Ruler,
    ChevronLeft,
    ChevronRight,
    User,
    CreditCard
} from "lucide-react";
import type { Plano } from "@/types";
import QuickBuyModal from "@/components/ui/QuickBuyModal";

interface PlanoCardProps {
    plano: Plano;
    onToggleFavorito?: (planoId: string) => void;
    isFavorito?: boolean;
}

function formatPrice(price: number): string {
    return "US$ " + new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
    }).format(price);
}

export default function PlanoCard({ plano, onToggleFavorito, isFavorito = false }: PlanoCardProps) {
    const [imgError, setImgError] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [showBuyModal, setShowBuyModal] = useState(false);

    const images = useMemo(() => {
        const galleryImgs = plano.galeria?.map(g => g.imagen_url) || [];
        return [plano.imagen_url, ...galleryImgs].filter(Boolean);
    }, [plano.imagen_url, plano.galeria]);

    const hasDiscount = !!(plano.precio_original && plano.precio_original > plano.precio);
    const isTerreno = plano.tipo_propiedad === "Terreno / Solar";

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? "100%" : "-100%",
            opacity: 0
        })
    };

    const paginate = useCallback((newDirection: number) => {
        if (images.length <= 1) return;
        setDirection(newDirection);
        setActiveIndex((prevIndex) => {
            let nextIndex = prevIndex + newDirection;
            if (nextIndex < 0) nextIndex = images.length - 1;
            if (nextIndex >= images.length) nextIndex = 0;
            return nextIndex;
        });
    }, [images.length]);

    return (
        <>
        <article className="group glass-card-hover overflow-hidden flex flex-col h-full relative">
            {/* Image Carousel Container */}
            <div className="relative h-56 overflow-hidden bg-[#0a0a0f]">
                {/* Skeleton Loader */}
                {isImageLoading && !imgError && (
                    <div className="absolute inset-0 z-20 skeleton-pulse flex items-center justify-center">
                        <Layers className="w-8 h-8 text-white/10 animate-pulse" />
                    </div>
                )}
                <AnimatePresence initial={false} custom={direction}>
                    {!imgError && images.length > 0 ? (
                        <motion.div
                            key={activeIndex}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={images[activeIndex]}
                                alt={`${plano.titulo} - imagen ${activeIndex + 1}`}
                                fill
                                className="object-cover"
                                priority={activeIndex === 0}
                                loading={activeIndex === 0 ? "eager" : "lazy"}
                                onLoad={() => setIsImageLoading(false)}
                                onError={() => { setImgError(true); setIsImageLoading(false); }}
                            />

                            {/* Watermark */}
                            <div className="watermark-overlay">
                                <span className="watermark-text select-none">
                                    ARQOVEX - PROTECTED IMAGE - PROHIBIDA SU REPRODUCCION
                                </span>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="w-full h-full bg-metal-gradient flex items-center justify-center">
                            <Layers className="w-12 h-12 text-gray-600" />
                        </div>
                    )}
                </AnimatePresence>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090b14] via-[#090b14]/40 to-transparent pointer-events-none z-[5]" />

                {/* Combined Badges Top Left */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
                    {plano.destacado && (
                        <span className="badge-blue text-[9px] uppercase tracking-wider font-bold">
                            Destacado
                        </span>
                    )}
                    {plano.estado_proyecto && (
                        <div className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-lg ${plano.estado_proyecto === 'Listo para entrega'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : plano.estado_proyecto === 'En Construcción'
                                ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                : 'bg-brand-blue/20 text-brand-blue-light border-brand-blue/30'
                            }`}>
                            {plano.estado_proyecto}
                        </div>
                    )}
                    {plano.modalidad && plano.modalidad !== "Ninguna" && (
                        <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[9px] uppercase tracking-wider font-bold">
                            {plano.modalidad}
                        </span>
                    )}
                    <span className="badge bg-white/10 text-gray-300 border border-white/20 text-[9px] uppercase tracking-wider font-bold backdrop-blur-md">
                        {plano.tipo_propiedad || "Plano Arquitectónico"}
                    </span>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                paginate(-1);
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 backdrop-blur-sm z-10"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                paginate(1);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 backdrop-blur-sm z-10"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}

                {/* Indicator Dots */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 rounded-full transition-all duration-300 ${idx === activeIndex
                                    ? "w-4 bg-brand-blue"
                                    : "w-1 bg-white/40"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Favorite Button */}
                {onToggleFavorito && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onToggleFavorito(plano.id);
                        }}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${isFavorito
                            ? "bg-red-500/20 border border-red-500/30 text-red-400"
                            : "bg-black/40 border border-white/10 text-gray-300 hover:text-red-400 hover:border-red-500/30 backdrop-blur-md"
                            }`}
                        aria-label={isFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
                    >
                        <Heart className={`w-4 h-4 transition-all ${isFavorito ? "fill-current" : ""}`} />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-5 gap-4 bg-[#090b14]">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] text-gray-400 font-medium flex items-center gap-1.5 w-fit">
                            <User className="w-3 h-3 text-brand-blue" />
                            {plano.autor_nombre ? `Publicado por: ${plano.autor_nombre}` : "Propiedad Exclusiva ARQOVEX"}
                        </div>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-white group-hover:text-brand-blue-light transition-colors line-clamp-2 leading-tight mb-2">
                        {plano.titulo}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {plano.descripcion}
                    </p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-300">
                        <Maximize2 className="w-4 h-4 text-brand-blue flex-shrink-0" />
                        <span>{plano.metros_cuadrados} m² {isTerreno ? "Total" : ""}</span>
                    </div>

                    {!isTerreno && (
                        <>
                            <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                <BedDouble className="w-4 h-4 text-brand-blue flex-shrink-0" />
                                <span>{plano.habitaciones} hab.</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                <Bath className="w-4 h-4 text-brand-blue flex-shrink-0" />
                                <span>{plano.banos} baños</span>
                            </div>
                            {(plano.parqueos ?? 0) > 0 && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                    <Car className="w-4 h-4 text-brand-blue flex-shrink-0" />
                                    <span>{plano.parqueos} pq.</span>
                                </div>
                            )}
                        </>
                    )}

                    {isTerreno && (
                        <>
                            <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                <Ruler className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <span>Frente: {plano.metros_frente}m</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                <Ruler className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <span>Fondo: {plano.metros_fondo}m</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                    <div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Precio</span>
                            <div className="flex items-baseline gap-2">
                                <span className="font-display text-xl font-bold text-white">
                                    {formatPrice(plano.precio)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-xs text-gray-600 line-through">
                                        {formatPrice(plano.precio_original!)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/plano/${plano.id}`}
                            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                        >
                            Detalles
                        </Link>
                        {plano.seccion === 'planos' ? (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowBuyModal(true);
                                }}
                                className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter bg-brand-gradient text-white px-4 py-2 rounded-lg shadow-blue-glow hover:scale-105 transition-all"
                            >
                                <CreditCard className="w-3 h-3" />
                                Comprar
                            </button>
                        ) : (
                            <Link
                                href={`/plano/${plano.id}`}
                                className="flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-blue-light transition-colors group/cta bg-brand-blue/10 px-4 py-2 rounded-lg"
                            >
                                Ver Más
                                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/cta:translate-x-1" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </article>

        {/* Quick Buy Modal */}
        <QuickBuyModal
            plano={plano}
            isOpen={showBuyModal}
            onClose={() => setShowBuyModal(false)}
        />
    </>
    );
}
