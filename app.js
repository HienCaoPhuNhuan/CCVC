const deck = document.querySelector('#deck');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const make = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};
function assessmentChart(slide) {
  const values = [...slide.body.slice(0, 2).join(' ').matchAll(/(Chưa đạt|Tốt|Khá|Đạt):\s*([\d,]+)%\s*\(([\d.]+) HS\)/gu)];
  if (values.length !== 4) return null;
  const chart = make('div', 'assessment');
  chart.append(make('p', 'chart-note', 'Phạm vi đánh giá: 2.387 học sinh'));
  const table = make('table', 'chart-table');
  const head = table.createTHead().insertRow();
  for (const heading of ['Xếp loại', 'Tỷ lệ (0–100%)', 'Số học sinh']) {
    const cell = make('th', '', heading);
    cell.scope = 'col';
    head.append(cell);
  }
  const rows = table.createTBody();
  for (const [index, [, name, percent, count]] of values.entries()) {
    const row = rows.insertRow();
    const label = make('th', '', name);
    label.scope = 'row';
    row.append(label);
    const rate = row.insertCell();
    const track = make('span', 'chart-track');
    const fill = make('span', 'chart-fill fill-' + index);
    fill.style.setProperty('--percent', percent.replace(',', '.') + '%');
    track.setAttribute('aria-hidden', 'true');
    track.append(fill);
    const meter = make('div', 'chart-meter');
    meter.append(track, make('strong', '', percent + '%'));
    rate.append(meter);
    row.insertCell().textContent = count.replace(/^0+(?=\d)/, '');
  }
  chart.append(table);
  const note = slide.body[2].split('; Danh hiệu')[0];
  chart.append(make('p', 'chart-note', note.endsWith('.') ? note : note + '.'));
  if (slide.mode === 'learning-chart') {
    chart.append(make('p', 'chart-note', 'Danh hiệu Xuất sắc/Giỏi: 67,83%. Bản đầy đủ: 1.619 học sinh; bản rút gọn: 1.691.'));
  }
  return chart;
}

function graduationChart(slide) {
  const chart = make('div', 'graduation-chart');
  const outcomes = make('div', 'chart-outcomes');
  for (const [value, label] of [['100%', 'Tốt nghiệp THPT · khối 12'], ['97,53%', 'Trúng tuyển đại học đợt 1 · 30/8/2026']]) {
    const item = make('div');
    item.append(make('strong', '', value), make('p', '', label));
    outcomes.append(item);
  }
  const scores = make('div', 'chart-scores');
  for (const [label, value] of [['Năm 2025', '22,85'], ['Năm 2026', '22,93'], ['So với 2025', '+0,08']]) {
    const item = make('div');
    item.append(make('p', '', label), make('strong', '', value + ' điểm'));
    scores.append(item);
  }
  chart.append(outcomes, make('h3', 'chart-heading', 'Điểm trung bình 3 môn thi cao nhất'), scores,
    make('p', 'chart-note', 'Năm 2026: cao nhất 28,00 điểm, thấp nhất 15,1 điểm.'),
    make('p', 'chart-note', slide.body[3]));
  return chart;
}

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
    const chart = slide.mode === 'graduation-chart' ? graduationChart(slide)
      : ['conduct-chart', 'learning-chart'].includes(slide.mode) ? assessmentChart(slide) : null;
    if (chart) body.append(chart);
    else if (slide.body.length) body.append(list);
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
