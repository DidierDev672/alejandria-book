---
name: alejandria-design-system
description: >
  Visual design system for the "Alajandría" hybrid platform — a personal knowledge + gym management app built with Vue 3 and Tailwind CSS.
  ALWAYS use this skill when the user asks to style, design, create UI, build a component, create a page, or generate any frontend output for this project.
  Trigger on any mention of: Alajandría, biblioteca, equipos de gimnasio, ejercicios, Vue component, page design, Tailwind styling, UI consistency, or any task where the user wants something to "look like the project".
  Also trigger when the user says phrases like "aplica el diseño del proyecto", "usa los estilos de Alajandría", "estílalo como el resto", or "hazlo consistente con lo demás".
  This skill is the single source of truth for all visual decisions in this project — consult it before writing a single line of CSS or Tailwind class.
---

# Alajandría — Design System

## Project Identity

**Alajandría** is a hybrid personal platform with two content domains:
1. **Biblioteca** — books, notes, study topics (knowledge management)
2. **Gimnasio** — gym equipment (dumbbells, machines) and linked exercises

Both domains share a **single visual identity** inspired by the warmth of a well-loved bookstore (Folio/BookStore aesthetic): amber tones, organic warmth, tactile typography, and calm structure. The gym domain does NOT get a "sporty" or "athletic" treatment — it inherits the same warmth and literary calm. The visual system unifies both worlds.

---

## Color Tokens

Use these exact values. When using Tailwind, map them via inline `style` or extend the config. When writing CSS, use CSS custom properties.

```css
:root {
  /* Primary — Amber / BookStore warmth */
  --color-primary:        #D97706;   /* amber-600: CTAs, active states, key accents */
  --color-primary-light:  #FDE68A;   /* amber-200: hover tints, soft highlights */
  --color-primary-dark:   #92400E;   /* amber-800: pressed states, dark emphasis */

  /* Surface — Paper-like neutrals */
  --color-bg:             #FFFBF5;   /* off-white warm: main background */
  --color-surface:        #FEF3C7;   /* amber-100: card backgrounds, sidebar */
  --color-surface-mid:    #FDE68A;   /* amber-200: dividers, input borders */
  --color-surface-dark:   #F59E0B;   /* amber-400: strong borders, table headers */

  /* Text */
  --color-text-primary:   #1C1917;   /* stone-900: main body text */
  --color-text-secondary: #78716C;   /* stone-500: captions, metadata, placeholders */
  --color-text-on-amber:  #FFFFFF;   /* white text on amber backgrounds */

  /* Status (semantic, NOT domain-specific) */
  --color-success:        #15803D;   /* green-700 */
  --color-warning:        #B45309;   /* amber-700 */
  --color-danger:         #B91C1C;   /* red-700 */
  --color-info:           #1D4ED8;   /* blue-700 */

  /* Status badge backgrounds (soft) */
  --color-success-bg:     #DCFCE7;
  --color-warning-bg:     #FEF3C7;
  --color-danger-bg:      #FEE2E2;
  --color-info-bg:        #DBEAFE;
}
```

### Tailwind Utility Mapping (quick reference)

| Role | Tailwind class |
|---|---|
| Page background | `bg-amber-50` or `bg-[#FFFBF5]` |
| Card / panel | `bg-amber-100` |
| Primary button | `bg-amber-600 text-white hover:bg-amber-700` |
| Secondary button | `border border-amber-600 text-amber-700 hover:bg-amber-50` |
| Table header | `bg-amber-200 text-stone-700` |
| Input border | `border-amber-300 focus:ring-amber-500` |
| Body text | `text-stone-900` |
| Muted text | `text-stone-500` |
| Divider | `border-amber-200` |

---

## Typography

```
Display / Headings:  "Playfair Display", Georgia, serif
Body / UI labels:    "Inter", system-ui, sans-serif
Monospace / IDs:     "JetBrains Mono", monospace
```

### Scale

| Role | Size | Weight | Class example |
|---|---|---|---|
| Page title (H1) | 2rem / 32px | 700 | `text-3xl font-bold font-serif text-stone-900` |
| Section title (H2) | 1.5rem / 24px | 600 | `text-2xl font-semibold font-serif text-stone-800` |
| Card title (H3) | 1.125rem / 18px | 600 | `text-lg font-semibold text-stone-800` |
| Body | 1rem / 16px | 400 | `text-base text-stone-700` |
| Label / caption | 0.875rem / 14px | 500 | `text-sm font-medium text-stone-500` |
| Badge / tag | 0.75rem / 12px | 600 | `text-xs font-semibold uppercase tracking-wide` |

**Rule:** headings always use serif (`font-serif`); interactive labels, table content, and form fields use sans-serif.

---

## Layout System

### Page Structure
```
┌─────────────────────────────────────────────────────┐
│  Sidebar (amber-100 bg, 240px)  │  Main content area │
│  - Nav links                    │  - Page header     │
│  - Domain switcher              │  - Content block   │
│    (Biblioteca / Gimnasio)      │  - Table / cards   │
└─────────────────────────────────────────────────────┘
```

- **Max content width:** `max-w-7xl mx-auto`
- **Page padding:** `px-6 py-8`
- **Section spacing:** `space-y-6` between major blocks
- **Card gap:** `gap-4` in grids

