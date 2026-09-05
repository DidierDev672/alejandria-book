---
name: vue-header-gradient
description: Instrucciones para implementar el gradiente oficial de headers/hero cards del proyecto Vue 3 + TailwindCSS + Motion (Alajandría / Colesio). Úsalo SIEMPRE que se cree o modifique un header, hero card, banner de sección o cualquier bloque destacado que deba llevar el degradado de marca (#F26616 → #A62F03 → #591202 → #260101 → #0D0D0D). Cubre los tokens de color, la utilidad Tailwind reutilizable, el ángulo/orden correcto de las paradas del gradiente, la animación de entrada con Motion, y las reglas de contraste de texto sobre el degradado.
---

# Gradiente de headers — Vue 3 + TailwindCSS + Motion

Estándar único para cualquier header, hero card o banner destacado que deba
llevar el degradado de marca. El objetivo: que **ningún componente nuevo
tenga un `linear-gradient` escrito a mano con hex sueltos** — todos
consumen el mismo token.

## 1. Paradas oficiales del gradiente

| Orden | Hex | Rol |
|---|---|---|
| 1 | `#F26616` | Inicio — naranja intenso, punto más "caliente" |
| 2 | `#A62F03` | Transición — naranja quemado |
| 3 | `#591202` | Medio — rojo oscuro |
| 4 | `#260101` | Transición final — rojo muy oscuro |
| 5 | `#0D0D0D` | Fin — casi negro |

**Ángulo:** `135deg` (diagonal de esquina superior-izquierda a
inferior-derecha) — es el que ya usan las hero cards existentes ("El pulso
de tu coliseo"). No usar `to right` ni `to bottom` planos: la diagonal es
lo que le da sensación de profundidad/movimiento al degradado.

**Distribución de paradas (no repartir en 0/25/50/75/100 parejo):** el
naranja debe dominar visualmente el primer tercio y el negro debe "llegar"
recién after 78%, para que el degradado no se sienta simétrico ni plano:

```
0%   → #F26616
30%  → #A62F03
55%  → #591202
78%  → #260101
100% → #0D0D0D
```

## 2. Definir el token una sola vez

### Opción A — Tailwind v3 (`tailwind.config.js`)

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        header: {
          1: '#F26616',
          2: '#A62F03',
          3: '#591202',
          4: '#260101',
          5: '#0D0D0D',
        },
      },
      backgroundImage: {
        'header-gradient':
          'linear-gradient(135deg, #F26616 0%, #A62F03 30%, #591202 55%, #260101 78%, #0D0D0D 100%)',
      },
    },
  },
};
```

Uso en cualquier componente:
```html
<header class="bg-header-gradient rounded-2xl">...</header>
```

### Opción B — Tailwind v4 (`@theme` en CSS)

```css
/* app.css o el archivo de entrada de Tailwind */
@theme {
  --color-header-1: #F26616;
  --color-header-2: #A62F03;
  --color-header-3: #591202;
  --color-header-4: #260101;
  --color-header-5: #0D0D0D;
}

.bg-header-gradient {
  background-image: linear-gradient(
    135deg,
    var(--color-header-1) 0%,
    var(--color-header-2) 30%,
    var(--color-header-3) 55%,
    var(--color-header-4) 78%,
    var(--color-header-5) 100%
  );
}
```

**Regla:** el agente NUNCA escribe `bg-[linear-gradient(...)]` con hex
arbitrarios directo en un componente `.vue`. Siempre se referencia
`bg-header-gradient` (o la variable CSS si el diseño necesita un ángulo
distinto puntual). Si un header necesita variar el ángulo, se crea una
segunda utilidad (`bg-header-gradient-vertical`, etc.) en el mismo lugar
central — no un valor arbitrario suelto en el markup.

## 3. Componente base reutilizable

```vue
<!-- components/ui/GradientHeader.vue -->
<script setup>
defineProps({
  eyebrow: { type: String, default: '' }, // ej: "COLISEO › MEMBRESÍAS"
  title: { type: String, required: true },
  description: { type: String, default: '' },
});
</script>

