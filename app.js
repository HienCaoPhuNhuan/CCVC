const deck = document.querySelector('#deck');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const photoStage = window.createCcvcPhotoStage(reduced.matches);
const make = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text.replace(/Hồ Chí Minh/gu, 'Hồ\u00a0Chí\u00a0Minh');
  return element;
};
function assessmentChart(slide) {
  const allValues = [...slide.body.slice(0, 2).join(' ').matchAll(/(Chưa đạt|Tốt|Khá|Đạt):\s*([\d,]+)%\s*\(([\d.]+) HS\)/gu)];
  if (allValues.length !== 4) return null;
  const visible = slide.mode === 'conduct-chart' ? ['Tốt', 'Khá'] : ['Tốt', 'Khá', 'Chưa đạt'];
  const values = allValues.filter(([, name]) => visible.includes(name));
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
    chart.append(make('p', 'chart-note', 'Danh hiệu Xuất sắc/Giỏi: 1.619 học sinh (67,83%), gồm 371 Xuất sắc và 1.248 Giỏi.'));
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

function targetsTable(slide) {
  const panels = make('div', 'targets-panels');
  let group;
  let table;
  for (const text of slide.body) {
    const title = text.match(/^\d+\.\s*(.+):$/u);
    if (title) {
      table = make('table', 'targets-table');
      table.append(make('caption', '', title[1]));
      const header = table.createTHead().insertRow();
      for (const label of ['Nội dung', 'Chỉ tiêu']) {
        const cell = make('th', '', label);
        cell.scope = 'col';
        header.append(cell);
      }
      group = table.createTBody();
      panels.append(table);
      continue;
    }
    const item = text.match(/^(Tốt|Khá|Đạt)(?:\s+đạt)?\s*((?:<=)?\d+%)\s*,?\s*(.*)$/u);
    if (!item || !group) throw new Error('Invalid target row: ' + text);
    const row = group.insertRow();
    const label = make('th', '', item[1]);
    label.scope = 'row';
    row.append(label);
    const value = row.insertCell();
    value.append(make('strong', '', item[2].replace('<=', '≤')));
    if (item[3]) {
      const note = table.createTFoot().insertRow().insertCell();
      note.colSpan = 2;
      note.append(make('small', '', item[3]));
    }
  }
  return panels;
}

window.ccvcSlides.forEach((slide, position) => {
  const section = make('section', ['slide', slide.mode, slide.images.length && 'illustrated'].filter(Boolean).join(' '));
  section.id = 'slide-' + (position + 1);
  const inner = make('div', 'inner');
  const header = make('header');
  header.append(make('p', 'kicker', String(position + 1).padStart(2, '0') + '  /  ' + slide.group));
  const title = make(position ? 'h2' : 'h1', '', slide.title);
  if (slide.mode === 'closing') {
    title.replaceChildren(...['Đổi mới tư duy', 'Chuyển biến mạnh mẽ', 'Kết quả thực chất'].map(text => make('span', '', text)));
  }
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
    const textColumn = make('div', 'text-column');
    if (slide.intro) textColumn.append(make('p', 'bullet-intro', slide.intro));
    textColumn.append(list);
    const chart = slide.mode === 'graduation-chart' ? graduationChart(slide)
      : slide.mode === 'targets-table' ? targetsTable(slide)
      : ['conduct-chart', 'learning-chart'].includes(slide.mode) ? assessmentChart(slide) : null;
    if (slide.mode === 'chapter') {
      const theme = slide.body[0].match(/“([^”]+)”/u)?.[1] || slide.body[0];
      const lines = make('div', 'theme-lines');
      theme.split(/\s+[–-]\s+/u).forEach(line => lines.append(make('span', '', line)));
      body.append(lines);
    } else if (chart) body.append(chart);
    else if (slide.body.length) body.append(textColumn);
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
      section.addEventListener('photo-cycle', event => {
        index = Number.isInteger(event.detail?.index) ? event.detail.index % slide.images.length : (index + 1) % slide.images.length;
        show();
        if (event.detail?.expanded) photoStage.show(img, section);
      });
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
const phrases = /\b\d[\d.,/]*\s*(?:%|triệu đồng|đồng|tiết\/tuần|học sinh|giáo viên|nhân viên|điểm|bài(?: điểm 10)?|(?:huy chương|HC)(?: (?:Vàng|Bạc|Đồng))?|[Gg]iải(?: (?:Nhất|Nhì|Ba|Khuyến khích|tiềm năng))?)|Hoàn thành xuất sắc nhiệm vụ|[Gg]iải Khuyến khích|[Gg]iải tiềm năng|Cờ thi đua Thành phố|Tập thể Lao động [Xx]uất sắc/gu;
for (const slide of slides) {
  const walker = document.createTreeWalker(slide.querySelector('.inner'), NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    if (!walker.currentNode.parentElement.closest('.kicker, h1, h2, .chart-note, .chart-outcomes p, .chart-scores p')) textNodes.push(walker.currentNode);
  }
  for (const node of textNodes) {
    const matches = [...node.textContent.matchAll(phrases)];
    if (!matches.length) continue;
    const fragment = document.createDocumentFragment();
    let start = 0;
    for (const match of matches) {
      fragment.append(document.createTextNode(node.textContent.slice(start, match.index)), make('mark', 'emphasis', match[0]));
      start = match.index + match[0].length;
    }
    fragment.append(document.createTextNode(node.textContent.slice(start)));
    node.replaceWith(fragment);
  }
  slide.querySelectorAll('.chart-table tbody td:last-child').forEach(cell => {
    cell.replaceChildren(make('mark', 'emphasis', cell.textContent));
  });
}
const autoplay = new URLSearchParams(location.search).get('autoplay') === '1';
const narration = autoplay && window.ccvcSlides.every(slide => slide.voice)
  ? window.createCcvcNarration(window.ccvcSlides) : null;
const durations = window.ccvcSlides.map(slide => slide.durationSeconds);
const boundaries = [];
durations.reduce((offset, seconds) => { boundaries.push(offset); return offset + seconds; }, 0);
const totalDuration = durations.reduce((sum, seconds) => sum + seconds, 0);
let clockStart = null;
let pausedElapsed = 0;
let scheduledPage = -1;
let photoIndex = -1;
let photoExpanded = false;
let manualStart = performance.now();
function elapsed() { return pausedElapsed + (clockStart === null ? 0 : (performance.now() - clockStart) / 1000); }
function activate(index) {
  const target = slides[index];
  if (target.classList.contains('entered')) return;
  target.classList.add('entered');
  if (!reduced.matches) {
    target.querySelectorAll('li, tbody tr, .chart-outcomes > div, .chart-scores > div').forEach((node, i) => {
      node.animate([{opacity:.5, transform:'translateY(8px)'}, {opacity:1, transform:'none'}], {
        duration:480, delay:Math.min(i * 90, 450), easing:'cubic-bezier(.2,.8,.2,1)', fill:'backwards'
      });
    });
  }
}
let active = 0;
let wheelAt = 0;
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    const next = slides.indexOf(entry.target);
    if (next !== active) {
      photoStage.stop();
      photoIndex = -1;
      photoExpanded = false;
      manualStart = performance.now();
    }
    active = next;
    activate(active);
  }
}, {threshold:.55});
slides.forEach(slide => observer.observe(slide));
if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
function go(index, fromClock = false) {
  photoStage.stop();
  photoExpanded = false;
  photoIndex = -1;
  manualStart = performance.now();
  active = Math.min(slides.length - 1, Math.max(0, index));
  if (narration) narration.setSlide(active);
  if (autoplay && !fromClock) {
    pausedElapsed = boundaries[active];
    clockStart = document.hidden ? null : performance.now();
    scheduledPage = active;
    photoIndex = -1;
    document.documentElement.dataset.playback = 'playing';
  }
  activate(active);
  slides[active].scrollIntoView({behavior:reduced.matches ? 'instant' : 'smooth'});
}
window.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('button,input,textarea,select,[contenteditable="true"]')) return;
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
if (!autoplay) setInterval(() => {
  const seconds = (performance.now() - manualStart) / 1000;
  const slide = window.ccvcSlides[active];
  const expanded = seconds >= 4 && slide.images.length > 0 && !['cover','closing'].includes(slide.mode);
  const index = seconds < 4 ? 0 : Math.floor((seconds - 4) / 4.5) % Math.max(1, slide.images.length);
  if (index !== photoIndex || expanded !== photoExpanded) {
    slides[active]?.dispatchEvent(new CustomEvent('photo-cycle', {detail:{index,expanded}}));
    photoIndex = index;
    photoExpanded = expanded;
  }
}, 100);
async function startPlayback() {
  await document.fonts.ready;
  await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
  const initial = slides.findIndex(slide => '#' + slide.id === location.hash);
  pausedElapsed = boundaries[Math.max(0, initial)];
  clockStart = document.hidden ? null : performance.now();
  document.documentElement.dataset.playback = 'playing';
  if (narration) {
    scheduledPage = Math.max(0, initial);
    go(scheduledPage, true);
  }
  function tick() {
    if (!document.hidden && document.documentElement.dataset.playback !== 'finished') {
      const time = narration ? boundaries[scheduledPage] + narration.elapsed() : elapsed();
      let index = boundaries.findLastIndex(start => time >= start);
      index = Math.max(0, index);
      if (index !== scheduledPage) {
        scheduledPage = index;
        photoIndex = -1;
        go(index, true);
      }
      const count = window.ccvcSlides[index].images.length;
      const photo = Math.min(Math.max(0, count - 1), Math.floor(Math.max(0, time - boundaries[index] - 4) / Math.max(1, (durations[index] - 4) / Math.max(1, count))));
      const expanded = time - boundaries[index] >= 4 && count > 0 && !['cover','closing'].includes(window.ccvcSlides[index].mode);
      if (photo !== photoIndex || expanded !== photoExpanded) {
        slides[index].dispatchEvent(new CustomEvent('photo-cycle', {detail:{index:photo,expanded}}));
        photoIndex = photo;
        photoExpanded = expanded;
      }
      document.documentElement.dataset.elapsed = Math.min(time, totalDuration).toFixed(2);
      if (time >= totalDuration) document.documentElement.dataset.playback = 'finished';
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
document.addEventListener('visibilitychange', () => {
  if (!autoplay) return;
  if (narration) {
    if (document.hidden) narration.pause();
    else if (document.documentElement.dataset.playback !== 'finished') narration.resume();
    return;
  }
  if (document.hidden) { pausedElapsed = elapsed(); clockStart = null; }
  else if (document.documentElement.dataset.playback !== 'finished') clockStart = performance.now();
});
if (autoplay) startPlayback();
