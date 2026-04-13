"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StepCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  accentColor?: string;
}

export default function StepCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
  accentColor = "#0066FF",
}: StepCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full p-6 text-left rounded-2xl border transition-all duration-300 overflow-hidden group ${
        selected
          ? "bg-white/[0.05] border-[#0066FF] shadow-[0_0_30px_rgba(0,102,255,0.25)]"
          : "bg-white/[0.02] border-white/10 hover:border-white/20"
      }`}
    >
      {/* Background Glow */}
      {selected && (
        <div 
          className="absolute inset-x-0 bottom-0 h-1/2 opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />
      )}

      <div className="relative z-10 flex flex-col gap-4">
        <div 
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
            selected 
              ? "bg-[#0066FF] text-white" 
              : "bg-white/5 text-gray-400 group-hover:text-white"
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>

        <div>
          <h3 className={`font-display font-bold text-lg transition-colors ${
            selected ? "text-white" : "text-gray-200 group-hover:text-white"
          }`}>
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Selected Indicator */}
      {selected && (
        <motion.div 
          layoutId="selected-indicator"
          className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#0066FF] shadow-[0_0_10px_#0066FF]"
        />
      )}
    </motion.button>
  );
}
