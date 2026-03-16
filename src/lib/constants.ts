/**
 * Ruta del logo en la app (carpeta public).
 * Si cambias el archivo del logo en public, actualiza este valor.
 */
export const LOGO_SRC = "/Logo-nuevo.png";

/** URL base del sitio (para emails y enlaces absolutos al logo). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://arqovex.vercel.app";

/** URL completa del logo (para emails). */
export const LOGO_FULL_URL = `${SITE_URL}${LOGO_SRC}`;
