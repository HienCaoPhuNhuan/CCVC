const deck = document.querySelector('#deck');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const make = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};
window.ccvcSlides.forEach((slide, position) => {
  const section = make('section', ['slide', slide.mode, slide.images.length && 'illustrated'].filter(Boolean).join(' '));
  section.id = 'slide-' + (position + 1);
  const inner = make('div', 'inner');
  const header = make('header');
  header.append(make('p', 'kicker', String(position + 1).padStart(2, '0') + '  /  ' + slide.group));
  const title = make(position ? 'h2' : 'h1', '', slide.title);
  title.id = section.id + '-title';
  section.setAttribute('aria-labelledby', title.id);
  header.append(title);
  inner.append(header);
  if (slide.mode === 'cover') {
    inner.append(make('p', 'subtitle', 'Tổng kết năm học 2025–2026'), make('p', 'subtitle', 'Phương hướng, nhiệm vụ năm học 2026–2027'));
  } else {
    const body = make('div', 'body');
    const list = make('ul');
    slide.body.forEach(text => list.append(make('li', '', text)));
    if (slide.body.length) body.append(list);
    if (slide.images.length && slide.mode !== 'closing') {
      const figure = make('figure');
      let index = 0;
      const img = make('img');
      function show() {
        img.src = slide.images[index];
        img.alt = 'Tư liệu nhà trường: ' + slide.title;
        if (!reduced.matches) img.animate([{opacity:.35},{opacity:1}],{duration:400});
      }
      figure.append(img);
      show();
      section.addEventListener('photo-cycle', () => { index = (index + 1) % slide.images.length; show(); });
      body.append(figure);
    }
    inner.append(body);
  }
  if (slide.mode === 'cover' || slide.mode === 'closing') {
    const backdrop = make('img', 'backdrop');
    backdrop.src = slide.images[0];
    backdrop.alt = '';
    section.append(backdrop);
  }
  section.append(inner);
  deck.append(section);
});
const slides = [...deck.children];
let active = 0;
let wheelAt = 0;
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    active = slides.indexOf(entry.target);
    entry.target.classList.add('entered');
  }
}, {threshold:.55});
slides.forEach(slide => observer.observe(slide));
if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
function go(index) {
  active = Math.min(slides.length - 1, Math.max(0, index));
  slides[active].scrollIntoView({behavior:reduced.matches ? 'instant' : 'smooth'});
}
window.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const delta = {ArrowDown:1, ArrowRight:1, PageDown:1, ' ':1, ArrowUp:-1, ArrowLeft:-1, PageUp:-1}[event.key];
  if (!delta && !['Home','End'].includes(event.key)) return;
  if (event.key === ' ' && event.shiftKey) { event.preventDefault(); go(active - 1); return; }
  event.preventDefault();
  go(delta ? active + delta : event.key === 'Home' ? 0 : slides.length - 1);
});
window.addEventListener('wheel', event => {
  if (!matchMedia('(min-width: 900px) and (min-height: 700px)').matches || event.ctrlKey || !event.deltaY) return;
  event.preventDefault();
  const now = performance.now();
  if (now - wheelAt > 260) go(active + Math.sign(event.deltaY));
  wheelAt = now;
}, {passive:false});
setInterval(() => slides[active]?.dispatchEvent(new Event('photo-cycle')), 4500);
