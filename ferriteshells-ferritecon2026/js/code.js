// Julia syntax colouring in the style of VS Code (Default Light+/Dark+).
// Usage:  <pre><code class="language-julia" data-line-numbers data-hl="3-5">…</code></pre>
//   data-line-numbers : show line numbers        data-hl="3-5,9" : highlight those lines
// Colours live in css/code.css. Runs immediately, so load it before Reveal.initialize().
(function () {
  const DECL = new Set('function struct mutable abstract primitive type module baremodule macro const local global where using import export'.split(' '));
  const FLOW = new Set('if elseif else for while in ∈ isa return break continue try catch finally do begin let quote end'.split(' '));
  const CONST = new Set('true false nothing missing NaN Inf NaN16 NaN32 NaN64 Inf16 Inf32 Inf64 pi π ℯ undef stdout stderr'.split(' '));

  const re = {
    comment: /#=[\s\S]*?=#|#[^\n]*/y,
    triple: /"""[\s\S]*?"""/y,
    str: /"(?:\\[\s\S]|[^"\\])*"/y,
    cmd: /`(?:\\[\s\S]|[^`\\])*`/y,
    chr: /'(?:\\.|[^'\\])'/y,
    num: /(?:0x[0-9a-fA-F_]+|0b[01_]+|0o[0-7_]+|(?:\d[\d_]*\.?\d*|\.\d[\d_]*)(?:[eEf][+-]?\d+)?)(?:im)?/y,
    macro: /@[\p{L}_][\p{L}\p{N}_.!]*/uy,
    sym: /:[\p{L}_][\p{L}\p{N}_!]*/uy,
    op: /::|<:|>:|->|=>|\.\.\./y,
    id: /[\p{L}_∇][\p{L}\p{N}\p{M}_!′]*/uy,
  };
  const M = (r, s, i) => { r.lastIndex = i; const m = r.exec(s); return m ? m[0] : null; };

  function tokenize(src) {
    const out = [];                       // {c: class|null, t: text}
    let i = 0, prev = '', typeDepth = 0, lineStart = true, lineKw = '';
    let prevKind = '';                    // kind of last significant token: 'id','close','other'
    const push = (c, t) => { out.push({ c, t }); };
    while (i < src.length) {
      const ch = src[i];
      let t;
      if (ch === '\n') { push(null, '\n'); i++; lineKw = ''; continue; }
      if (ch === ' ' || ch === '\t') { push(null, ch); i++; continue; }
      if ((t = M(re.comment, src, i)))           { push('c-com', t); i += t.length; continue; }
      if ((t = M(re.triple, src, i)))            { push('c-str', t); i += t.length; prev = '"'; prevKind = 'close'; continue; }
      if ((t = M(re.str, src, i)))               { push('c-str', t); i += t.length; prev = '"'; prevKind = 'close'; continue; }
      if ((t = M(re.cmd, src, i)))               { push('c-str', t); i += t.length; prev = '`'; prevKind = 'close'; continue; }
      if (ch === "'" && prevKind !== 'id' && prevKind !== 'close' && (t = M(re.chr, src, i))) { push('c-str', t); i += t.length; prev = "'"; prevKind = 'close'; continue; }
      if ((t = M(re.macro, src, i)))             { push('c-fn', t); i += t.length; prev = t; prevKind = 'id'; continue; }
      if ((t = M(re.op, src, i)))                { push(null, t); i += t.length; prev = t; prevKind = 'other'; continue; }
      if (ch === ':' && prevKind !== 'id' && prevKind !== 'close' && (t = M(re.sym, src, i))) { push('c-const', t); i += t.length; prev = t; prevKind = 'close'; continue; }
      if ((t = M(re.id, src, i))) {
        const next = src[i + t.length];
        const before = out.length ? out[out.length - 1].t : '';
        const afterDot = before.endsWith('.');
        let c = null;
        if (CONST.has(t) && !afterDot) c = 'c-const';
        else if (DECL.has(t) && !afterDot) c = 'c-decl';
        else if (FLOW.has(t) && !afterDot) c = 'c-flow';
        else if (lineKw === 'using' || lineKw === 'import') c = null;
        else if (prev === '::' || prev === '<:' || prev === '>:' || prev === 'where' || typeDepth > 0) c = 'c-type';
        else if (prev === 'struct' || prev === 'type' || prev === 'module') c = 'c-type';
        else if (prev === 'function' || prev === 'macro') c = 'c-fn';
        else if (next === '(' || next === '{') c = (/^[A-Z]/.test(t) && /[a-z]/.test(t)) || next === '{' ? 'c-type' : 'c-fn';
        else if (/^[A-Z]/.test(t) && /[a-z]/.test(t) && next !== '.') c = 'c-type';
        if (lineStart_(out)) lineKw = (t === 'using' || t === 'import') ? t : lineKw;
        push(c, t); i += t.length; prev = t; prevKind = 'id'; continue;
      }
      if ((t = M(re.num, src, i)) && t.length) {
        push('c-num', t); i += t.length; prev = t; prevKind = 'close'; continue;
      }
      // single punctuation / operator character
      if (ch === '{' && prevKind === 'id') typeDepth++;
      else if (ch === '}' && typeDepth > 0) typeDepth--;
      push(null, ch); i++;
      prev = ch; prevKind = (ch === ')' || ch === ']' || ch === '}') ? 'close' : 'other';
    }
    return out;
  }
  // true when no non-space token precedes on the current line
  function lineStart_(out) {
    for (let k = out.length - 1; k >= 0; k--) {
      const t = out[k].t;
      if (t === '\n') return true;
      if (t.trim()) return false;
    }
    return true;
  }

  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function toLines(tokens) {
    const lines = [[]];
    for (const { c, t } of tokens) {
      const parts = t.split('\n');
      parts.forEach((p, k) => {
        if (k > 0) lines.push([]);
        if (p) lines[lines.length - 1].push(c ? `<span class="${c}">${esc(p)}</span>` : esc(p));
      });
    }
    return lines;
  }

  function dedent(src) {
    const lines = src.replace(/\r/g, '').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    const ind = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
    return lines.map(l => l.slice(isFinite(ind) ? ind : 0)).join('\n');
  }

  function hlSet(spec) {
    const s = new Set();
    (spec || '').split(',').forEach(part => {
      const m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
      if (m) for (let n = +m[1]; n <= +(m[2] || m[1]); n++) s.add(n);
    });
    return s;
  }

  document.querySelectorAll('pre code').forEach(code => {
    if (code.className && !/language-julia/.test(code.className)) return;
    const src = dedent(code.textContent);
    const hl = hlSet(code.dataset.hl);
    const html = toLines(tokenize(src)).map((parts, n) =>
      `<span class="ln${hl.has(n + 1) ? ' hl' : ''}">${parts.join('') || '&#8203;'}</span>`).join('');
    code.innerHTML = html;
    code.classList.add('vs');
    if (code.hasAttribute('data-line-numbers')) code.classList.add('numbered');
  });
})();
