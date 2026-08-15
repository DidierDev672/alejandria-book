# Graph Report - .  (2026-07-20)

## Corpus Check
- 244 files · ~164,407 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1067 nodes · 1740 edges · 131 communities (100 shown, 31 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Member Domain|Member Domain]]
- [[_COMMUNITY_Routine Service|Routine Service]]
- [[_COMMUNITY_Auth & App Core|Auth & App Core]]
- [[_COMMUNITY_Video Upload|Video Upload]]
- [[_COMMUNITY_Project Documentation|Project Documentation]]
- [[_COMMUNITY_Routine Frontend|Routine Frontend]]
- [[_COMMUNITY_Dashboard Authors|Dashboard Authors]]
- [[_COMMUNITY_Member Progress|Member Progress]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Topic Research Repo|Topic Research Repo]]
- [[_COMMUNITY_Notes Feature|Notes Feature]]
- [[_COMMUNITY_Role Assignment|Role Assignment]]
- [[_COMMUNITY_Topic Research Handler|Topic Research Handler]]
- [[_COMMUNITY_Book Domain|Book Domain]]
- [[_COMMUNITY_Vue Skill References|Vue Skill References]]
- [[_COMMUNITY_Backup Handler|Backup Handler]]
- [[_COMMUNITY_Exercise Video Upload|Exercise Video Upload]]
- [[_COMMUNITY_TSConfig Node|TSConfig Node]]
- [[_COMMUNITY_Loading System|Loading System]]
- [[_COMMUNITY_Backup Service|Backup Service]]
- [[_COMMUNITY_Backup Database|Backup Database]]
- [[_COMMUNITY_Topic Store|Topic Store]]
- [[_COMMUNITY_Server Main|Server Main]]
- [[_COMMUNITY_Video Player|Video Player]]
- [[_COMMUNITY_Routine Database|Routine Database]]
- [[_COMMUNITY_Fitness Transcripts|Fitness Transcripts]]
- [[_COMMUNITY_User Registration|User Registration]]
- [[_COMMUNITY_Exercise Edit|Exercise Edit]]
- [[_COMMUNITY_Exercise Viewer|Exercise Viewer]]
- [[_COMMUNITY_Equipment Store|Equipment Store]]
- [[_COMMUNITY_Routine Create Page|Routine Create Page]]
- [[_COMMUNITY_Backup Entities|Backup Entities]]
- [[_COMMUNITY_Exercise Pages|Exercise Pages]]
- [[_COMMUNITY_Dune Documentation|Dune Documentation]]
- [[_COMMUNITY_TSConfig App|TSConfig App]]
- [[_COMMUNITY_Server Middleware|Server Middleware]]
- [[_COMMUNITY_Build Config|Build Config]]
- [[_COMMUNITY_Authors Page|Authors Page]]
- [[_COMMUNITY_Member Create Page|Member Create Page]]
- [[_COMMUNITY_Status Handler|Status Handler]]
- [[_COMMUNITY_Routine Validation|Routine Validation]]
- [[_COMMUNITY_Storage Service|Storage Service]]
- [[_COMMUNITY_Go Middleware|Go Middleware]]
- [[_COMMUNITY_Backup UI|Backup UI]]
- [[_COMMUNITY_Equipment List|Equipment List]]
- [[_COMMUNITY_Design System|Design System]]
- [[_COMMUNITY_PgDump Executor|PgDump Executor]]
- [[_COMMUNITY_Backup Domain|Backup Domain]]
- [[_COMMUNITY_Topic Research Store|Topic Research Store]]
- [[_COMMUNITY_Navigation Guard|Navigation Guard]]
- [[_COMMUNITY_Exercise Video Card|Exercise Video Card]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 118|Community 118]]
- [[_COMMUNITY_Community 123|Community 123]]
- [[_COMMUNITY_Community 124|Community 124]]
- [[_COMMUNITY_Community 125|Community 125]]
- [[_COMMUNITY_Community 127|Community 127]]
- [[_COMMUNITY_Community 128|Community 128]]
- [[_COMMUNITY_Community 130|Community 130]]

