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
  expand: '.header .logo, .header .nav, .header .btn, .title, .lead, main .btn, .leistungen li, .leistungen .media, .ueber .portrait, .ueber .text, .ueber .cert, .warum .cols > div, .preisliste .row, .card, .videos video, .faq details, .vn .slider, .form, .contact-lines, .map, .footer .grid > *, .behandlungen > div, .kicker, .page-title, .galerie-grid > *, .vn-grid img'
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
