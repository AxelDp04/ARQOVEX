"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, ClipboardList } from "lucide-react";

interface BriefItem {
  label: string;
  value: string | null;
}

interface ProjectBriefSummaryProps {
  items: BriefItem[];
}

export default function ProjectBriefSummary({ items }: ProjectBriefSummaryProps) {
  const completedItems = items.filter(item => item.value !== null);

  return (
    <div className="glass-card p-6 h-fit border-white/5 bg-white/[0.01]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
          <ClipboardList className="w-4 h-4 text-brand-blue" />
        </div>
        <h3 className="font-display font-bold text-white uppercase tracking-wider text-sm">
          Resumen Técnico
        </h3>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="flex justify-between items-start gap-4">
                <span className="text-xs text-gray-500 uppercase tracking-tight">
                  {item.label}
                </span>
                {item.value ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1.5 text-brand-blue"
                  >
                    <Check className="w-3 h-3" />
                  </motion.div>
                ) : (
                  <div className="w-1 h-1 rounded-full bg-white/10 mt-2" />
                )}
              </div>
              <p className={`text-sm mt-1 font-medium transition-colors ${
                item.value ? "text-white" : "text-gray-600 italic"
              }`}>
                {item.value || "Pendiente..."}
              </p>
              {index < items.length - 1 && (
                <div className="h-px bg-white/[0.05] w-full mt-4" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {completedItems.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Progreso del Brief</span>
            <span className="text-brand-blue font-bold">
              {Math.round((completedItems.length / items.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedItems.length / items.length) * 100}%` }}
              className="h-full bg-brand-blue shadow-[0_0_10px_#0066FF]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