## God Nodes (most connected - your core abstractions)
1. `BackupService` - 22 edges
2. `SupabaseVideoRepository` - 22 edges
3. `Routine` - 19 edges
4. `TopicResearchHandler` - 18 edges
5. `Video` - 18 edges
6. `VideoService` - 17 edges
7. `RoutineHandler` - 16 edges
8. `MemberDomainService` - 16 edges
9. `compilerOptions` - 16 edges
10. `TopicResearchService` - 15 edges

## Surprising Connections (you probably didn't know these)
- `AuthService` --references--> `Dependency Inversion Principle`  [EXTRACTED]
  src/features/auth/application/AuthService.ts → routine-service/README.md
- `index.html (App Entry)` --references--> `Vite Config`  [INFERRED]
  index.html → vite.config.ts
- `Vite Config` --references--> `main`  [INFERRED]
  vite.config.ts → routine-service/cmd/server/main.go
- `BackupService` --semantically_similar_to--> `TopicResearchService`  [INFERRED] [semantically similar]
  backup-service/application/services/backup_service.go → backup-service/application/services/topic_research_service.go
- `Backup` --semantically_similar_to--> `TopicResearch`  [INFERRED] [semantically similar]
  backup-service/domain/entities/backup.go → backup-service/domain/entities/topic_research.go

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Vue Reactivity System** — references_vue_ref, references_vue_shallow_ref, references_vue_computed, references_vue_watch, references_vue_watch_effect [EXTRACTED 1.00]
- **Atreides API Endpoint Surface** — docs_api_login_endpoint, docs_api_books_crud, docs_api_authors_crud, docs_api_exercises_crud, docs_api_progress_member_crud, docs_api_members_get [EXTRACTED 1.00]
- **Clean Architecture Layer Stack** — docs_architecture_presentation_layer, docs_architecture_application_layer, docs_architecture_domain_layer, docs_architecture_infrastructure_layer [EXTRACTED 1.00]
- **Exercise Video Upload Pipeline** — docs_exercise_list_changes_video_upload, docs_exercise_list_changes_upload_composable, docs_exercise_list_changes_upload_service, docs_exercise_list_changes_upload_modal, docs_exercise_list_changes_verify_modal, docs_api_supabase_storage [EXTRACTED 1.00]
- **High Intensity Interval Training Domain** — transcripts_entrenamiento_hiit, transcripts_sprint_interval, transcripts_tabata [INFERRED 0.85]
- **Clean Architecture Backup Domain Stack** — repositories_backuprepository, database_postgresbackuprepository, filesystem_pdumpexecutor, services_backupservice, handlers_backuphandler, entities_backup, entities_backupstatus [EXTRACTED 1.00]
- **Clean Architecture Research Domain Stack** — repositories_topicresearchrepository, database_postgrestopicresearchrepository, services_topicresearchservice, handlers_topicresearchhandler, entities_topicresearch, entities_createtopicresearchrequest, entities_updatetopicresearchrequest [EXTRACTED 1.00]
- **HTTP Server Bootstrap Wiring** — server_main, http_newrouter, http_startserver, middleware_corsmiddleware, handlers_backuphandler, handlers_statushandler, handlers_topicresearchhandler [EXTRACTED 1.00]
- **Clean Architecture Layered Dependency Flow** — handlers_routinehandler, services_routineapplicationservice, repositories_routinerepository, database_postroutinerepository, services_routinevalidationservice [EXTRACTED 1.00]
- **CRUD Routine Use Case Flow** — handlers_getall, handlers_getbyid, handlers_create, handlers_update, handlers_delete, handlers_search, services_getallroutines, services_getroutinebyid, services_createroutine, services_updateroutine, services_deleteroutine, services_searchroutines [EXTRACTED 1.00]
- **Domain Entity Types** — entities_routine, entities_createroutinerequest, entities_updateroutinerequest, entities_routineresponse, entities_errorresponse [EXTRACTED 1.00]
- **Authentication Flow (Login/Logout/Session)** — stores_authstore, application_authservice, infrastructure_authapi, domain_authrepository, domain_authentity, http_axiosinstance, pages_loginpage, router_index, concept_localstorage_session [INFERRED 0.95]
- **AI Chat Integration (Config + Chat + Supabase)** — stores_chatstore, config_aiconfigstore, components_aiconfigmodal, lib_supabase, concept_fallback_local_mode [INFERRED 0.95]
- **User Registration Flow (Validation + Form + UseCase)** — pages_registerform, usescases_useregisterform, validators_uservalidator, domain_userentity, components_userregisterform [INFERRED 0.90]
- **Backup Feature UI Composition (Atom -> Molecule -> Organism -> Page)** — atoms_statusindicator, atoms_storagebar, molecules_backupcard, molecules_serverstatus, organisms_backuptable, organisms_createbackupbutton, pages_backuppge [EXTRACTED 1.00]
- **Books Feature Clean Architecture Layers (Domain -> Application -> Infrastructure -> Presentation)** — entities_book, entities_bookfactory, repositories_bookrepository, repositories_axiosbookrepository, application_usebookstore, components_bookform [EXTRACTED 1.00]
- **Colesio Role Assignment Flow (Store -> Modal -> Page)** — stores_useassignrolesmemberstore, stores_useassignrolesuserstore, organisms_memberlistmodal, organisms_userlistmodal, pages_assignrolespage [EXTRACTED 1.00]
- **Author CRUD Workflow** — composables_useauthorform_useauthorform, composables_useauthorcrud_useauthorcrud, infrastructure_authorapi_authorapi, pages_authorspage_authorspage, components_authormodal_authormodal [EXTRACTED 1.00]
- **Exercise Video Upload Pipeline** — services_exercisevideouploadservice_exercisevideouploadservice, composables_useexercisevideoupload_useexercisevideoupload, pages_exerciselistpage_exerciselistpage, pages_exerciscreatepage_exerciscreatepage, molecules_videouploadingmodal_videouploadingmodal, molecules_videoverificationmodal_videoverificationmodal [EXTRACTED 1.00]
- **Login Authentication Flow** — pages_loginpage_loginpage, stores_authstore_useauthstore, application_authservice_authservice, infrastructure_authapi_authapi, domain_authrepository_authrepository [EXTRACTED 1.00]
- **User Registration Workflow** — pages_registerform_registerform, usescases_useregisterform_useregisterform, validators_uservalidator_uservalidator, domain_userentity_userentity [EXTRACTED 1.00]
- **Book Management Workflow** — components_bookform_bookform, application_usebookstore_usebookstore, repositories_axiosbookrepository_axiosbookrepository, entities_book_bookfactory, entities_book_book [EXTRACTED 1.00]
- **Video Upload Pipeline** — components_videouploadform_videouploadform, composables_usevideoupload_usevideoupload, application_videoservice_videoservice, repositories_supabasevideorepository_supabasevideorepository, entities_videoentity_videovdator, config_supabase_getsupabasevideoconfig [EXTRACTED 1.00]
- **Supabase Video Storage Infrastructure** — repositories_supabasevideorepository_supabasevideorepository, config_supabase_getsupabasevideoconfig, repositories_videorepository_videorepository [EXTRACTED 1.00]
- **Notes CRUD Workflow** — components_noteform_noteform, components_notelist_notelist, application_usenotestore_usenotestore, repositories_axiosnoterepository_axiosnoterepository, entities_note_notefactory, entities_note_note [EXTRACTED 1.00]
- **Equipment-Exercise-Video Integration Pipeline** — components_equipmentpage_equipmentpage, composables_useexerciseedit_useexerciseedit, composables_useexerciseviewer_useexerciseviewer, composables_usevideoupload_usevideoupload, repositories_supabasevideorepository_supabasevideorepository, http_axiosequipment_axiosequipment, http_axiosexercise_axiosexercise [EXTRACTED 1.00]
- **Equipment CRUD Workflow** — components_maintenanceform_maintenanceform, components_equipmentlist_equipmentlist, components_equipmentdetailcard_equipmentdetailcard, stores_useequipmentstore_useequipmentstore, stores_useequipmentliststore_useequipmentliststore, http_axiosequipment_axiosequipment [EXTRACTED 1.00]
- **Equipment-Exercise Integration (Post-Creation Flow)** — components_maintenanceform_maintenanceform, components_exercisemodal_exercisemodal, stores_useexercisestore_useexercisestore, stores_useequipmentstore_useequipmentstore [EXTRACTED 1.00]
- **Members Full Domain Service Architecture** — entities_member_member, entities_member_healthcondition, entities_member_mentalhealth, entities_member_membergoal, repositories_memberrepository_memberrepository, services_memberdomainservice_memberdomainservice, services_memberservice_memberservice, stores_usememberstore_usememberstore, infrastructure_httpmemberrepository_httpmemberrepository, infrastructure_memberlocalcache_memberlocalcache [EXTRACTED 1.00]
- **Roles Assignment Workflow (User/Member + Role Selection)** — pages_assignrolespage_assignrolespage, pages_assignedroleslistpage_assignedroleslistpage, stores_useassignrolesuserstore_useassignrolesuserstore, stores_useassignrolesmemberstore_useassignrolesmemberstore, components_userlistmodal_userlistmodal, components_memberlistmodal_memberlistmodal, http_axiosinstance_axiosinstance [EXTRACTED 1.00]
- **AI Chat with Supabase Persistence + Local Fallback** — stores_chatstore_chatstore, components_notebookspread_notebookspread, concept_ai_chat_persistence, concept_local_cache_fallback [EXTRACTED 1.00]

