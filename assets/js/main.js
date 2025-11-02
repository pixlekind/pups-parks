/* Trial banner — demo via localStorage */
(function initTrialBanner() {
  const banner = document.getElementById('trialBanner');
  const countdown = document.getElementById('trialCountdown');
  const startBtn = document.getElementById('startTrialBtn');
  if (!countdown || !banner) return;

  const now = Date.now();
  let trialEnds = Number(localStorage.getItem('trialEndsAt') || 0);

  const daysLeft = (msLeft) => Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const renderBanner = () => {
    const msLeft = trialEnds - Date.now();
    const d = daysLeft(msLeft);
    if (msLeft > 0) {
      countdown.textContent = `${d} day${d !== 1 ? 's' : ''} left`;
      banner.hidden = false;
    } else {
      banner.hidden = true;
    }
  };

  startBtn?.addEventListener('click', () => {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    trialEnds = Date.now() + sevenDays;
    localStorage.setItem('trialEndsAt', String(trialEnds));
    renderBanner();
    alert('🎉 Your 7‑day free trial has started!');
  });

  if (trialEnds > now) {
    renderBanner();
    setInterval(renderBanner, 60 * 60 * 1000);
  }
})();

/* Feed — local demo storage */
(function initFeed() {
  const form = document.getElementById('postForm');
  const content = document.getElementById('postContent');
  const charCount = document.getElementById('charCount');
  const posts = document.getElementById('posts');
  if (!form || !content || !posts) return;

  const load = () => JSON.parse(localStorage.getItem('pp_posts') || '[]');
  const save = (list) => localStorage.setItem('pp_posts', JSON.stringify(list));

  const render = () => {
    const list = load();
    posts.innerHTML = '';
    list.slice().reverse().forEach((p) => {
      const el = document.createElement('article');
      el.className = `post-card ${p.hidden ? 'hidden' : ''}`;
      el.innerHTML = `
        <div class="post-meta">
          <span>${new Date(p.ts).toLocaleString()}</span>
          <span>by ${p.author || 'Anonymous'}</span>
        </div>
        <p>${p.text}</p>
        <div class="post-actions">
          <button class="pill" data-action="like">🐾 ${p.likes || 0}</button>
          <button class="pill" data-action="cheer">💚 ${p.cheers || 0}</button>
          <button class="pill flag" data-action="flag">Flag</button>
          <button class="pill" data-action="hide">${p.hidden ? 'Unhide' : 'Hide'}</button>
          <button class="pill" data-action="delete">Delete</button>
        </div>
      `;
      el.querySelectorAll('.pill').forEach((btn) => {
        btn.addEventListener('click', () => {
          const action = btn.getAttribute('data-action');
          const listNow = load();
          const idx = listNow.findIndex((i) => i.ts === p.ts);
          const item = listNow[idx];
          if (!item) return;
          if (action === 'like') item.likes = (item.likes || 0) + 1;
          if (action === 'cheer') item.cheers = (item.cheers || 0) + 1;
          if (action === 'flag') alert('Reported — moderators will review.');
          if (action === 'hide') item.hidden = !item.hidden;
          if (action === 'delete') listNow.splice(idx, 1);
          save(listNow);
          render();
        });
      });
      posts.appendChild(el);
    });
  };

  content.addEventListener('input', () => {
    charCount.textContent = `${content.value.length} / ${content.maxLength}`;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = content.value.trim();
    if (!text) return;
    const list = load();
    list.push({ ts: Date.now(), text, likes: 0, cheers: 0, hidden: false, author: 'You' });
    save(list);
    content.value = '';
    charCount.textContent = `0 / ${content.maxLength}`;
    render();
  });

  render();
})();

/* Contact — demo feedback */
(function initContact() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('contactStatus');
  if (!form || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = 'Thanks! We’ll be in touch soon.';
    status.classList.remove('muted');
    setTimeout(() => { status.textContent = ''; }, 4000);
    form.reset();
  });
})();
