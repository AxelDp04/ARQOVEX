import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import WhatsAppFloating from "@/components/ui/WhatsAppFloating";

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-[var(--page-bg)]">{children}</main>
            <Footer />
            <WhatsAppFloating />
            <React.Suspense fallback={null}>
                <BottomNav />
            </React.Suspense>
        </>
    );
}
