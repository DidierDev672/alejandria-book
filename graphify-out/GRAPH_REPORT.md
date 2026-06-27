# Graph Report - D:\Vue\alajandria-book  (2026-06-24)

## Corpus Check
- 76 files · ~50,983 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 284 nodes · 328 edges · 51 communities (37 shown, 14 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Package Config|Package Config]]
- [[_COMMUNITY_Notes Feature|Notes Feature]]
- [[_COMMUNITY_Auth Feature|Auth Feature]]
- [[_COMMUNITY_TypeScript Node Config|TypeScript Node Config]]
- [[_COMMUNITY_Books Feature|Books Feature]]
- [[_COMMUNITY_Topics Feature|Topics Feature]]
- [[_COMMUNITY_TypeScript App Config|TypeScript App Config]]
- [[_COMMUNITY_Dashboard BookApi|Dashboard BookApi]]
- [[_COMMUNITY_Dashboard AuthorApi|Dashboard AuthorApi]]
- [[_COMMUNITY_Architecture Docs|Architecture Docs]]
- [[_COMMUNITY_API Documentation|API Documentation]]
- [[_COMMUNITY_Vue Core APIs Ref|Vue Core APIs Ref]]
- [[_COMMUNITY_Dune Alexandria Essay|Dune Alexandria Essay]]
- [[_COMMUNITY_User Registration|User Registration]]
- [[_COMMUNITY_Equipment Store|Equipment Store]]
- [[_COMMUNITY_Vue Script Setup Macros|Vue Script Setup Macros]]
- [[_COMMUNITY_Exercise Service|Exercise Service]]
- [[_COMMUNITY_Vue Advanced Patterns|Vue Advanced Patterns]]
- [[_COMMUNITY_Axios Instance|Axios Instance]]
- [[_COMMUNITY_Router and App Entry|Router and App Entry]]
- [[_COMMUNITY_Tracking Documentation|Tracking Documentation]]
- [[_COMMUNITY_Vue Skill Definition|Vue Skill Definition]]
- [[_COMMUNITY_Project README|Project README]]
- [[_COMMUNITY_Exercise Store|Exercise Store]]
- [[_COMMUNITY_TypeScript Base Config|TypeScript Base Config]]
- [[_COMMUNITY_Axios Equipment|Axios Equipment]]
- [[_COMMUNITY_Axios Exercise|Axios Exercise]]
- [[_COMMUNITY_Register Form|Register Form]]
- [[_COMMUNITY_Index HTML Entry|Index HTML Entry]]
- [[_COMMUNITY_Frontend Design License|Frontend Design License]]
- [[_COMMUNITY_Frontend Design Skill|Frontend Design Skill]]
- [[_COMMUNITY_Favicon SVG|Favicon SVG]]
- [[_COMMUNITY_Social Icons SVG|Social Icons SVG]]
- [[_COMMUNITY_Vue Generation Info|Vue Generation Info]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `compilerOptions` - 10 edges
3. `Architecture Documentation` - 9 edges
4. `Note` - 8 edges
5. `AxiosNoteRepository` - 8 edges
6. `Vue Core New APIs Reference` - 8 edges
7. `API Atreides Documentation` - 8 edges
8. `AuthService` - 7 edges
9. `LoginCredentials` - 7 edges
10. `Book` - 7 edges

## Surprising Connections (you probably didn't know these)
- `AuthApi` --implements--> `AuthRepository`  [EXTRACTED]
  src/features/auth/infrastructure/AuthApi.ts → src/features/auth/domain/AuthRepository.ts
- `AxiosBookRepository` --implements--> `BookRepository`  [EXTRACTED]
  src/features/books/infrastructure/repositories/AxiosBookRepository.ts → src/features/books/domain/repositories/BookRepository.ts
- `AxiosNoteRepository` --implements--> `NoteRepository`  [EXTRACTED]
  src/features/notes/infrastructure/repositories/AxiosNoteRepository.ts → src/features/notes/domain/repositories/NoteRepository.ts
- `AxiosTopicRepository` --implements--> `TopicRepository`  [EXTRACTED]
  src/features/topics/infrastructure/repositories/AxiosTopicRepository.ts → src/features/topics/domain/repositories/TopicRepository.ts
- `Vue Skill` --references--> `Reactivity System`  [EXTRACTED]
  .agents/skills/vue/SKILL.md → .agents/skills/vue/references/core-new-apis.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Vue Reactivity System** — vue_references_core-new-apis_ref, vue_references_core-new-apis_shallowref, vue_references_core-new-apis_computed, vue_references_core-new-apis_reactive, vue_references_core-new-apis_watch, vue_references_core-new-apis_watcheffect, vue_references_core-new-apis_effectscope, vue_references_core-new-apis_composables [INFERRED 0.90]
- **Vue Built-in Components** — vue_references_advanced-patterns_transition, vue_references_advanced-patterns_teleport, vue_references_advanced-patterns_suspense, vue_references_advanced-patterns_keepalive, vue_references_advanced-patterns_v_memo, vue_references_advanced-patterns_custom_directives [INFERRED 0.90]
- **Dune/Alexandria Metaphor** — docs_dune-alexandria_dune, docs_dune-alexandria_biblioteca_de_alejandria, docs_dune-alexandria_casa_atreides, docs_dune-alexandria_paul_atreides, docs_dune-alexandria_duke_leto_atreides, docs_dune-alexandria_knowledge_as_power, docs_dune-alexandria_preservation_of_knowledge [INFERRED 0.80]

## Communities (51 total, 14 thin omitted)

### Community 0 - "Package Config"
Cohesion: 0.07
Nodes (26): dependencies, axios, dotenv, motion, motion-vue, pinia, vue, vue-router (+18 more)

### Community 1 - "Notes Feature"
Cohesion: 0.21
Nodes (7): noteRepository, useNoteStore, Note, NoteFactory, NoteType, AxiosNoteRepository, NoteRepository

### Community 2 - "Auth Feature"
Cohesion: 0.23
Nodes (8): AuthService, AuthResponse, LoginCredentials, User, AuthRepository, AuthApi, authService, useAuthStore

### Community 3 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 4 - "Books Feature"
Cohesion: 0.26
Nodes (6): bookRepository, useBookStore, Book, BookFactory, AxiosBookRepository, BookRepository

### Community 5 - "Topics Feature"
Cohesion: 0.24
Nodes (7): topicRepository, useTopicStore, Topic, TopicFactory, TopicType, AxiosTopicRepository, TopicRepository

### Community 6 - "TypeScript App Config"
Cohesion: 0.14
Nodes (13): compilerOptions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, noFallthroughCasesInSwitch, noUnusedLocals, noUnusedParameters, paths (+5 more)

### Community 7 - "Dashboard BookApi"
Cohesion: 0.32
Nodes (5): ApiError, Book, CreateBookPayload, UpdateBookPayload, BookApi

### Community 8 - "Dashboard AuthorApi"
Cohesion: 0.36
Nodes (4): Author, CreateAuthorPayload, UpdateAuthorPayload, AuthorApi

### Community 9 - "Architecture Docs"
Cohesion: 0.22
Nodes (10): Architecture Documentation, Application Layer, Auth Store, Axios Instance, Clean Architecture, Domain Layer, Feature-based Architecture, Infrastructure Layer (+2 more)

### Community 10 - "API Documentation"
Cohesion: 0.22
Nodes (9): API Atreides Documentation, API Atreides, ApiError Interface, AuthApi, Author Entity, AuthorApi, Book Entity, BookApi (+1 more)

### Community 11 - "Vue Core APIs Ref"
Cohesion: 0.31
Nodes (9): Vue Core New APIs Reference, Composables Pattern, computed Function, effectScope Function, reactive Function, ref Function, shallowRef Function, watch Function (+1 more)

### Community 12 - "Dune Alexandria Essay"
Cohesion: 0.32
Nodes (8): Dune Alexandria Essay, Biblioteca de Alexandria, Casa Atreides, Duke Leto Atreides, Dune Novel, Knowledge as Power, Paul Atreides, Preservation of Knowledge

### Community 14 - "Equipment Store"
Cohesion: 0.25
Nodes (7): CreateEquipmentDTO, Equipment, EquipmentApiResponse, EquipmentFilters, EquipmentStore, UpdateEquipmentDTO, useEquipmentStore

### Community 15 - "Vue Script Setup Macros"
Cohesion: 0.25
Nodes (8): Vue Script Setup Macros Reference, defineEmits Macro, defineExpose Macro, defineModel Macro, defineOptions Macro, defineProps Macro, defineSlots Macro, Generic Components

### Community 16 - "Exercise Service"
Cohesion: 0.29
Nodes (6): CreateExerciseDTO, Exercise, ExerciseFilters, ExerciseService, PaginatedResponse, UpdateExerciseDTO

### Community 17 - "Vue Advanced Patterns"
Cohesion: 0.29
Nodes (7): Vue Advanced Patterns Reference, Custom Directives, KeepAlive Component, Suspense Component, Teleport Component, Transition Component, v-memo Directive

### Community 20 - "Tracking Documentation"
Cohesion: 0.40
Nodes (5): Tracking System Documentation, Grabify Tracking System, Visitor Tracking System, UrlTracker Component, Visitor Tracking

### Community 21 - "Vue Skill Definition"
Cohesion: 0.50
Nodes (4): Reactivity System, Vue Skill, Script Setup Macros, Vue 3 Composition API

### Community 22 - "Project README"
Cohesion: 0.67
Nodes (3): Alejandria Book README, Pinia State Management, Vue Router

## Knowledge Gaps
- **131 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+126 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `name`, `private`, `version` to the rest of the system?**
  _131 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Package Config` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `TypeScript Node Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `TypeScript App Config` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._