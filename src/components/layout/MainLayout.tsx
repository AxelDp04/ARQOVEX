import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import dynamic from "next/dynamic";

const BottomNav = dynamic(() => import("@/components/layout/BottomNav"), { ssr: false });
const WhatsAppFloating = dynamic(() => import("@/components/ui/WhatsAppFloating"), { ssr: false });
const AIConcierge = dynamic(() => import("@/components/ai/AIConcierge"), { ssr: false });

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <>
            <div className="print:hidden"><Header /></div>
            <main className="min-h-screen bg-[var(--page-bg)]">{children}</main>
            <div className="print:hidden"><Footer /></div>
            <div className="print:hidden"><WhatsAppFloating /></div>
            <div className="print:hidden"><AIConcierge /></div>
            <div className="print:hidden"><BottomNav /></div>
        </>
    );
}
