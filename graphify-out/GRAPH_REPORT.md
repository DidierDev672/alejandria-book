# Graph Report - .  (2026-06-24)

## Corpus Check
- Corpus is ~46,879 words - fits in a single context window. You may not need a graph.

## Summary
- 202 nodes · 258 edges · 34 communities (28 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Notes Feature (Store + UI)|Notes Feature (Store + UI)]]
- [[_COMMUNITY_Auth Service & Login|Auth Service & Login]]
- [[_COMMUNITY_Dev Dependencies Config|Dev Dependencies Config]]
- [[_COMMUNITY_TypeScript Node Config|TypeScript Node Config]]
- [[_COMMUNITY_Books Feature (Store + Entities)|Books Feature (Store + Entities)]]
- [[_COMMUNITY_Topics Feature (Store + Entities)|Topics Feature (Store + Entities)]]
- [[_COMMUNITY_TypeScript App Config|TypeScript App Config]]
- [[_COMMUNITY_Dashboard Book Domain|Dashboard Book Domain]]
- [[_COMMUNITY_Dashboard Author Domain|Dashboard Author Domain]]
- [[_COMMUNITY_NPM Dependencies|NPM Dependencies]]
- [[_COMMUNITY_User Registration Domain|User Registration Domain]]
- [[_COMMUNITY_Maintenance Equipment Store|Maintenance Equipment Store]]
- [[_COMMUNITY_Axios HTTP Client|Axios HTTP Client]]
- [[_COMMUNITY_Router & App Entry|Router & App Entry]]
- [[_COMMUNITY_TypeScript Base Config|TypeScript Base Config]]
- [[_COMMUNITY_Equipment Axios Instance|Equipment Axios Instance]]
- [[_COMMUNITY_Register Form Page|Register Form Page]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `compilerOptions` - 10 edges
3. `Note` - 8 edges
4. `AxiosNoteRepository` - 8 edges
5. `AuthService` - 7 edges
6. `LoginCredentials` - 7 edges
7. `Book` - 7 edges
8. `AuthResponse` - 6 edges
9. `AxiosBookRepository` - 6 edges
10. `Author` - 6 edges

## Surprising Connections (you probably didn't know these)
- `AuthApi` --implements--> `AuthRepository`  [EXTRACTED]
  src/features/auth/infrastructure/AuthApi.ts → src/features/auth/domain/AuthRepository.ts
- `AxiosBookRepository` --implements--> `BookRepository`  [EXTRACTED]
  src/features/books/infrastructure/repositories/AxiosBookRepository.ts → src/features/books/domain/repositories/BookRepository.ts
- `AxiosNoteRepository` --implements--> `NoteRepository`  [EXTRACTED]
  src/features/notes/infrastructure/repositories/AxiosNoteRepository.ts → src/features/notes/domain/repositories/NoteRepository.ts
- `AxiosTopicRepository` --implements--> `TopicRepository`  [EXTRACTED]
  src/features/topics/infrastructure/repositories/AxiosTopicRepository.ts → src/features/topics/domain/repositories/TopicRepository.ts

## Import Cycles
- None detected.

## Communities (34 total, 6 thin omitted)

### Community 0 - "Notes Feature (Store + UI)"
Cohesion: 0.21
Nodes (7): noteRepository, useNoteStore, Note, NoteFactory, NoteType, AxiosNoteRepository, NoteRepository

### Community 1 - "Auth Service & Login"
Cohesion: 0.23
Nodes (8): AuthService, AuthResponse, LoginCredentials, User, AuthRepository, AuthApi, authService, useAuthStore

### Community 2 - "Dev Dependencies Config"
Cohesion: 0.11
Nodes (17): devDependencies, tailwindcss, @tailwindcss/vite, @types/node, typescript, vite, @vitejs/plugin-vue, vue-tsc (+9 more)

### Community 3 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 4 - "Books Feature (Store + Entities)"
Cohesion: 0.26
Nodes (6): bookRepository, useBookStore, Book, BookFactory, AxiosBookRepository, BookRepository

### Community 5 - "Topics Feature (Store + Entities)"
Cohesion: 0.24
Nodes (7): topicRepository, useTopicStore, Topic, TopicFactory, TopicType, AxiosTopicRepository, TopicRepository

### Community 6 - "TypeScript App Config"
Cohesion: 0.14
Nodes (13): compilerOptions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, noFallthroughCasesInSwitch, noUnusedLocals, noUnusedParameters, paths (+5 more)

### Community 7 - "Dashboard Book Domain"
Cohesion: 0.32
Nodes (5): ApiError, Book, CreateBookPayload, UpdateBookPayload, BookApi

### Community 8 - "Dashboard Author Domain"
Cohesion: 0.36
Nodes (4): Author, CreateAuthorPayload, UpdateAuthorPayload, AuthorApi

### Community 9 - "NPM Dependencies"
Cohesion: 0.22
Nodes (9): dependencies, axios, dotenv, motion, motion-vue, pinia, vue, vue-router (+1 more)

### Community 11 - "Maintenance Equipment Store"
Cohesion: 0.25
Nodes (7): CreateEquipmentDTO, Equipment, EquipmentApiResponse, EquipmentFilters, EquipmentStore, UpdateEquipmentDTO, useEquipmentStore

## Knowledge Gaps
- **72 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+67 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `NPM Dependencies` to `Dev Dependencies Config`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _72 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dev Dependencies Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `TypeScript Node Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `TypeScript App Config` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._