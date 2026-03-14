"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function PayPalProvider({ children }: { children: React.ReactNode }) {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    if (!clientId) {
        console.warn("PayPal Client ID not found. PayPal integration will be disabled.");
        return <>{children}</>;
    }

    return (
        <PayPalScriptProvider
            options={{
                clientId: clientId,
                currency: "USD",
                intent: "capture",
                components: "buttons",
                enableFunding: "card",
                locale: "es_ES",
            }}
        >
            {children}
        </PayPalScriptProvider>
    );
}