## Communities (131 total, 31 thin omitted)

### Community 0 - "Member Domain"
Cohesion: 0.05
Nodes (48): getCachedMembers(), isMembersListFallbackActive(), readCache(), removeCachedMember(), setMembersListFallback(), upsertCachedMember(), writeCache(), BMI Calculation (Weight / Height^2) (+40 more)

### Community 1 - "Routine Service"
Cohesion: 0.07
Nodes (45): Dependency Inversion Principle, CreateRoutineRequest, Routine, RoutineResponse, UpdateRoutineRequest, Create (handler), Delete (handler), GetAll (handler) (+37 more)

### Community 2 - "Auth & App Core"
Cohesion: 0.07
Nodes (27): AuthService, Graceful Fallback to Local Mode, localStorage-Based Session Management, Custom Auth System (Non-Supabase Auth), Repository Pattern (Clean Architecture), Route Guard Authentication (localStorage Token Check), Custom Session Expiration Event Pattern, useAiConfigStore (+19 more)

### Community 3 - "Video Upload"
Cohesion: 0.12
Nodes (21): VideoService, VideoServiceConfig, VideoUploadForm (Vue Component), globalState, useVideoUpload(), UseVideoUploadOptions, useVideoUploadQueue(), UseVideoUploadReturn (+13 more)

