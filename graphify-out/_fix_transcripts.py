import json
from pathlib import Path

# Create transcripts JSON manually since the script timed out
transcripts_dir = Path(r'D:\Vue\alajandria-book\graphify-out\transcripts')
transcript_paths = [str(p) for p in transcripts_dir.glob('*.txt')]
Path(r'D:\Vue\alajandria-book\graphify-out\.graphify_transcripts.json').write_text(json.dumps(transcript_paths, ensure_ascii=False), encoding='utf-8')
print('Found ' + str(len(transcript_paths)) + ' transcripts')
