"use client";

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface PayPalButtonProps {
    planoId: string;
    monto: number;
    userId: string;
    onSuccess: () => void;
}

export default function PayPalButton({ planoId, monto, userId, onSuccess }: PayPalButtonProps) {
    const [{ isPending }] = usePayPalScriptReducer();
    const [isCapturing, setIsCapturing] = useState(false);

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
                <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                    <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                </div>
            )}
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
            />
        </div>
    );
}
