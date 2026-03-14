import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { ProyectoNotificationEmailTemplate } from '@/lib/email-templates';

// BYPASS DE EMERGENCIA - API KEY HARDCODED 
const EMERGENCY_RESEND_KEY = 're_DuWwPamW_FQYFbfTdGNBbzAKY7SoKrQEV';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nombre, email, telefono, tipo_servicio, mensaje } = body;

        // Validación básica
        if (!nombre || !email || !tipo_servicio || !mensaje) {
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

        // 2. ENVIAR CORREO (USANDO ONBOARDING@RESEND.DEV SI EL DOMINIO NO ESTÁ VERIFICADO)
        let emailSent = false;
        try {
            const resend = new Resend(EMERGENCY_RESEND_KEY);
            const emailHtml = await render(ProyectoNotificationEmailTemplate({
                nombre,
                email,
                telefono,
                tipo_servicio,
                mensaje
            }));

            // Usamos 'onboarding@resend.dev' porque SIEMPRE funciona aunque el dominio 'arqovex.com' no esté verificado.
            const response = await resend.emails.send({
                from: 'Resend <onboarding@resend.dev>', 
                to: 'arqovex@gmail.com',
                subject: `🏠 SOLICITUD DE PROYECTO: ${nombre}`,
                html: emailHtml,
            });

            if (response.error) {
                console.error('Resend Error Logic:', response.error);
                // Si 'onboarding' falló, intentamos con el corporativo como último recurso
                await resend.emails.send({
                    from: 'ARQOVEX <notificaciones@arqovex.com>', 
                    to: 'arqovex@gmail.com',
                    subject: `🏠 SOLICITUD DE PROYECTO (Fallback): ${nombre}`,
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
