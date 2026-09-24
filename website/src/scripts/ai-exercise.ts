// AI Exercise Generator: creates fresh practice questions from the ai-exercise Netlify function.
const button = document.querySelector<HTMLButtonElement>('#ai-exercise-button');
const status = document.querySelector<HTMLElement>('#ai-exercise-status');
const result = document.querySelector<HTMLElement>('#ai-exercise-result');

button?.addEventListener('click', async () => {
  if (!status || !result) return;
  const content = [...document.querySelectorAll<HTMLElement>('#lesson-content .prose')]
    .map((section) => section.innerText.trim()).filter(Boolean).join('\n\n');
  button.disabled = true;
  button.textContent = 'Generating…';
  button.setAttribute('aria-expanded', 'true');
  result.hidden = true;
  status.hidden = false;
  status.textContent = 'Creating practice exercises…';

  try {
    const response = await fetch('/.netlify/functions/ai-exercise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not generate practice. Please try again.');
    if (!Array.isArray(data.exercises) || !data.exercises.length ||
        !data.exercises.every((item: { question?: unknown; answer?: unknown; explanation?: unknown }) =>
          typeof item?.question === 'string' && typeof item.answer === 'string' && typeof item.explanation === 'string')) {
      throw new Error('The practice response was incomplete. Please try again.');
    }

    const cards = data.exercises.map((exercise: { question: string; answer: string; explanation: string }, index: number) => {
      const card = document.createElement('article');
      card.className = 'ai-exercise-card';
      const number = document.createElement('span');
      number.className = 'section-kicker';
      number.textContent = `QUESTION ${String(index + 1).padStart(2, '0')}`;
      const question = document.createElement('h3');
      question.textContent = exercise.question;
      const details = document.createElement('details');
      const reveal = document.createElement('summary');
      reveal.textContent = 'Show answer';
      const answer = document.createElement('p');
      const label = document.createElement('strong');
      label.textContent = 'Answer: ';
      answer.append(label, document.createTextNode(exercise.answer));
      const explanation = document.createElement('p');
      explanation.textContent = exercise.explanation;
      details.append(reveal, answer, explanation);
      card.append(number, question, details);
      return card;
    });
    result.replaceChildren(...cards);
    result.hidden = false;
    status.hidden = true;
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Could not generate practice. Please try again.';
  } finally {
    button.disabled = false;
    button.textContent = '📝 Generate Practice';
  }
});

export {};
