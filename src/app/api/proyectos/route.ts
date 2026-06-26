import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { ProyectoNotificationEmailTemplate } from '@/lib/email-templates';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const nombre = typeof body?.nombre === 'string' ? body.nombre.trim() : '';
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
        const telefono = typeof body?.telefono === 'string' ? body.telefono.trim() : '';
        const tipo_servicio = typeof body?.tipo_servicio === 'string' ? body.tipo_servicio.trim() : '';
        const mensaje = typeof body?.mensaje === 'string' ? body.mensaje.trim() : '';

        if (!nombre || !email || !tipo_servicio || !mensaje) {
            return NextResponse.json(
                { error: 'Campos incompletos.' },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
            return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
        }

        if (nombre.length > 120 || tipo_servicio.length > 80 || mensaje.length > 2000 || (telefono && telefono.length > 30)) {
            return NextResponse.json({ error: 'Datos demasiado largos.' }, { status: 400 });
        }

        const cookieStore = cookies();
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const supabase = createServerClient(
            supabaseUrl,
            serviceRoleKey || anonKey,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {}
                    },
                },
            }
        );

        // 1. Intentar Guardar en Supabase (Si falla, NO detenemos el correo)
        const { error: dbError } = await supabase
            .from('proyectos')
            .insert([{
                nombre_cliente: nombre,
                email_cliente: email,
                telefono_cliente: telefono,
                tipo_servicio,
                mensaje,
                estado: 'nuevo'
            }]);

        if (dbError) console.error('Supabase DB Error [No Crítico]:', dbError);

        // 2. ENVIAR CORREO
        let emailSent = false;
        try {
            const resendApiKey = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY;
            if (!resendApiKey) {
                console.error('Resend API key not configured.');
            } else {
                const resend = new Resend(resendApiKey);
                const emailHtml = await render(ProyectoNotificationEmailTemplate({
                nombre,
                email,
                telefono,
                tipo_servicio,
                mensaje
            }));

                const response = await resend.emails.send({
                    from: 'ARQOVEX <notificaciones@arqovex.com>',
                    to: 'arqovex@gmail.com',
                    subject: `🏠 SOLICITUD DE PROYECTO: ${nombre}`,
                    html: emailHtml,
                });

                if (response.error) {
                    console.error('Resend Error Logic:', response.error);
                } else {
                    emailSent = true;
                }
            }
        } catch (emailErr) {
            console.error('Fatal Email Error:', emailErr);
        }

        return NextResponse.json(
            { 
                message: emailSent ? 'Solicitud enviada con éxito.' : 'Error en envío de correo.', 
                status: emailSent ? 'success' : 'partial_error'
            },
            { status: 200 }
        );

    } catch (err: unknown) {
        const error = err as Error;
        console.error('Global API Error:', error);
        return NextResponse.json({ error: error.message || 'Error desconocido' }, { status: 500 });
    }
}
