# Graph Report - D:\Vue\alajandria-book  (2026-07-13)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1657 nodes · 2289 edges · 186 communities (114 shown, 72 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.69)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f74e309b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- VideoUploadForm.vue
- EquipmentPage.vue
- index.ts
- ExerciseListPage.vue
- ExerciseCreatePage.vue
- NotebookSpread.vue
- MaintenanceForm.vue
- TopicList.vue
- Alejandría Book
- Arquitectura de Alejandría Book
- dependencies
- LoginPage.vue
- AssignRolesPage.vue
- NoteForm.vue
- AuthorsPage.vue
- index.ts
- CustomVideoPlayer.vue
- MemberDomainService
- UserRegisterForm.vue
- MemberCreatePage.vue
- BooksPage.vue
- LoadingView.vue
- BookForm.vue
- Note
- Feature: Video
- UserList.vue
- DashboardLayout.vue
- Grabify - Sistema de Registro de Visitas
- compilerOptions
- Member
- NoteList.vue
- Alajandría Design System
- Book
- MemberHealthForm.vue
- Built-in Components & Directives
- LoadingModel
- AssignedRolesListPage.vue
- CustomVideoPlayer.vue
- useMemberStore.ts
- HttpMemberRepository.ts
- UrlTracker.vue
- compilerOptions
- EquipmentDetailCard.vue
- API Atreides — Contrato de integración
- Book
- BaseInput.vue
- Script Setup Macros
- Vue
- App.vue
- Component Patterns
- useRegisterForm.ts
- Alejandria Book Platform
- Register of Technical Changes — Duniverse & Alexandria Chronicles
- MemberCreatePage.vue
- MemberBasicInfoForm.vue
- HealthConditionCard.vue
- BaseModal.vue
- Reactivity, Lifecycle & Composables
- Clean Architecture
- url
- resetForm
- ImageViewer.vue
- Frontend Design
- Platform Modules
- exerciseService.ts
- DashboardOverview.vue
- exerciseService.ts
- handleSubmit
- EquipmentPage.vue
- Modelos de datos (TypeScript)
- Autores
- Libros
- Ejercicios
- Technical Changelog Dune Alexandria
- Generic Social/Star Icon
- useEquipmentStore.ts
- saveExerciseToAPI
- rejectVideoUrl
- axiosInstance.ts
- useEquipmentStore.ts
- Transition
- Composables
- processImageFile
- Watchers
- README.md
- I. The Guild Heighliner — Uploading Video to Supabase
- II. The Mentat's Precision — Fixing Template Compilation
- III. The Great Houses Conflict — Resolving the Pinia Store ID Collision
- IV. The Janitor's Gate — Validation System
- supabase.ts
- useEquipmentListStore.ts
- EquipmentList.vue
- fetchEquipmentExercises
- Video Feature Module
- chatStore.ts
- chatStore.ts
- useEquipmentListStore.ts
- useExerciseStore.ts
- addExercise
- validateForm
- BaseErrorDisplay.vue
- BaseLoading.vue
- EmptyBox.vue
- useExerciseStore.ts
- tsconfig.json
- GENERATION.md
- Unified Visual Identity
- axiosEquipment.ts
- axiosExercise.ts
- axiosExercise.ts
- closeEquipmentModal
- axiosEquipment.ts
- closeDeleteModal
- closeEditModal
- onVideoFileChange
- clearError
- equipmentStore.js
- BaseTextarea.vue
- equipmentStore.js
- Vue Skill Generation Info
- Apache 2.0 License
- AuthApi
- AuthEntity
- AuthRepository
- AuthService
- authStore
- AuthorApi
- AuthorEntity
- AuthorsPage
- axiosInstance
- axiosExercise
- BookApi
- BookEntity
- BooksPage
- Composables Pattern
- DashboardLayout
- DashboardOverview
- Two-Pass Design Process
- Exercise Entity
- ExerciseList
- ExerciseService
- KeepAlive Component
- LoginPage
- onWatcherCleanup
- Playfair Display Typography
- Reactivity System
- RegisterForm
- Suspense Component
- Teleport Component
- Transition Component
- UrlTracker Component
- useRegisterForm Composable
- useVideoUpload Composable
- UserValidator
- v-memo Directive
- VideoEntity
- SupabaseVideoRepository
- VideoRepository Interface
- VideoService
- VideoUploadForm
- watchPostEffect
- API Atreides Documentation
- Dune-Alexandria Essay
- Project Favicon - Lightning Bolt Icon
- Hero as Thesis
- Structure is Information
- Typography Carries Personality

