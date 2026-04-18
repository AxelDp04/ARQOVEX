import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";
const PAYPAL_API = PAYPAL_MODE === "production" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

async function getPayPalAccessToken() {
    if (!PAYPAL_CLIENT_ID) {
        throw new Error("PAYPAL_CLIENT_ID is missing from environment variables.");
    }
    if (!PAYPAL_SECRET) {
        throw new Error("PAYPAL_SECRET is missing from environment variables. Check Vercel Dashboard.");
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("PayPal Auth Error:", errorData);
        throw new Error(`PayPal Auth Grant Failed: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.access_token;
}

export async function POST(req: Request) {
    let body;
    try {
        body = await req.json();
    } catch (e) {
        console.error("Failed to parse request body:", e);
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { orderID, planoID, userID, monto } = body;

    try {
        if (!orderID || !planoID || !userID) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        const accessToken = await getPayPalAccessToken();

        // Capture the order
        const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const captureData = await captureResponse.json();

        if (captureData.status === "COMPLETED") {
            const supabase = await createClient();

            // 1. Record the sale in ventas_planos
            const { data: saleData, error: dbError } = await supabase
                .from("ventas_planos")
                .insert([{
                    usuario_id: userID,
                    plano_id: planoID,
                    monto_usd: monto,
                    paypal_order_id: orderID,
                    estado_pago: "COMPLETADO",
                    descarga_habilitada: true
                }])
                .select()
                .single();

            if (dbError) {
                console.error("Error al registrar venta en Supabase:", dbError);
                return NextResponse.json({ 
                    status: "COMPLETED", 
                    warning: "Pago capturado pero error al registrar en DB",
                    dbError 
                });
            }

            // 2. SURGICAL AUTOMATION: Create the Payout Request for the Socio
            try {
                // Get the Seller ID from the Plan
                const { data: planoData } = await supabase
                    .from("planos")
                    .select("vendedor_id")
                    .eq("id", planoID)
                    .single();

                if (planoData?.vendedor_id) {
                    // Get Seller payout preferences from their profile
                    const { data: profile } = await supabase
                        .from("perfiles")
                        .select("*")
                        .eq("id", planoData.vendedor_id)
                        .single();

                    if (profile) {
                        // Calculate payout (85%) - Precise for micro-transactions
                        const payoutAmount = Number((monto * 0.85).toFixed(4));
                        
                        // Construct payout method info
                        const metodoInfo = {
                            metodo: profile.metodo_pago || 'paypal',
                            paypal: profile.paypal_email,
                            banco: profile.banco_nombre,
                            cuenta: profile.banco_numero_cuenta,
                            cedula: profile.cedula_identidad
                        };

                        // Insert into payouts_queue
                        await supabase
                            .from("payouts_queue")
                            .insert([{
                                venta_id: saleData.id,
                                vendedor_id: planoData.vendedor_id,
                                monto_payout: payoutAmount,
                                estado: "pendiente",
                                metodo_usado: metodoInfo
                            }]);
                    }
                }
            } catch (automationError) {
                console.error("Surgical Automation Error [Payout Creation]:", automationError);
                // We don't block the response since the sale was successful
            }

            return NextResponse.json({ status: "COMPLETED" });
        } else {
            // Keep error details but don't log the entire object to console if not needed, 
            // though for PayPal errors it might be useful. I'll just remove the log.
            return NextResponse.json({ 
                status: "FAILED", 
                details: captureData,
                debug: {
                    paypalApi: PAYPAL_API,
                    orderID: orderID
                }
            }, { status: 400 });
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Internal API Error [PayPal Capture]:", errorMessage);
        return NextResponse.json({ 
            error: "Error interno del servidor", 
            details: errorMessage 
        }, { status: 500 });
    }
}