### Community 4 - "Project Documentation"
Cohesion: 0.05
Nodes (51): Atomic Design Pattern, Melange (State Flow Analogy), Alajandría Book Platform, Supabase as Arrakis (Data Source), API Atreides Documentation, API Atreides, Axios 401 Auth Interceptor, Author TypeScript Interface (+43 more)

### Community 5 - "Routine Frontend"
Cohesion: 0.11
Nodes (15): getCachedRoutines(), removeCachedRoutine(), upsertCachedRoutine(), CreateRoutineDTO, Routine, RoutineFormState, RoutineValidationErrors, UpdateRoutineDTO (+7 more)

### Community 6 - "Dashboard Authors"
Cohesion: 0.11
Nodes (20): AuthorModal (Vue Component), api, useAuthorCrud(), api, useAuthorForm(), Atomic Design Pattern, Entity + CreatePayload + UpdatePayload Pattern, SOLID Principles (+12 more)

### Community 7 - "Member Progress"
Cohesion: 0.15
Nodes (13): CreateMemberProgressDTO, MemberProgress, MemberProgressFormState, MemberProgressValidationErrors, UpdateMemberProgressDTO, HttpMemberProgressRepository, normalizeList(), normalizeProgress() (+5 more)

### Community 8 - "Package Dependencies"
Cohesion: 0.06
Nodes (30): dependencies, axios, dotenv, marked, motion, motion-vue, pinia, @supabase/supabase-js (+22 more)

