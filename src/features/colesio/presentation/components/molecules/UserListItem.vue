<script setup lang="ts">
import UserListItemCheckbox from '../atoms/UserListItemCheckbox.vue'
import UserListItemInfo from '../atoms/UserListItemInfo.vue'

defineProps<{
  id: string
  name: string
  phone: string
  isSelected: boolean
}>()

defineEmits<{
  (e: 'toggle', id: string): void
}>()
</script>

<template>
  <div
    :class="[
      'flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer',
      isSelected
        ? 'border-amber-500 bg-amber-50 shadow-md'
        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
    ]"
    @click="$emit('toggle', id)"
  >
    <div
      class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
    >
      {{ name.charAt(0) }}
    </div>
    <UserListItemInfo :name="name" :phone="phone" />
    <UserListItemCheckbox :is-selected="isSelected" @toggle="$emit('toggle', id)" />
  </div>
</template>
