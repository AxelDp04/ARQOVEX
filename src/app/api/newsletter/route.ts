import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
// import { sendEmailWithLog } from '@/lib/resend';
// import { WelcomeEmailTemplate } from '@/lib/email-templates';

export async function GET() {
    return NextResponse.json({ message: 'Newsletter API is active. Use POST to subscribe.' });
}

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
            return NextResponse.json(
                { error: 'Email inválido.' },
                { status: 400 }
            );
        }

        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // sessions.
                        }
                    },
                },
            }
        );

        // 1. Insert into newsletter table
        const { error } = await supabase
            .from('newsletter')
            .insert([{ email: normalizedEmail }]);

        if (error) {
            // Unique constraint violation (code 23505)
            if (error.code === '23505') {
                return NextResponse.json(
                    { message: '¡Ya eres parte de nosotros!', status: 'already_exists' },
                    { status: 200 }
                );
            }
            console.error('Supabase error inserting email:', error);
            return NextResponse.json(
                { error: 'Error al registrar el correo.' },
                { status: 500 }
            );
        }

        // 2. Send Welcome Email (PAUSED - Waiting for official domain)
        /*
        try {
            await sendEmailWithLog({
                to: email,
                subject: '¡Bienvenido a la comunidad ARQOVEX! 🏗️',
                react: WelcomeEmailTemplate({ email }),
                category: 'bienvenida',
                supabase
            });
        } catch (emailErr) {
            console.error('Error sending welcome email (non-blocking):', emailErr);
            // We don't fail the request if the email fails
        }
        */

        return NextResponse.json(
            { 
                message: '¡Gracias por tu interés! El sistema de comunicaciones está bajo optimización por el Ing. Axel Perez. Muy pronto recibirás novedades exclusivas de ARQOVEX.', 
                status: 'success' 
            },
            { status: 200 }
        );
    } catch (err) {
        console.error('Newsletter API Error:', err);
        return NextResponse.json(
            { error: 'Error interno del servidor.' },
            { status: 500 }
        );
    }
}
