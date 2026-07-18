<script setup lang="ts">
import MemberListItemCheckbox from '../atoms/MemberListItemCheckbox.vue'
import MemberListItemInfo from '../atoms/MemberListItemInfo.vue'

// ============================================================
// MOLECULE - Member list item with checkbox selection
// ============================================================

interface Member {
  id: string
  name_full: string
  phone_number: string
}

interface Props {
  member: Member
  isSelected: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  select: [member: Member]
}>()

function handleToggle(): void {
  if (!props.disabled) {
    emit('select', props.member)
  }
}
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :class="[
      'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left',
      isSelected
        ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-500/20'
        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    ]"
    @click="handleToggle"
  >
    <!-- Avatar -->
    <div
      :class="[
        'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200',
        isSelected
          ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
          : 'bg-stone-200 text-stone-600'
      ]"
    >
      <span class="text-sm font-bold">
        {{ member.name_full.charAt(0).toUpperCase() }}
      </span>
    </div>

    <!-- Info -->
    <MemberListItemInfo
      :name="member.name_full"
      :phone="member.phone_number"
    />

    <!-- Checkbox -->
    <MemberListItemCheckbox
      :checked="isSelected"
      :disabled="disabled"
      @toggle="handleToggle"
    />
  </button>
</template>
