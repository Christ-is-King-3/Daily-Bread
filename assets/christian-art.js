/* Shared pure functions also run under Node in the collection tests. */
(function (scope) {
  'use strict';
  const DAY = 86400000;
  const EPOCH = Date.UTC(2026, 10, 6) / DAY;
  function dateKey(date = new Date()) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }
  function dayNumber(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new Error('Invalid date');
    const [y, m, d] = key.split('-').map(Number);
    const value = Date.UTC(y, m - 1, d);
    if (new Date(value).toISOString().slice(0, 10) !== key) throw new Error('Invalid date');
    return value / DAY;
  }
  // The explicit sequence in the manifest stays stable when new works are appended.
  function dailyWork(works, key) {
    const ordered = [...works].sort((a, b) => a.sequence - b.sequence);
    if (!ordered.length) throw new Error('Empty art collection');
    const index = ((dayNumber(key) - EPOCH) % ordered.length + ordered.length) % ordered.length;
    return ordered[index];
  }
  function filterWorks(works, {query = '', topic = '', medium = '', period = '', museum = ''} = {}) {
    const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    return works.filter(w => (!museum || w.museum === museum) && (!topic || w.topic === topic) && (!medium || w.type === medium) && (!period || w.period === period) && words.every(word => [w.title, w.artist, w.date, w.culture, w.medium, w.topic, w.type, w.period, w.museum].join(' ').toLocaleLowerCase().includes(word)));
  }
  const api = {dateKey, dayNumber, dailyWork, filterWorks};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  let works = [], limit = 12, selectedDay = dateKey(), currentWork = null;
  const today = () => dateKey();
  function scriptureLink(w) {
    return w.scripture ? `<a href="index.html?scripture=${encodeURIComponent(w.scripture)}#library">Read ${esc(w.scripture)} in Scripture ↗</a>` : '';
  }
  function textFor(w, heading = 'h3') {
    return `<div class="art-type">${esc(w.type)} · ${esc(w.topic)}</div><${heading}>${esc(w.title)}</${heading}><p>${esc(w.artist)}${w.culture ? ' · ' + esc(w.culture) : ''}</p><p class="meta">${esc(w.date)} · ${esc(w.medium)}</p><p>${esc(w.context)}</p><div class="look"><strong>A moment to reflect</strong><p>${esc(w.reflection)}</p><span class="meta">A Daily Bread reflection</span></div>${scriptureLink(w)}`;
  }
  function showFeature() {
    const w = dailyWork(works, selectedDay);
    const image = $('daily-image');
    image.src = w.image;
    image.alt = w.title + ' — ' + w.artist;
    image.width = w.width;
    image.height = w.height;
    $('daily-caption').textContent = 'Collection: ' + w.museum + ' · Image reuse: ' + w.rights;
    $('daily-copy').innerHTML = `<div class="eyebrow">Artwork of the day · ${esc(new Intl.DateTimeFormat('en-GB', {dateStyle:'long'}).format(new Date(selectedDay + 'T12:00:00')))}</div>${textFor(w, 'h2')}<div class="feature-actions"><button class="button" data-open="${w.id}">Enlarge & explore</button><a class="button secondary" href="${esc(w.source)}" target="_blank" rel="noopener">Museum record ↗</a></div>`;
    $('art-date').value = selectedDay;
    $('art-date').max = today();
    $('next-day').disabled = selectedDay >= today();
  }
  function renderArchive() {
    const results = filterWorks(works, {query:$('art-search').value, topic:$('topic').value, medium:$('medium').value, period:$('period').value, museum:$('museum').value});
    const visible = new Set(results.slice(0, limit).map(w => String(w.id)));
    document.querySelectorAll('[data-card]').forEach(card => { card.hidden = !visible.has(card.dataset.card); });
    $('art-count').textContent = `${results.length} ${results.length === 1 ? 'work' : 'works'} found · ${Math.min(limit, results.length)} shown`;
    $('no-art').hidden = results.length > 0;
    $('more-art').hidden = results.length <= limit;
  }
  function openWork(id) {
    const w = works.find(a => String(a.id) === String(id));
    if (!w) return;
    currentWork = w;
    $('work-title').textContent = w.title;
    $('work-image').src = w.image;
    $('work-image').alt = w.title + ' — ' + w.artist;
    $('work-image').width = w.width;
    $('work-image').height = w.height;
    $('zoom').value = '1';
    zoom();
    $('work-text').innerHTML = `${textFor(w)}<p><a href="${esc(w.image)}" target="_blank" rel="noopener">Open image in a new tab ↗</a></p><div class="credit"><strong>Collection & image credit</strong><p>${esc(w.museum)}. ${esc(w.credit)}</p><p>${esc(w.accession)} · ${esc(w.rights)}. Museum rights record checked ${esc(w.retrieved)}.</p><a href="${esc(w.source)}" target="_blank" rel="noopener">Museum record & provenance ↗</a><a href="${esc(w.rightsUrl)}" target="_blank" rel="noopener">Image reuse terms ↗</a><a href="${esc(w.record)}" target="_blank" rel="noopener">Saved museum record ↗</a></div>`;
    $('work-dialog').showModal();
  }
  function zoom() {
    const scale = Number($('zoom').value);
    $('zoom-label').textContent = scale === 1 ? 'Fit whole image' : `${scale}× detail`;
    $('study-canvas').classList.toggle('zoomed', scale > 1);
    if (currentWork) $('work-image').style.setProperty('--zoom-width', Math.round(Math.min(currentWork.width, 900) * scale) + 'px');
    $('study-canvas').scrollTop = 0;
    $('study-canvas').scrollLeft = 0;
  }
  function shiftDay(step) {
    const key = new Date((dayNumber(selectedDay) + step) * DAY).toISOString().slice(0, 10);
    if (key <= today()) { selectedDay = key; showFeature(); }
  }
  try { if (localStorage.getItem('db-dark') === '1') document.body.classList.add('dark'); } catch (_) {}
  $('art-theme').onclick = () => {
    const dark = document.body.classList.toggle('dark');
    $('art-theme').setAttribute('aria-pressed', String(dark));
    try { localStorage.setItem('db-dark', dark ? '1' : '0'); } catch (_) {}
  };
  $('art-theme').setAttribute('aria-pressed', String(document.body.classList.contains('dark')));
  async function init() {
    try {
      const response = await fetch('content/art-collection.json');
      if (!response.ok) throw new Error('Collection unavailable');
      works = await response.json();
      showFeature(); renderArchive();
      $('art-controls').hidden = false;
      $('date-controls').hidden = false;
      $('art-search').oninput = () => { limit = 12; renderArchive(); };
      ['topic','medium','period','museum'].forEach(id => { $(id).onchange = () => { limit = 12; renderArchive(); }; });
      $('clear-art').onclick = () => { ['art-search','topic','medium','period','museum'].forEach(id => { $(id).value = ''; }); limit = 12; renderArchive(); };
      $('more-art').onclick = () => { limit += 12; renderArchive(); };
      $('previous-day').onclick = () => shiftDay(-1);
      $('next-day').onclick = () => shiftDay(1);
      $('back-today').onclick = () => { selectedDay = today(); showFeature(); };
      $('art-date').onchange = () => {
        try { dayNumber($('art-date').value); if ($('art-date').value > today()) throw new Error('Future date'); selectedDay = $('art-date').value; showFeature(); }
        catch (_) { $('art-date').value = selectedDay; }
      };
      document.addEventListener('click', e => { const button = e.target.closest('[data-open]'); if (button) { e.preventDefault(); openWork(button.dataset.open); } });
      $('close-work').onclick = () => $('work-dialog').close();
      $('zoom').oninput = zoom;
      // Follow the visitor's local calendar, including after a sleeping tab wakes.
      let lastToday = today();
      function tick() { const next = today(); if (next !== lastToday) { if (selectedDay === lastToday) selectedDay = next; lastToday = next; showFeature(); } }
      setInterval(tick, 60000);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
    } catch (_) {
      document.querySelectorAll('[data-card]').forEach(card => { card.hidden = false; });
      $('art-status').textContent = 'The complete collection is shown below. Daily rotation and filters are temporarily unavailable.';
      $('art-status').hidden = false;
      $('more-art').hidden = true;
    }
  }
  init();
})(typeof window !== 'undefined' ? window : globalThis);
