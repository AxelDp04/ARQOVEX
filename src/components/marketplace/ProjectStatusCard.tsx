"use client";

import { Plano } from "@/types";
import { 
    Clock, CheckCircle, XCircle, Home, 
    ArrowUpRight, 
    MoreVertical, Edit, Trash2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProjectStatusCardProps {
    plano: Plano;
    onEdit?: (plano: Plano) => void;
    onDelete?: (id: string) => void;
    categoriaSocio?: 'arquitectura' | 'inmobiliaria';
}

export default function ProjectStatusCard({ plano, onEdit, onDelete, categoriaSocio }: ProjectStatusCardProps) {
    const [showOptions, setShowOptions] = useState(false);

    const statusConfig = {
        en_revision: {
            label: "En Revisión",
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20",
            icon: Clock
        },
        publicado: {
            label: "Publicado",
            color: "text-green-400",
            bg: "bg-green-400/10",
            border: "border-green-400/20",
            icon: CheckCircle
        },
        rechazado: {
            label: "Rechazado",
            color: "text-red-400",
            bg: "bg-red-400/10",
            border: "border-red-400/20",
            icon: XCircle
        }
    };

    const config = statusConfig[plano.estado_revision || 'en_revision'];

    return (
        <div className="group relative glass-card p-4 overflow-hidden border-white/5 hover:border-brand-blue/30 transition-all duration-500">
            {/* Status Badge */}
            <div className={`absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} ${config.border} border backdrop-blur-md`}>
                <config.icon className={`w-3.5 h-3.5 ${config.color}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                    {config.label}
                </span>
            </div>

            {/* Thumbnail */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-5">
                <Image 
                    src={plano.imagen_url} 
                    alt={plano.titulo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
            </div>

            {/* Content */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-white truncate group-hover:text-brand-blue transition-colors">
                        {plano.titulo}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Home className="w-3 h-3" /> {plano.tipo_propiedad || "Arquitectura"}
                    </p>
                </div>

                <div className="flex items-center justify-between py-3 border-y border-white/5">
                    <div className="flex gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Área</span>
                            <span className="text-xs text-white font-medium">{plano.metros_cuadrados}m²</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Hab</span>
                            <span className="text-xs text-white font-medium">{plano.habitaciones}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Baños</span>
                            <span className="text-xs text-white font-medium">{plano.banos}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-gray-500 uppercase font-bold block mb-0.5">Precio</span>
                        <span className="text-sm font-bold text-brand-blue">US$ {plano.precio.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Link 
                        href={`/plano/${plano.id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 text-white text-xs font-bold hover:bg-white/10 transition-colors border border-white/5"
                    >
                        Vista Previa <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                    <div className="relative">
                        <button 
                            onClick={() => setShowOptions(!showOptions)}
                            className="p-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-white border border-white/5 transition-colors"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {showOptions && (
                            <>
                                <div className="fixed inset-0 z-20" onClick={() => setShowOptions(false)}></div>
                                <div className="absolute right-0 bottom-full mb-2 w-48 glass-card border-white/10 p-2 z-30 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                                    <button 
                                        onClick={() => {
                                            onEdit?.(plano);
                                            setShowOptions(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-xs text-white hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <Edit className={`w-4 h-4 ${categoriaSocio === 'inmobiliaria' ? 'text-amber-500' : 'text-brand-blue'}`} /> 
                                        {categoriaSocio === 'inmobiliaria' ? "Editar Inmueble" : "Editar Diseño"}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            onDelete?.(plano.id);
                                            setShowOptions(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-400 hover:bg-red-400/5 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" /> Eliminar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
