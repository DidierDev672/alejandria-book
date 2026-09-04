<script setup lang="ts">
// ============================================================
// ATOM · Badge
// Insignia/píldora altamente reutilizable y accesible.
// Fondo suave (pastel), texto oscuro contrastante y esquinas
// totalmente redondeadas. Soporta un punto de estado (dot) o
// un icono SVG vía slot, y es compatible con tema oscuro (dark:).
// ============================================================

// tones: presets pastel con contraste legible, en claro y oscuro.
type BadgeTone = 'neutral' | 'amber' | 'emerald' | 'orange' | 'rose' | 'sky'

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-stone-100 text-orange-700 dark:bg-stone-700 dark:text-stone-100',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500 dark:text-emerald-200',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-500 dark:text-orange-200',
  rose: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200',
  sky: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200',
}

const DOT_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-orange-500 dark:bg-stone-300',
  amber: 'bg-amber-500 dark:bg-amber-300',
  emerald: 'bg-emerald-500 dark:bg-emerald-300',
  orange: 'bg-orange-500 dark:bg-orange-300',
  rose: 'bg-rose-500 dark:bg-rose-300',
  sky: 'bg-sky-500 dark:bg-sky-300',
}

withDefaults(
  defineProps<{
    tone?: BadgeTone
    dot?: boolean
    label?: string
    size?: 'sm' | 'md'
  }>(),
  {
    tone: 'neutral',
    dot: false,
    label: undefined,
    size: 'sm',
  },
)
</script>

<template>
  <span role="status" :aria-label="label"
    class="inline-flex h-max items-center gap-1.5 whitespace-nowrap rounded-full font-bold" :class="[
      TONES[tone],
      size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
    ]">
    <!-- Punto de estado -->
    <span v-if="dot" class="h-1.5 w-1.5 shrink-0 rounded-full" :class="DOT_TONES[tone]" aria-hidden="true" />
    <!-- Icono SVG opcional (slot) -->
    <span v-else-if="$slots.icon" class="shrink-0 [&>svg]:h-3 [&>svg]:w-3" aria-hidden="true">
      <slot name="icon" />
    </span>

    <slot />
  </span>
</template>
