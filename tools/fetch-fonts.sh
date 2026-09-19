#!/usr/bin/env bash
# Re-download the self-hosted webfonts from Google Fonts and rebuild
# assets/css/fonts.css. Only needed if you change which families or weights
# the site uses. Run from the repository root:  bash tools/fetch-fonts.sh
set -euo pipefail

QUERY="family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..700&family=JetBrains+Mono:wght@500..600&family=Instrument+Serif:ital@0;1&display=swap"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

mkdir -p assets/fonts
curl -sS -A "$UA" "https://fonts.googleapis.com/css2?${QUERY}" -o /tmp/gf.css

python3 - <<'PY'
import re, os, subprocess
css = open('/tmp/gf.css').read()
KEEP = {'latin', 'latin-ext'}          # drop cyrillic/greek/vietnamese
out = ["/* Self-hosted so the site makes no third-party request for type.\n"
       "   Latin + Latin-Extended subsets only. Regenerate with tools/fetch-fonts.sh */\n"]
for subset, face in re.findall(r'/\*\s*([a-z0-9\-\[\] ]+)\s*\*/\s*(@font-face\s*\{.*?\})', css, re.S):
    subset = subset.strip()
    if subset not in KEEP:
        continue
    fam   = re.search(r"font-family:\s*'([^']+)'", face).group(1)
    style = re.search(r'font-style:\s*([^;]+);', face).group(1).strip()
    url   = re.search(r'url\((https://[^)]+)\)', face).group(1)
    slug  = f"{fam.lower().replace(' ', '-')}-{'italic' if style == 'italic' else 'normal'}-{subset}.woff2"
    subprocess.run(['curl', '-sS', '-o', f'assets/fonts/{slug}', url], check=True)
    face = face.replace(url, f'../fonts/{slug}')
    face = re.sub(r'\s+', ' ', face).replace('{ ', '{\n  ').replace('; ', ';\n  ').replace(' }', '\n}')
    out.append(f'/* {fam} · {style} · {subset} */\n{face}\n')
open('assets/css/fonts.css', 'w').write('\n'.join(out))
print('wrote assets/css/fonts.css')
PY
