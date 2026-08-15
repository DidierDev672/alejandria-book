import sys, json, os
os.environ['GRAPHIFY_MAX_WORKERS'] = '2'
from graphify.extract import collect_files, extract
from pathlib import Path

code_files = []
detect = json.loads(Path(r'D:\Vue\alajandria-book\graphify-out\.graphify_detect.json').read_text(encoding='utf-8'))
for f in detect.get('files', {}).get('code', []):
    code_files.extend(collect_files(Path(f)) if Path(f).is_dir() else [Path(f)])

result = extract(code_files, cache_root=Path(r'D:\Vue\alajandria-book'), max_workers=2)
Path(r'D:\Vue\alajandria-book\graphify-out\.graphify_ast.json').write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding='utf-8')
print('AST: ' + str(len(result['nodes'])) + ' nodes, ' + str(len(result['edges'])) + ' edges')
