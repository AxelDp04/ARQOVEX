import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { articles } from '@/data/blog-articles';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://arqovex.vercel.app';
  const supabase = await createClient();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/nosotros',
    '/blog',
    '/vender',
    '/catalogo',
    '/inmobiliaria',
    '/arquitectura',
    '/contacto',
    '/privacidad',
    '/terminos',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic Blog routes
  const blogRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Dynamic Property routes
  const { data: planos } = await supabase.from('planos').select('id, created_at');
  const propertyRoutes: MetadataRoute.Sitemap = (planos || []).map((plano) => ({
    url: `${baseUrl}/plano/${plano.id}`,
    lastModified: new Date(plano.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes, ...propertyRoutes];
}
