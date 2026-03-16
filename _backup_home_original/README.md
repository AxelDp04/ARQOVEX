# Backup página de inicio ARQOVEX

Copia de la página de inicio y secciones **antes** del rediseño profesional (15 mar 2026).

## Cómo restaurar el diseño original

1. Copia los archivos de esta carpeta de vuelta a su ubicación:
   - `page.tsx` → `src/app/page.tsx`
   - `HeroSection.tsx` → `src/components/sections/HeroSection.tsx`
   - `FeaturesSection.tsx` → `src/components/sections/FeaturesSection.tsx`
   - `StatsSection.tsx` → `src/components/sections/StatsSection.tsx`
   - `FeaturedPlansSection.tsx` → `src/components/sections/FeaturedPlansSection.tsx`
   - `TestimonialsSection.tsx` → `src/components/sections/TestimonialsSection.tsx`
   - `CTASection.tsx` → `src/components/sections/CTASection.tsx`
   - `globals.css` → `src/app/globals.css` (solo si cambiaste estilos globales)

2. O en PowerShell desde la raíz del proyecto:
   ```powershell
   Copy-Item _backup_home_original\page.tsx src\app\page.tsx
   Copy-Item _backup_home_original\sections\*.tsx src\components\sections\
   ```

No borres esta carpeta hasta que confirmes que te gusta el nuevo diseño.
