<script setup lang="ts">
// ============================================================
// ATOM - Icon Component (Lucide-style SVG Icons)
// ============================================================

interface Props {
  name: 'timer' | 'save' | 'arrow-left' | 'x' | 'check' | 'alert-circle' | 'plus' | 'trash' | 'edit' | 'eye'
  size?: 'sm' | 'md' | 'lg'
  color?: 'amber' | 'stone' | 'red' | 'green' | 'blue' | 'white'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'amber'
})

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
}

const colorClasses = {
  amber: 'text-amber-600',
  stone: 'text-stone-500',
  red: 'text-red-500',
  green: 'text-emerald-500',
  blue: 'text-blue-500',
  white: 'text-white'
}
</script>

<template>
  <svg class="shrink-0 text-white" :class="[sizeClasses[size], colorClasses[color]]" fill="none" stroke="currentColor"
    viewBox="0 0 24 24">
    <!-- Timer -->
    <template v-if="name === 'timer'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </template>

    <!-- Save -->
    <template v-else-if="name === 'save'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </template>

    <!-- Arrow Left -->
    <template v-else-if="name === 'arrow-left'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </template>

    <!-- X (Close) -->
    <template v-else-if="name === 'x'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </template>

    <!-- Check -->
    <template v-else-if="name === 'check'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </template>

    <!-- Alert Circle -->
    <template v-else-if="name === 'alert-circle'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </template>

    <!-- Plus -->
    <template v-else-if="name === 'plus'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </template>

    <!-- Trash -->
    <template v-else-if="name === 'trash'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </template>

    <!-- Edit -->
    <template v-else-if="name === 'edit'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </template>

    <!-- Eye -->
    <template v-else-if="name === 'eye'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </template>
  </svg>
</template>
