"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  Send, 
  User, 
  Bot, 
  Loader2, 
  MessageSquare,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Sea bienvenido a ARQOVEX. Soy su Concierge IA personal. ¿En qué dimensión de su próximo proyecto arquitectónico puedo asesorarle hoy?" 
    }
  ]);
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializar estado desde sessionStorage sólo una vez después de montar
  useEffect(() => {
    setIsMounted(true);
    
    const savedOpen = sessionStorage.getItem("arqovex_chat_open");
    if (savedOpen === "true") setIsOpen(true);
    
    const savedMessages = sessionStorage.getItem("arqovex_chat_messages");
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filtrar mensajes para asegurar que el 'content' exista (evita crash en renderizado)
          const validMessages = parsed.filter(m => m && typeof m.content === 'string');
          if (validMessages.length > 0) {
            setMessages(validMessages);
          }
        }
      } catch (e) {
        console.error("Error parsing chat state", e);
      }
    }
  }, []);

  // Persistir estado cuando cambia, pero sólo después de montar
  useEffect(() => {
    if (isMounted) sessionStorage.setItem("arqovex_chat_open", String(isOpen));
  }, [isOpen, isMounted]);

  useEffect(() => {
    if (isMounted) sessionStorage.setItem("arqovex_chat_messages", JSON.stringify(messages));
  }, [messages, isMounted]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error("Error en la respuesta del Concierge");

      const data = await response.json();
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "Lo lamento, he tenido una interferencia técnica. ¿Desea que lo conecte directamente con nuestro equipo de ingeniería?" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Evitar renderizado hasta el montaje para seguridad de Hidratación en Next.js
  if (!isMounted) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 left-0 w-[380px] h-[550px] bg-[#020408] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-brand-blue/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center relative">
                  <Sparkles className="w-5 h-5 text-brand-blue" />
                  <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-[#020408]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">ARQO IA</h3>
                  <p className="text-[10px] text-brand-blue font-bold uppercase tracking-widest">Consultor ARQOVEX</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`whitespace-pre-wrap max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-brand-blue text-white rounded-tr-none" 
                      : "bg-white/5 border border-white/5 text-gray-300 rounded-tl-none font-light"
                  }`}>
                    {msg.content.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, index) => {
                      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                      if (match) {
                        return (
                          <Link 
                            key={index} 
                            href={match[2]} 
                            prefetch={true}
                            onClick={() => setIsOpen(false)}
                            className="text-brand-blue font-bold underline hover:text-brand-blue-light transition-colors mx-1"
                          >
                            {match[1]}
                          </Link>
                        );
                      }
                      
                      return (
                        <span key={index}>
                          {part.split(/(\*\*[^*]+\*\*)/g).map((subPart, subIndex) => {
                            if (subPart.startsWith("**") && subPart.endsWith("**")) {
                              return (
                                <strong key={subIndex} className="font-bold text-white">
                                  {subPart.slice(2, -2)}
                                </strong>
                              );
                            }
                            return <span key={subIndex}>{subPart}</span>;
                          })}
                        </span>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 text-brand-blue animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white/[0.02] border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Consulte sobre su proyecto..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-blue/50 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="w-12 h-12 bg-brand-blue rounded-xl flex items-center justify-center text-white hover:bg-brand-blue-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
              <p className="text-[9px] text-center text-gray-600 mt-4 uppercase tracking-[0.2em]">
                Ingeniería Inteligente ARQOVEX
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all ${
          isOpen ? "bg-white/10 text-white" : "bg-brand-blue text-white"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-7 h-7" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-blue-light rounded-full animate-ping opacity-75" />
        )}
      </motion.button>
    </div>
  );
}
