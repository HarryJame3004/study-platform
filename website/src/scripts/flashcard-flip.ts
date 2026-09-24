// Flashcard flip interaction: click or Enter/Space turns a card over.
// The spaced repetition recorder lives in study/srs-recorder.ts and reads these flips.
document.querySelectorAll<HTMLElement>('.flashcard').forEach((card) => {
  const flip = () => {
    const flipped = card.dataset.flipped !== 'true';
    card.dataset.flipped = String(flipped);
    card.setAttribute('aria-pressed', String(flipped));
    const index = [...card.parentElement!.children].indexOf(card) + 1;
    card.setAttribute('aria-label', `Card ${index}: show ${flipped ? 'question' : 'answer'}`);
    card.querySelector('.flashcard-front')?.setAttribute('aria-hidden', String(flipped));
    card.querySelector('.flashcard-back')?.setAttribute('aria-hidden', String(!flipped));
  };
  card.addEventListener('click', flip);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      flip();
    }
  });
});

export {};
