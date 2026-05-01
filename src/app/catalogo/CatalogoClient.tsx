"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PlanoCard from "@/components/ui/PlanoCard";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import type { Plano } from "@/types";

const estilos = ["Todos", "Contemporáneo", "Minimalista", "Colonial", "Moderno", "Rústico"];

interface CatalogoClientProps {
    initialPlanos: Plano[];
}

export default function CatalogoClient({ initialPlanos }: CatalogoClientProps) {
    const searchParams = useSearchParams();
    const isSeccionInmobiliaria = searchParams.get("seccion") === "inmobiliaria";
    const { showToast } = useToast();

    // Filtramos los initialPlanos inmediatamente basado en la sección actual
    const [planos, setPlanos] = useState<Plano[]>([]);
    
    // Efecto para sincronizar los planos con la sección actual sin volver a llamar a DB
    useEffect(() => {
        const filteredData = initialPlanos.filter((p: Plano) => {
            const type = p.tipo_propiedad || "Plano Arquitectónico";
            return isSeccionInmobiliaria ? type !== "Plano Arquitectónico" : type === "Plano Arquitectónico";
        });
        setPlanos(filteredData);
    }, [initialPlanos, isSeccionInmobiliaria]);

    const [filtrados, setFiltrados] = useState<Plano[]>([]);
    const [favoritos, setFavoritos] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Search state with debounce
    const [busqueda, setBusqueda] = useState("");
    const [debouncedBusqueda, setDebouncedBusqueda] = useState("");

    // Filter states
    const [estiloActivo, setEstiloActivo] = useState("Todos");
    const [minPrecio, setMinPrecio] = useState<number | "">("");
    const [maxPrecio, setMaxPrecio] = useState<number | "">("");
    const [habitaciones, setHabitaciones] = useState<number | "Todos">("Todos");
    const [parqueos, setParqueos] = useState<number | "Todos">("Todos");
    const [estadoProyecto, setEstadoProyecto] = useState<string>("Todos");
    const [showFilters, setShowFilters] = useState(false);

    // Filtros extra para inmobiliaria
    const [tipoFiltro, setTipoFiltro] = useState("Todos");
    const tiposPropiedad = ["Todos", "Casa", "Apartamento", "Local Comercial", "Terreno / Solar"];
    const estados = ["Todos", "En Planos", "En Construcción", "Listo para entrega"];

    const supabase = createClient();

    // Fetch favorites
    useEffect(() => {
        const fetchFavoritos = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return; // No intentamos pedir favoritos si no hay sesión

                const res = await fetch('/api/favoritos');
                if (res.ok) {
                    const data = await res.json();
                    setFavoritos(data);
                }
            } catch (err) {
                // Silenciamos el error en consola si es un 401 esperado
                console.debug("Favoritos no disponibles (Usuario no logueado)");
            }
        };
        fetchFavoritos();
    }, [supabase]);

    const handleToggleFavorito = async (planoId: string) => {
        try {
            const res = await fetch('/api/favoritos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planoId })
            });

            const data = await res.json();

            if (res.ok) {
                if (data.status === 'added') {
                    setFavoritos(prev => [...prev, planoId]);
                    showToast("¡Agregado a tus favoritos! ❤️", "success");
                } else {
                    setFavoritos(prev => prev.filter(id => id !== planoId));
                    showToast("Eliminado de favoritos.", "info");
                }
            } else {
                showToast(data.error || "Error al actualizar favoritos", "error");
            }
        } catch {
            showToast("Error de conexión", "error");
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedBusqueda(busqueda);
        }, 300);
        return () => clearTimeout(timer);
    }, [busqueda]);
    // Fetch Planos logic removed because it is now SSR injected via initialPlanos

    useEffect(() => {
        setFiltrados(
            planos.filter((p) => {
                const matchBusqueda =
                    debouncedBusqueda === "" ||
                    p.titulo.toLowerCase().includes(debouncedBusqueda.toLowerCase()) ||
                    p.descripcion.toLowerCase().includes(debouncedBusqueda.toLowerCase());

                const matchEstilo = estiloActivo === "Todos" || p.estilo === estiloActivo;

                const matchPrecio =
                    (minPrecio === "" || p.precio >= (minPrecio as number)) &&
                    (maxPrecio === "" || p.precio <= (maxPrecio as number));

                const matchTipo = !isSeccionInmobiliaria || tipoFiltro === "Todos" || p.tipo_propiedad === tipoFiltro;

                const matchHab = habitaciones === "Todos" || p.habitaciones >= (habitaciones as number);
                const matchParq = parqueos === "Todos" || (p.parqueos || 0) >= (parqueos as number);
                const matchEstado = estadoProyecto === "Todos" || p.estado_proyecto === estadoProyecto;

                return matchBusqueda && matchEstilo && matchPrecio && matchTipo && matchHab && matchParq && matchEstado;
            })
        );
    }, [planos, debouncedBusqueda, estiloActivo, minPrecio, maxPrecio, tipoFiltro, isSeccionInmobiliaria, habitaciones, parqueos, estadoProyecto]);

    const clearFilters = () => {
        setBusqueda("");
        setEstiloActivo("Todos");
        setMinPrecio("");
        setMaxPrecio("");
        setTipoFiltro("Todos");
        setHabitaciones("Todos");
        setParqueos("Todos");
        setEstadoProyecto("Todos");
    };

    const hasFilters = busqueda || estiloActivo !== "Todos" || minPrecio !== "" || maxPrecio !== "" || (isSeccionInmobiliaria && tipoFiltro !== "Todos") || habitaciones !== "Todos" || parqueos !== "Todos" || estadoProyecto !== "Todos";

    return (
        <div className="pt-24 pb-16 min-h-screen">
            {/* Header */}
            <div className="container-section mb-10">
                <div className="space-y-3">
                    <div className="badge-blue w-fit">Catálogo Completo</div>
                    <h1 className="section-title">
                        {isSeccionInmobiliaria ? "Propiedades " : "Planos "}
                        <span className="bg-gradient-to-r from-brand-blue to-brand-blue-light bg-clip-text text-transparent">
                            {isSeccionInmobiliaria ? "Inmobiliarias" : "Arquitectónicos"}
                        </span>
                    </h1>
                    <p className="text-gray-500 text-lg">
                        {isSeccionInmobiliaria
                            ? "Explora nuestra exclusiva selección de casas, apartamentos y terrenos."
                            : "Encuentra el plano perfecto entre nuestra colección de diseños profesionales."}
                    </p>
                </div>
            </div>

            <div className="container-section">
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="input-field pl-11 h-12"
                            placeholder="Buscar por nombre o descripción..."
                        />
                        {busqueda && (
                            <button
                                onClick={() => setBusqueda("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-medium text-sm transition-all duration-200 ${hasFilters
                            ? "bg-brand-blue/15 border-brand-blue/40 text-brand-blue-light"
                            : "glass-card border-white/10 text-gray-400 hover:border-white/20"
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filtros Avanzados
                        {hasFilters && (
                            <span className="w-5 h-5 rounded-full bg-brand-blue text-white text-xs flex items-center justify-center">•</span>
                        )}
                    </button>
                    {hasFilters && (
                        <button onClick={clearFilters} className="flex items-center gap-1.5 px-4 py-3 text-sm text-gray-500 hover:text-white transition-colors">
                            <X className="w-4 h-4" /> Limpiar
                        </button>
                    )}
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="glass-card p-6 mb-8 space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Price Range */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rango de Precio (US$)</h3>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrecio}
                                        onChange={e => setMinPrecio(e.target.value === "" ? "" : Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-brand-blue/50 outline-none"
                                    />
                                    <span className="text-gray-600">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrecio}
                                        onChange={e => setMaxPrecio(e.target.value === "" ? "" : Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-brand-blue/50 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Rooms & Parking */}
                            {!isSeccionInmobiliaria ? (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Características</h3>
                                    <div className="flex flex-col gap-3">
                                        <select
                                            value={habitaciones}
                                            onChange={e => setHabitaciones(e.target.value === "Todos" ? "Todos" : Number(e.target.value))}
                                            className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white outline-none"
                                        >
                                            <option value="Todos" className="bg-[#090b14]">Habitaciones: Todas</option>
                                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n} className="bg-[#090b14]">{n}+ Hab.</option>)}
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Características</h3>
                                    <div className="flex gap-2">
                                        <select
                                            value={habitaciones}
                                            onChange={e => setHabitaciones(e.target.value === "Todos" ? "Todos" : Number(e.target.value))}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white outline-none"
                                        >
                                            <option value="Todos" className="bg-[#090b14]">Hab: Todas</option>
                                            {[1, 2, 3, 4].map(n => <option key={n} value={n} className="bg-[#090b14]">{n}+ Hab.</option>)}
                                        </select>
                                        <select
                                            value={parqueos}
                                            onChange={e => setParqueos(e.target.value === "Todos" ? "Todos" : Number(e.target.value))}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white outline-none"
                                        >
                                            <option value="Todos" className="bg-[#090b14]">Parq: Todos</option>
                                            {[1, 2, 3].map(n => <option key={n} value={n} className="bg-[#090b14]">{n}+ Pq.</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Status */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado del Proyecto</h3>
                                <select
                                    value={estadoProyecto}
                                    onChange={e => setEstadoProyecto(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white outline-none"
                                >
                                    {estados.map(est => <option key={est} value={est} className="bg-[#090b14]">{est}</option>)}
                                </select>
                            </div>

                            {/* Style */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estilo</h3>
                                <select
                                    value={estiloActivo}
                                    onChange={e => setEstiloActivo(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white outline-none"
                                >
                                    {estilos.map(est => <option key={est} value={est} className="bg-[#090b14]">{est}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Secondary Filter for Inmobiliaria */}
                        {isSeccionInmobiliaria && (
                            <div className="pt-6 border-t border-white/5">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tipo de Propiedad</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tiposPropiedad.map((tipo) => (
                                        <button
                                            key={tipo}
                                            onClick={() => setTipoFiltro(tipo)}
                                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${tipoFiltro === tipo
                                                ? "bg-brand-blue text-white shadow-blue-glow"
                                                : "glass-card text-gray-400 hover:text-white hover:border-white/20"
                                                }`}
                                        >
                                            {tipo}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Results Count */}
                {!loading && (
                    <p className="text-sm text-gray-600 mb-6">
                        {filtrados.length} {isSeccionInmobiliaria ? "propiedades" : "planos"} encontrada(o)s
                    </p>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
                    </div>
                ) : filtrados.length === 0 ? (
                    <div className="text-center py-32 space-y-6 animate-fade-in">
                        <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <Search className="w-10 h-10 text-gray-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-display text-2xl font-bold text-white">No encontramos resultados</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                No pudimos encontrar {isSeccionInmobiliaria ? "propiedades" : "planos"} que coincidan con tu búsqueda.
                                Intenta ajustar los filtros o contáctanos directamente.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button onClick={clearFilters} className="btn-secondary">
                                Limpiar Filtros
                            </button>
                            <a
                                href="https://wa.me/18296503337?text=Hola ARQOVEX, no encontré lo que buscaba en el catálogo. Me interesa..."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary bg-emerald-600 hover:bg-emerald-500 border-none inline-flex items-center gap-2"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                Contactar Soporte
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtrados.map((plano) => (
                            <PlanoCard 
                                key={plano.id} 
                                plano={plano} 
                                isFavorito={favoritos.includes(plano.id)}
                                onToggleFavorito={handleToggleFavorito}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Layout export removed since it's a client component segment now
