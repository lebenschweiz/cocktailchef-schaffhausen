// Menü auf dem Handy
const header = document.querySelector('.header');
const burger = document.querySelector('.burger');
burger.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.mobile-nav a').forEach(a => a.addEventListener('click', () => header.classList.remove('open')));

// Studio-Fotos: laufen ständig langsam durch wie im Original, Pfeile springen weiter
const track = document.querySelector('.studio .track');
if (track) {
  // Bilder verdoppeln, damit das Band endlos weiterläuft
  [...track.children].forEach(img => track.appendChild(img.cloneNode(true)));
  const speed = 120; // Pixel pro Sekunde
  let paused = false, last = performance.now(), pos = 0;
  const half = () => track.scrollWidth / 2;
  const tick = now => {
    const dt = (now - last) / 1000; last = now;
    if (!paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pos += speed * dt;
      if (pos >= half()) pos -= half();
      track.scrollLeft = pos;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  track.addEventListener('mouseenter', () => paused = true);
  track.addEventListener('mouseleave', () => { paused = false; pos = track.scrollLeft; });
  track.addEventListener('touchstart', () => paused = true, { passive: true });
  track.addEventListener('touchend', () => setTimeout(() => { pos = track.scrollLeft; paused = false; }, 1500));
  const jump = dir => {
    paused = true;
    track.scrollBy({ left: dir * track.clientWidth * 0.6, behavior: 'smooth' });
    setTimeout(() => { pos = track.scrollLeft; if (pos >= half()) pos -= half(); paused = false; }, 700);
  };
  document.querySelector('.studio .prev').addEventListener('click', () => jump(-1));
  document.querySelector('.studio .next').addEventListener('click', () => jump(1));
}

// Vorher-Nachher-Slider auf der Startseite
const slides = document.querySelectorAll('.vn .slides img');
if (slides.length) {
  let i = 0;
  const show = n => {
    slides[i].classList.remove('on');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('on');
  };
  document.querySelector('.vn-prev').addEventListener('click', () => show(i - 1));
  document.querySelector('.vn-next').addEventListener('click', () => show(i + 1));
}

// FAQ: immer nur eine Antwort offen, wie im Original
const faqs = document.querySelectorAll('.faq details');
faqs.forEach(d => d.addEventListener('toggle', () => {
  if (d.open) faqs.forEach(o => { if (o !== d) o.open = false; });
}));

// Galerie-Videos: Klick startet und stoppt
document.querySelectorAll('.galerie-grid .vid').forEach(box => {
  const v = box.querySelector('video');
  box.addEventListener('click', () => {
    if (v.paused) { v.play(); box.classList.add('playing'); }
    else { v.pause(); box.classList.remove('playing'); }
  });
});

// Formulare öffnen eine fertige E-Mail an Erika
document.querySelectorAll('form[data-mail]').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const lines = [];
    for (const [k, v] of data) if (v) lines.push(`${k}: ${v}`);
    const subject = encodeURIComponent(form.dataset.mail);
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:erika.hartung.2022@gmail.com?subject=${subject}&body=${body}`;
  });
});

// Einblend-Effekte beim Scrollen, wie auf der bisherigen Seite
const animTargets = {
  reveal: '.warum-head',
  glide: '.kontakt .title',
  expand: '.header .logo, .header .nav, .header .btn, .title, .lead, main .btn, .leistungen li, .leistungen .media, .ueber .portrait, .ueber .text, .ueber .cert, .warum .cols > div, .price-box, .card, .g-intro, .g-badge, .videos video, .faq details, .vn .slider, .form, .contact-lines, .map, .footer .grid > *, .behandlungen > div, .kicker, .page-title, .galerie-grid > *, .vn-grid img'
};
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('anim');
  const seen = new Set();
  for (const [type, sel] of Object.entries(animTargets)) {
    document.querySelectorAll(sel).forEach(el => {
      if (seen.has(el) || el.closest('[data-anim]')) return;
      seen.add(el);
      el.dataset.anim = type;
    });
  }
  // Nach dem Einblenden die Effekt-Klassen entfernen, damit der Zoom beim Überfahren wieder greift
  const done = el => { delete el.dataset.anim; el.classList.remove('in'); };
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    (watched.get(e.target) || []).forEach(el => {
      el.classList.add('in');
      setTimeout(() => done(el), 1300);
    });
  }), { threshold: 0.1 });
  // Aufgedeckte oder hineingleitende Elemente sind vorher unsichtbar, darum wird ihr Elternelement beobachtet
  const watched = new Map();
  seen.forEach(el => {
    const target = el.dataset.anim === 'expand' ? el : el.parentElement;
    watched.set(target, [...(watched.get(target) || []), el]);
    io.observe(target);
  });
}

// Bild gross anzeigen (z. B. Zertifikat)
const zoomImgs = document.querySelectorAll('img[data-zoom]');
if (zoomImgs.length) {
  const box = document.createElement('dialog');
  box.className = 'lightbox';
  box.innerHTML = '<button class="close" aria-label="Schliessen">×</button><img alt="">';
  document.body.appendChild(box);
  const big = box.querySelector('img');
  const open = img => {
    big.src = img.currentSrc || img.src; big.alt = img.alt;
    if (typeof box.showModal === 'function') box.showModal(); else window.open(big.src, '_blank');
  };
  box.addEventListener('click', () => box.close());
  zoomImgs.forEach(img => {
    img.addEventListener('click', () => open(img));
    img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); } });
  });
}

// «Jetzt buchen»: Zonen auswählen, dann WhatsApp mit fertiger Nachricht
const bookLinks = document.querySelectorAll('a[href^="https://wa.me/"][href*="?text="]');
if (bookLinks.length && typeof HTMLDialogElement === 'function') {
  const phone = '41782235962';
  const intro = 'Hallo, ich möchte einen Termin für eine Laser-Haarentfernung vereinbaren.';
  const groups = [
    ['Einzelne Zonen', [['Beine komplett', '110 CHF'], ['Beine bis & inkl. Knie', '90 CHF'], ['Bikinizone inkl. Intimbereich', '65 CHF'], ['Bikinizone', '40 CHF'], ['Achseln', '40 CHF'], ['Bauchregion', '40 CHF'], ['Arme komplett', '50 CHF']]],
    ['Pakete', [['Intim komplett und Achseln', '100 CHF'], ['Intim komplett, Achseln und halbe Beine', '170 CHF'], ['Intim komplett, Achseln und ganze Beine', '190 CHF'], ['Ganzer Körper (5 Zonen)', '250 CHF']]]
  ];
  const esc = t => t.replace(/&/g, '&amp;');
  const dlg = document.createElement('dialog');
  dlg.className = 'book-dialog';
  dlg.innerHTML = `
    <button class="close" type="button" aria-label="Schliessen">×</button>
    <h2>Termin buchen</h2>
    <p>Welche Zonen möchten Sie behandeln lassen?</p>
    ${groups.map(([title, items]) => `<fieldset><legend>${title}</legend>${items.map(([z, p]) =>
      `<label><input type="checkbox" value="${esc(z)}"><span>${esc(z)}</span><em>${p}</em></label>`).join('')}</fieldset>`).join('')}
    <fieldset class="q"><legend>Machen Sie zum ersten Mal eine Laser-Haarentfernung?</legend>
      <div class="yn"><label><input type="radio" name="q1" value="Ja"><span>Ja</span></label><label><input type="radio" name="q1" value="Nein"><span>Nein</span></label></div></fieldset>
    <fieldset class="q"><legend>Haben Sie irgendwelche Kontraindikationen?</legend>
      <div class="yn"><label><input type="radio" name="q2" value="Ja"><span>Ja</span></label><label><input type="radio" name="q2" value="Nein"><span>Nein</span></label></div>
      <input class="q2-text" type="text" placeholder="Welche? (optional)" hidden>
      <a class="q-info" href="index.html#faq">Liste der Kontraindikationen ansehen</a></fieldset>
    <a class="btn wa-go" target="_blank" rel="noopener">Weiter zu WhatsApp</a>
    <small>Noch unsicher? Einfach ohne Auswahl weiter, Erika berät Sie gerne.</small>`;
  document.body.appendChild(dlg);
  const go = dlg.querySelector('.wa-go');
  const boxes = [...dlg.querySelectorAll('input[type=checkbox]')];
  const q2text = dlg.querySelector('.q2-text');
  const val = n => (dlg.querySelector(`input[name=${n}]:checked`) || {}).value;
  const update = () => {
    const chosen = boxes.filter(b => b.checked).map(b => b.value);
    const lines = [intro];
    if (chosen.length) lines.push(`Zonen: ${chosen.join(', ')}`);
    const q1 = val('q1'), q2 = val('q2');
    q2text.hidden = q2 !== 'Ja';
    if (q1) lines.push(`Zum ersten Mal Laser-Haarentfernung: ${q1}`);
    if (q2) lines.push(`Kontraindikationen: ${q2}${q2 === 'Ja' && q2text.value.trim() ? ' (' + q2text.value.trim() + ')' : ''}`);
    const text = lines.join('\n');
    go.href = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    go.textContent = chosen.length ? `Weiter zu WhatsApp (${chosen.length})` : 'Weiter zu WhatsApp';
  };
  boxes.forEach(b => b.addEventListener('change', update));
  dlg.querySelectorAll('input[type=radio]').forEach(r => r.addEventListener('change', update));
  q2text.addEventListener('input', update);
  dlg.querySelector('.q-info').addEventListener('click', () => dlg.close());
  update();
  dlg.querySelector('.close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  go.addEventListener('click', () => setTimeout(() => dlg.close(), 100));
  bookLinks.forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    header.classList.remove('open');
    dlg.showModal();
  }));
}
