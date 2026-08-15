<script setup lang="ts">
import ModalBackdrop from '../atoms/ModalBackdrop.vue'
import BounceModalCard from '../atoms/BounceModalCard.vue'
import ModalStatusIcon from '../atoms/ModalStatusIcon.vue'
import ModalPrimaryButton from '../atoms/ModalPrimaryButton.vue'

defineProps<{
  visible: boolean
  phase: 'idle' | 'booting' | 'translating' | 'rendering' | 'error'
  title: string
  message: string
  progressLabel?: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <ModalBackdrop :visible="visible" :dismissible="phase === 'error'" @close="$emit('close')">
    <BounceModalCard :accent="phase === 'error' ? 'error' : 'progress'">
      <template v-if="phase === 'error'">
        <ModalStatusIcon variant="error" />
        <div>
          <h2 class="text-xl font-bold font-serif text-stone-900">{{ title }}</h2>
          <p class="text-sm text-stone-500 mt-2 leading-relaxed max-w-sm mx-auto">
            {{ message }}
          </p>
        </div>
        <ModalPrimaryButton label="Entendido" @click="$emit('close')" />
      </template>

      <template v-else>
        <div
          class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center
                 bg-gradient-to-br from-orange-400 to-amber-600 shadow-lg shadow-amber-500/30"
        >
          <svg class="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold font-serif text-stone-900">{{ title }}</h2>
          <p class="text-sm text-stone-500 mt-2 leading-relaxed max-w-sm mx-auto">
            {{ message }}
          </p>
          <p v-if="progressLabel" class="mt-3 text-xs font-medium uppercase tracking-widest text-amber-700">
            {{ progressLabel }}
          </p>
        </div>
      </template>
    </BounceModalCard>
  </ModalBackdrop>
</template>
