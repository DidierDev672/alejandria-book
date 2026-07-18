<script setup lang="ts">
// ============================================================
// ATOM - Checkbox for member selection
// ============================================================

interface Props {
  checked: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <div class="flex items-center justify-center">
    <button
      type="button"
      :disabled="disabled"
      :class="[
        'w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center',
        checked
          ? 'bg-amber-500 border-amber-500 shadow-md shadow-amber-500/30'
          : 'bg-white border-stone-300 hover:border-amber-400',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      ]"
      @click="emit('toggle')"
    >
      <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="scale-0"
        enter-to-class="scale-100" leave-active-class="transition duration-100 ease-in"
        leave-from-class="scale-100" leave-to-class="scale-0">
        <svg v-if="checked" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </Transition>
    </button>
  </div>
</template>
