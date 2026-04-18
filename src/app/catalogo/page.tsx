import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import CatalogoClient from "./CatalogoClient";
import { createClient } from "@/lib/supabase/server";

import { Metadata } from "next";

export async function generateMetadata({ searchParams }: { searchParams: { seccion?: string } }): Promise<Metadata> {
    const isInmobiliaria = searchParams.seccion === "inmobiliaria";
    return {
        title: isInmobiliaria ? "Propiedades Inmobiliarias" : "Planos Arquitectónicos",
        description: isInmobiliaria 
            ? "Explora nuestra exclusiva selección de casas, apartamentos y terrenos en la República Dominicana."
            : "Encuentra el plano perfecto entre nuestra colección de diseños arquitectónicos profesionales.",
    };
}

// Revalidar caché cada 60 segundos si es necesario para mantenerlo siempre rápido
export const revalidate = 60;

export default async function CatalogoPage() {
    const supabase = await createClient();

    // Obtención de datos en el SERVIDOR (0 milisegundos de carga visual en el cliente)
    const { data: initialPlanos, error } = await supabase
        .from("planos")
        .select("*, categoria:categorias(*), galeria:galeria_propiedades!fk_galeria_plano(imagen_url)")
        .eq("disponible", true)
        .eq("estado_revision", "publicado")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching planos SSR:", error.message);
    }

    return (
        <MainLayout>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
                </div>
            }>
                {/* 
                    Pasamos los planos obtenidos en el servidor al cliente. 
                    El cliente ya NO tendrá que mostrar una pantalla de carga. 
                */}
                <CatalogoClient initialPlanos={initialPlanos || []} />
            </Suspense>
        </MainLayout>
    );
}
