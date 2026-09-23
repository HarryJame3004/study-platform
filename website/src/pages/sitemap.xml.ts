import type { APIRoute } from 'astro';
import { getSubjects } from '../lib/content';

const escapeXml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[character]!);

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('http://localhost:4321');
  const subjects = getSubjects();
  const paths = ['/', ...subjects.flatMap((subject) => [
    `/subjects/${subject.slug}/`,
    ...subject.lessons.map((lesson) => lesson.url),
  ])];
  const urls = paths.map((path) => `  <url><loc>${escapeXml(new URL(path, origin).href)}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
