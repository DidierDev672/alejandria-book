<script setup lang="ts">
import { ref } from 'vue'
import {
  NOTE_FONT_OPTIONS,
  noteFontOption,
  type NoteFontId,
} from '../../../domain/entities/DigitalBookNote.types'

const font = defineModel<NoteFontId>({ required: true })
const open = ref(false)

function select(id: NoteFontId) {
  font.value = id
  open.value = false
}
</script>

<template>
  <div class="relative min-w-48">
    <button
      type="button"
      class="flex w-full items-center justify-between gap-2 rounded-xl border border-[#C4A35A]/70
             bg-[#F5E6A3]/50 px-3 py-2 text-left
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A017]"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="open = !open"
    >
      <span>
        <span class="block text-[10px] font-semibold uppercase tracking-widest text-[#5C4033]">
          Tipografía
        </span>
        <span class="text-sm text-[#1C1408]" :style="{ fontFamily: noteFontOption(font).family }">
          {{ noteFontOption(font).label }}
        </span>
      </span>
      <svg class="h-4 w-4 shrink-0 text-[#5C4033]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <ul
      v-if="open"
      v-motion
      :initial="{ opacity: 0, y: -8 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 0.2 } }"
      class="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-[#C4A35A]
             bg-[#FDFEFA] py-1 shadow-xl shadow-[#1C1408]/20"
      role="listbox"
    >
      <li v-for="option in NOTE_FONT_OPTIONS" :key="option.id">
        <button
          type="button"
          class="w-full px-3 py-2 text-left text-sm hover:bg-[#F5E6A3]/70"
          :class="font === option.id ? 'bg-[#E8C547]/50' : ''"
          :style="{ fontFamily: option.family }"
          role="option"
          :aria-selected="font === option.id"
          @click="select(option.id)"
        >
          {{ option.label }}
        </button>
      </li>
    </ul>
  </div>
</template>
