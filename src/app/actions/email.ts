'use server';

import { sendEmailWithLog } from '@/lib/resend';
import { WelcomeEmailTemplate, PropertyNotificationEmailTemplate } from '@/lib/email-templates';
import { createClient } from '@/lib/supabase/server';

export async function sendWelcomeEmail(email: string) {
    const supabase = await createClient();
    
    return await sendEmailWithLog({
        to: email,
        subject: '¡Bienvenido a la comunidad ARQOVEX! 🏗️',
        react: WelcomeEmailTemplate({ email }),
        category: 'bienvenida',
        supabase
    });
}

export async function sendPropertyNotification(recipients: string[], propertyData: {
    titulo: string;
    precio: number;
    imagen_url: string;
    tipo: string;
}) {
    const supabase = await createClient();

    // Resend's free tier or standard send has limits, but batch is better for multiple recipients
    // For simplicity and logging, we'll use the helper which logs to Supabase
    // Note: In a real production environment with 1000s of users, this should be a background job.
    
    const results = [];
    for (const email of recipients) {
        const result = await sendEmailWithLog({
            to: email,
            subject: `🏠 Nueva Propiedad: ${propertyData.titulo}`,
            react: PropertyNotificationEmailTemplate({
                titulo: propertyData.titulo,
                precio: propertyData.precio,
                imagen_url: propertyData.imagen_url,
                tipo: propertyData.tipo
            }),
            category: 'notificacion_propiedad',
            supabase
        });
        results.push(result);
    }
    
    return results;
}
