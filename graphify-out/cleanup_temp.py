import json, glob, os
from pathlib import Path

# Clean up temp files
temp_files = [
    'graphify-out/.graphify_detect.json',
    'graphify-out/.graphify_extract.json',
    'graphify-out/.graphify_ast.json',
    'graphify-out/.graphify_semantic.json',
    'graphify-out/.graphify_analysis.json',
    'graphify-out/.graphify_transcripts.json'
]
for f in temp_files:
    if os.path.exists(f):
        os.remove(f)

# Clean up chunk files
for f in glob.glob('graphify-out/.graphify_chunk_*.json'):
    os.remove(f)
for f in glob.glob('graphify-out/.graphify_chunk_files_*.txt'):
    os.remove(f)

# Clean up helper scripts
scripts = [
    'graphify-out/run_transcribe.py',
    'graphify-out/run_ast.py',
    'graphify-out/update_detect.py',
    'graphify-out/check_cache.py',
    'graphify-out/prepare_chunks.py',
    'graphify-out/merge_chunks.py',
    'graphify-out/save_cache.py',
    'graphify-out/merge_semantic.py',
    'graphify-out/merge_final.py',
    'graphify-out/run_merge_all.py',
    'graphify-out/run_build.py',
    'graphify-out/label_communities.py',
    'graphify-out/regen_report.py',
    'graphify-out/run_cleanup.py'
]
for f in scripts:
    if os.path.exists(f):
        os.remove(f)

print('Cleaned up temporary files')