### Page Header Pattern
Every page starts with a header block:
```html
<div class="mb-6">
  <h1 class="text-3xl font-bold font-serif text-stone-900">
    Page Title
  </h1>
  <p class="text-sm text-stone-500 mt-1">
    Subtitle or breadcrumb
  </p>
</div>
```

---

## Component Patterns

### Card
```html
<div class="bg-amber-100 rounded-xl border border-amber-200 p-5 shadow-sm hover:shadow-md transition-shadow">
  <h3 class="text-lg font-semibold text-stone-800">Title</h3>
  <p class="text-sm text-stone-500 mt-1">Description</p>
</div>
```

### Data Table
```html
<div class="overflow-hidden rounded-xl border border-amber-200 shadow-sm">
  <table class="w-full text-sm">
    <thead class="bg-amber-200">
      <tr>
        <th class="px-4 py-3 text-left font-semibold text-stone-700 uppercase tracking-wide text-xs">
          Column
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-amber-100 bg-white">
      <tr class="hover:bg-amber-50 transition-colors">
        <td class="px-4 py-3 text-stone-800">Value</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Status Badge
```html
<!-- Active / Active -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
  Activo
</span>

<!-- Inactive -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
  Inactivo
</span>

<!-- Maintenance / Warning -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
  En mantenimiento
</span>
```

### Primary Button
```html
<button class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
  <svg><!-- icon --></svg>
  Label
</button>
```

### Secondary / Outline Button
```html
<button class="inline-flex items-center gap-2 border border-amber-600 text-amber-700 hover:bg-amber-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
  Label
</button>
```

### Form Input
```html
<div class="flex flex-col gap-1">
  <label class="text-sm font-medium text-stone-700">Label</label>
  <input
    class="border border-amber-300 rounded-lg px-3 py-2 text-sm text-stone-800 bg-white
           placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
           transition"
    placeholder="..."
  />
</div>
```

### Empty State
```html
<div class="flex flex-col items-center justify-center py-16 text-center">
  <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
    <!-- icon in text-amber-500 -->
  </div>
  <h3 class="text-lg font-semibold font-serif text-stone-700 mb-1">No hay registros</h3>
  <p class="text-sm text-stone-400 max-w-xs">Mensaje descriptivo orientado a la acción.</p>
</div>
```

### Loading State
```html
<div class="flex items-center justify-center py-12">
  <div class="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
  <span class="ml-3 text-sm text-stone-500">Cargando...</span>
</div>
```

### Error State
```html
<div class="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
  <!-- icon text-red-500 -->
  <div>
    <p class="text-sm font-medium text-red-700">{{ errorMessage }}</p>
    <button @click="retry" class="mt-2 text-xs font-medium text-amber-700 hover:underline">
      Reintentar
    </button>
  </div>
</div>
```

---

## Domain-Specific Adaptations

The visual system is **identical** for both domains. The only differences are:

| Element | Biblioteca | Gimnasio |
|---|---|---|
| Section icon | Book, bookmark icons | Dumbbell, activity icons |
| Empty state illustration | Book shelf | Equipment rack |
| Entity terms | Libro, Nota, Tema | Equipo, Ejercicio, Categoría |

**Never** change colors, fonts, border-radius, or layout patterns based on domain. The warmth travels with the data.

---

## Spacing & Border Radius

| Token | Value | Tailwind |
|---|---|---|
| Radius SM | 8px | `rounded-lg` |
| Radius MD | 12px | `rounded-xl` |
| Radius LG | 16px | `rounded-2xl` |
| Radius Full (badge) | 9999px | `rounded-full` |
| Shadow SM | subtle | `shadow-sm` |
| Shadow MD | on hover | `hover:shadow-md` |

Avoid `rounded-none` and `rounded-sm` — always prefer warm, softened corners.

---

## Rules for the AI Agent

When applying this skill:

1. **Always load this file first** before writing any CSS, Tailwind class, or component.
2. Use **amber-600 as the primary action color** — never blue, never generic gray.
3. Use **serif font for all headings** — `font-serif` in Tailwind or `font-family: 'Playfair Display', serif`.
4. **Every page must have** a page header (H1 + subtitle), a loading state, an error state with retry, and an empty state.
5. Table rows must use `hover:bg-amber-50` for hover feedback.
6. Status columns always use **rounded-full colored badges** — never raw text.
7. When in doubt about a color: use the amber scale. When in doubt about a shape: use `rounded-xl`.
8. Keep backgrounds warm (`bg-amber-50`, `bg-amber-100`) — avoid pure white (`bg-white`) as a page background.

---

## Quick Consistency Checklist

Before delivering any UI component, verify:

- [ ] Page background is `bg-amber-50` or `bg-[#FFFBF5]`
- [ ] Headings use `font-serif`
- [ ] Primary actions use `bg-amber-600`
- [ ] Cards use `bg-amber-100 rounded-xl border-amber-200`
- [ ] Table headers use `bg-amber-200 text-stone-700`
- [ ] Status values use colored `rounded-full` badges
- [ ] Loading, error, and empty states are all handled
- [ ] No `blue-*` classes on interactive elements (unless semantic info badges)
