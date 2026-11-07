(() => {
  const theme = document.getElementById('theme');
  function applyTheme(dark) {
    document.body.classList.toggle('dark', dark);
    theme.setAttribute('aria-pressed', String(dark));
    theme.textContent = dark ? '☀ Light' : '☾ Dark';
  }
  try {
    applyTheme(localStorage.getItem('db-dark') === '1');
    theme.hidden = false;
    theme.addEventListener('click', () => {
      const dark = !document.body.classList.contains('dark');
      localStorage.setItem('db-dark', dark ? '1' : '0');
      applyTheme(dark);
    });
  } catch {
    // Keep the default theme if browser storage is blocked.
  }

  if (typeof AbortSignal === 'undefined' || !AbortSignal.timeout) return;

  for (const form of document.querySelectorAll('.contact-form')) {
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('[role="status"]');

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (button.disabled) return;

      const data = new FormData(form);
      button.disabled = true;
      status.dataset.state = 'pending';
      status.textContent = 'Sending…';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
          signal: AbortSignal.timeout(15000)
        });
        if (!response.ok) {
          status.dataset.state = 'error';
          status.textContent = response.status === 429
            ? 'The form is busy. Your text is still here. Please wait a moment and try again.'
            : 'The form could not accept your message. Your text is still here. Please try again later.';
          return;
        }

        const result = await response.json();
        if (result.errors?.length || result.error || result.ok === false) {
          throw new Error('Formspree returned a submission error');
        }
        form.reset();
        status.dataset.state = 'success';
        status.textContent = 'Thank you. Your message was sent.';
      } catch {
        status.dataset.state = 'error';
        status.textContent = 'We could not confirm your message was sent. Your text is still here. Please check your connection before trying again.';
      } finally {
        button.disabled = false;
      }
    });
  }
})();
