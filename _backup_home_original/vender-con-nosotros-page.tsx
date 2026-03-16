"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
    ShieldCheck, ArrowRight, CheckCircle2, 
    Instagram, Facebook, Linkedin, User, Globe,
    ChevronRight, Loader2, 
    ArrowUpRight, Signature as SignatureIcon,
    Gem, Quote
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ArqovexLogo = () => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
    >
        <div className="flex flex-col items-center">
            <span className="text-white font-black text-4xl tracking-[0.3em] italic">ARQOVEX</span>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent mt-2"></div>
            <span className="text-white/40 text-[8px] font-bold tracking-[0.5em] mt-2 uppercase">Elite Partnership</span>
        </div>
    </motion.div>
);

const TeamCredits = () => (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mt-12 py-8 border-t border-white/5">
        <div className="text-center md:text-left">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Dirección General</p>
            <p className="text-white font-display text-lg italic tracking-tight">Robert Carrasco</p>
        </div>
        <div className="w-[1px] h-8 bg-white/10 hidden md:block"></div>
        <div className="text-center md:text-right">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Desarrollo e Ingeniería</p>
            <p className="text-white font-display text-lg italic tracking-tight">Ing. Axel Perez</p>
        </div>
    </div>
);

export default function VenderConNosotrosPage() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { scrollY } = useScroll();
    
    const yHero = useTransform(scrollY, [0, 800], [0, 300]);
    const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);
    const scaleHero = useTransform(scrollY, [0, 400], [1, 1.1]);

    const [formData, setFormData] = useState({
        nombre_completo: "",
        telefono: "",
        bio: "",
        instagram: "",
        facebook: "",
        linkedin: ""
    });

    const steps = [
        { id: 1, title: "Perfil", icon: User },
        { id: 2, title: "Social", icon: Globe },
        { id: 3, title: "Finalizar", icon: ShieldCheck }
    ];

    const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                router.push("/auth/login?returnTo=/vender-con-nosotros");
                return;
            }

            const { error: insertError } = await supabase
                .from("solicitudes_vendedores")
                .insert([{
                    usuario_id: user.id,
                    nombre_completo: formData.nombre_completo,
                    telefono: formData.telefono,
                    bio: formData.bio,
                    social_links: {
                        instagram: formData.instagram,
                        facebook: formData.facebook,
                        linkedin: formData.linkedin
                    }
                }]);

            if (insertError) throw insertError;

            setSubmitted(true);
        } catch (err: unknown) {
            const error = err as Error;
            console.error(error);
            setError(error.message || "Error al enviar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="bg-[#020308] text-white selection:bg-brand-blue selection:text-white">
                {/* ... rest of original page content ... */}
            </div>
        </MainLayout>
    );
}
