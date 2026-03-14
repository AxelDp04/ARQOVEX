import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('favoritos')
            .select('plano_id')
            .eq('user_id', user.id);

        if (error) throw error;

        return NextResponse.json(data.map(f => f.plano_id));
    } catch (err) {
        console.error('Error fetching favorites:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { planoId } = await request.json();
        if (!planoId) {
            return NextResponse.json({ error: 'Falta planoId' }, { status: 400 });
        }

        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Inicia sesión para guardar favoritos' }, { status: 401 });
        }

        // Toggle logic
        const { data: existing } = await supabase
            .from('favoritos')
            .select('id')
            .eq('user_id', user.id)
            .eq('plano_id', planoId)
            .single();

        if (existing) {
            const { error: delError } = await supabase
                .from('favoritos')
                .delete()
                .eq('id', existing.id);
            
            if (delError) throw delError;
            return NextResponse.json({ status: 'removed', message: 'Eliminado de favoritos' });
        } else {
            const { error: insError } = await supabase
                .from('favoritos')
                .insert([{ user_id: user.id, plano_id: planoId }]);
            
            if (insError) throw insError;
            return NextResponse.json({ status: 'added', message: 'Agregado a favoritos' });
        }
    } catch (err) {
        console.error('Error toggling favorite:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
