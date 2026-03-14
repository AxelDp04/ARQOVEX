import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { CitaNotificationEmailTemplate } from '@/lib/email-templates';

// BYPASS DE EMERGENCIA - API KEY HARDCODED 
const EMERGENCY_RESEND_KEY = 're_DuWwPamW_FQYFbfTdGNBbzAKY7SoKrQEV';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nombre_completo, email, telefono, fecha_cita, mensaje, url_propiedad } = body;

        // Validación básica
        if (!nombre_completo || !email || !telefono || !fecha_cita) {
            return NextResponse.json(
                { error: 'Campos incompletos.' },
                { status: 400 }
            );
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
            .from('citas')
            .insert([{
                nombre_cliente: nombre_completo,
                email_cliente: email,
                telefono_cliente: telefono,
                fecha_propuesta: fecha_cita,
                mensaje,
                url_propiedad
            }]);

        if (dbError) console.error('Supabase DB Error [No Crítico]:', dbError);

        // 2. ENVIAR CORREO (USANDO ONBOARDING@RESEND.DEV SI EL DOMINIO NO ESTÁ VERIFICADO)
        let emailSent = false;
        try {
            const resend = new Resend(EMERGENCY_RESEND_KEY);
            const emailHtml = await render(CitaNotificationEmailTemplate({
                nombre: nombre_completo,
                email,
                telefono,
                fecha: fecha_cita,
                mensaje,
                url_propiedad
            }));

            // Usamos 'onboarding@resend.dev' porque SIEMPRE funciona aunque el dominio 'arqovex.com' no esté verificado.
            const response = await resend.emails.send({
                from: 'Resend <onboarding@resend.dev>', 
                to: 'arqovex@gmail.com',
                subject: `🏠 NUEVA CITA: ${nombre_completo}`,
                html: emailHtml,
            });

            if (response.error) {
                console.error('Resend Error Logic:', response.error);
                // Si 'onboarding' falló, intentamos con el corporativo como último recurso
                await resend.emails.send({
                    from: 'ARQOVEX <notificaciones@arqovex.com>', 
                    to: 'arqovex@gmail.com',
                    subject: `🏠 NUEVA CITA (Fallback): ${nombre_completo}`,
                    html: emailHtml,
                });
            } else {
                emailSent = true;
            }
        } catch (emailErr) {
            console.error('Fatal Email Error:', emailErr);
        }

        return NextResponse.json(
            { 
                message: emailSent ? 'Enviado con éxito.' : 'Error en envío de correo.', 
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
