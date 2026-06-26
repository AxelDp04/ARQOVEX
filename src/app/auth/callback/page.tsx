"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { isAdminEmail } from "@/lib/security/admin";

function AuthCallback() {
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error("Error getting session:", error);
                    router.push("/auth/login?error=auth_failed");
                    return;
                }

                if (data.session?.user) {
                    const user = data.session.user;
                    
                    // Check profile for admin status
                    const { data: profile } = await supabase
                        .from('perfiles')
                        .select('es_admin, role')
                        .eq('id', user.id)
                        .single();

                    const isAdminFromProfile = profile?.es_admin === true || profile?.role === 'admin';
                    const isAdmin = isAdminFromProfile || isAdminEmail(user.email);

                    if (isAdminEmail(user.email) && !isAdminFromProfile) {
                        try {
                            // First, ensure profile exists
                            const { data: existingProfile } = await supabase
                                .from('perfiles')
                                .select('id')
                                .eq('id', user.id)
                                .single();

                            if (!existingProfile) {
                                // Create profile with admin role
                                await supabase.from('perfiles').insert({
                                    id: user.id,
                                    email: user.email,
                                    nombre_completo: user.user_metadata?.full_name || user.email?.split('@')[0],
                                    es_admin: true,
                                    role: 'admin'
                                });
                            } else {
                                // Update existing profile to admin
                                await supabase
                                    .from('perfiles')
                                    .update({ es_admin: true, role: 'admin' })
                                    .eq('id', user.id);
                            }
                        } catch (profileError) {
                            console.error("Error updating admin profile:", profileError);
                        }
                    }
                    
                    // Redirect based on admin status
                    if (isAdmin) {
                        router.push("/admin");
                    } else {
                        router.push("/arquitectura");
                    }
                } else {
                    router.push("/auth/login");
                }
            } catch (error) {
                console.error("Auth callback error:", error);
                router.push("/auth/login?error=callback_failed");
            }
        };

        handleAuthCallback();
    }, [router, supabase]);

    return (
        <div className="min-h-screen bg-brand-slate-deeper flex items-center justify-center">
            <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto" />
                <p className="text-white">Autenticando...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-brand-slate-deeper flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
            </div>
        }>
            <AuthCallback />
        </Suspense>
    );
}
