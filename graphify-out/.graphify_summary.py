import json
from pathlib import Path
detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8'))
print(f\"Corpus: {detect['total_files']} files · ~{detect['total_words']} words\")
for typ, files in detect['files'].items():
    if files:
        exts = set()
        for f in files:
            ext = Path(f).suffix
            if ext:
                exts.add(ext)
        ext_str = ' '.join(sorted(exts))
        print(f\"  {typ}:     {len(files)} files ({ext_str})\")
if detect.get('skipped_sensitive'):
    print(f\"Skipped {len(detect['skipped_sensitive'])} sensitive files.\")
