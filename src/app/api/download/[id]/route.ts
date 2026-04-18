import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const supabase = await createClient();

        // 1. Verify User Session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        // 2. Check Ownership in both legacy and new tables
        interface PlanoJoin {
            url_archivo: string;
        }

        // Check new table
        const { data: venta } = await supabase
            .from("ventas_planos")
            .select("descarga_habilitada, planos(url_archivo)")
            .eq("usuario_id", user.id)
            .eq("plano_id", id)
            .eq("descarga_habilitada", true)
            .maybeSingle();

        // The join returns an object or array depending on config, but usually an object for .single()/.maybeSingle()
        const planosVenta = venta?.planos as unknown as PlanoJoin | null;
        let technicalFilePath = planosVenta?.url_archivo;

        // If not found in new table, check legacy table
        if (!technicalFilePath) {
            const { data: adq } = await supabase
                .from("adquisiciones")
                .select("planos(url_archivo)")
                .eq("user_id", user.id)
                .eq("plano_id", id)
                .eq("estado", "completado")
                .maybeSingle();
            
            const planosAdq = adq?.planos as unknown as PlanoJoin | null;
            technicalFilePath = planosAdq?.url_archivo;
        }

        if (!technicalFilePath) {
            return NextResponse.json({ error: "No tienes acceso a este archivo o la compra no ha sido verificada." }, { status: 403 });
        }

        // 3. Check if it's an external link
        if (technicalFilePath.startsWith('http')) {
            return NextResponse.json({ url: technicalFilePath });
        }

        // 4. Generate Signed URL (Expire in 1200 seconds = 20 minutes)
        const { data, error: signedUrlError } = await supabase
            .storage
            .from("planos-privados")
            .createSignedUrl(technicalFilePath, 1200);

        if (signedUrlError || !data?.signedUrl) {
            console.error("Error creating signed URL:", signedUrlError);
            return NextResponse.json({ error: "Error al generar enlace de descarga" }, { status: 500 });
        }

        return NextResponse.json({ url: data.signedUrl });

    } catch (error) {
        console.error("Internal Download API Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
