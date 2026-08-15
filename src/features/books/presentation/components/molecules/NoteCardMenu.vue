<script setup lang="ts">
import type { NoteCard } from '../../../domain/entities/DigitalBookNote.types'
import NoteColorSquare from '../atoms/NoteColorSquare.vue'

defineProps<{
  cards: NoteCard[]
  activeId: string | null
}>()

defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <div
    class="flex min-h-10 flex-wrap items-center gap-2 rounded-xl border border-[#C4A35A]/70
           bg-[#F5E6A3]/50 px-2.5 py-2"
    role="listbox"
    aria-label="Notas creadas"
  >
    <span class="text-[10px] font-semibold uppercase tracking-widest text-[#5C4033]">
      Notas
    </span>
    <p v-if="!cards.length" class="text-xs text-[#5C4033]/70">
      Aún no hay cuadros. Pulsa Crear nota.
    </p>
    <NoteColorSquare
      v-for="card in cards"
      :key="card.id"
      size="sm"
      :color="card.color"
      :selected="activeId === card.id"
      @select="$emit('select', card.id)"
    />
  </div>
</template>
