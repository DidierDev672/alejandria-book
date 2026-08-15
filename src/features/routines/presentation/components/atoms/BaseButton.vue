<script setup lang="ts">
// ============================================================
// ATOM - Base Button Component
// ============================================================

import BaseIcon from './BaseIcon.vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: 'timer' | 'save' | 'arrow-left' | 'x' | 'check' | 'alert-circle' | 'plus' | 'trash' | 'edit'
  type?: 'button' | 'submit'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses = {
  primary: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35',
  secondary: 'border-2 border-stone-200 text-stone-600 hover:border-amber-200 hover:bg-amber-50 hover:text-stone-700',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35',
  ghost: 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5'
}

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    @click="handleClick"
    class="relative overflow-hidden inline-flex items-center justify-center 
           font-semibold rounded-xl transition-all duration-300 
           active:scale-95 group
           disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[variantClasses[variant], sizeClasses[size]]"
  >
    <!-- Loading Spinner -->
    <svg 
      v-if="loading"
      class="animate-spin shrink-0"
      :class="size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'"
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
    
    <!-- Icon -->
    <BaseIcon 
      v-else-if="icon"
      :name="icon" 
      :size="size === 'sm' ? 'sm' : 'md'"
    />
    
    <!-- Loading Text -->
    <span v-if="loading" class="relative">Cargando...</span>
    
    <!-- Slot Content -->
    <slot v-else />
    
    <!-- Hover Shine Effect (primary only) -->
    <div 
      v-if="variant === 'primary' && !loading"
      class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
             -translate-x-full group-hover:translate-x-full transition-transform duration-700" 
    />
  </button>
</template>
