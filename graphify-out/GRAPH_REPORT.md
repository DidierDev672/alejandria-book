# Graph Report - .  (2026-07-16)

## Corpus Check
- 24 files · ~139,218 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 696 nodes · 1012 edges · 113 communities (94 shown, 19 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Member Management|Member Management]]
- [[_COMMUNITY_Video Upload System|Video Upload System]]
- [[_COMMUNITY_Member Progress Tracking|Member Progress Tracking]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_Platform Architecture Docs|Platform Architecture Docs]]
- [[_COMMUNITY_Go Backup Service Core|Go Backup Service Core]]
- [[_COMMUNITY_Notes Feature|Notes Feature]]
- [[_COMMUNITY_Authentication System|Authentication System]]
- [[_COMMUNITY_Vue.js References|Vue.js References]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Backup HTTP Handlers|Backup HTTP Handlers]]
- [[_COMMUNITY_Loading Content System|Loading Content System]]
- [[_COMMUNITY_Backup Service Logic|Backup Service Logic]]
- [[_COMMUNITY_Book Management|Book Management]]
- [[_COMMUNITY_Topic Management|Topic Management]]
- [[_COMMUNITY_PostgreSQL Backup DB|PostgreSQL Backup DB]]
- [[_COMMUNITY_Custom Video Player|Custom Video Player]]
- [[_COMMUNITY_App TypeScript Config|App TypeScript Config]]
- [[_COMMUNITY_Book API Infrastructure|Book API Infrastructure]]
- [[_COMMUNITY_Dune Dev Notes|Dune Dev Notes]]
- [[_COMMUNITY_Author API Infrastructure|Author API Infrastructure]]
- [[_COMMUNITY_Member Create Page|Member Create Page]]
- [[_COMMUNITY_User Registration|User Registration]]
- [[_COMMUNITY_Design System Tokens|Design System Tokens]]
- [[_COMMUNITY_Exercise Service|Exercise Service]]
- [[_COMMUNITY_Backup Domain Entities|Backup Domain Entities]]
- [[_COMMUNITY_Frontend Backup Entities|Frontend Backup Entities]]
- [[_COMMUNITY_Axios HTTP Client|Axios HTTP Client]]
- [[_COMMUNITY_App Entry & Router|App Entry & Router]]
- [[_COMMUNITY_Equipment Store|Equipment Store]]
- [[_COMMUNITY_Exercise Viewer|Exercise Viewer]]
- [[_COMMUNITY_Supabase Client|Supabase Client]]
- [[_COMMUNITY_Chat Store|Chat Store]]
- [[_COMMUNITY_Equipment List Store|Equipment List Store]]
- [[_COMMUNITY_CORS Middleware|CORS Middleware]]
- [[_COMMUNITY_Backup Axios Client|Backup Axios Client]]
- [[_COMMUNITY_Backup Repository|Backup Repository]]
- [[_COMMUNITY_Assign Roles Users|Assign Roles Users]]
- [[_COMMUNITY_Exercise Store|Exercise Store]]
- [[_COMMUNITY_Root TSConfig|Root TSConfig]]
- [[_COMMUNITY_Maintenance Form|Maintenance Form]]
- [[_COMMUNITY_Topic List|Topic List]]
- [[_COMMUNITY_Exercise Axios|Exercise Axios]]
- [[_COMMUNITY_Backup Page|Backup Page]]
- [[_COMMUNITY_Register Form Page|Register Form Page]]
- [[_COMMUNITY_Equipment Store (Legacy)|Equipment Store (Legacy)]]
- [[_COMMUNITY_Book Icon|Book Icon]]
- [[_COMMUNITY_Dashboard Layout|Dashboard Layout]]
- [[_COMMUNITY_Social Icons|Social Icons]]
- [[_COMMUNITY_Topic Repository (TS)|Topic Repository (TS)]]
- [[_COMMUNITY_Vite Config|Vite Config]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `MemberProgress` - 15 edges
3. `Member` - 15 edges
4. `SupabaseVideoRepository` - 15 edges
5. `Video` - 14 edges
6. `BackupService` - 12 edges
7. `MemberDomainService` - 12 edges
8. `MemberService` - 11 edges
9. `HttpMemberRepository` - 11 edges
10. `main()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Gurney Halleck AI Assistant` --semantically_similar_to--> `Fortafid Fitness App`  [AMBIGUOUS] [semantically similar]
  docs/ALAJANDRIA.md → graphify-out/transcripts/entrenamiento_20_minutos.txt
- `Mentat (Specialized Processor Analogy)` --semantically_similar_to--> `Vue Composables Pattern`  [AMBIGUOUS] [semantically similar]
  docs/ALAJANDRIA.md → .agents/skills/vue/references/core-new-apis.md
- `Frontend Design Skill` --conceptually_related_to--> `Atomic Design Pattern`  [INFERRED]
  .agents/skills/frontend-design/SKILL.md → docs/ALAJANDRIA.md
- `20-Minute HIIT Workout Routine` --semantically_similar_to--> `Tabata Protocol`  [INFERRED] [semantically similar]
  graphify-out/transcripts/entrenamiento_20_minutos.txt → graphify-out/transcripts/tabata_workout.txt
- `main()` --calls--> `NewBackupService()`  [INFERRED]
  backup-service/cmd/server/main.go → backup-service/application/services/backup_service.go

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Machine Chest Press Setup Sequence** — press_de_pecho_sentado_ajuste_del_asiento, press_de_pecho_sentado_profundidad, press_de_pecho_sentado_ajuste_del_peso [INFERRED 0.85]
- **Execution Technique Cluster** — press_de_pecho_sentado_protraccion_escapular, press_de_pecho_sentado_serrato_anterior, press_de_pecho_sentado_rango_de_movimiento [INFERRED 0.75]

## Communities (113 total, 19 thin omitted)

### Community 0 - "Member Management"
Cohesion: 0.06
Nodes (40): getCachedMembers(), isMembersListFallbackActive(), readCache(), removeCachedMember(), setMembersListFallback(), upsertCachedMember(), writeCache(), CreateMemberDTO (+32 more)

### Community 1 - "Video Upload System"
Cohesion: 0.11
Nodes (18): VideoService, VideoServiceConfig, globalState, useVideoUpload(), UseVideoUploadOptions, useVideoUploadQueue(), UseVideoUploadReturn, getSupabaseVideoConfig() (+10 more)

### Community 2 - "Member Progress Tracking"
Cohesion: 0.15
Nodes (13): CreateMemberProgressDTO, MemberProgress, MemberProgressFormState, MemberProgressValidationErrors, UpdateMemberProgressDTO, HttpMemberProgressRepository, normalizeList(), normalizeProgress() (+5 more)

### Community 3 - "Project Dependencies"
Cohesion: 0.06
Nodes (30): dependencies, axios, dotenv, marked, motion, motion-vue, pinia, @supabase/supabase-js (+22 more)

### Community 4 - "Platform Architecture Docs"
Cohesion: 0.09
Nodes (29): Atomic Design Pattern, Coliseo (Sports Domain), Gurney Halleck AI Assistant, Melange (State Flow Analogy), Alajandría Book Platform, Supabase as Arrakis (Data Source), API Atreides (Backend REST), Auth Login Endpoint (+21 more)

### Community 5 - "Go Backup Service Core"
Cohesion: 0.10
Nodes (15): BackupService, BackupHandler, getEnv(), NewPgDumpExecutor(), PgDumpExecutor, NewStatusHandler(), StatusHandler, NewRouter() (+7 more)

### Community 6 - "Notes Feature"
Cohesion: 0.14
Nodes (10): Backup, Backup, ServerStatus, getEnv(), NewPostgresBackupRepository(), PostgresBackupRepository, DB, axiosBackup (+2 more)

### Community 7 - "Authentication System"
Cohesion: 0.21
Nodes (7): noteRepository, useNoteStore, Note, NoteFactory, NoteType, AxiosNoteRepository, NoteRepository

### Community 8 - "Vue.js References"
Cohesion: 0.23
Nodes (8): AuthService, AuthResponse, LoginCredentials, User, AuthRepository, AuthApi, authService, useAuthStore

### Community 9 - "TypeScript Config"
Cohesion: 0.30
Nodes (12): BackupService, Request, ResponseWriter, Request, ResponseWriter, BackupService, NewBackupHandler(), writeError() (+4 more)

### Community 10 - "Backup HTTP Handlers"
Cohesion: 0.11
Nodes (16): Biblioteca (Knowledge Domain), Mentat (Specialized Processor Analogy), Vue Built-in Components Reference, Vue Reactivity and Lifecycle Reference, Vue Script Setup Macros Reference, Vue Composables Pattern, defineModel Macro, defineProps Macro (+8 more)

### Community 11 - "Loading Content System"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 12 - "Backup Service Logic"
Cohesion: 0.21
Nodes (6): api, api, Author, CreateAuthorPayload, UpdateAuthorPayload, AuthorApi

### Community 13 - "Book Management"
Cohesion: 0.28
Nodes (5): LoadingService, LoadingModel, DEFAULT_CONFIG, LoadingConfig, LoadingProps

### Community 14 - "Topic Management"
Cohesion: 0.21
Nodes (7): Backup, ServerStatus, BackupExecutor, BackupRepository, NewBackupService(), BackupService, StorageService

### Community 15 - "PostgreSQL Backup DB"
Cohesion: 0.16
Nodes (12): DIFFICULTY_BADGE_STYLES, DIFFICULTY_OPTIONS, ExerciseEditForm, ExerciseEditState, MUSCLE_GROUP_BADGE_STYLES, MUSCLE_GROUP_OPTIONS, CreateExerciseDTO, Exercise (+4 more)

### Community 16 - "Custom Video Player"
Cohesion: 0.26
Nodes (6): bookRepository, useBookStore, Book, BookFactory, AxiosBookRepository, BookRepository

### Community 17 - "App TypeScript Config"
Cohesion: 0.24
Nodes (7): topicRepository, useTopicStore, Topic, TopicFactory, TopicType, AxiosTopicRepository, TopicRepository

### Community 19 - "Dune Dev Notes"
Cohesion: 0.14
Nodes (13): compilerOptions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, noFallthroughCasesInSwitch, noUnusedLocals, noUnusedParameters, paths (+5 more)

### Community 20 - "Author API Infrastructure"
Cohesion: 0.32
Nodes (5): ApiError, Book, CreateBookPayload, UpdateBookPayload, BookApi

### Community 21 - "Member Create Page"
Cohesion: 0.25
Nodes (11): Gom Jabbar Three Stage Modal Architecture, Pinia Store ID Collision Fix, Stillsuit Graceful Degradation, Technical Changelog Dune Alexandria, Template Compilation Fix, Janitor Gate Validation System, Video Upload to Supabase, useVideoUpload Composable (+3 more)

### Community 23 - "Design System Tokens"
Cohesion: 0.42
Nodes (7): handleSubmit(), nextStep(), previousStep(), scrollToTop(), validateCurrentStep(), validateStep1(), validateStep2()

### Community 25 - "Backup Domain Entities"
Cohesion: 0.29
Nodes (8): Ajuste del Asiento, Ajuste del Peso, Press de Pecho en Máquina, Ajuste de Profundidad / Rango de Movimiento, Protracción Escapular, Rango de Movimiento, Series y Repeticiones (Plan de Entrenamiento), Serrato Anterior (Activación)

### Community 26 - "Frontend Backup Entities"
Cohesion: 0.29
Nodes (7): Bookstore Aesthetic, Color Tokens Amber Palette, Component Patterns, Alajandria Design System, Domain Adaptations Biblioteca Gimnasio, Layout System, Typography System

### Community 27 - "Axios HTTP Client"
Cohesion: 0.40
Nodes (6): Backup, BackupStatus, CreateBackupRequest, ErrorResponse, ServerStatus, Time

### Community 28 - "App Entry & Router"
Cohesion: 0.33
Nodes (5): ApiResponse, Backup, BackupStatus, CreateBackupRequest, ServerStatus

### Community 30 - "Exercise Viewer"
Cohesion: 0.40
Nodes (3): router, app, pinia

### Community 31 - "Supabase Client"
Cohesion: 0.33
Nodes (5): CreateEquipmentDTO, Equipment, EquipmentFilters, UpdateEquipmentDTO, useEquipmentStore

### Community 32 - "Chat Store"
Cohesion: 0.40
Nodes (3): DIFFICULTY_MAP, ExerciseViewerExercise, MUSCLE_GROUP_MAP

### Community 33 - "Equipment List Store"
Cohesion: 0.50
Nodes (3): key, supabase, url

### Community 34 - "CORS Middleware"
Cohesion: 0.50
Nodes (3): AiConfig, ChatMessage, useChatStore

### Community 35 - "Backup Axios Client"
Cohesion: 0.50
Nodes (3): Equipment, EquipmentListStore, useEquipmentListStore

## Ambiguous Edges - Review These
- `Gurney Halleck AI Assistant` → `Fortafid Fitness App`  [AMBIGUOUS]
  docs/ALAJANDRIA.md · relation: semantically_similar_to
- `Mentat (Specialized Processor Analogy)` → `Vue Composables Pattern`  [AMBIGUOUS]
  docs/ALAJANDRIA.md · relation: semantically_similar_to

## Knowledge Gaps
- **174 isolated node(s):** `ServerStatus`, `BackupStatus`, `Time`, `ServerStatus`, `CreateBackupRequest` (+169 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Gurney Halleck AI Assistant` and `Fortafid Fitness App`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Mentat (Specialized Processor Analogy)` and `Vue Composables Pattern`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `main()` connect `Go Backup Service Core` to `TypeScript Config`, `Notes Feature`, `Topic Management`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `NewPostgresBackupRepository()` connect `Notes Feature` to `Go Backup Service Core`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `ServerStatus`, `BackupStatus`, `Time` to the rest of the system?**
  _177 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Member Management` be split into smaller, more focused modules?**
  _Cohesion score 0.05617283950617284 - nodes in this community are weakly interconnected._
- **Should `Video Upload System` be split into smaller, more focused modules?**
  _Cohesion score 0.11081560283687943 - nodes in this community are weakly interconnected._