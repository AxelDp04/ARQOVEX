import { Resend } from 'resend';
import { SupabaseClient } from '@supabase/supabase-js';

let resendClient: Resend | null = null;

const getResendClient = () => {
    if (!resendClient) {
        resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
};

/**
 * Sends an email and logs it to Supabase historial_correos
 */
export async function sendEmailWithLog({
    to,
    subject,
    react,
    category,
    supabase
}: {
    to: string | string[];
    subject: string;
    react: React.ReactElement;
    category: string;
    supabase: SupabaseClient;
}) {
    try {
        getResendClient();
        const resend = getResendClient();
        const { data, error } = await resend.emails.send({
            from: 'ARQOVEX <info@arqovex.com>', // Assuming info@arqovex.com or similar will work if configured, otherwise use verified sender
            to,
            subject,
            react,
        });

        if (error) {
            console.error('Resend Error:', error);
            // Fallback for development if needed, but in LIVE let's error log
        }

        // Log to historial_correos
        const recipients = Array.isArray(to) ? to : [to];
        const logEntries = recipients.map(email => ({
            email,
            asunto: subject,
            categoria: category,
            enviado_at: new Date().toISOString()
        }));

        const { error: logError } = await supabase
            .from('historial_correos')
            .insert(logEntries);

        if (logError) {
            console.error('Error logging email to Supabase:', logError);
        }

        return { data };
    } catch (err) {
        console.error('Exception sending email:', err);
        return { error: err };
    }
}
