import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import PayPalProvider from "@/components/providers/PayPalProvider";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  applicationName: "ARQOVEX",
  title: {
    default: "ARQOVEX | Planos y Consultoría de Ingeniería en RD",
    template: "%s | ARQOVEX",
  },
  description: "ARQOVEX: Expertos en planos arquitectónicos, consultoría de ingeniería y proyectos inmobiliarios en República Dominicana. Innovación, calidad y excelencia.",
  keywords: ["arquitectura rd", "ingeniería dominicana", "planos de casas", "proyectos inmobiliarios", "consultoría ingeniería", "arqovex"],
  openGraph: {
    siteName: "ARQOVEX",
    title: "ARQOVEX | Ingeniería y Arquitectura",
    description: "Expertos en consultoría de ingeniería y planos arquitectónicos en RD.",
    type: "website",
    locale: "es_DO",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`scroll-smooth ${inter.variable} ${outfit.variable}`}>
      <head>
        <meta name="google-site-verification" content="nPeW-sxF1D-RSsaVxaLVd7h9ym_ADh8kFL7q006cFSk" />
      </head>
      <body className="bg-[var(--page-bg)] text-white antialiased font-sans">
        <ToastProvider>
          <PayPalProvider>
            {children}
          </PayPalProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
