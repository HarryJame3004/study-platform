import { guard } from './_ai-guard.js';
import { cacheGet, cacheSet } from './_ai-cache.js';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';
const MAX_CONTENT_LENGTH = 30_000;

function json(data, status = 200, extraHeaders = {}) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

export default async function aiExercise(request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  if (request.method !== 'POST') {
    return json({ error: 'Use POST to generate practice exercises.' }, 405, { Allow: 'POST' });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Send valid JSON with lesson content.' }, 400);
  }

  const content = typeof payload?.content === 'string' ? payload.content.trim() : '';
  if (!content || content.length > MAX_CONTENT_LENGTH) {
    return json({ error: 'Lesson content must be between 1 and 30,000 characters.' }, 400);
  }

  const cached = await cacheGet('exercise', { content });
  if (cached) return json({ ...cached, cached: true });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json({ error: 'Practice generation is not configured.' }, 503);

  const prompt = [
    'Create four varied practice exercises for a student based only on the lesson below.',
    '',
    'For each exercise provide:',
    '- question',
    '- correct answer',
    '- short explanation',
    '',
    'The exercises should test understanding, not just memorization.',
    '',
    'LESSON:',
    '',
    content,
  ].join('\n');

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      signal: AbortSignal.timeout(25_000),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              exercises: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    question: { type: 'STRING' },
                    answer: { type: 'STRING' },
                    explanation: { type: 'STRING' },
                  },
                  required: ['question', 'answer', 'explanation'],
                },
              },
            },
            required: ['exercises'],
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return json({ error: 'Gemini API error', details: errorText }, 502);
    }

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '').join('') ?? '';
    const generated = JSON.parse(generatedText);

    if (
      !Array.isArray(generated.exercises) ||
      generated.exercises.length === 0 ||
      !generated.exercises.every(
        (exercise) =>
          exercise &&
          typeof exercise.question === 'string' &&
          exercise.question.trim() &&
          typeof exercise.answer === 'string' &&
          exercise.answer.trim() &&
          typeof exercise.explanation === 'string' &&
          exercise.explanation.trim(),
      )
    ) {
      return json({ error: 'Practice generation returned an incomplete result.' }, 502);
    }

    const data = {
      exercises: generated.exercises.slice(0, 6).map((exercise) => ({
        question: exercise.question.trim(),
        answer: exercise.answer.trim(),
        explanation: exercise.explanation.trim(),
      })),
    };
    await cacheSet('exercise', { content }, data);
    return json(data);
  } catch {
    return json({ error: 'Practice generation failed. Please try again.' }, 502);
  }
}
