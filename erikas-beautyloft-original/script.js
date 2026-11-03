// Immer über HTTPS
if (location.protocol === 'http:' && /erikas-beautyloft\.ch$/.test(location.hostname)) location.replace('https:' + location.href.slice(5));

// Übersetzungen (DE ist die Grundsprache, EN/RU kommen aus i18n/ui.js)
const T = s => ((window.I18N_UI || {})[s]) || s;

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
  box.innerHTML = '<button class="close" aria-label="' + T('Schliessen') + '">×</button><img alt="">';
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
  const intro = T('Hallo, ich möchte einen Termin für eine Laser-Haarentfernung vereinbaren.');
  const groups = [
    ['Einzelne Zonen', [['Achseln', '40 CHF'], ['Bikinizone', '40 CHF'], ['Bauchregion', '40 CHF'], ['Arme komplett', '50 CHF'], ['Bikinizone inkl. Intimbereich', '65 CHF'], ['Beine bis & inkl. Knie', '90 CHF'], ['Beine komplett', '110 CHF']]],
    ['Pakete', [['Intim komplett und Achseln', '100 CHF'], ['Intim komplett, Achseln und halbe Beine', '170 CHF'], ['Intim komplett, Achseln und ganze Beine', '190 CHF'], ['Ganzer Körper (5 Zonen)', '250 CHF']]]
  ];
  const esc = t => t.replace(/&/g, '&amp;');
  const dlg = document.createElement('dialog');
  dlg.className = 'book-dialog';
  dlg.innerHTML = `
    <button class="close" type="button" aria-label="${T('Schliessen')}">×</button>
    <h2>${T('Termin buchen')}</h2>
    <fieldset class="q q-name"><legend>${T('Wie heissen Sie?')}</legend>
      <input class="q-name-input" type="text" placeholder="${T('Vorname und Nachname')}" autocomplete="name"></fieldset>
    <p>${T('Welche Zonen möchten Sie behandeln lassen?')}</p>
    ${groups.map(([title, items]) => `<fieldset><legend>${T(title)}</legend>${items.map(([z, p]) =>
      `<label><input type="checkbox" value="${esc(z)}"><span>${esc(T(z))}</span><em>${p}</em></label>`).join('')}</fieldset>`).join('')}
    <fieldset class="q"><legend>${T('Machen Sie zum ersten Mal eine Laser-Haarentfernung?')}</legend>
      <div class="yn"><label><input type="radio" name="q1" value="Ja"><span>${T('Ja')}</span></label><label><input type="radio" name="q1" value="Nein"><span>${T('Nein')}</span></label></div></fieldset>
    <fieldset class="q"><legend>${T('Haben Sie irgendwelche Kontraindikationen?')}</legend>
      <div class="yn"><label><input type="radio" name="q2" value="Ja"><span>${T('Ja')}</span></label><label><input type="radio" name="q2" value="Nein"><span>${T('Nein')}</span></label></div>
      <input class="q2-text" type="text" placeholder="${T('Welche? (optional)')}" hidden>
      <a class="q-info" href="index.html#faq">${T('Liste der Kontraindikationen ansehen')}</a></fieldset>
    <fieldset class="q"><legend>${T('Wann möchten Sie gerne einen Termin vereinbaren?')}</legend>
      <div class="yn chips"><label><input type="radio" name="q3" value="So bald wie möglich"><span>${T('So bald wie möglich')}</span></label><label><input type="radio" name="q3" value="Diese Woche"><span>${T('Diese Woche')}</span></label><label><input type="radio" name="q3" value="Nächste Woche"><span>${T('Nächste Woche')}</span></label><label><input type="radio" name="q3" value="Wunschdatum"><span>${T('Wunschdatum')}</span></label></div>
      <input class="q3-date" type="date" hidden>
      <p class="q-sub">${T('Bevorzugte Tageszeit')}</p>
      <div class="yn chips"><label><input type="radio" name="q4" value="Vormittag"><span>${T('Vormittag')}</span></label><label><input type="radio" name="q4" value="Nachmittag"><span>${T('Nachmittag')}</span></label><label><input type="radio" name="q4" value="Abend"><span>${T('Abend')}</span></label></div></fieldset>
    <a class="btn wa-go" target="_blank" rel="noopener">${T('Weiter zu WhatsApp')}</a>
    <small>${T('Noch unsicher? Einfach ohne Auswahl weiter, Erika berät Sie gerne.')}</small>`;
  document.body.appendChild(dlg);
  const go = dlg.querySelector('.wa-go');
  const boxes = [...dlg.querySelectorAll('input[type=checkbox]')];
  const q2text = dlg.querySelector('.q2-text');
  const nameIn = dlg.querySelector('.q-name-input');
  const q3date = dlg.querySelector('.q3-date');
  q3date.min = new Date().toISOString().slice(0, 10);
  const val = n => (dlg.querySelector(`input[name=${n}]:checked`) || {}).value;
  const update = () => {
    const chosen = boxes.filter(b => b.checked).map(b => b.value);
    const nm = nameIn.value.trim();
    const lines = [nm ? T('Hallo, ich heisse {n} und möchte einen Termin für eine Laser-Haarentfernung vereinbaren.').replace('{n}', nm) : intro];
    if (chosen.length) lines.push(`${T('Zonen')}: ${chosen.map(T).join(', ')}`);
    const q1 = val('q1'), q2 = val('q2');
    q2text.hidden = q2 !== 'Ja';
    if (q1) lines.push(`${T('Zum ersten Mal Laser-Haarentfernung')}: ${T(q1)}`);
    if (q2) lines.push(`${T('Kontraindikationen')}: ${T(q2)}${q2 === 'Ja' && q2text.value.trim() ? ' (' + q2text.value.trim() + ')' : ''}`);
    const q3 = val('q3'), q4 = val('q4');
    q3date.hidden = q3 !== 'Wunschdatum';
    let when = q3 === 'Wunschdatum' ? (q3date.value ? q3date.value.split('-').reverse().join('.') : '') : (q3 ? T(q3) : '');
    if (q4) when = when ? `${when}, ${T(q4)}` : T(q4);
    if (when) lines.push(`${T('Gewünschter Termin')}: ${when}`);
    const text = lines.join('\n');
    go.href = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    go.textContent = chosen.length ? `${T('Weiter zu WhatsApp')} (${chosen.length})` : T('Weiter zu WhatsApp');
  };
  boxes.forEach(b => b.addEventListener('change', update));
  dlg.querySelectorAll('input[type=radio]').forEach(r => r.addEventListener('change', update));
  q2text.addEventListener('input', update);
  nameIn.addEventListener('input', update);
  q3date.addEventListener('change', update);
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

