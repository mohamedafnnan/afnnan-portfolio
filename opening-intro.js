(() => {
  const intro = document.querySelector('.opening-intro');
  if (!intro) return;

  const hello = intro.querySelector('.hello-word');
  const skip = intro.querySelector('.opening-skip');
  const voice = intro.querySelector('.opening-voice');
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


  if (voice) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      voice.textContent = 'VOICE NOT AVAILABLE';
      voice.disabled = true;
      voice.title = 'Speech recognition is not supported in this browser.';
    } else {
      voice.addEventListener('click', () => {
        const recognition = new Recognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        voice.textContent = 'LISTENING…';
        voice.disabled = true;
        try {
          recognition.onresult = event => {
            const spoken = event.results[0][0].transcript;
            timers.forEach(window.clearTimeout);
            hello.textContent = /salaam|assalamu/i.test(spoken) ? 'السلام عليكم' : /namask|malayalam/i.test(spoken) ? 'നമസ്കാരം' : 'HELLO';
            hello.classList.remove('hello-out');
            reveal();
            voice.textContent = 'WELCOME';
            later(dismiss, 3600);
          };
          recognition.onerror = () => {
            voice.textContent = 'TRY AGAIN';
            voice.disabled = false;
          };
          recognition.onend = () => { if (!dismissed && voice.textContent === 'LISTENING…') { voice.textContent = 'SAY HELLO'; voice.disabled = false; } };
          recognition.start();
        } catch (error) {
          voice.textContent = 'TRY AGAIN';
          voice.disabled = false;
        }
      });
    }
  }

  skip?.addEventListener('click', dismiss);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !dismissed) dismiss();
  });
})();
