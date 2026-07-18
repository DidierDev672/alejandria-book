<script setup lang="ts">
const props = defineProps({
  exercise: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
  muscleGroupInfo: { type: Object, required: true },
  difficultyInfo: { type: Object, required: true },
})

const emit = defineEmits(['select'])
</script>

<template>
  <button @click="emit('select', exercise)" @mouseenter="isHovered = true" @mouseleave="isHovered = false" v-motion
    :initial="{ scale: 1 }" :hovered="{ scale: 1.015 }" :tapped="{ scale: 0.98 }"
    :transition="{ type: 'spring', stiffness: 400, damping: 22 }" :class="[
      'w-full text-left p-2.5 sm:p-3 rounded-xl border transition-colors duration-200 group',
      isSelected
        ? 'bg-amber-50 border-amber-300 shadow-sm ring-1 ring-amber-200/50'
        : 'bg-white/50 border-stone-100 hover:border-amber-200 hover:bg-amber-50/50 hover:shadow-sm'
    ]">
    <div class="flex items-center gap-2.5 sm:gap-3">
      <!-- Indicador de video -->
      <div v-motion :animate="isSelected || isHovered ? { scale: 1.08, rotate: 6 } : { scale: 1, rotate: 0 }"
        :transition="{ type: 'spring', stiffness: 300, damping: 18 }" :class="[
          'w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
          isSelected ? 'bg-amber-200/60' : 'bg-stone-100 group-hover:bg-amber-100'
        ]">
        <svg v-motion
          :animate="isSelected
            ? { scale: [1, 1.18, 1], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } }
            : (isHovered ? { scale: 1.25, transition: { type: 'spring', stiffness: 500, damping: 12 } } : { scale: 1 })"
          :class="['w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors', isSelected ? 'text-amber-700' : 'text-stone-400 group-hover:text-amber-600']"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div class="flex-1 min-w-0">
        <p :class="[
          'text-xs sm:text-sm font-semibold truncate transition-colors',
          isSelected ? 'text-amber-900' : 'text-stone-700 group-hover:text-stone-900'
        ]">{{ exercise.name }}</p>
        <div class="flex items-center gap-1 sm:gap-1.5 mt-0.5 flex-wrap">
          <span class="text-[9px] sm:text-[10px] text-stone-400 truncate">{{ muscleGroupInfo.label }}</span>
          <span class="text-stone-300 text-[9px] sm:text-[10px]">·</span>
          <span
            :class="['text-[9px] sm:text-[10px] px-1 py-0 rounded border font-medium whitespace-nowrap', difficultyInfo.colorClass]">
            {{ difficultyInfo.label }}
          </span>
        </div>
      </div>

      <!-- Arrow indicator -->
      <svg v-motion :animate="isSelected
        ? { x: 0, opacity: 1 }
        : (isHovered ? { x: 0, opacity: 1 } : { x: -6, opacity: 0 })"
        :transition="{ type: 'spring', stiffness: 350, damping: 24 }"
        :class="['w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0', isSelected ? 'text-amber-500' : 'text-stone-300']"
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
</template>
