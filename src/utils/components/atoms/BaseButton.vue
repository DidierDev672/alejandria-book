<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'danger'

const props = withDefaults(defineProps<{
  variant?: ButtonVariant
}>(), {
  variant: 'primary',
})

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-600 shadow-sm hover:shadow',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-600 shadow-sm',
}
</script>

<template>
  <button
    class="inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none active:scale-95 disabled:pointer-events-none disabled:opacity-50"
    :class="variantClasses[props.variant]"
  >
    <slot />
  </button>
</template>
