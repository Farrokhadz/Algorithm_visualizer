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

  // Lomuto partition (CLRS): pivot is the last element of the range.
  // lo..hi = active range, i = end of the low region, j = last scanned index,
  // cur = element to highlight.
  function buildSteps(values) {
    const a = values.slice(), n = a.length, out = [], fixed = new Array(n).fill(false);
    let cmps = 0, swaps = 0;
    const snap = (msg, o) => out.push(Object.assign(
      { msg, arr: a.slice(), fixed: fixed.slice(), cmps, swaps, lo: -1, hi: -1, pivot: -1, i: -2, j: -1, cur: -1 }, o));
    const swap = (x, y) => { if (x !== y) { const t = a[x]; a[x] = a[y]; a[y] = t; swaps++; } };

    const sort = (lo, hi) => {
      if (lo > hi) return;
      if (lo === hi) {
        fixed[lo] = true;
        snap('A range with one element (' + a[lo] + ') is already in place.', { lo, hi });
        return;
      }
      const p = a[hi];
      let i = lo - 1;
      snap('Range [' + lo + '..' + hi + ']: take the last element, ' + p + ', as the pivot.', { lo, hi, pivot: hi, i });
      for (let j = lo; j < hi; j++) {
        cmps++;
        const v = a[j];
        if (v <= p) {
          i++;
          const moved = i !== j;
          swap(i, j);
          snap(v + ' <= ' + p + ': it joins the low side' + (moved ? ' (swapped to index ' + i + ')' : '') + '.',
               { lo, hi, pivot: hi, i, j, cur: i });
        } else {
          snap(v + ' > ' + p + ': it stays on the high side.', { lo, hi, pivot: hi, i, j, cur: j });
        }
      }
      const q = i + 1;
      swap(q, hi);
      fixed[q] = true;
      snap('Put the pivot ' + p + ' at index ' + q + '. Everything left of it is <= ' + p + ', everything right is larger.',
           { lo, hi, i: q - 1, j: hi });
      sort(lo, q - 1);
      sort(q + 1, hi);
    };

    snap('Start. In each range the last element is the pivot.');
    sort(0, n - 1);
    snap('Done. Every element is in its final position.');
    return out;
  }

  function render() {
    const s = steps[pos];
    const max = Math.max.apply(null, s.arr.concat(1));
    bars.className = 'bars' + (s.arr.length > 16 ? ' many' : '');
    bars.innerHTML = s.arr.map((v, k) => {
      let c = '';
      if (k === s.cur) c = 'cmp';
      else if (s.fixed[k]) c = 'sorted';
      else if (k === s.pivot) c = 'key';
      else if (s.lo >= 0 && (k < s.lo || k > s.hi)) c = 'out';
      else if (k >= s.lo && k <= s.i) c = 'lo';
      else if (k > s.i && k <= s.j) c = 'hi';
      return '<div class="bar ' + c + '" style="height:' + (6 + (v / max) * 94) + '%"><span>' + v + '</span></div>';
    }).join('');
    log.textContent = s.msg;
    stats.textContent = 'comparisons: ' + s.cmps + '   swaps: ' + s.swaps + '   step: ' + pos + '/' + (steps.length - 1);
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
