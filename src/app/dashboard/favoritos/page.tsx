"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

export default function FavoritosPlaceholder() {
    const router = useRouter();

    useEffect(() => {
        // Redirigir al dashboard principal con el tab de favoritos activo
        router.replace("/dashboard?tab=favoritos");
    }, [router]);

    return (
        <MainLayout>
            <div className="min-h-screen flex flex-col items-center justify-center pt-24 bg-[#090b14]">
                <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
                <p className="text-gray-450 font-medium">Cargando tus favoritos...</p>
            </div>
        </MainLayout>
    );
}
