#!/usr/bin/env bash
# Usage: scripts/new-talk.sh my-talk-event2027 "Talk title"
# Copies _template/ to a new folder and adds an entry to the landing page.
set -euo pipefail
cd "$(dirname "$0")/.."
slug="${1:?usage: scripts/new-talk.sh <folder-name> [\"Talk title\"]}"
title="${2:-$slug}"
[ -e "$slug" ] && { echo "$slug already exists" >&2; exit 1; }
cp -r _template "$slug"
find "$slug/img" -name '.gitkeep' -delete 2>/dev/null || true
python3 - "$slug" "$title" <<'PY'
import sys, html, pathlib
slug, title = sys.argv[1], sys.argv[2]
p = pathlib.Path("index.html"); s = p.read_text()
marker = "<!-- add new talks here"
entry = (f'    <li>\n      <a class="title" href="{slug}/">{html.escape(title)}</a>\n'
         f'      <div class="meta">Event · Authors</div>\n    </li>\n    ')
if marker in s:
    p.write_text(s.replace(marker, entry + marker, 1))
else:
    print("note: marker not found in index.html, add the list entry by hand")
q = pathlib.Path(slug) / "index.html"
t = q.read_text().replace("<title>Talk title</title>", f"<title>{html.escape(title)}</title>")
q.write_text(t)
PY
echo "Created $slug/. Edit $slug/index.html, then: python3 scripts/serve.py  ->  http://localhost:8000/$slug/"
