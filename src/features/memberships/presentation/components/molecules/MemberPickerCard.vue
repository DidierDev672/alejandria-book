<script setup lang="ts">
import type { Member } from '@/features/members/domain/entities/Member.types'
import { MemberDomainService } from '@/features/members/domain/services/MemberDomainService'

interface Props {
  member: Member
  selected: boolean
  index: number
}

defineProps<Props>()

defineEmits<{
  (e: 'select', member: Member): void
}>()

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 450, delay: 0 },
  },
  animate: { opacity: 1, y: 0 },
}
</script>

<template>
  <article
    v-motion
    :initial="fadeIn.initial"
    :enter="{ ...fadeIn.enter, transition: { duration: 450, delay: index * 60 } }"
    :animate="fadeIn.animate"
    role="radio"
    :aria-checked="selected"
    tabindex="0"
    class="group relative flex flex-col rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
    :class="selected
      ? 'border-amber-600 bg-amber-50 shadow-sm ring-1 ring-amber-600/30'
      : 'border-amber-200 bg-[#FFFBF5] shadow-sm hover:border-amber-400 hover:bg-amber-50/60'"
    @click="$emit('select', member)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="truncate text-sm font-bold text-stone-800">{{ member.name_full }}</p>
        <p class="mt-0.5 text-xs text-stone-500">
          {{ MemberDomainService.getDocumentTypeLabel(member.type_document) }} · {{ member.number_document }}
        </p>
        <p class="mt-0.5 text-xs text-stone-400">{{ member.phone_number }}</p>
      </div>

      <div
        class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
        :class="selected
          ? 'border-amber-600 bg-amber-600 text-white'
          : 'border-stone-300 bg-white text-transparent group-hover:border-amber-500'"
        aria-hidden="true"
      >
        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>

    <div
      v-if="selected"
      class="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
    >
      Miembro seleccionado
    </div>
  </article>
</template>
