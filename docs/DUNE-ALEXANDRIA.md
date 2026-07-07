# Register of Technical Changes — Duniverse & Alexandria Chronicles

> *"Quien controla el código, controla el universo."* — Adaptación del Gran Maestre de la Biblioteca de Alejandría

---

## Table of Contents

1. [I. The Guild Heighliner — Uploading Video to Supabase](#i-the-guild-heighliner--uploading-video-to-supabase)
2. [II. The Mentat's Precision — Fixing Template Compilation](#ii-the-mentats-precision--fixing-template-compilation)
3. [III. The Great Houses Conflict — Resolving the Pinia Store ID Collision](#iii-the-great-houses-conflict--resolving-the-pinia-store-id-collision)
4. [IV. The Janitor's Gate — Validation System](#iv-the-janitors-gate--validation-system)
5. [V. The Three Stages of the Gom Jabbar — Modal Architecture](#v-the-three-stages-of-the-gom-jabbar--modal-architecture)
6. [VI. The Spice Melange — Dependencies & Architecture](#vi-the-spice-melange--dependencies--architecture)

---

## I. The Guild Heighliner — Uploading Video to Supabase

**Affected:**
- `src/features/exercise/presentation/pages/ExerciseCreatePage.vue`
- `src/features/video/presentation/composables/useVideoUpload.ts`
- `src/features/video/infrastructure/repositories/SupabaseVideoRepository.ts`
- `src/features/video/domain/entities/VideoEntity.ts`
- `src/features/video/application/VideoService.ts`

### The Spice Must Flow

As the Spacing Guild navigates Heighliners across the cosmos using prescience and the spice melange, our `ExerciseCreatePage.vue` now navigates video files across the network to Supabase Storage before the exercise is committed to the API.

Previously, the form submitted directly to the backend, and if a video was included, it had to be attached separately — like a Fremen carrying water in the deep desert without a stillsuit.

**The Flow:**

```
User selects video (File)
    │
    ▼
Handle Submit Clicked
    │
    ├── no video → direct HTTP POST /exercises
    │
    └── video selected → uploadVideoToSupabase()
            │
            ├── SupabaseVideoRepository.uploadVideoOnly()
            │       ├── validatePayload()       ← Mentat check
            │       ├── ensureBucketExists()     ← Survey the territory
            │       ├── uploadWithResumable()    ← Navigate the Heighliner
            │       └── getPublicUrl()           ← Emerge in orbit
            │
            ├── showVideoConfirmModal = true
            │       ├── CustomVideoPlayer preview (Know thy enemy)
            │       └── URL display w/ copy button (The Atreides banner)
            │
            ├── Confirm → submit with video_url (The Padishah seal)
            │
            └── Retry → resetVideoFile() (Retreat to Caladan)
```

### Architecture: Onion Layers

Like the concentric walls of the Imperial Palace on Kaitain, each layer has a single responsibility:

| Layer | File | Role | Alexandria Analogy |
|-------|------|------|-------------------|
| **UI** | `ExerciseCreatePage.vue` | Orchestrates the flow | The Head Librarian commanding scribes |
| **Composable** | `useVideoUpload.ts` | Reactive state management | The Catalog Keeper tracking each scroll's status |
| **Application** | `VideoService.ts` | Business rules & validation | The Copyist verifying text before shelving |
| **Domain** | `VideoEntity.ts` | Types, validators, payload | The Taxonomy of Knowledge — what IS a scroll? |
| **Infrastructure** | `SupabaseVideoRepository.ts` | Actual HTTP calls to Supabase | The Scribe's quill & papyrus |

### Graceful Degradation — The Stillsuit Principle

If `getSupabaseVideoConfig()` fails (missing environment variables), the system does not collapse. Like a Fremen stillsuit that recycles every drop of moisture, the `try/catch` block in `setup` sets `videoUploadComposable = null`, and the form falls back to creating an exercise without video. The user sees no error — the system adapts.

---

## II. The Mentat's Precision — Fixing Template Compilation

**Affected:**
- `src/features/exercise/presentation/pages/ExerciseCreatePage.vue`
- `src/utils/components/BaseModal.vue`
- `src/utils/components/CustomVideoPlayer.vue`

### The Error That Was

```
D:/Vue/alajandria-book/src/features/exercise/presentation/pages/ExerciseCreatePage.vue:516:7
    at createCompilerError (compiler-core.cjs.js:1378:17)
```

Like a Mentat's miscalculation that sends a Guild ship into the void, a misplaced closing `</div>` at line 714 caused the Vue template compiler to fail when parsing the `<form>` at line 516.

### The Diagnosis

The template had two issues:

**1. The False Closing (The Padishah's Deception)**

After the form body closed at line 713 (`</div>`), an extra `</div>` at line 714 prematurely closed the `max-w-3xl` container — the parent of the `<form>`. This left the form footer (Cancel + Submit buttons) and the `</form>` tag orphaned outside their parent, like a Sardaukar legion without a commander.

```
Before (broken):
    <form>      ← opens at line 516
      <div>     ← form body
      </div>    ← closes form body (713)
    </div>      ← EXTRA! Closes max-w-3xl prematurely (714)
      <div>…</div>  ← footer, now outside form
    </form>     ← form closes, but max-w-3xl already closed

After (fixed):
    <form>
      <div>     ← form body
      </div>    ← closes form body
      <div>…</div>  ← divider
      <div>…</div>  ← footer
    </form>     ← form closes properly
```

**2. The Self-Closing Divs (The Voice That Didn't Work)**

In HTML, `<div />` is NOT self-closing — unlike `<br />` or `<input />`, the slash is ignored. Five `<div class="..." />` tags across `ExerciseCreatePage.vue` and `BaseModal.vue` were treated as opening divs with no matching close. Like Paul's Voice commanding a guard who doesn't hear it — the intended self-close was ignored by the parser.

### The Alexandria Analogy: The Scroll Index

Imagine a librarian marking scroll locations on a papyrus: each `</div>` is a closing entry. A misplaced mark (the extra `</div>) means the catalog lists scroll #713 (form body) followed immediately by a closing bracket for the entire scroll chamber — skipping scrolls #714–740 (divider, footer, form close). The catalog becomes unreadable.

---

## III. The Great Houses Conflict — Resolving the Pinia Store ID Collision

**Affected:**
- `src/features/maintenance/application/stores/useEquipmentStore.ts`

### The Family Atom

In the Imperium, when two Great Houses claim the same fief, the Landsraad assigns it to the first claimant. Pinia works the same way: stores are identified by their `id` string, and the first `defineStore('id', ...)` wins.

Two files used the same store ID `'equipment'`:

| File | Store ID | State Property | Used By |
|------|----------|---------------|---------|
| `src/stores/equipmentStore.js` | `'equipment'` | `equipmentList` | ExerciseListPage, EquipmentPage |
| `src/features/.../useEquipmentStore.ts` | ~~`'equipment'`~~ → `'maintenance-equipment'` | `equipments` | ExerciseCreatePage |

### The Runtime Trap

**Navigation sequence that triggers the bug:**

1. User visits `ExerciseListPage` → calls `useEquipmentStore()` from the JS file
2. Pinia registers the JS store under ID `'equipment'` (first claimant)
3. User navigates to `ExerciseCreatePage` → calls `useEquipmentStore()` from the TS file
4. Pinia finds an existing store under ID `'equipment'` — returns the JS store
5. `equipmentStore.equipments` → `undefined` (JS store has `equipmentList`, not `equipments`)
6. `undefined.length` → **"Cannot read properties of undefined (reading 'length')"**

### The Fix: Renaming the Fief

Changed the TS store's ID from `'equipment'` to `'maintenance-equipment'`:

```typescript
// Before (collision)
export const useEquipmentStore = defineStore('equipment', () => {

// After (unique)
export const useEquipmentStore = defineStore('maintenance-equipment', () => {
```

Like Emperor Shaddam IV granting House Atreides the fief of Arrakis while House Harkonnen holds Giedi Prime — both exist independently, no conflict.

---

## IV. The Janitor's Gate — Validation System

**Affected:**
- `src/features/exercise/presentation/pages/ExerciseCreatePage.vue`

### The Gladiator's Credentials

Before a gladiator enters the Colosseum arena, the *Janitor* (gatekeeper) inspects their weapons, armor, and lineage. Similarly, before the form submits, three validations are performed:

| Field | Rule | Colosseum Analogy |
|-------|------|-------------------|
| **name** | Required · 2–100 chars · Must contain a letter | The gladiator must have a name worthy of the arena |
| **difficulty** | Must be `BEGINNER`, `INTERMEDIATE`, or `ADVANCED` | The combat tier — novice, veteran, or champion |
| **video** | Optional · File must be valid video format | The trident and net — optional but deadly |

### The Three Gates

```typescript
function validateForm(): boolean
    │
    ├── Gate 1: name
    │     ├── trimmed === ''         → "El nombre es obligatorio"
    │     ├── trimmed.length < 2     → "Debe tener al menos 2 caracteres"
    │     ├── trimmed.length > 100   → "No debe superar los 100 caracteres"
    │     └── /[a-zA-Z]/ not found   → "Debe contener al menos una letra"
    │
    ├── Gate 2: difficulty
    │     └── not in valid set       → "Debes seleccionar una dificultad"
    │
    └── Gate 3: combined
          └── Any errors? → collect and display in UI
```

### The Dune Analogy: The Gom Jabbar Test

Like Reverend Mother Mohiam's test — the box (pain), the needle (death), and the observation (truth). Each validation gate is a test the input must pass before being deemed worthy (`isFormValid`).

---

## V. The Three Stages of the Gom Jabbar — Modal Architecture

**Affected:**
- `src/features/exercise/presentation/pages/ExerciseCreatePage.vue`

Three modals, three stages of knowledge acquisition:

| Modal | Trigger | Purpose | Dune Analogy |
|-------|---------|---------|-------------|
| **ConfirmVideo** | Upload success | User reviews video preview, decides to confirm or retry | The Gom Jabbar — the test of humanity |
| **Success** | HTTP POST success | Celebration + navigation | The Kwisatz Haderach's revelation |
| **Error** | Any failure | Shows error details with cause explanation | The failed Bene Gesserit breeding program |

### The ConfirmModal Flow: The Test of Humanity

```
Upload succeeds
    │
    ▼
showVideoConfirmModal = true
    │
    ├── CustomVideoPlayer shows preview (The pain box — see what you've done)
    ├── URL displayed with copy button (The truth)
    │
    ├── Confirm → isSubmitting = true
    │           → handleCreateExercise(videoUrl)
    │           → HTTP POST /exercises
    │           → showSuccessModal
    │
    └── Retry → resetVideoFile()
              → showVideoConfirmModal = false
              → Form re-enabled (Retreat from the test, live to fight another day)
```

### The Alexandria Analogy: The Three Halls

The Great Library of Alexandria had halls for different stages of knowledge:
1. **The Hall of Verification** (ConfirmModal) — scholars review new scrolls before shelving
2. **The Hall of Acclaim** (SuccessModal) — new knowledge is celebrated and cataloged
3. **The Hall of Errors** (ErrorModal) — damaged or false scrolls are analyzed for their flaws

---

## VI. The Spice Melange — Dependencies & Architecture

### The Vertical Slice

Like a single dune spanning the entire planet Arrakis, each feature in this system spans all layers of the Onion architecture:

```
Video Feature (vertical slice)
    ├── Domain  → VideoEntity.ts (types, validators)
    ├── App     → VideoService.ts (business logic)
    ├── Infra   → SupabaseVideoRepository.ts (storage)
    ├── Pres    → useVideoUpload.ts (composable)
    └── UI      → ExerciseCreatePage.vue (integration)
```

### Key Decisions (The Council of the Landsraad)

| Decision | Rationale |
|----------|-----------|
| `uploadVideoOnly()` vs `uploadVideo()` | We only need the URL, not a DB record in the `videos` table |
| `useVideoUpload` composable | Keeps reactive state centralized (progress, error, isUploading) |
| `type="button"` on all form buttons | Prevents accidental submit when interacting with video player controls |
| Graceful degradation with try/catch | If Supabase is unavailable, the form still works without video |

### Environment Variables (The Spice Variables)

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Database URL | Required |
| `VITE_SUPABASE_ANON_KEY` | Client-side API key | Required (or SERVICE_KEY) |
| `VITE_SUPABASE_SERVICE_KEY` | Bypass RLS (dev only) | Optional |
| `VITE_SUPABASE_VIDEO_BUCKET` | Storage bucket name | `gallary` |

---

> *"The mystery of life isn't a problem to solve, but a reality to experience."* — Frank Herbert, *Dune*
>
> *"This code is the beginning of knowledge, not the end."* — The Librarian of Alexandria

---

**Last Updated:** 2026-07-05
**Maintainer:** OpenCode Agent
**Saga Status:** Currently navigating the Spacing Guild's corridors between Caladan and Arrakis
