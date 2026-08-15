import json

with open(r"D:\Vue\alajandria-book\graphify-out\graph.json", "r", encoding="utf-8") as f:
    graph = json.load(f)

print(f"Nodes: {len(graph['nodes'])}")
print(f"Links: {len(graph['links'])}")
print(f"Hyperedges: {len(graph.get('hyperedges', []))}")

# Sample links
print("\nSample links:")
for link in graph['links'][:5]:
    print(json.dumps(link, indent=2))

# Community distribution
from collections import Counter
communities = Counter(n.get('community') for n in graph['nodes'])
print(f"\nCommunities: {len(communities)}")
for c, count in communities.most_common(10):
    print(f"  Community {c}: {count} nodes")

# Origin distribution
origins = Counter(n.get('_origin') for n in graph['nodes'])
print(f"\nOrigins:")
for o, count in origins.most_common():
    print(f"  {o}: {count}")
