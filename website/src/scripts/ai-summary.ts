// AI Summary: requests a bilingual lesson recap from the ai-summary Netlify function.
const button = document.querySelector<HTMLButtonElement>('#ai-summary-button');
const card = document.querySelector<HTMLElement>('#ai-summary-card');
const status = document.querySelector<HTMLElement>('#ai-summary-status');
const result = document.querySelector<HTMLElement>('#ai-summary-result');

type SummarySection = { summary: string; keyPoints: string[]; importantConcepts: string[] };

function validSummary(value: unknown): value is SummarySection {
  if (!value || typeof value !== 'object') return false;
  const section = value as Partial<SummarySection>;
  return typeof section.summary === 'string' && !!section.summary.trim() &&
    Array.isArray(section.keyPoints) && section.keyPoints.every((item) => typeof item === 'string') &&
    Array.isArray(section.importantConcepts) && section.importantConcepts.every((item) => typeof item === 'string');
}

function showItems(list: HTMLUListElement, items: string[]) {
  list.replaceChildren(...items.map((item) => {
    const row = document.createElement('li');
    row.textContent = item;
    return row;
  }));
}

function renderSummary(section: SummarySection, language: 'vi' | 'en'): boolean {
  const text = document.querySelector<HTMLElement>(`#ai-summary-${language}-text`);
  const points = document.querySelector<HTMLUListElement>(`#ai-summary-${language}-points`);
  const concepts = document.querySelector<HTMLUListElement>(`#ai-summary-${language}-concepts`);
  if (!text || !points || !concepts) return false;
  text.textContent = section.summary;
  showItems(points, section.keyPoints);
  showItems(concepts, section.importantConcepts);
  return true;
}

button?.addEventListener('click', async () => {
  if (!card || !status || !result) return;
  const content = [...document.querySelectorAll<HTMLElement>('#lesson-content .prose')]
    .map((section) => section.innerText.trim()).filter(Boolean).join('\n\n');
  card.hidden = false;
  button.setAttribute('aria-expanded', 'true');
  button.disabled = true;
  button.textContent = 'Generating…';
  result.hidden = true;
  status.hidden = false;
  status.textContent = 'Creating your lesson summary…';

  try {
    const response = await fetch('/.netlify/functions/ai-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Could not create a summary. Please try again.');
    if (!validSummary(data?.vietnamese) || !validSummary(data?.english) ||
        !renderSummary(data.vietnamese, 'vi') || !renderSummary(data.english, 'en')) {
      throw new Error('The summary response was incomplete. Please try again.');
    }
    result.hidden = false;
    status.hidden = true;
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Could not create a summary. Please try again.';
  } finally {
    button.disabled = false;
    button.textContent = '✨ AI Summary';
  }
});

export {};
