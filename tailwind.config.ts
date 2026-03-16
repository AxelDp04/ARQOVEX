import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0066FF",
          "blue-dark": "#0044CC",
          "blue-light": "#4D94FF",
          "blue-glow": "#1A6FFF",
          metal: "#6B7280",
          "metal-light": "#9CA3AF",
          "metal-dark": "#374151",
          slate: "#1E2638",
          "slate-dark": "#111827",
          "slate-deeper": "#0A0F1A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-pattern": "radial-gradient(ellipse at 60% 0%, #0066FF22 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, #0044CC15 0%, transparent 50%)",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)",
        "brand-gradient": "linear-gradient(135deg, #0066FF 0%, #0044CC 100%)",
        "metal-gradient": "linear-gradient(135deg, #374151 0%, #1E2638 100%)",
      },
      boxShadow: {
        "blue-glow": "0 0 30px rgba(0, 102, 255, 0.3)",
        "blue-glow-lg": "0 0 60px rgba(0, 102, 255, 0.4)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 8px 40px rgba(0, 102, 255, 0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.6s ease-out",
        "pulse-blue": "pulseBlue 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "bg-float": "bg-float 18s ease-in-out infinite",
        "bg-float-slow": "bg-float-slow 25s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseBlue: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 102, 255, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 102, 255, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "bg-float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(3%, -2%) scale(1.02)" },
          "66%": { transform: "translate(-2%, 2%) scale(0.98)" },
        },
        "bg-float-slow": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(-4%, 3%)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
