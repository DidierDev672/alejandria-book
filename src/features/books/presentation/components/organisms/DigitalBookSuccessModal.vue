<script setup lang="ts">
import ModalBackdrop from '../atoms/ModalBackdrop.vue'
import BounceModalCard from '../atoms/BounceModalCard.vue'
import ModalStatusIcon from '../atoms/ModalStatusIcon.vue'
import ModalPrimaryButton from '../atoms/ModalPrimaryButton.vue'

defineProps<{
  visible: boolean
  title: string
  message: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <ModalBackdrop :visible="visible" @close="$emit('close')">
    <BounceModalCard accent="success">
      <ModalStatusIcon variant="success" />
      <div>
        <h2 class="text-xl font-bold font-serif text-stone-900">{{ title }}</h2>
        <p class="text-sm text-stone-500 mt-2 leading-relaxed max-w-sm mx-auto">
          {{ message }}
        </p>
      </div>
      <ModalPrimaryButton label="Continuar" @click="$emit('close')" />
    </BounceModalCard>
  </ModalBackdrop>
</template>
