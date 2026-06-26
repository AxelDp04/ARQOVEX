import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";

const PROJECT_NAME = "ARQOVEX - Luxury Engine";

export async function POST(request: Request) {
    try {
        const ip = getClientIp(request);
        const rateLimit = checkRateLimit(`sentinel:${ip}`, 10, 60_000);
        if (!rateLimit.allowed) {
            return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
        }

        const { description } = await request.json();
        console.error("🚨 SENTINEL FRONTEND ERROR CRASH:", description);

        if (typeof description !== "string" || description.trim().length < 10 || description.trim().length > 4000) {
            return NextResponse.json({ error: "No description provided" }, { status: 400 });
        }

        const nexusUrl = process.env.SENTINEL_SUPABASE_URL;
        const nexusKey = process.env.SENTINEL_SUPABASE_ANON_KEY;

        if (!nexusUrl || !nexusKey) {
            return NextResponse.json({ error: "Sentinel not configured" }, { status: 500 });
        }

        const supabase = createClient(nexusUrl, nexusKey);

        const { error } = await supabase
            .from('nexus_tasks')
            .insert({
                project_name: PROJECT_NAME,
                error_description: description,
                status: 'pending',
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error("Sentinel API Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Reported to Sentinel" });
    } catch (err: any) {
        console.error("Sentinel API Fatal Failure:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
