import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
const escape = (s: string) => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
export const GET: APIRoute = async ({ site }) => {
  const pages = await getCollection('pages', ({ data }) => !data.seo?.no_index);
  const posts = await getCollection('blog', ({ data }) => !data.draft && !data.seo?.no_index);
  const urls = [...pages.map(page => page.id === 'index' ? '/' : `/${page.id}/`), ...posts.map(post => `/blog/${post.id}/`)];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(path => `<url><loc>${escape(new URL(path, site).href)}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};
