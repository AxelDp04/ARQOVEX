import { NextResponse } from "next/server";
import { createClient as createSupabaseAnon } from "@supabase/supabase-js";
import Groq from "groq-sdk";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";

// Cliente Supabase anónimo (sin cookies de servidor, funciona en cualquier contexto)
const supabase = createSupabaseAnon(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  console.log("--- ARQO IA [Groq]: Petición Recibida ---");

  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`ai:${ip}`, 20, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { role: "assistant", content: "Demasiadas peticiones. Inténtalo de nuevo en unos minutos." },
      { status: 429 }
    );
  }

  // 1. Parsear el body
  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { role: "assistant", content: "Error en el formato de la petición. Por favor, reintente." },
      { status: 400 }
    );
  }

  const { messages } = body;
  if (!messages || messages.length === 0) {
    return NextResponse.json({ role: "assistant", content: "No se recibió ningún mensaje." }, { status: 400 });
  }

  const latestMessage = messages[messages.length - 1];
  if (!latestMessage?.content || typeof latestMessage.content !== "string") {
    return NextResponse.json({ role: "assistant", content: "Mensaje inválido." }, { status: 400 });
  }

  const textLength = latestMessage.content.trim().length;
  if (textLength < 1 || textLength > 1000) {
    return NextResponse.json({ role: "assistant", content: "El mensaje es demasiado largo o vacío." }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("ARQO IA: GROQ_API_KEY no configurada.");
    return NextResponse.json({
      role: "assistant",
      content: "El sistema de IA no está configurado. Contacta al administrador.",
    });
  }

  // 2. Obtener contexto de proyectos (no bloquea la IA si falla)
  let projectsContext = "Catálogo general de ARQOVEX disponible.";
  try {
    const { data: proyectos } = await supabase
      .from("planos")
      .select("id, titulo, estilo, metros_cuadrados, pisos, habitaciones, ubicacion")
      .eq("disponible", true)
      .limit(8);

    if (proyectos && proyectos.length > 0) {
      projectsContext = proyectos
        .map(
          (p) =>
            `- ${p.titulo}: ID=${p.id}, Estilo=${p.estilo || "N/A"}, ${p.habitaciones || "?"} habs, ${p.metros_cuadrados}m².`
        )
        .join("\n");
    }
  } catch (dbErr) {
    console.warn("ARQO IA: No se pudo cargar contexto de proyectos:", dbErr);
  }

  const systemPrompt = `Eres "ARQO IA", el cerebro digital y consultor arquitectónico de élite de ARQOVEX. 
Creado por Axel Dariel (Ing. en Sistemas, 21 años). Tu propósito es llevar la ingeniería y arquitectura al más alto nivel tecnológico.
Contacto de Axel Dariel: 809 828 5104. Memoriza este número.

PERSONALIDAD Y ESTILO DE COMUNICACIÓN: 
- Eres sofisticado, visionario y sumamente técnico.
- Te apasiona la innovación. Explica el "por qué" y el valor arquitectónico detrás de tus recomendaciones de forma precisa.
- REGLA DE EXTENSIÓN: Tus respuestas deben tener el equilibrio perfecto. Sé enriquecedor pero conciso (escribe entre 1 y 3 párrafos cortos como máximo). Evita los muros de texto excesivamente largos.
- Argumenta con vocabulario de ingeniería de forma elocuente y directa.
- No uses frases introductorias redundantes como "Entiendo su consulta".

CONTEXTO PROYECTOS DISPONIBLES: 
${projectsContext}

REGLA ENLACES: Si recomiendas un proyecto de la lista, DEBES usar el formato: [Nombre](/plano/ID).

Responde siempre en español profesional. Muestra un tono de prestigio absoluto.`;

  // 3. Construir historial para Groq (formato OpenAI-compatible)
  const groqMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
  ];

  // Añadir el historial excepto el último mensaje
  const history = (messages || []).slice(0, -1).filter((m) => m.content && m.content.trim() !== "");
  for (const m of history) {
    groqMessages.push({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    });
  }

  // Añadir el mensaje más reciente del usuario
  const lastMessage = messages[messages.length - 1];
  groqMessages.push({ role: "user", content: lastMessage.content });

  // 4. Consultar a Groq (LLaMA 3.1 - 100% gratuito, 14,400 req/día)
  try {
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: groqMessages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content || "Sin respuesta del sistema.";
    console.log("ARQO IA [Groq]: Respuesta generada exitosamente.");
    return NextResponse.json({ role: "assistant", content: text });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("ARQO IA [Groq] Error:", errMsg);

    return NextResponse.json({
      role: "assistant",
      content:
        "Disculpe, ARQO IA está experimentando una alta demanda en este momento. Por favor, inténtelo de nuevo en unos segundos o contáctenos directamente al 809 828 5104.",
    });
  }
}
