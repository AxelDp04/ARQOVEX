import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { CitaNotificationEmailTemplate } from '@/lib/email-templates';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const nombre_completo = typeof body?.nombre_completo === 'string' ? body.nombre_completo.trim() : '';
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
        const telefono = typeof body?.telefono === 'string' ? body.telefono.trim() : '';
        const fecha_cita = typeof body?.fecha_cita === 'string' ? body.fecha_cita.trim() : '';
        const mensaje = typeof body?.mensaje === 'string' ? body.mensaje.trim() : '';
        const url_propiedad = typeof body?.url_propiedad === 'string' ? body.url_propiedad.trim() : '';

        if (!nombre_completo || !email || !telefono || !fecha_cita) {
            return NextResponse.json(
                { error: 'Campos incompletos.' },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
            return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
        }

        if (nombre_completo.length > 120 || telefono.length > 30 || mensaje.length > 2000 || (url_propiedad && url_propiedad.length > 500)) {
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

        // 2. ENVIAR CORREO
        let emailSent = false;
        try {
            const resendApiKey = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY;
            if (!resendApiKey) {
                console.error('Resend API key not configured.');
            } else {
                const resend = new Resend(resendApiKey);
                const emailHtml = await render(CitaNotificationEmailTemplate({
                nombre: nombre_completo,
                email,
                telefono,
                fecha: fecha_cita,
                mensaje,
                url_propiedad
            }));

                const response = await resend.emails.send({
                    from: 'ARQOVEX <notificaciones@arqovex.com>',
                    to: 'arqovex@gmail.com',
                    subject: `🏠 NUEVA CITA: ${nombre_completo}`,
                    html: emailHtml,
                });

                if (response.error) {
                    console.error('Resend Error Logic:', response.error);
                } else {
                    await resend.emails.send({
                        from: 'ARQOVEX <notificaciones@arqovex.com>',
                        to: email,
                        subject: `Confirmación de Solicitud de Cita - ARQOVEX`,
                        html: `
                            <div style="font-family: sans-serif; padding: 20px; background-color: #0d1424; color: #fff;">
                                <h2 style="color: #0066ff;">¡Hola ${nombre_completo}!</h2>
                                <p>Hemos recibido tu solicitud para visitar la propiedad.</p>
                                <p><strong>Detalles de tu cita programada:</strong></p>
                                <ul>
                                    <li>Fecha sugerida: ${new Date(fecha_cita).toLocaleDateString()}</li>
                                    <li>Propiedad: <a href="${url_propiedad}" style="color: #0066ff;">Ver Propiedad</a></li>
                                </ul>
                                <p>Un asesor de nuestro equipo se pondrá en contacto contigo muy pronto a través de WhatsApp o llamada telefónica.</p>
                                <hr style="border: 1px solid #1e293b;" />
                                <p style="font-size: 12px; color: #94a3b8;">ARQOVEX Real Estate - Innovación Inmobiliaria</p>
                            </div>
                        `,
                    });
                    emailSent = true;
                }
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
