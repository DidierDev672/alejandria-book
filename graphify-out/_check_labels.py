import json

# Check if labels exist
try:
    with open(r"D:\Vue\alajandria-book\graphify-out\.graphify_labels.json", "r", encoding="utf-8") as f:
        labels = json.load(f)
    print("Labels file exists")
    print(f"Number of labels: {len(labels)}")
    if labels:
        print("\nSample labels:")
        for k, v in list(labels.items())[:10]:
            print(f"  {k}: {v}")
except FileNotFoundError:
    print("No labels file")

# Check graph report
import os
report_path = r"D:\Vue\alajandria-book\graphify-out\GRAPH_REPORT.md"
if os.path.exists(report_path):
    with open(report_path, "r", encoding="utf-8") as f:
        content = f.read()
    print(f"\nGRAPH_REPORT.md exists: {len(content)} chars")
    print(content[:2000])
else:
    print("\nNo GRAPH_REPORT.md")
