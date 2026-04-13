import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// CREDENCIALES HARDCODED (CONEXIÓN BLINDADA)
const NEXUS_URL = "https://badqkfvbymxyqtwpnejd.supabase.co";
const NEXUS_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZHFrZnZieW14eXF0d3BuZWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTczNTUsImV4cCI6MjA4OTY5MzM1NX0.8-0_QRz19s4g74pmRYj0vv5OwoS5UTrnhqhSlqhghTQ";
const PROJECT_NAME = "ARQOVEX - Luxury Engine";

export async function POST(request: Request) {
    try {
        const { description } = await request.json();
        console.error("🚨 SENTINEL FRONTEND ERROR CRASH:", description);

        if (!description) {
            return NextResponse.json({ error: "No description provided" }, { status: 400 });
        }

        const supabase = createClient(NEXUS_URL, NEXUS_KEY);

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
