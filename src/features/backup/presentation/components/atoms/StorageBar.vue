<script setup>
import { computed } from 'vue'

const props = defineProps({
  used: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  label: { type: String, default: '' },
})

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.min((props.used / props.total) * 100, 100)
})

const barColor = computed(() => {
  if (percentage.value > 90) return 'bg-rose-500'
  if (percentage.value > 70) return 'bg-amber-500'
  return 'bg-emerald-500'
})
</script>

<template>
  <div class="w-full">
    <div v-if="label" class="flex justify-between items-center mb-1.5">
      <span class="text-xs font-medium text-stone-600">{{ label }}</span>
      <span class="text-xs text-stone-400">{{ used }} / {{ total }}</span>
    </div>
    <div class="h-2 bg-stone-100 rounded-full overflow-hidden">
      <div
        v-motion
        :initial="{ width: 0 }"
        :enter="{ width: `${percentage}%` }"
        :transition="{ duration: 0.5, ease: 'easeOut' }"
        :class="['h-full rounded-full', barColor]"
      />
    </div>
  </div>
</template>
