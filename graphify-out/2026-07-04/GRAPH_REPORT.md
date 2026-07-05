# Graph Report - .  (2026-07-04)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 619 nodes · 793 edges · 69 communities (56 shown, 13 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `25f6a180`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Video Service|Video Service]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_Vue Patterns|Vue Patterns]]
- [[_COMMUNITY_API Architecture|API Architecture]]
- [[_COMMUNITY_Design System|Design System]]
- [[_COMMUNITY_Notes Feature|Notes Feature]]
- [[_COMMUNITY_Auth Service|Auth Service]]
- [[_COMMUNITY_TypeScript Node Config|TypeScript Node Config]]
- [[_COMMUNITY_Books Feature|Books Feature]]
- [[_COMMUNITY_Topics Feature|Topics Feature]]
- [[_COMMUNITY_Video Player|Video Player]]
- [[_COMMUNITY_TypeScript App Config|TypeScript App Config]]
- [[_COMMUNITY_Book Domain|Book Domain]]
- [[_COMMUNITY_Author Domain|Author Domain]]
- [[_COMMUNITY_Routing|Routing]]
- [[_COMMUNITY_User Domain|User Domain]]
- [[_COMMUNITY_Exercise Service|Exercise Service]]
- [[_COMMUNITY_Equipment Page|Equipment Page]]
- [[_COMMUNITY_HTTP Client|HTTP Client]]
- [[_COMMUNITY_Social Icons|Social Icons]]
- [[_COMMUNITY_Equipment Store|Equipment Store]]
- [[_COMMUNITY_Supabase Config|Supabase Config]]
- [[_COMMUNITY_Equipment List|Equipment List]]
- [[_COMMUNITY_Exercise Store|Exercise Store]]
- [[_COMMUNITY_TypeScript Root Config|TypeScript Root Config]]
- [[_COMMUNITY_Topic List|Topic List]]
- [[_COMMUNITY_Equipment HTTP|Equipment HTTP]]
- [[_COMMUNITY_Exercise HTTP|Exercise HTTP]]
- [[_COMMUNITY_Books Page|Books Page]]
- [[_COMMUNITY_Registration Form|Registration Form]]
- [[_COMMUNITY_Legacy Equipment Store|Legacy Equipment Store]]
- [[_COMMUNITY_Apache License|Apache License]]
- [[_COMMUNITY_Info Row|Info Row]]
- [[_COMMUNITY_Status Badge|Status Badge]]
- [[_COMMUNITY_Error Display|Error Display]]
- [[_COMMUNITY_Loading Spinner|Loading Spinner]]
- [[_COMMUNITY_Base Modal|Base Modal]]
- [[_COMMUNITY_Empty State|Empty State]]
- [[_COMMUNITY_Equipment Detail|Equipment Detail]]
- [[_COMMUNITY_Equipment List View|Equipment List View]]
- [[_COMMUNITY_Favicon|Favicon]]
- [[_COMMUNITY_Vue Generation Info|Vue Generation Info]]

