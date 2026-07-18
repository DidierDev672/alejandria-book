<script setup>
const props = defineProps({
  isConnected: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
})

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
}
</script>

<template>
  <span
    :class="[
      'rounded-full inline-block',
      sizeClasses[size],
      isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
    ]"
  />
</template>
