<script setup lang="ts">
interface Props {
  status: 'active' | 'inactive' | 'pending'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const statusConfig: Record<string, { label: string; bgColor: string; borderColor: string; textColor: string; dotColor: string; icon: string }> = {
  active: {
    label: 'Activo',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  inactive: {
    label: 'Inactivo',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-600',
    dotColor: 'bg-slate-400',
    icon: 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  pending: {
    label: 'Pendiente',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    dotColor: 'bg-amber-500',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
}

const config = statusConfig[props.status] || statusConfig.inactive

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-3 py-1.5 text-xs gap-1.5',
  lg: 'px-4 py-2 text-sm gap-2',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full font-medium border',
      config.bgColor,
      config.borderColor,
      config.textColor,
      sizeClasses[props.size],
    ]"
  >
    <span class="w-2 h-2 rounded-full animate-pulse" :class="config.dotColor" />
    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="config.icon" />
    </svg>
    {{ config.label }}
  </span>
</template>
