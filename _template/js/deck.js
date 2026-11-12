// Small helpers for the talk template (no dependencies).
//  1. Media layers:  <div class="media" data-file="img/x.jpg" data-alt="…" data-credit="…">
//     Images and videos (.mp4/.webm/.mov: muted, looping, autoplay) are built here.
//     A missing file shows a placeholder that names it, so you can lay slides out first.
//  2. Footer from <body data-footer="Name | Title | Event"> (hidden on slides with class "title").
//  3. Theme toggle: press L (light/dark), remembered in localStorage.
(function () {
  const VIDEO = /\.(mp4|webm|mov)$/i;

  function placeholder(el, file, alt) {
    el.querySelectorAll('img, video').forEach(n => n.remove());
    const ph = document.createElement('div');
    ph.className = 'ph';
    const kind = VIDEO.test(file) ? 'video' : 'image';
    ph.innerHTML = '<b></b><span></span><code></code>';
    ph.querySelector('b').textContent = kind + ' needed' + (alt ? ': ' + alt : '');
    ph.querySelector('code').textContent = file;
    el.prepend(ph);
  }

  document.querySelectorAll('.media[data-file]').forEach(el => {
    const file = el.dataset.file, alt = el.dataset.alt || '';
    const isVideo = VIDEO.test(file);
    const node = document.createElement(isVideo ? 'video' : 'img');
    if (isVideo) {
      node.muted = true; node.loop = true; node.playsInline = true;
      node.setAttribute('muted', ''); node.setAttribute('data-autoplay', '');
      node.addEventListener('error', () => placeholder(el, file, alt));
    } else {
      node.alt = alt; node.decoding = 'async';
      node.addEventListener('error', () => placeholder(el, file, alt));
    }
    node.src = file;
    el.prepend(node);
    if (el.dataset.credit) {
      const c = document.createElement('div');
      c.className = 'credit'; c.textContent = el.dataset.credit;
      el.append(c);
    }
  });

  // Footer
  const text = document.body.dataset.footer;
  if (text) {
    const f = document.createElement('div');
    f.className = 'deck-footer';
    f.innerHTML = '<span></span>';
    f.firstChild.textContent = text;
    document.body.append(f);
  }

  // Theme
  const root = document.documentElement;
  try { const t = localStorage.getItem('deck-theme'); if (t) root.dataset.theme = t; } catch (e) {}
  window.addEventListener('keydown', e => {
    if (e.key === 'l' || e.key === 'L') {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('deck-theme', root.dataset.theme); } catch (err) {}
    }
  });

  // Hide the footer on title slides
  window.deckReady = function (Reveal) {
    const update = () => {
      const s = Reveal.getCurrentSlide();
      document.body.classList.toggle('on-title', !!(s && s.classList.contains('title')));
    };
    Reveal.on('ready', update); Reveal.on('slidechanged', update);
  };
})();