### Community 9 - "Topic Research Repo"
Cohesion: 0.11
Nodes (12): TopicResearch, Time, DB, TopicResearch, NewPostgresTopicResearchRepository(), PostgresTopicResearchRepository, TopicResearch, TopicResearchRepository (+4 more)

### Community 10 - "Notes Feature"
Cohesion: 0.16
Nodes (14): noteRepository, useNoteStore, NotebookSpread (Vue Component), NoteForm (Vue Component), NoteList (Vue Component), AI Chat Persistence (Supabase + Local Fallback), Notebook Grouping (Duplicate Title Aggregation), Onion Architecture (Layered Dependency) (+6 more)

### Community 11 - "Role Assignment"
Cohesion: 0.11
Nodes (13): MemberListModal (Vue Organism), UserListModal (Vue Organism), HTTP Interceptor Pattern (Request/Response Pipeline), Role-Based Access Control (admin/coach/super_admin), axiosInstance, AssignedRolesListPage (Vue Page), AssignRoleEntry, AssignRolesPage (Vue Page) (+5 more)

### Community 12 - "Topic Research Handler"
Cohesion: 0.26
Nodes (12): ErrorResponse, Request, ResponseWriter, Router, CreateTopicResearchRequest, TopicResearchErrorResponse, UpdateTopicResearchRequest, NewTopicResearchHandler() (+4 more)

### Community 13 - "Book Domain"
Cohesion: 0.20
Nodes (11): bookRepository, useBookStore, BookForm (Vue Component), Dependency Inversion Principle (DIP), Domain-Driven Design (DDD), Factory Pattern (Clean Entity Creation), Single Responsibility Principle (SRP), Book (+3 more)

### Community 14 - "Vue Skill References"
Cohesion: 0.11
Nodes (16): Biblioteca (Knowledge Domain), Mentat (Specialized Processor Analogy), Vue Built-in Components Reference, Vue Reactivity and Lifecycle Reference, Vue Script Setup Macros Reference, Vue Composables Pattern, defineModel Macro, defineProps Macro (+8 more)

### Community 15 - "Backup Handler"
Cohesion: 0.32
Nodes (9): BackupService, Request, ResponseWriter, Request, ResponseWriter, NewBackupHandler(), writeError(), writeJSON() (+1 more)

### Community 16 - "Exercise Video Upload"
Cohesion: 0.18
Nodes (10): ExerciseVideoUploadState, UploadPhase, useExerciseVideoUpload(), UseExerciseVideoUploadReturn, ExerciseVideoUploadService, ExerciseVideoUploadServiceConfig, UploadProgress, UploadProgressCallback (+2 more)

### Community 17 - "TSConfig Node"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+8 more)

### Community 18 - "Loading System"
Cohesion: 0.28
Nodes (5): LoadingService, LoadingModel, DEFAULT_CONFIG, LoadingConfig, LoadingProps

### Community 19 - "Backup Service"
Cohesion: 0.21
Nodes (7): Backup, ServerStatus, BackupExecutor, BackupRepository, NewBackupService(), BackupService, StorageService

