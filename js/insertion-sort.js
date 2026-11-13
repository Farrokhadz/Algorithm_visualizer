(() => {
  const $ = (id) => document.getElementById(id);
  const input = $('data'), bars = $('bars'), log = $('log'), err = $('err'), stats = $('stats');
  const playBtn = $('play'), speed = $('speed');
  const MAX = 24;
  let steps = [], pos = 0, timer = null;

  function parse(text) {
    const parts = text.split(/[\s,;]+/).filter(Boolean);
    if (!parts.length) throw new Error('Enter at least one number.');
    if (parts.length > MAX) throw new Error('Use at most ' + MAX + ' numbers.');
    return parts.map((p) => {
      if (!/^\d{1,3}$/.test(p)) throw new Error('"' + p + '" is not an integer from 0 to 999.');
      return Number(p);
    });
  }

  // Precompute every step so play / step / reset are trivial.
  function buildSteps(input) {
    const a = input.slice(), out = [];
    let cmps = 0, shifts = 0;
    const push = (o) => out.push(Object.assign({ arr: a.slice(), cmps, shifts, hole: -1, cmp: -1 }, o));
    push({ msg: 'Start. The first element counts as a sorted prefix of length 1.', sorted: 0 });
    for (let j = 1; j < a.length; j++) {
      const key = a[j];
      let i = j - 1;
      push({ msg: 'Pick key = ' + key + ' (index ' + j + ').', hole: j, key, sorted: j });
      while (i >= 0) {
        cmps++;
        const bigger = a[i] > key;
        push({ msg: 'Is ' + a[i] + ' > ' + key + '? ' + (bigger ? 'Yes, shift it right.' : 'No, the key stays here.'),
               hole: i + 1, key, cmp: i, sorted: j });
        if (!bigger) break;
        a[i + 1] = a[i];
        shifts++;
        i--;
        push({ msg: 'Shifted right. The gap is now at index ' + (i + 1) + '.', hole: i + 1, key, sorted: j });
      }
      a[i + 1] = key;
      push({ msg: 'Insert ' + key + ' at index ' + (i + 1) + '.', sorted: j });
    }
    push({ msg: 'Done. The array is sorted.', sorted: a.length - 1 });
    return out;
  }

  function render() {
    const s = steps[pos];
    const max = Math.max.apply(null, s.arr.concat(1));
    bars.className = 'bars' + (s.arr.length > 16 ? ' many' : '');
    bars.innerHTML = s.arr.map((v, i) => {
      const val = i === s.hole ? s.key : v;
      const cls = i === s.hole ? 'key' : i === s.cmp ? 'cmp' : i <= s.sorted ? 'sorted' : '';
      return '<div class="bar ' + cls + '" style="height:' + (6 + (val / max) * 94) + '%"><span>' + val + '</span></div>';
    }).join('');
    log.textContent = s.msg;
    stats.textContent = 'comparisons: ' + s.cmps + '   shifts: ' + s.shifts + '   step: ' + pos + '/' + (steps.length - 1);
  }

  function stop() { clearTimeout(timer); timer = null; playBtn.textContent = 'play'; }
  function next() { if (pos < steps.length - 1) { pos++; render(); return true; } return false; }

  function tick() {
    if (!next()) { stop(); return; }
    timer = setTimeout(tick, 1100 - Number(speed.value) * 100);
  }

  function load() {
    stop();
    try {
      steps = buildSteps(parse(input.value));
      err.textContent = '';
      pos = 0;
      render();
    } catch (e) { err.textContent = e.message; }
  }

  $('load').addEventListener('click', load);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') load(); });
  $('random').addEventListener('click', () => {
    input.value = Array.from({ length: 10 }, () => 5 + Math.floor(Math.random() * 95)).join(' ');
    load();
  });
  playBtn.addEventListener('click', () => {
    if (timer) { stop(); return; }
    if (pos >= steps.length - 1) pos = 0;
    playBtn.textContent = 'pause';
    tick();
  });
  $('step').addEventListener('click', () => { stop(); next(); });
  $('reset').addEventListener('click', () => { stop(); pos = 0; render(); });

  load();
})();
