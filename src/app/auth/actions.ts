'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

function getSupabaseServer() {
    const cookieStore = cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                name: 'arqovex-session'
            },
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { /* Server Component */ }
                },
            },
        }
    );
}

const HARDCODED_ADMIN_EMAILS = ['axelp7223@gmail.com', 'arqovex@gmail.com', 'robertoficial69@hotmail.com'];

// ─── LOGIN ACTION ────────────────────────────────────────────────────────────
export async function loginAction(formData: FormData): Promise<{ error?: string; redirectUrl?: string }> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email y contraseña son obligatorios.' };
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
        return { error: 'Credenciales incorrectas. Verifica tu email y contraseña.' };
    }

    // Determine redirect target
    const { data: profile } = await supabase
        .from('perfiles')
        .select('es_admin, role')
        .eq('id', data.user.id)
        .maybeSingle();

    const isAdmin =
        profile?.es_admin === true ||
        profile?.role === 'admin' ||
        HARDCODED_ADMIN_EMAILS.includes(data.user.email?.toLowerCase() ?? '');

    return { redirectUrl: isAdmin ? '/admin' : '/arquitectura' };
}

// ─── REGISTER ACTION ─────────────────────────────────────────────────────────
export async function registerAction(formData: FormData): Promise<{ error?: string; success?: boolean; redirectUrl?: string }> {
    const nombre = (formData.get('nombre') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;

    if (!nombre) return { error: 'El nombre completo es obligatorio.' };
    if (!email || !email.includes('@')) return { error: 'Email inválido.' };
    if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' };
    if (!/[0-9]/.test(password)) return { error: 'La contraseña debe incluir al menos un número.' };

    const supabase = getSupabaseServer();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: nombre } },
    });

    if (signUpError) {
        const msg = signUpError.message === 'User already registered'
            ? 'Este email ya está registrado. Intenta iniciar sesión.'
            : 'Error al crear la cuenta. Inténtalo de nuevo.';
        return { error: msg };
    }

    // Save full name in perfiles table
    if (signUpData.user) {
        await supabase.from('perfiles').upsert({
            id: signUpData.user.id,
            nombre_completo: nombre,
            email: email,
        }, { onConflict: 'id' });
    }

    return { success: true };
}

// ─── VERIFY RECOVERY ACTION ──────────────────────────────────────────────────
export async function verifyRecoveryTokenAction(tokenHash: string): Promise<{ error?: string; success?: boolean }> {
    if (!tokenHash) return { error: 'El código de recuperación es inválido.' };

    const supabase = getSupabaseServer();
    const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery',
    });

    if (error) {
        console.error("Error verificando OTP recovery:", error.message);
        return { error: 'El enlace ha expirado o ya fue utilizado.' };
    }

    return { success: true };
}

// ─── LOGOUT ACTION ────────────────────────────────────────────────────────────
export async function logoutAction(): Promise<void> {
    const supabase = getSupabaseServer();
    await supabase.auth.signOut();
    redirect('/');
}