### Community 20 - "Backup Database"
Cohesion: 0.20
Nodes (7): Backup, DB, ServerStatus, GetDB(), getEnv(), NewPostgresBackupRepository(), PostgresBackupRepository

### Community 21 - "Topic Store"
Cohesion: 0.24
Nodes (7): topicRepository, useTopicStore, Topic, TopicFactory, TopicType, AxiosTopicRepository, TopicRepository

### Community 22 - "Server Main"
Cohesion: 0.19
Nodes (10): getEnv(), main(), Router, BackupHandler, NewRouter(), StartServer(), getEnv(), main() (+2 more)

### Community 24 - "Routine Database"
Cohesion: 0.26
Nodes (6): getEnv(), NewPostgresRoutineRepository(), PostgresRoutineRepository, Context, DB, Routine

### Community 25 - "Fitness Transcripts"
Cohesion: 0.16
Nodes (14): Coliseo (Sports Domain), Gurney Halleck AI Assistant, Airbike Equipment, Caloric Expenditure Equation, 20-Minute HIIT Workout Routine, External vs Internal Training Load, Fortafid Fitness App, Low Cadence Cycling Effects (+6 more)

### Community 26 - "User Registration"
Cohesion: 0.29
Nodes (6): UserRegisterForm (Vue Component), UserEntity, RegisterForm (Vue Component), {
    user,
    errors,
    showPassword,
    isLoading,
    submitSuccess,
    handleSubmit,
    togglePasswordVisibility,
    clearFieldError,
}, useRegisterForm(), UserValidator

### Community 27 - "Exercise Edit"
Cohesion: 0.18
Nodes (11): DIFFICULTY_BADGE_STYLES, DIFFICULTY_OPTIONS, ExerciseEditForm, ExerciseEditState, MUSCLE_GROUP_BADGE_STYLES, MUSCLE_GROUP_OPTIONS, CreateExerciseDTO, Exercise (+3 more)

### Community 28 - "Exercise Viewer"
Cohesion: 0.18
Nodes (11): InfoRow (Vue Atom Component), StatusBadge (Vue Atom Component), EquipmentDetailCard (Vue Component), EquipmentPage (Vue Component), useExerciseEdit(), DIFFICULTY_MAP, ExerciseViewerExercise, MUSCLE_GROUP_MAP (+3 more)

### Community 29 - "Equipment Store"
Cohesion: 0.18
Nodes (11): ExerciseModal (Shared Vue Component), ImageViewer (Shared Vue Component), MaintenanceForm (Vue Component), SuccessModal (Shared Vue Component), Equipment Status Validation (active/inactive/pending), Image Upload Validation (Type/Size + Drag-and-Drop), CreateEquipmentDTO, Equipment (+3 more)

### Community 30 - "Routine Create Page"
Cohesion: 0.18
Nodes (9): handleSubmit(), isSubmitting, pageTitle, randomSuccessMessage, router, routineStore, submitSuccess, successMessages (+1 more)

### Community 31 - "Backup Entities"
Cohesion: 0.24
Nodes (8): Backup, Time, BackupStatus, CreateBackupRequest, ServerStatus, axiosBackup, BackupApi, BackupRepository

### Community 32 - "Exercise Pages"
Cohesion: 0.22
Nodes (9): Domain Service Pattern (Pure Business Logic), axiosExercise, VideoUploadingModal (Vue Component), VideoVerificationModal (Vue Component), ExerciseCreatePage (Vue Component), ExerciseListPage (Vue Component), ExerciseService, ExerciseStore (+1 more)

### Community 33 - "Dune Documentation"
Cohesion: 0.25
Nodes (11): Gom Jabbar Three Stage Modal Architecture, Pinia Store ID Collision Fix, Stillsuit Graceful Degradation, Technical Changelog Dune Alexandria, Template Compilation Fix, Janitor Gate Validation System, Video Upload to Supabase, useVideoUpload Composable (+3 more)

