(() => {
  const $ = (id) => document.getElementById(id);
  const input = $('data'), tree = $('tree'), log = $('log'), err = $('err'), stats = $('stats');
  const playBtn = $('play'), speed = $('speed');
  const MAX = 16, ROW = 72, NODE_H = 36;
  let nodes = [], steps = [], size = 0, maxDepth = 0, pos = 0, timer = null;

  function parse(text) {
    const parts = text.split(/[\s,;]+/).filter(Boolean);
    if (!parts.length) throw new Error('Enter at least one number.');
    if (parts.length > MAX) throw new Error('Use at most ' + MAX + ' numbers.');
    return parts.map((p) => {
      if (!/^\d{1,3}$/.test(p)) throw new Error('"' + p + '" is not an integer from 0 to 999.');
      return Number(p);
    });
  }

  // Build the recursion tree, then record one snapshot per visible step.
  function build(arr) {
    nodes = []; steps = [];
    size = arr.length;
    const make = (lo, hi, depth) => {
      const n = { id: nodes.length, lo, hi, depth, l: -1, r: -1 };
      nodes.push(n);
      if (lo < hi) {
        const mid = (lo + hi) >> 1;
        n.l = make(lo, mid, depth + 1);
        n.r = make(mid + 1, hi, depth + 1);
      }
      return n.id;
    };
    make(0, size - 1, 0);
    maxDepth = Math.max.apply(null, nodes.map((n) => n.depth));

    const st = nodes.map((n) => ({ vis: n.id === 0, status: '', vals: arr.slice(n.lo, n.hi + 1), hl: -1 }));
    let cmps = 0;
    const snap = (msg) => steps.push({
      msg, cmps,
      st: st.map((s) => ({ vis: s.vis, status: s.status, vals: s.vals.slice(), hl: s.hl })),
    });
    const fmt = (a) => '[' + a.join(', ') + ']';

    const merge = (id) => {
      const n = nodes[id], s = st[id], a = st[n.l], b = st[n.r];
      const L = a.vals.slice(), R = b.vals.slice(), total = L.length + R.length, out = [];
      const show = () => { s.vals = out.concat(new Array(total - out.length).fill(null)); };
      let i = 0, j = 0;
      s.status = 'merge'; show();
      snap('Merge the sorted halves ' + fmt(L) + ' and ' + fmt(R) + '.');
      while (i < L.length && j < R.length) {
        cmps++;
        a.hl = i; b.hl = j;
        const left = L[i] <= R[j];
        out.push(left ? L[i++] : R[j++]);
        show();
        snap('Compare ' + L[i - (left ? 1 : 0)] + ' and ' + R[j - (left ? 0 : 1)] + '. Take ' + out[out.length - 1] +
             (left ? ' from the left half.' : ' from the right half.'));
      }
      a.hl = b.hl = -1;
      const rest = L.slice(i).concat(R.slice(j));
      s.vals = out.concat(rest);
      s.status = 'done';
      snap(rest.length
        ? 'One half is empty, so copy the rest ' + fmt(rest) + '. Result: ' + fmt(s.vals) + '.'
        : 'Merged: ' + fmt(s.vals) + '.');
    };

    const rec = (id) => {
      const n = nodes[id], s = st[id];
      if (n.l < 0) { s.status = 'done'; snap(s.vals[0] + ' is a single element, so it is already sorted.'); return; }
      s.status = 'divide';
      st[n.l].vis = st[n.r].vis = true;
      snap('Divide ' + fmt(s.vals) + ' into ' + fmt(st[n.l].vals) + ' and ' + fmt(st[n.r].vals) + '.');
      s.status = '';
      rec(n.l); rec(n.r);
      merge(id);
    };
    snap('Start. Divide until every piece has one element, then merge back up.');
    rec(0);
    steps[steps.length - 1].msg += ' The array is sorted.';
  }

  function render() {
    const s = steps[pos];
    let html = '', lines = '';
    nodes.forEach((nd) => {
      const t = s.st[nd.id];
      if (!t.vis) return;
      const cells = t.vals.map((v, i) => {
        let c = t.status === 'done' ? 'out' : t.status === 'merge' ? (v === null ? 'empty' : 'out') : 'raw';
        if (t.hl === i) c = 'hl';
        return '<span class="c ' + c + '">' + (v === null ? '·' : v) + '</span>';
      }).join('');
      html += '<div class="node nd-' + (t.status || 'wait') + '" style="left:' + (nd.lo / size * 100) +
              '%;width:' + ((nd.hi - nd.lo + 1) / size * 100) + '%;top:' + (nd.depth * ROW) + 'px"><div class="cells">' + cells + '</div></div>';
      [nd.l, nd.r].forEach((c) => {
        if (c < 0 || !s.st[c].vis) return;
        const ch = nodes[c];
        lines += '<line x1="' + ((nd.lo + nd.hi + 1) / (2 * size) * 100) + '%" y1="' + (nd.depth * ROW + NODE_H) +
                 '" x2="' + ((ch.lo + ch.hi + 1) / (2 * size) * 100) + '%" y2="' + (ch.depth * ROW) + '"/>';
      });
    });
    tree.innerHTML = '<div class="tree-inner" style="min-width:' + (size * 30) + 'px;height:' + (maxDepth * ROW + NODE_H) +
                     'px"><svg class="lines" width="100%" height="100%">' + lines + '</svg>' + html + '</div>';
    log.textContent = s.msg;
    stats.textContent = 'comparisons: ' + s.cmps + '   step: ' + pos + '/' + (steps.length - 1);
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
      build(parse(input.value));
      err.textContent = '';
      pos = 0;
      render();
    } catch (e) { err.textContent = e.message; }
  }

  $('load').addEventListener('click', load);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') load(); });
  $('random').addEventListener('click', () => {
    input.value = Array.from({ length: 8 }, () => 5 + Math.floor(Math.random() * 95)).join(' ');
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
