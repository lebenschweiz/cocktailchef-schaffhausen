// Menü auf dem Handy
const header = document.querySelector('.header');
const burger = document.querySelector('.burger');
burger.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.mobile-nav a').forEach(a => a.addEventListener('click', () => header.classList.remove('open')));

// Studio-Fotos: Pfeile und langsames automatisches Weiterlaufen
const track = document.querySelector('.studio .track');
if (track) {
  const step = () => track.clientWidth * 0.6;
  const go = dir => {
    const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
    if (dir > 0 && end) track.scrollTo({ left: 0, behavior: 'smooth' });
    else track.scrollBy({ left: dir * step(), behavior: 'smooth' });
  };
  document.querySelector('.studio .prev').addEventListener('click', () => go(-1));
  document.querySelector('.studio .next').addEventListener('click', () => go(1));
  let timer = setInterval(() => go(1), 4000);
  track.addEventListener('pointerdown', () => clearInterval(timer));
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