// Lange Bewertungen: «Weiterlesen»
document.querySelectorAll('.bewertungen .card').forEach(card => {
  const p = card.querySelector('p');
  if (!p || p.scrollHeight <= p.clientHeight + 2) return;
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'more'; btn.textContent = T('Weiterlesen');
  btn.addEventListener('click', () => {
    const open = card.classList.toggle('open');
    btn.textContent = open ? T('Weniger') : T('Weiterlesen');
  });
  p.after(btn);
});

// Vorher/Nachher-Vergleich mit Schieberegler
const cmp = document.querySelector('.compare');
if (cmp) {
  const range = cmp.querySelector('.c-range');
  const set = v => cmp.style.setProperty('--pos', v + '%');
  range.addEventListener('input', () => set(range.value));
  document.querySelectorAll('.c-tabs button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.c-tabs button').forEach(x => x.classList.toggle('on', x === b));
    cmp.querySelector('.c-before').src = `img/vorher-nachher/split/${b.dataset.p}-vorher.jpg`;
    cmp.querySelector('.c-after').src = `img/vorher-nachher/split/${b.dataset.p}-nachher.jpg`;
    range.value = 50; set(50);
  }));
}

// FAQ: Antworten weich auf- und zuklappen
document.querySelectorAll('.faq details').forEach(d => {
  const sum = d.querySelector('summary'), ans = d.querySelector('.answer');
  if (!ans || !ans.animate) return;
  sum.addEventListener('click', e => {
    e.preventDefault();
    if (d.open) {
      const a = ans.animate([{ height: ans.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 300, easing: 'ease' });
      a.onfinish = () => { d.open = false; };
    } else {
      document.querySelectorAll('.faq details[open]').forEach(o => { if (o !== d) o.open = false; });
      d.open = true;
      ans.animate([{ height: '0px', opacity: 0 }, { height: ans.offsetHeight + 'px', opacity: 1 }], { duration: 350, easing: 'ease' });
    }
  });
});

// Video-Bewertungen: eigener Play-Knopf
document.querySelectorAll('.v-card').forEach(c => {
  const v = c.querySelector('video');
  c.querySelector('.v-play').addEventListener('click', () => { v.controls = true; c.classList.add('playing'); v.play(); });
  v.addEventListener('ended', () => { c.classList.remove('playing'); v.controls = false; });
});

// Knopf "nach oben"
(() => {
  const b = document.createElement('button');
  b.className = 'to-top'; b.type = 'button'; b.setAttribute('aria-label', T('Nach oben'));
  b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
  b.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(b);
  const t = () => b.classList.toggle('show', window.scrollY > 600);
  window.addEventListener('scroll', t, { passive: true }); t();
})();

// Ton an/aus für das Leistungen-Video
document.querySelectorAll('.leistungen .media').forEach(m => {
  const v = m.querySelector('video'); if (!v) return;
  const on = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  const off = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
  const b = document.createElement('button'); b.type = 'button'; b.className = 'sound-btn';
  const set = () => { b.innerHTML = (v.muted ? off : on) + '<span>' + (v.muted ? T('Ton an') : T('Ton aus')) + '</span>'; b.setAttribute('aria-label', v.muted ? T('Ton einschalten') : T('Ton ausschalten')); };
  b.addEventListener('click', () => { v.muted = !v.muted; if (!v.muted) { v.volume = 1; v.play(); } set(); });
  set(); m.appendChild(b);
});

// Öffnungsstatus (Mo–Fr 8–20, Sa 9–14, Zeitzone Schweiz)
(() => {
  const els = document.querySelectorAll('.open-status'); if (!els.length) return;
  const hours = { 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 20], 6: [9, 14] };
  const update = () => {
    let day, h, m;
    try {
      const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const g = t => p.find(x => x.type === t).value;
      day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[g('weekday')]; h = +g('hour'); m = +g('minute');
    } catch (e) { const d = new Date(); day = d.getDay(); h = d.getHours(); m = d.getMinutes(); }
    const t = h + m / 60, r = hours[day], open = r && t >= r[0] && t < r[1];
    els.forEach(el => { el.hidden = false; el.className = 'open-status ' + (open ? 'is-open' : 'is-closed'); el.textContent = open ? T('Jetzt geöffnet') : T('Geschlossen'); });
  };
  update(); setInterval(update, 60000);
})();