<template>
  <header
    v-motion
    :initial="{ opacity: 0, y: -16 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 500, ease: 'easeOut' } }"
    class="bg-header-gradient rounded-2xl px-8 py-7 text-stone-50 shadow-lg shadow-black/20"
  >
    <p
      v-if="eyebrow"
      class="text-xs font-semibold uppercase tracking-widest text-orange-100/80"
    >
      {{ eyebrow }}
    </p>

    <h1 class="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">
      {{ title }}
    </h1>

    <p v-if="description" class="mt-3 max-w-2xl text-sm text-orange-50/85 md:text-base">
      {{ description }}
    </p>

    <slot />
  </header>
</template>
```

Uso:
```html
<GradientHeader
  eyebrow="COLISEO › MEMBRESÍAS"
  title="El pulso de tu coliseo"
  description="Aquí vive el vínculo que sostiene a cada miembro..."
/>
```

## 4. Animación de entrada con Motion

El header **siempre** entra con fade + slide-down sutil (`y: -16 → 0`,
`opacity: 0 → 1`, `duration: 500ms`, `ease: easeOut`) — nunca aparece de
golpe ni con animaciones más agresivas (bounce, scale grande), porque es
un elemento de contexto, no un CTA.

- Si el proyecto usa **`@vueuse/motion`** (directiva `v-motion`): usar el
  patrón `:initial` / `:enter` como en el componente de arriba.
- Si el proyecto usa **`motion-v`** (puerto de Motion One/Framer Motion a
  Vue, componente `<Motion>`):

```vue
<Motion
  :initial="{ opacity: 0, y: -16 }"
  :animate="{ opacity: 1, y: 0 }"
  :transition="{ duration: 0.5, ease: 'easeOut' }"
>
  <header class="bg-header-gradient rounded-2xl px-8 py-7">...</header>
</Motion>
```

Verificar en `package.json` cuál de las dos librerías está instalada antes
de escribir la animación — no asumir.

## 5. Reglas de contraste de texto sobre el gradiente

El texto SIEMPRE va en tonos claros (`text-white`, `text-stone-50`, o
`text-orange-50/85` para texto secundario) — nunca texto oscuro sobre este
degradado, ni siquiera en la zona más clara (`#F26616`), porque:

- El naranja `#F26616` tiene luminosidad media: texto oscuro pierde
  legibilidad en tamaños pequeños.
- El resto del degradado (`#A62F03` en adelante) es oscuro — texto claro
  es obligatorio.

**Checklist de contraste antes de dar un header por terminado:**
- [ ] Título principal: blanco puro (`#FFFFFF`) o `text-stone-50`, peso `bold`/`font-semibold`, nunca por debajo de `text-2xl`.
- [ ] Texto secundario/descripción: usar opacidad reducida sobre blanco (`text-orange-50/85`) en vez de un gris — mantiene la temperatura cálida del diseño.
- [ ] Badges o pills sobre el header (ej. "Conteos al día"): fondo semitransparente oscuro (`bg-black/30`) + texto claro, nunca el color de marca sólido encima del gradiente (se pierde contra el fondo).
- [ ] Si el header tiene una imagen o ícono decorativo superpuesto, verificar que no caiga justo en la zona de transición `#591202 → #260101` sin un halo/sombra que lo separe del fondo.

## 6. Checklist final para el agente

1. ¿Existe ya `bg-header-gradient` en el proyecto? → reutilizar, no
   redefinir el gradiente en otro archivo.
2. ¿El componente es un header/hero/banner? → usar `GradientHeader.vue`
   como base o extenderlo, no crear un `<header>` desde cero con estilos
   inline.
3. ¿Tiene animación de entrada? → `v-motion` o `<Motion>` según lo que
   esté instalado, con los valores de la sección 4 (nunca improvisar
   otros tiempos/curvas para este tipo de componente).
4. ¿El texto pasa el checklist de contraste de la sección 5?
5. ¿El ángulo es `135deg` y las paradas son las de la sección 1? Ningún
   header debe usar un degradado con paradas distintas sin justificación
   de diseño explícita del usuario.
