(function () {
const form = document.getElementById('apiKeyInline');
if (!form) return;

const TARGET_URL = form.getAttribute('action')

const successEl = document.getElementById('apiKeyInlineSuccess');
const errorEl = document.getElementById('apiKeyInlineError'); // optional <div id="apiKeyInlineError"></div>

function getField(name) {
    return form.querySelector(`[name="${name}"]`);
}

function showError(msg) {
    if (errorEl) {
    errorEl.textContent = msg || 'An error occurred. Please try again later.';
    errorEl.classList.remove('hidden');
    } else {
    alert(msg || 'An error occurred. Please try again later.');
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect fields explicitly (avoid multipart)
    const email = (getField('email')?.value || '').trim();


    // Very basic client-side check
    if (!email || !email.includes('@')) {
    showError('Please enter a valid email address.');
    return;
    }

    const btn = form.querySelector('button[type="submit"]');
    if (btn?.disabled) return; // guard double clicks

    // Prepare request
    const payload = { email };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s

    if (errorEl) errorEl.classList.add('hidden');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    try {
    const res = await fetch(TARGET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      credentials: 'same-origin', // no cookies sent cross-origin
      signal: controller.signal
    });

    

    // Try to read a JSON error message if not OK
    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      try {
        const data = await res.json();
        if (data?.error || data?.message) message = data.error || data.message;
      } catch {
        try {
          const text = await res.text();
          if (text) message = text.slice(0, 300);
        } catch {}
      }
      throw new Error(message);
    }

    // Success -> hide form, show success
    form.classList.add('hidden');
    successEl?.classList.remove('hidden');
    } catch (err) {
    showError(err?.message || 'Network error. Please try again.');
    } finally {
    clearTimeout(timeout);
    if (btn) { btn.disabled = false; btn.textContent = 'Send Request'; }
    }
});
})();

