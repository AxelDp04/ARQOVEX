import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PlanoDetailClient from "./PlanoDetailClient";
import { createClient } from "@/lib/supabase/server";
import type { Plano } from "@/types";

// Revalidar caché brevemente para balancear en vivo vs velocidad
export const revalidate = 60;

// Fallback sample data matching catalog
const samplePlanos: Record<string, Plano> = {
    "s0": { id: "s0", tipo_propiedad: "Plano Arquitectónico", titulo: "Residencia Contemporánea", descripcion: "Diseño moderno con amplios espacios abiertos.", precio: 299, metros_cuadrados: 180, habitaciones: 3, banos: 2, pisos: 1, categoria_id: "m", imagen_url: "", estilo: "Contemporáneo", destacado: true, disponible: true, created_at: new Date().toISOString() },
};

export default async function PlanoDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { id } = params;

    // Obtención de datos en el SERVIDOR (0 ms carga visual en el cliente)
    const { data: planoData, error } = await supabase
        .from("planos")
        .select("*, categoria:categorias(*)")
        .eq("id", id)
        .single();
    
    let plano = planoData as Plano;
    
    if (error || !planoData) {
        if (samplePlanos[id]) {
            plano = samplePlanos[id];
        } else {
            // Retorna un verdadero 404 instantáneo si no existe
            notFound();
        }
    }

    // Array maestro de la galería (Se carga en el servidor para evitar layout shifts en las fotos)
    let galeriaUrls = [plano.imagen_url];
    const { data: galeriaData } = await supabase
        .from("galeria_propiedades")
        .select("imagen_url")
        .eq("plano_id", id)
        .order("orden");
    
    if (galeriaData && galeriaData.length > 0) {
        galeriaUrls = [plano.imagen_url, ...galeriaData.map((g: { imagen_url: string }) => g.imagen_url)];
    }

    // Calcula estadísticas del servidor
    let avgRating = null;
    let numResenas = 0;
    const { data: resData } = await supabase
        .from("resenas")
        .select("estrellas")
        .eq("plano_id", id)
        .eq("aprobado", true);

    if (resData && resData.length > 0) {
        const sum = resData.reduce((acc, curr) => acc + curr.estrellas, 0);
        avgRating = sum / resData.length;
        numResenas = resData.length;
    }

    return (
        <MainLayout>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center pt-24">
                    <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
                </div>
            }>
                <PlanoDetailClient 
                    initialPlano={plano} 
                    initialGaleriaUrls={galeriaUrls}
                    initialAvgRating={avgRating}
                    initialNumResenas={numResenas}
                />
            </Suspense>
        </MainLayout>
    );
}