## God Nodes (most connected - your core abstractions)
1. `Member` - 18 edges
2. `Alejandría Book` - 18 edges
3. `Video` - 17 edges
4. `MemberDomainService` - 16 edges
5. `SupabaseVideoRepository` - 16 edges
6. `compilerOptions` - 16 edges
7. `Member` - 15 edges
8. `SupabaseVideoRepository` - 15 edges
9. `Note` - 14 edges
10. `Video` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Clean Architecture` --conceptually_related_to--> `Video Feature Module`  [INFERRED]
  docs/ARCHITECTURE.md → src/features/video/README.md
- `Alejandria Book Platform` --references--> `Alajandría Design System`  [EXTRACTED]
  README.md → .cursor/skills/alejandria-design-system/SKILL.md
- `Entry HTML` --implements--> `Unified Visual Identity`  [INFERRED]
  index.html → .cursor/skills/alejandria-design-system/SKILL.md
- `Clean Architecture` --conceptually_related_to--> `Vertical Slice Implementation`  [INFERRED]
  docs/ARCHITECTURE.md → docs/DUNE-ALEXANDRIA.md
- `Alejandria Book Platform` --references--> `Clean Architecture`  [EXTRACTED]
  README.md → docs/ARCHITECTURE.md

## Import Cycles
- None detected.

## Communities (186 total, 72 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.06
Nodes (40): getCachedMembers(), isMembersListFallbackActive(), readCache(), removeCachedMember(), setMembersListFallback(), upsertCachedMember(), writeCache(), CreateMemberDTO (+32 more)

### Community 1 - "VideoUploadForm.vue"
Cohesion: 0.07
Nodes (35): VideoService, VideoServiceConfig, Video, VideoMetadata, VideoUploadPayload, VideoUploadProgress, VideoUploadState, VideoValidator (+27 more)

### Community 2 - "EquipmentPage.vue"
Cohesion: 0.04
Nodes (36): confirmedVideoUrl, currentUserId, difficultyOptions, editForm, equipmentExercises, { equipmentList, loading, error }, equipmentStore, exerciseError (+28 more)

### Community 3 - "index.ts"
Cohesion: 0.11
Nodes (18): VideoService, VideoServiceConfig, globalState, useVideoUpload(), UseVideoUploadOptions, useVideoUploadQueue(), UseVideoUploadReturn, getSupabaseVideoConfig() (+10 more)

### Community 4 - "ExerciseListPage.vue"
Cohesion: 0.05
Nodes (29): closeDeleteModal(), closeEditModal(), confirmDelete(), deleteError, deletingExercise, editError, editForm, editingExercise (+21 more)

### Community 5 - "ExerciseCreatePage.vue"
Cohesion: 0.05
Nodes (28): difficultyOptions, equipmentSearch, equipmentStore, errorDetail, errorTitle, exerciseStore, filteredEquipments, form (+20 more)

### Community 6 - "NotebookSpread.vue"
Cohesion: 0.07
Nodes (27): aiConfig, buildSystemPrompt(), chatInput, chatScrollRef, chatStore, configForm, configTested, configTestError (+19 more)

### Community 7 - "MaintenanceForm.vue"
Cohesion: 0.06
Nodes (25): difficultyLevels, equipmentTypes, errors, Exercise, exerciseErrors, exercises, exerciseStore, fileInputRef (+17 more)

### Community 8 - "TopicList.vue"
Cohesion: 0.10
Nodes (19): topicRepository, useTopicStore, Topic, TopicFactory, TopicType, TopicRepository, AxiosTopicRepository, descriptionLength (+11 more)

### Community 9 - "Alejandría Book"
Cohesion: 0.06
Nodes (33): 1. Clonar el repositorio, 2. Instalar dependencias, 3. Configurar variables de entorno, 4. Iniciar Supabase local, 5. Iniciar el servidor de desarrollo, Alejandría Book, 🗄️ Base de Datos Supabase — Migraciones, 📖 Descripción del Proyecto (+25 more)

### Community 10 - "Arquitectura de Alejandría Book"
Cohesion: 0.06
Nodes (31): Analogía con la Biblioteca de Alejandría y *Dune*, Arquitectura de Alejandría Book, Bootstrap de la aplicación, Build y despliegue, Cliente HTTP (`axiosInstance`), Convenciones de código, Diagrama de capas, Enrutamiento y seguridad (+23 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (30): dependencies, axios, dotenv, marked, motion, motion-vue, pinia, @supabase/supabase-js (+22 more)

### Community 12 - "LoginPage.vue"
Cohesion: 0.14
Nodes (16): AuthService, AuthResponse, LoginCredentials, User, AuthRepository, AuthApi, authStore, errors (+8 more)

### Community 13 - "AssignRolesPage.vue"
Cohesion: 0.07
Nodes (17): AssignRoleRequest, AssignRoleResponse, assignRoles(), error, form, isFormValid, isLoading, isMemberModalOpen (+9 more)

### Community 14 - "NoteForm.vue"
Cohesion: 0.07
Nodes (21): bookApi, books, closeBookModal(), closeTopicModal(), colorPalette, confirmBookSelection(), confirmTopicSelection(), errors (+13 more)

### Community 15 - "AuthorsPage.vue"
Cohesion: 0.11
Nodes (15): Author, CreateAuthorPayload, UpdateAuthorPayload, AuthorApi, api, apiError, authors, deleting (+7 more)

### Community 16 - "index.ts"
Cohesion: 0.09
Nodes (21): GOAL_TYPE_OPTIONS, MOOD_OPTIONS, MemberGoal, Props, Emits, Props, Emits, Option (+13 more)

### Community 17 - "CustomVideoPlayer.vue"
Cohesion: 0.07
Nodes (13): containerRef, currentTime, duration, formattedCurrentTime, formattedDuration, isFullscreen, isMuted, isPlaying (+5 more)

### Community 18 - "MemberDomainService"
Cohesion: 0.10
Nodes (12): useMemberStore, MemberDomainService, bmiBgColor, bmiCategory, bmiColor, Props, sizeClasses, validateStep1() (+4 more)

### Community 19 - "UserRegisterForm.vue"
Cohesion: 0.10
Nodes (21): errors, form, FormData, FormErrors, handleSubmit(), isFormValid, isSubmitting, isValidEmail() (+13 more)

### Community 20 - "MemberCreatePage.vue"
Cohesion: 0.11
Nodes (21): MemberValidationErrors, canProceedToStep2, canSubmit, currentStep, formState, handleSubmit(), isStep1Valid, isStep2Valid (+13 more)

### Community 21 - "BooksPage.vue"
Cohesion: 0.09
Nodes (13): bookRepo, books, bookStore, editingId, filteredBooks, form, genreInput, loading (+5 more)

### Community 22 - "LoadingView.vue"
Cohesion: 0.17
Nodes (12): LoadingService, LoadingModel, DEFAULT_CONFIG, LoadingConfig, LoadingProps, IconProps, props, LoadingViewProps (+4 more)

### Community 23 - "BookForm.vue"
Cohesion: 0.10
Nodes (12): BookFactory, BookForm, bookStore, currentGenre, currentPhoto, form, genresList, handleSubmit() (+4 more)

### Community 24 - "Note"
Cohesion: 0.20
Nodes (8): noteRepository, useNoteStore, Note, NoteFactory, NoteType, NoteRepository, AxiosNoteRepository, Props

### Community 25 - "Feature: Video"
Cohesion: 0.10
Nodes (20): 1. Variables de Entorno, 2. Configuración de Supabase, API del Composable `useVideoUpload`, Arquitectura, Características, Componente Pre-construido, Composable (Composition API), Configuración completa del bucket 'gallary' (+12 more)

### Community 26 - "UserList.vue"
Cohesion: 0.12
Nodes (13): ApiUser, error, fetchUsers(), filteredUsers, formatRole(), generateAvatar(), isModalOpen, loading (+5 more)

### Community 27 - "DashboardLayout.vue"
Cohesion: 0.11
Nodes (12): alejandriaItems, alejandriaOpen, authStore, coliseoItems, coliseoOpen, dashboardItem, route, router (+4 more)

### Community 28 - "Grabify - Sistema de Registro de Visitas"
Cohesion: 0.11
Nodes (18): Tracking Feature README, 1. Configurar la ruta en Vue Router, 2. Personalizar la configuración, Backend personalizado (ejemplo con fetch), ⚙️ Características de seguridad, 📍 Componente UrlTracker.vue, 🚀 Cómo usar, Datos de la visita (+10 more)

### Community 29 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 30 - "Member"
Cohesion: 0.25
Nodes (3): MemberService, Member, MemberRepository

### Community 31 - "NoteList.vue"
Cohesion: 0.12
Nodes (8): cardBackgrounds, getCardBackground(), getNotebookColor(), groupedNotes, isNotebookOpen, noteStore, noteTypeConfig, selectedNotebook

### Community 32 - "Alajandría Design System"
Cohesion: 0.12
Nodes (15): Alajandría Design System, Bookstore Aesthetic, Color Tokens, Domain Adaptations Biblioteca Gimnasio, Domain-Specific Adaptations, Layout System, Page Header Pattern, Page Structure (+7 more)

### Community 33 - "Book"
Cohesion: 0.24
Nodes (6): bookRepository, useBookStore, Book, BookRepository, AxiosBookRepository, save()

### Community 34 - "MemberHealthForm.vue"
Cohesion: 0.27
Nodes (11): addGoal(), addHealthCondition(), emit, Emits, removeGoal(), removeHealthCondition(), stressLevelColor, stressLevelLabel (+3 more)

### Community 35 - "Built-in Components & Directives"
Cohesion: 0.13
Nodes (15): Async Dependencies, Built-in Components & Directives, Custom Directives, Directive Arguments & Modifiers, Events, Global Registration, Include/Exclude, KeepAlive (+7 more)

### Community 36 - "LoadingModel"
Cohesion: 0.28
Nodes (5): LoadingService, LoadingModel, DEFAULT_CONFIG, LoadingConfig, LoadingProps

### Community 37 - "AssignedRolesListPage.vue"
Cohesion: 0.15
Nodes (12): assignments, AssignRoleEntry, docTypeLabels, EnrichedAssignment, error, fetchAssignments(), isLoading, MemberData (+4 more)

### Community 39 - "useMemberStore.ts"
Cohesion: 0.35
Nodes (9): CreateMemberDTO, DocumentType, Gender, GoalType, HealthConditionSeverity, MentalHealth, MoodType, UpdateMemberDTO (+1 more)

### Community 40 - "HttpMemberRepository.ts"
Cohesion: 0.22
Nodes (6): HttpMemberRepository, toApiGenre(), toApiGoalType(), toApiMood(), toApiStressLevel(), toApiTargetValue()

### Community 41 - "UrlTracker.vue"
Cohesion: 0.19
Nodes (11): collectTrackingData(), fetchIpData(), generateVisitId(), getQueryParams(), getScreenResolution(), hasError, isTracking, route (+3 more)

### Community 42 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, noFallthroughCasesInSwitch, noUnusedLocals, noUnusedParameters, paths (+5 more)

### Community 43 - "EquipmentDetailCard.vue"
Cohesion: 0.15
Nodes (6): Props, Props, sizeClasses, statusConfig, maintenanceDays, Props

### Community 44 - "API Atreides — Contrato de integración"
Cohesion: 0.18
Nodes (12): API Atreides — Contrato de integración, Autenticación, Clases API en el frontend, Comportamiento ante 401, Configuración, Endpoints, Esquema, Manejo de errores en la UI (+4 more)

### Community 45 - "Book"
Cohesion: 0.32
Nodes (5): ApiError, Book, CreateBookPayload, UpdateBookPayload, BookApi

### Community 46 - "BaseInput.vue"
Cohesion: 0.17
Nodes (6): inputType, isFocused, modelValue, Props, showPassword, state

### Community 47 - "Script Setup Macros"
Cohesion: 0.18
Nodes (11): Basic Syntax, defineEmits, defineExpose, defineModel, defineOptions, defineProps, defineSlots, Generic Components (+3 more)

### Community 48 - "Vue"
Cohesion: 0.20
Nodes (7): Component Template, Core, Features, Key Imports, Preferences, Quick Reference, Vue

### Community 49 - "App.vue"
Cohesion: 0.22
Nodes (6): @/stores/chatStore, isAppReady, router, app, pinia, router

### Community 50 - "Component Patterns"
Cohesion: 0.20
Nodes (10): Card, Component Patterns, Data Table, Empty State, Error State, Form Input, Loading State, Primary Button (+2 more)

### Community 51 - "useRegisterForm.ts"
Cohesion: 0.38
Nodes (4): UserEntity, UserValidator, {
    user,
    errors,
    showPassword,
    isLoading,
    submitSuccess,
    handleSubmit,
    togglePasswordVisibility,
    clearFieldError,
}, useRegisterForm()

### Community 52 - "Alejandria Book Platform"
Cohesion: 0.22
Nodes (9): API Atreides Backend, JWT Authentication, TypeScript Data Models, Centralized HTTP Client Axios, REST Endpoints, Graphify Knowledge Graph, Alejandria Book Platform, Technology Stack (+1 more)

### Community 53 - "Register of Technical Changes — Duniverse & Alexandria Chronicles"
Cohesion: 0.22
Nodes (9): Environment Variables (The Spice Variables), Key Decisions (The Council of the Landsraad), Register of Technical Changes — Duniverse & Alexandria Chronicles, Table of Contents, The Alexandria Analogy: The Three Halls, The ConfirmModal Flow: The Test of Humanity, The Vertical Slice, V. The Three Stages of the Gom Jabbar — Modal Architecture (+1 more)

### Community 54 - "MemberCreatePage.vue"
Cohesion: 0.42
Nodes (7): handleSubmit(), nextStep(), previousStep(), scrollToTop(), validateCurrentStep(), validateStep1(), validateStep2()

### Community 55 - "MemberBasicInfoForm.vue"
Cohesion: 0.21
Nodes (11): DOCUMENT_TYPE_OPTIONS, GENDER_OPTIONS, MemberFormState, calculatedAge, calculatedBMI, emit, Emits, Props (+3 more)

### Community 56 - "HealthConditionCard.vue"
Cohesion: 0.28
Nodes (8): SEVERITY_OPTIONS, HealthCondition, emit, Emits, Props, severityColor, severityIcon, updateField()

### Community 57 - "BaseModal.vue"
Cohesion: 0.33
Nodes (8): currentMaxWidthClass, emit, handleClose(), handleEscape(), handleExpandKey(), isExpanded, Props, toggleExpand()

### Community 58 - "Reactivity, Lifecycle & Composables"
Cohesion: 0.25
Nodes (7): computed, Effect Scope, Lifecycle Hooks, reactive & readonly, Reactivity, Reactivity, Lifecycle & Composables, ref vs shallowRef

### Community 59 - "Clean Architecture"
Cohesion: 0.25
Nodes (8): Clean Architecture, Feature Based Structure, Architecture Layers, File Naming Conventions, Architectural Roadmap, Routing and Security Vue Router, Pinia State Management, Supabase Integration

### Community 60 - "url"
Cohesion: 0.25
Nodes (7): handleCancel(), handleVideoFileSelect(), removeVideoFile(), retryVideoUpload(), key, supabase, url

### Community 61 - "resetForm"
Cohesion: 0.25
Nodes (8): clearImage(), closeExercisesModal(), handleOnlyEquipment(), resetExercises(), resetForm(), saveExercises(), validateAllExercises(), validateExercise()

### Community 62 - "ImageViewer.vue"
Cohesion: 0.39
Nodes (7): currentIndex, emit, handleClose(), handleKeyDown(), nextImage(), previousImage(), Props

### Community 63 - "Frontend Design"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 64 - "Platform Modules"
Cohesion: 0.29
Nodes (7): Pinia Store ID Collision Fix, Vertical Slice Implementation, AI Assistant NotebookSpread, Chat Persistence Supabase, Members Gladiators Module, Platform Modules, Vertical Slicing Onion Architecture

### Community 65 - "exerciseService.ts"
Cohesion: 0.29
Nodes (6): CreateExerciseDTO, Exercise, ExerciseFilters, ExerciseService, PaginatedResponse, UpdateExerciseDTO

### Community 66 - "DashboardOverview.vue"
Cohesion: 0.29
Nodes (6): KpiCard, kpis, maxValue, monthlyData, PopularBook, popularBooks

### Community 67 - "exerciseService.ts"
Cohesion: 0.29
Nodes (6): CreateExerciseDTO, Exercise, ExerciseFilters, ExerciseService, PaginatedResponse, UpdateExerciseDTO

### Community 68 - "handleSubmit"
Cohesion: 0.29
Nodes (7): confirmVideoUrl(), handleSubmit(), pickRandomMessage(), uploadVideoToSupabase(), validateDifficulty(), validateForm(), validateName()

### Community 69 - "EquipmentPage.vue"
Cohesion: 0.53
Nodes (3): closeUrlConfirmationModal(), rejectVideoUrl(), resetUrlConfirmation()

### Community 70 - "Modelos de datos (TypeScript)"
Cohesion: 0.33
Nodes (6): Author, Book, Error estándar, Exercise, Modelos de datos (TypeScript), User

### Community 71 - "Autores"
Cohesion: 0.33
Nodes (6): Autores, `DELETE /authors/:id`, `GET /authors`, `GET /authors/:id`, `POST /authors`, `PUT /authors/:id`

### Community 72 - "Libros"
Cohesion: 0.33
Nodes (6): `DELETE /books/:id`, `GET /books`, `GET /books/:id`, Libros, `POST /books`, `PUT /books/:id`

### Community 73 - "Ejercicios"
Cohesion: 0.33
Nodes (6): `DELETE /exercises/:id`, Ejercicios, `GET /exercises`, `GET /exercises/:id`, `POST /exercises`, `PUT /exercises/:id`

### Community 74 - "Technical Changelog Dune Alexandria"
Cohesion: 0.60
Nodes (6): Gom Jabbar Three Stage Modal Architecture, Stillsuit Graceful Degradation, Technical Changelog Dune Alexandria, Template Compilation Fix, Janitor Gate Validation System, Video Upload to Supabase

### Community 75 - "Generic Social/Star Icon"
Cohesion: 0.73
Nodes (6): Bluesky Social Icon, Discord Social Icon, Documentation Icon, GitHub Social Icon, Generic Social/Star Icon, X (Twitter) Social Icon

### Community 76 - "useEquipmentStore.ts"
Cohesion: 0.33
Nodes (5): CreateEquipmentDTO, Equipment, EquipmentFilters, UpdateEquipmentDTO, useEquipmentStore

### Community 77 - "saveExerciseToAPI"
Cohesion: 0.33
Nodes (6): closeAddExerciseModal(), confirmVideoUrl(), resetExerciseForm(), retryVideoUpload(), saveExerciseToAPI(), submitExercise()

### Community 78 - "rejectVideoUrl"
Cohesion: 0.40
Nodes (5): closeUrlConfirmationModal(), closeVideoUploadError(), rejectVideoUrl(), removeVideoFile(), resetUrlConfirmation()

### Community 80 - "useEquipmentStore.ts"
Cohesion: 0.33
Nodes (5): CreateEquipmentDTO, Equipment, EquipmentFilters, UpdateEquipmentDTO, useEquipmentStore

### Community 81 - "Transition"
Cohesion: 0.40
Nodes (5): Appear on Initial Render, CSS Classes, JavaScript Hooks, Transition, Transition Modes

### Community 82 - "Composables"
Cohesion: 0.40
Nodes (5): Accept Reactive Input, Composables, Naming Convention, Pattern, Return Refs (Not Reactive)

### Community 83 - "processImageFile"
Cohesion: 0.40
Nodes (5): ALLOWED_IMAGE_TYPES, handleImageDrop(), handleImageSelect(), processImageFile(), validateImageFile()

### Community 84 - "Watchers"
Cohesion: 0.50
Nodes (4): Flush Timing, watch, watchEffect, Watchers

### Community 86 - "I. The Guild Heighliner — Uploading Video to Supabase"
Cohesion: 0.50
Nodes (4): Architecture: Onion Layers, Graceful Degradation — The Stillsuit Principle, I. The Guild Heighliner — Uploading Video to Supabase, The Spice Must Flow

### Community 87 - "II. The Mentat's Precision — Fixing Template Compilation"
Cohesion: 0.50
Nodes (4): II. The Mentat's Precision — Fixing Template Compilation, The Alexandria Analogy: The Scroll Index, The Diagnosis, The Error That Was

### Community 88 - "III. The Great Houses Conflict — Resolving the Pinia Store ID Collision"
Cohesion: 0.50
Nodes (4): III. The Great Houses Conflict — Resolving the Pinia Store ID Collision, The Family Atom, The Fix: Renaming the Fief, The Runtime Trap

### Community 89 - "IV. The Janitor's Gate — Validation System"
Cohesion: 0.50
Nodes (4): IV. The Janitor's Gate — Validation System, The Dune Analogy: The Gom Jabbar Test, The Gladiator's Credentials, The Three Gates

### Community 90 - "supabase.ts"
Cohesion: 0.50
Nodes (3): key, supabase, url

### Community 91 - "useEquipmentListStore.ts"
Cohesion: 0.50
Nodes (3): Equipment, EquipmentListStore, useEquipmentListStore

### Community 93 - "fetchEquipmentExercises"
Cohesion: 0.50
Nodes (4): closeDeleteExerciseModal(), deleteExercise(), fetchEquipmentExercises(), openViewModal()

### Community 94 - "Video Feature Module"
Cohesion: 0.50
Nodes (4): useVideoUpload Composable, Supabase Video Storage Configuration, Video Upload Validations, Video Feature Module

### Community 95 - "chatStore.ts"
Cohesion: 0.50
Nodes (3): AiConfig, ChatMessage, useChatStore

### Community 96 - "chatStore.ts"
Cohesion: 0.50
Nodes (3): AiConfig, ChatMessage, useChatStore

### Community 97 - "useEquipmentListStore.ts"
Cohesion: 0.50
Nodes (3): Equipment, EquipmentListStore, useEquipmentListStore

### Community 99 - "addExercise"
Cohesion: 0.67
Nodes (3): addExercise(), generateExerciseId(), handleAddExercises()

### Community 100 - "validateForm"
Cohesion: 0.67
Nodes (3): handleSubmit(), validateField(), validateForm()

## Knowledge Gaps
- **749 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+744 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **72 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SupabaseVideoRepository` connect `VideoUploadForm.vue` to `rejectVideoUrl`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `rejectVideoUrl()` connect `rejectVideoUrl` to `EquipmentPage.vue`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `url` connect `url` to `onVideoFileChange`, `rejectVideoUrl`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _749 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05617283950617284 - nodes in this community are weakly interconnected._
- **Should `VideoUploadForm.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.06738245094409478 - nodes in this community are weakly interconnected._
- **Should `EquipmentPage.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._