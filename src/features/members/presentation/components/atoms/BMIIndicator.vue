<script setup lang="ts">
import { computed } from 'vue'
import { MemberDomainService } from '../../../domain/services/MemberDomainService'

interface Props {
  bmi?: number
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const bmiCategory = computed(() => {
  if (!props.bmi || props.bmi <= 0) return null
  return MemberDomainService.getBMICategory(props.bmi)
})

const bmiColor = computed(() => {
  if (!props.bmi) return 'text-stone-400'
  
  if (props.bmi < 18.5) return 'text-blue-600'      // Bajo peso
  if (props.bmi < 25) return 'text-emerald-600'     // Normal
  if (props.bmi < 30) return 'text-amber-600'       // Sobrepeso
  return 'text-red-600'                              // Obesidad
})

const bmiBgColor = computed(() => {
  if (!props.bmi) return 'bg-stone-100'
  
  if (props.bmi < 18.5) return 'bg-blue-100'
  if (props.bmi < 25) return 'bg-emerald-100'
  if (props.bmi < 30) return 'bg-amber-100'
  return 'bg-red-100'
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  }
  return sizes[props.size]
})
</script>

<template>
  <div v-if="bmi" class="inline-flex items-center gap-2">
    <span :class="['font-semibold', bmiColor]">
      {{ bmi.toFixed(1) }}
    </span>
    <span 
      :class="[
        'rounded-full font-medium',
        bmiColor,
        bmiBgColor,
        sizeClasses
      ]"
    >
      {{ bmiCategory }}
    </span>
  </div>
  <span v-else class="text-stone-400 text-sm">
    IMC no calculado
  </span>
</template>