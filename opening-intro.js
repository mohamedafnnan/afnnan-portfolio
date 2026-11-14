(() => {
  const intro = document.querySelector('.opening-intro');
  if (!intro) return;

  const hello = intro.querySelector('.hello-word');
  const skip = intro.querySelector('.opening-skip');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timers = [];
  let dismissed = false;

  const later = (callback, delay) => {
    const id = window.setTimeout(callback, delay);
    timers.push(id);
    return id;
  };

  const reveal = () => {
    if (dismissed) return;
    intro.classList.add('opening-reveal');
    later(() => intro.classList.add('opening-name-reveal'), 650);
    later(() => intro.classList.add('opening-surname-reveal'), 1050);
  };

  const changeGreeting = (word) => {
    if (!hello || dismissed) return;
    hello.classList.add('hello-out');
    later(() => {
      if (dismissed) return;
      hello.textContent = word;
      hello.classList.remove('hello-out');
    }, 220);
  };

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    timers.forEach(window.clearTimeout);
    intro.classList.add('opening-exit');
    later(() => intro.remove(), 850);
  };

  if (reducedMotion) {
    reveal();
    later(dismiss, 1800);
  } else {
    // Let the first frame paint before starting the greeting sequence.
    window.requestAnimationFrame(() => {
      later(() => changeGreeting('നമസ്കാരം'), 950);
      later(() => changeGreeting('السلام عليكم'), 1950);
      later(reveal, 2850);
      later(dismiss, 5900);
    });
  }

  skip?.addEventListener('click', dismiss);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !dismissed) dismiss();
  });
})();
