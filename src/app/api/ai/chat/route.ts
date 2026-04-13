import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  console.log("--- ARQO IA: Petición Recibida ---");
  
  try {
    // 1. Obtener y validar el cuerpo de la petición
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Error al parsear JSON del body:", parseError);
      return NextResponse.json({ role: "assistant", content: "Error en el formato de la petición. Por favor, reintente." }, { status: 400 });
    }

    const { messages } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("error: GEMINI_API_KEY is missing");
      return NextResponse.json({ role: "assistant", content: "El sistema no está configurado (API Key ausente)." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const supabase = await createClient();
    
    // 2. Obtener contexto de base de datos
    const { data: proyectos } = await supabase
      .from("planos")
      .select("id, titulo, estilo, metros_cuadrados, pisos, habitaciones, ubicacion")
      .limit(8);

    const projectsContext = proyectos && proyectos.length > 0
      ? proyectos.map(p => `- ${p.titulo}: ID=${p.id}, Estilo=${p.estilo}, ${p.habitaciones || '?'} habs, ${p.metros_cuadrados}m².`).join("\n")
      : "Catálogo general de ARQOVEX disponible.";

    const systemInstruction = `
Eres "ARQO IA", el cerebro digital y consultor arquitectónico de élite de ARQOVEX. 
Creado por Axel Dariel (Ing. en Sistemas, 21 años). Tu propósito es llevar la ingeniería y arquitectura al más alto nivel tecnológico.
Contacto de Axel Dariel: 809 828 5104. Memoriza este número.

PERSONALIDAD Y ESTILO DE COMUNICACIÓN: 
- Eres sofisticado, visionario y sumamente técnico.
- Te apasiona la innovación. Explica el "por qué" y el valor arquitectónico detrás de tus recomendaciones de forma precisa.
- **REGLA DE EXTENSIÓN:** Tus respuestas deben tener el equilibrio perfecto. Sé enriquecedor pero **conciso** (escribe entre 1 y 3 párrafos cortos como máximo). Evita los muros de texto excesivamente largos.
- Argumenta con vocabulario de ingeniería de forma elocuente y directa.
- No uses frases introductorias redundantes como "Entiendo su consulta".

CONTEXTO PROYECTOS DISPONIBLES: 
${projectsContext}

REGLA ENLACES: Si recomiendas un proyecto de la lista, DEBES usar el formato: [Nombre](/plano/ID).

Responde siempre en español profesional. Muestra un tono de prestigio absoluto.
`;

    // 3. Consultar a Gemini
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction 
    });

    let history = (messages || []).slice(0, -1)
      .filter((m: any) => m.content && m.content.trim() !== "")
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    // Gemini exige que el historial empiece con 'user'. Si empieza con 'model', lo removemos.
    if (history.length > 0 && history[0].role === "model") {
      history.shift();
    }

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    console.log("ARQO IA: Respuesta generada exitosamente.");
    return NextResponse.json({ role: "assistant", content: text });

  } catch (error: any) {
    console.error("ARQO IA Gemini Error Detail:", error.message || error);
    return NextResponse.json({ 
      role: "assistant", 
      content: "Disculpe, mi sistema ha tenido una interferencia técnica momentánea. Como asistente de ARQOVEX, le recomiendo contactar directamente al equipo de Axel Dariel para una respuesta inmediata." 
    });
  }
}
