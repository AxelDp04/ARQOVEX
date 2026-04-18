import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const start = Date.now();
        const res = await fetch('https://rdbdwvwmnozumwtxdmra.supabase.co/rest/v1/', { method: 'OPTIONS' });
        const time = Date.now() - start;
        return NextResponse.json({ status: res.status, time });
    } catch (e: any) {
        return NextResponse.json({ error: e.message, cause: e.cause?.message });
    }
}
