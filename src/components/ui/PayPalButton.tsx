"use client";

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

interface PayPalButtonProps {
    planoId: string;
    monto: number;
    userId: string;
    onSuccess: () => void;
}

export default function PayPalButton({ planoId, monto, userId, onSuccess }: PayPalButtonProps) {
    const [{ isPending }] = usePayPalScriptReducer();
    const [isCapturing, setIsCapturing] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [turnstileStatus, setTurnstileStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    // Site Key de Cloudflare Turnstile
    const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

    // Debug log para verificar que la llave llega al cliente
    console.log("Turnstile Site Key Status:", SITE_KEY === "1x00000000000000000000AA" ? "Using Testing Key" : "Using Production Key");

    if (isPending) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative z-0">
            {isCapturing && (
                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
                    <Loader2 className="w-8 h-8 text-brand-blue animate-spin mb-2" />
                    <p className="text-sm font-medium text-slate-600">Procesando pago...</p>
                </div>
            )}

            {/* Filtro Anti-Bots (Turnstile) */}
            {!turnstileToken && (
                <div className="mb-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-slate-700">
                            <ShieldCheck className={`w-5 h-5 ${turnstileStatus === 'error' ? 'text-red-500' : 'text-emerald-500'}`} />
                            <span className="text-sm font-semibold">Verificación de seguridad</span>
                        </div>
                        {turnstileStatus === 'loading' && (
                            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                        )}
                    </div>
                    
                    <div className="min-h-[65px] flex items-center justify-center bg-white rounded-lg border border-dashed border-slate-200">
                        <Turnstile 
                            siteKey={SITE_KEY}
                            onSuccess={(token) => {
                                setTurnstileToken(token);
                                setTurnstileStatus('ready');
                            }}
                            onError={(err) => {
                                console.error("Turnstile Error:", err);
                                setTurnstileStatus('error');
                            }}
                            onExpire={() => {
                                setTurnstileToken(null);
                                setTurnstileStatus('loading');
                            }}
                            onLoad={() => setTurnstileStatus('ready')}
                            options={{
                                theme: 'light',
                                size: 'normal',
                            }}
                        />
                    </div>
                    
                    {turnstileStatus === 'error' ? (
                        <p className="mt-2 text-xs text-red-500 font-medium">
                            Error al cargar la seguridad. Por favor, refresca la página o desactiva tu bloqueador de anuncios.
                        </p>
                    ) : (
                        <p className="mt-2 text-xs text-slate-500">
                            Completa la verificación para habilitar el pago.
                        </p>
                    )}
                </div>
            )}

            {turnstileToken && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <PayPalButtons
                style={{
                    layout: "vertical",
                    color: "gold",
                    shape: "rect",
                    label: "pay",
                }}
                createOrder={(data, actions) => {
                    return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                            {
                                amount: {
                                    currency_code: "USD",
                                    value: monto.toString(),
                                },
                                description: `Plano Arquitectónico - ID: ${planoId}`,
                            },
                        ],
                        application_context: {
                            shipping_preference: "NO_SHIPPING",
                            user_action: "PAY_NOW",
                            brand_name: "ARQOVEX",
                        },
                    });
                }}
                onApprove={async (data) => {
                    setIsCapturing(true);
                    try {
                        const response = await fetch("/api/paypal/capture", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                orderID: data.orderID,
                                planoID: planoId,
                                userID: userId,
                                monto: monto,
                                turnstileToken: turnstileToken, // Enviamos el token para validación en el servidor
                            }),
                        });

                        const captureData = await response.json();

                        if (captureData.status === "COMPLETED") {
                            onSuccess();
                        } else {
                            alert("Hubo un error al procesar el pago. Por favor contacta a soporte.");
                        }
                    } catch (error) {
                        console.error("Capture Error:", error);
                        alert("Error de conexión al procesar el pago.");
                    } finally {
                        setIsCapturing(false);
                    }
                }}
                onError={(err) => {
                    console.error("PayPal Error:", err);
                    alert("Error en la pasarela de PayPal. Intenta de nuevo.");
                }}
            )}
        </div>
    );
}