## God Nodes (most connected - your core abstractions)
1. `Architecture Documentation` - 21 edges
2. `compilerOptions` - 16 edges
3. `Alejandría Book` - 16 edges
4. `SupabaseVideoRepository` - 15 edges
5. `Video` - 14 edges
6. `Arquitectura de Alejandría Book` - 13 edges
7. `Script Setup & Macros` - 11 edges
8. `VideoService` - 10 edges
9. `VideoUploadPayload` - 10 edges
10. `compilerOptions` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Entry HTML` --implements--> `Unified Visual Identity`  [INFERRED]
  index.html → .cursor/skills/alejandria-design-system/SKILL.md
- `Unified Visual Identity` --conceptually_related_to--> `Hero as Thesis`  [INFERRED]
  .cursor/skills/alejandria-design-system/SKILL.md → .agents/skills/frontend-design/SKILL.md
- `Unified Visual Identity` --conceptually_related_to--> `Typography Carries Personality`  [INFERRED]
  .cursor/skills/alejandria-design-system/SKILL.md → .agents/skills/frontend-design/SKILL.md
- `VideoService` --implements--> `Clean Architecture`  [INFERRED]
  src/features/video/README.md → docs/ARCHITECTURE.md
- `Unified Visual Identity` --conceptually_related_to--> `Clean Architecture`  [INFERRED]
  .cursor/skills/alejandria-design-system/SKILL.md → docs/ARCHITECTURE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Vue 3 Ecosystem Knowledge** — vue_skill, references_advanced_patterns, references_core_new_apis, references_script_setup_macros [EXTRACTED 1.00]
- **Clean Architecture Across Features** — concept_clean_architecture, concept_auth_repository, concept_video_repository, concept_video_service, concept_auth_service [INFERRED 0.95]
- **API-Frontend Integration Contract** — api_atreides, concept_auth_api, concept_book_api, concept_author_api, concept_exercise_service, concept_axios_instance [EXTRACTED 1.00]
- **Social Media & Utility Icon Sprite** — public_icons_bluesky_icon, public_icons_discord_icon, public_icons_documentation_icon, public_icons_github_icon, public_icons_social_icon, public_icons_x_icon [EXTRACTED 1.00]

## Communities (69 total, 13 thin omitted)

### Community 0 - "Video Service"
Cohesion: 0.11
Nodes (18): VideoService, VideoServiceConfig, globalState, useVideoUpload(), UseVideoUploadOptions, useVideoUploadQueue(), UseVideoUploadReturn, getSupabaseVideoConfig() (+10 more)

### Community 1 - "Project Dependencies"
Cohesion: 0.05
Nodes (37): API Atreides — Contrato de integración, Autenticación, Autenticación, Author, Autores, Book, Clases API en el frontend, Comportamiento ante 401 (+29 more)

### Community 2 - "Vue Patterns"
Cohesion: 0.15
Nodes (21): Composables Pattern, onWatcherCleanup, Reactivity System, v-memo Directive, watchPostEffect, Accept Reactive Input, Composables, computed (+13 more)

### Community 3 - "API Architecture"
Cohesion: 0.13
Nodes (25): API Atreides Documentation, Architecture Documentation, AuthApi, AuthEntity, AuthRepository, AuthService, authStore, AuthorApi (+17 more)

### Community 4 - "Design System"
Cohesion: 0.12
Nodes (19): Alajandría Design System, Color Tokens, Tailwind Utility Mapping (quick reference), Clean Architecture, Two-Pass Design Process, Playfair Display Typography, Unified Visual Identity, UrlTracker Component (+11 more)

### Community 5 - "Notes Feature"
Cohesion: 0.06
Nodes (31): Analogía con la Biblioteca de Alejandría y *Dune*, Arquitectura de Alejandría Book, Bootstrap de la aplicación, Build y despliegue, Cliente HTTP (`axiosInstance`), Convenciones de código, Diagrama de capas, Enrutamiento y seguridad (+23 more)

### Community 6 - "Auth Service"
Cohesion: 0.06
Nodes (30): dependencies, axios, dotenv, marked, motion, motion-vue, pinia, @supabase/supabase-js (+22 more)

### Community 7 - "TypeScript Node Config"
Cohesion: 0.09
Nodes (26): useVideoUpload Composable, VideoEntity, SupabaseVideoRepository, VideoRepository Interface, VideoService, VideoUploadForm, 1. Variables de Entorno, 2. Configuración de Supabase (+18 more)

### Community 8 - "Books Feature"
Cohesion: 0.08
Nodes (26): 1. Clonar el repositorio, 2. Instalar dependencias, 3. Configurar variables de entorno, 4. Iniciar Supabase local, 5. Iniciar el servidor de desarrollo, Alejandría Book, 🗄️ Base de Datos Supabase — Migraciones, 📖 Descripción del Proyecto (+18 more)

### Community 9 - "Topics Feature"
Cohesion: 0.09
Nodes (24): KeepAlive Component, Suspense Component, Teleport Component, Transition Component, Appear on Initial Render, Async Dependencies, Built-in Components & Directives, CSS Classes (+16 more)

### Community 10 - "Video Player"
Cohesion: 0.09
Nodes (21): Alajandría — Design System, Card, Component Patterns, Data Table, Domain-Specific Adaptations, Empty State, Error State, Form Input (+13 more)

### Community 11 - "TypeScript App Config"
Cohesion: 0.16
Nodes (19): Script Setup Macros, Basic Syntax, defineEmits, defineExpose, defineModel, defineOptions, defineProps, defineSlots (+11 more)

### Community 12 - "Book Domain"
Cohesion: 0.10
Nodes (20): 1. El conocimiento como poder, 2. La caída por traición y negligencia, 3. El desierto y los pergaminos, Conceptos de *Dune* y su reflejo técnico, El nombre, I. La Gran Biblioteca: el sueño de reunir todo el saber, II. La Casa Atreides en *Dune*: honor, cultura y responsabilidad, III. La síntesis: Alejandría Book como biblioteca Atreides (+12 more)

### Community 13 - "Author Domain"
Cohesion: 0.21
Nodes (7): noteRepository, useNoteStore, Note, NoteFactory, NoteType, AxiosNoteRepository, NoteRepository

### Community 14 - "Routing"
Cohesion: 0.23
Nodes (8): AuthService, AuthResponse, LoginCredentials, User, AuthRepository, AuthApi, authService, useAuthStore

### Community 15 - "User Domain"
Cohesion: 0.11
Nodes (17): 1. Configurar la ruta en Vue Router, 2. Personalizar la configuración, Backend personalizado (ejemplo con fetch), ⚙️ Características de seguridad, 📍 Componente UrlTracker.vue, 🚀 Cómo usar, Datos de la visita, Datos de red (vía ipapi.co) (+9 more)

### Community 16 - "Exercise Service"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 17 - "Equipment Page"
Cohesion: 0.26
Nodes (6): bookRepository, useBookStore, Book, BookFactory, AxiosBookRepository, BookRepository

### Community 18 - "HTTP Client"
Cohesion: 0.24
Nodes (7): topicRepository, useTopicStore, Topic, TopicFactory, TopicType, AxiosTopicRepository, TopicRepository

### Community 19 - "Social Icons"
Cohesion: 0.73
Nodes (6): Bluesky Social Icon, Discord Social Icon, Documentation Icon, GitHub Social Icon, Generic Social/Star Icon, X (Twitter) Social Icon

### Community 21 - "Supabase Config"
Cohesion: 0.14
Nodes (13): compilerOptions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, noFallthroughCasesInSwitch, noUnusedLocals, noUnusedParameters, paths (+5 more)

### Community 22 - "Equipment List"
Cohesion: 0.32
Nodes (5): ApiError, Book, CreateBookPayload, UpdateBookPayload, BookApi

### Community 23 - "Exercise Store"
Cohesion: 0.36
Nodes (4): Author, CreateAuthorPayload, UpdateAuthorPayload, AuthorApi

### Community 24 - "TypeScript Root Config"
Cohesion: 0.20
Nodes (7): router, app, initApp(), pinia, AiConfig, ChatMessage, useChatStore

### Community 26 - "Equipment HTTP"
Cohesion: 0.29
Nodes (6): CreateExerciseDTO, Exercise, ExerciseFilters, ExerciseService, PaginatedResponse, UpdateExerciseDTO

### Community 27 - "Exercise HTTP"
Cohesion: 0.53
Nodes (3): closeUrlConfirmationModal(), rejectVideoUrl(), resetUrlConfirmation()

### Community 29 - "Registration Form"
Cohesion: 0.33
Nodes (5): CreateEquipmentDTO, Equipment, EquipmentFilters, UpdateEquipmentDTO, useEquipmentStore

### Community 30 - "Legacy Equipment Store"
Cohesion: 0.50
Nodes (3): key, supabase, url

### Community 32 - "Info Row"
Cohesion: 0.50
Nodes (3): Equipment, EquipmentListStore, useEquipmentListStore

## Knowledge Gaps
- **269 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+264 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Clean Architecture` connect `Design System` to `API Architecture`, `TypeScript Node Config`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `Architecture Documentation` connect `API Architecture` to `Design System`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _269 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Video Service` be split into smaller, more focused modules?**
  _Cohesion score 0.11081560283687943 - nodes in this community are weakly interconnected._
- **Should `Project Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `Vue Patterns` be split into smaller, more focused modules?**
  _Cohesion score 0.1471861471861472 - nodes in this community are weakly interconnected._
- **Should `API Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.13230769230769232 - nodes in this community are weakly interconnected._