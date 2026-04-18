
import re
import os

source_file = r'c:\Users\ZBOOK\Documents\dinarlytics\Dinarlytics\frontend\src\pages\inventory\Inventaire.tsx'
if not os.path.exists(source_file):
    print(f"File not found: {source_file}")
    exit(1)

with open(source_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Find strings in JSX: >text<
matches = re.finditer(r'>([^<>{}\n]+)<', content)
hardcoded = []
for m in matches:
    text = m.group(1).strip()
    if len(text) > 2 and not any(k in text for k in ['{', '}']):
        hardcoded.append((content.count('\n', 0, m.start()) + 1, text))

# Find strings in props: title="text"
props_matches = re.finditer(r' (?:title|label|placeholder|text|tooltip)="([^"{ }]+)"', content)
for m in props_matches:
    text = m.group(1).strip()
    if len(text) > 2:
        hardcoded.append((content.count('\n', 0, m.start()) + 1, text))

# Filter out common false positives
ignore_list = ['Dinars Algériens', 'DZD', 'http', 'https', 'rgba', 'grid', 'flex', 'text-', 'bg-']
filtered = []
for line, text in hardcoded:
    if any(ignore in text for ignore in ignore_list):
        continue
    if text.replace('.', '').replace(',', '').isdigit():
        continue
    filtered.append((line, text))

for line, text in sorted(filtered):
    print(f"L{line}: {text}")
