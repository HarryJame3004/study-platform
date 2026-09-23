import type { APIRoute } from 'astro';
import { getSubjects } from '../lib/content';

const escapeXml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[character]!);

const validSegment = (segment: unknown): segment is string =>
  typeof segment === 'string' && segment.length > 0 && segment !== '.' && segment !== '..' &&
  !/[\s/?#\\%]/u.test(segment);

function validUrl(path: unknown, origin: URL): string | null {
  if (typeof path !== 'string' || !path || !path.startsWith('/') || !path.endsWith('/') ||
      path.includes('//') || /[\s?#\\]/u.test(path)) return null;

  try {
    const url = new URL(path, origin);
    if (url.origin !== origin.origin || url.pathname !== path || url.search || url.hash) return null;
    return url.href;
  } catch {
    return null;
  }
}

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('http://localhost:4321');
  const subjects = getSubjects();
  const paths = ['/'];
  for (const subject of subjects) {
    if (!validSegment(subject.slug)) continue;
    paths.push(`/subjects/${subject.slug}/`);
    for (const lesson of subject.lessons) {
      if (!validSegment(lesson.slug) || lesson.subjectSlug !== subject.slug) continue;
      const generatedPath = `/subjects/${subject.slug}/lessons/${lesson.slug}/`;
      if (lesson.url === generatedPath) paths.push(generatedPath);
    }
  }
  const urls = [...new Set(paths.map((path) => validUrl(path, origin)).filter((url): url is string => url !== null))]
    .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
