# talks

Slide decks, published with GitHub Pages at https://marinlauber.github.io/talks/.
One folder per talk. Each deck is a plain reveal.js page (no build step); reveal.js itself is vendored in `vendor/reveal/` and shared by all decks.

## New talk
```
scripts/new-talk.sh my-talk-event2027 "Talk title"   # copies _template/, adds a landing-page entry
python3 scripts/serve.py                              # http://localhost:8000/my-talk-event2027/
```
Edit `my-talk-event2027/index.html` (one `<section>` per slide), put figures in its `img/`, then commit and push.

## Template (`_template/`)
- `index.html`: example slides (title, fragments, equations, Julia code + figure, full-bleed image, big numbers, appendix).
- `css/theme.css`: light/dark theme, section label (`data-label`), footer, columns.
- `js/deck.js`: `<div class="media" data-file="img/x.jpg">` images and looping videos (a missing file shows a placeholder), footer from `<body data-footer>`, `L` toggles dark mode.
- Keys: `S` speaker notes · `L` light/dark · `Esc` overview · `F` fullscreen. Add `?print-pdf` to the URL and print to PDF.
- Equations: write `\( inline \)` and `\[ display \]` LaTeX; KaTeX is vendored in `vendor/katex/`, so everything works offline.

`_template/` is also published (at `/talks/_template/`) and works as a live demo.

## Other
- `ferriteshells-ferritecon2026/`: the FerriteCon 2026 talk, rebuilt as native HTML from the Google Slides (text, equations and code are live; figures are images). The two videos go in its `img/` as `membrane_shear.mp4` and `pillow_inflation.mp4`.
- `.nojekyll` makes Pages serve files as they are.
- reveal.js and KaTeX are MIT licensed (see `vendor/`).