### Community 34 - "TSConfig App"
Cohesion: 0.18
Nodes (11): compilerOptions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, noFallthroughCasesInSwitch, noUnusedLocals, noUnusedParameters, paths (+3 more)

### Community 35 - "Server Middleware"
Cohesion: 0.20
Nodes (9): Handler, getEnv (database), migrate, NewPostgresRoutineRepository, NewRoutineHandler, RegisterRoutes, main, CorsMiddleware() (+1 more)

### Community 36 - "Build Config"
Cohesion: 0.20
Nodes (7): index.html (App Entry), extends, include, files, include, references, Vite Config

### Community 38 - "Member Create Page"
Cohesion: 0.38
Nodes (8): handleSubmit(), nextStep(), previousStep(), scrollToTop(), validateCurrentStep(), validateStep1(), validateStep2(), validateStep3()

### Community 39 - "Status Handler"
Cohesion: 0.31
Nodes (8): BackupService, GetDB, NewStatusHandler(), StatusHandler, NewRouter, StartServer, CorsMiddleware, main

### Community 40 - "Routine Validation"
Cohesion: 0.25
Nodes (4): CreateRoutineRequest, UpdateRoutineRequest, RoutineValidationService, NewRoutineValidationService()

### Community 42 - "Go Middleware"
Cohesion: 0.32
Nodes (6): Logger, CORS(), Logger(), statusResponseWriter, Handler, ResponseWriter

### Community 44 - "Equipment List"
Cohesion: 0.29
Nodes (5): EquipmentList (Vue Component), axiosEquipment, Equipment, EquipmentListStore, useEquipmentListStore

### Community 45 - "Design System"
Cohesion: 0.29
Nodes (7): Bookstore Aesthetic, Color Tokens Amber Palette, Component Patterns, Alajandria Design System, Domain Adaptations Biblioteca Gimnasio, Layout System, Typography System

### Community 46 - "PgDump Executor"
Cohesion: 0.38
Nodes (4): getEnv(), NewPgDumpExecutor(), PgDumpExecutor, BackupExecutor

### Community 47 - "Backup Domain"
Cohesion: 0.33
Nodes (5): ApiResponse, Backup, BackupStatus, CreateBackupRequest, ServerStatus

### Community 48 - "Topic Research Store"
Cohesion: 0.50
Nodes (3): CreateTopicResearchPayload, TopicResearch, useTopicResearchStore

## Ambiguous Edges - Review These
- `Vue Composables Pattern` → `Mentat (Specialized Processor Analogy)`  [AMBIGUOUS]
  D:/Vue/alajandria-book/docs/ALAJANDRIA.md · relation: semantically_similar_to
- `Gurney Halleck AI Assistant` → `Fortafid Fitness App`  [AMBIGUOUS]
  D:/Vue/alajandria-book/docs/ALAJANDRIA.md · relation: semantically_similar_to

## Knowledge Gaps
- **253 isolated node(s):** `ServerStatus`, `UpdateTopicResearchRequest`, `Time`, `Time`, `ServerStatus` (+248 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Vue Composables Pattern` and `Mentat (Specialized Processor Analogy)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Gurney Halleck AI Assistant` and `Fortafid Fitness App`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `axiosInstance` connect `Role Assignment` to `Member Domain`, `Auth & App Core`, `Exercise Viewer`, `Book Domain`?**
  _High betweenness centrality (0.199) - this node is a cross-community bridge._
- **Why does `Backup` connect `Backup Entities` to `Topic Research Repo`, `Backup Service`, `Topic Research Handler`, `Backup Database`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Why does `EquipmentPage (Vue Component)` connect `Exercise Viewer` to `Role Assignment`, `Video Upload`, `Equipment List`, `Equipment Store`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **What connects `ServerStatus`, `UpdateTopicResearchRequest`, `Time` to the rest of the system?**
  _268 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Member Domain` be split into smaller, more focused modules?**
  _Cohesion score 0.05030643513789581 - nodes in this community are weakly interconnected._