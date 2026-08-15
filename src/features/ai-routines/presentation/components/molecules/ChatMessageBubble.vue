<script setup lang="ts">
// ============================================================
// MOLECULE - Chat message bubble
// Las respuestas del coach se renderizan como Markdown (marked)
// ============================================================

import { computed } from 'vue'
import { marked } from 'marked'
import type { ChatMessage } from '../../../domain/entities/AiChat.types'
import AiSparkleIcon from '../atoms/AiSparkleIcon.vue'

const props = defineProps<{
  message: ChatMessage
  index?: number
}>()

const isUser = computed(() => props.message.role === 'user')

const renderedContent = computed(() => {
  if (isUser.value) return ''
  return marked.parse(props.message.content, { async: false, breaks: true }) as string
})
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 14 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 0.3 } }"
    class="flex gap-3"
    :class="isUser ? 'flex-row-reverse' : 'flex-row'"
  >
    <!-- Avatar -->
    <div
      class="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center shadow-sm"
      :class="
        isUser
          ? 'bg-stone-800 text-amber-400'
          : 'bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 text-white shadow-orange-500/30'
      "
    >
      <svg
        v-if="isUser"
        class="w-4.5 h-4.5"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      <AiSparkleIcon v-else size="sm" />
    </div>

    <!-- Bubble -->
    <div
      class="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
      :class="
        isUser
          ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-tr-sm shadow-md shadow-orange-500/20'
          : message.blockedByPolicy
            ? 'bg-amber-50 border border-amber-300 text-stone-800 rounded-tl-sm'
            : 'bg-white border border-amber-200/70 text-stone-800 rounded-tl-sm shadow-sm'
      "
    >
      <p v-if="isUser" class="whitespace-pre-wrap break-words">{{ message.content }}</p>
      <div v-else class="ai-markdown" v-html="renderedContent" />
    </div>
  </div>
</template>

<style scoped>
/* Tipografía del Markdown del coach — alineada al design system Alajandría */
.ai-markdown :deep(h1),
.ai-markdown :deep(h2),
.ai-markdown :deep(h3) {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
  color: #1c1917;
  margin: 0.75em 0 0.35em;
  line-height: 1.25;
}

.ai-markdown :deep(h1) {
  font-size: 1.15rem;
}

.ai-markdown :deep(h2) {
  font-size: 1.05rem;
}

.ai-markdown :deep(h3) {
  font-size: 0.95rem;
}

.ai-markdown :deep(p) {
  margin: 0.4em 0;
}

.ai-markdown :deep(ul),
.ai-markdown :deep(ol) {
  margin: 0.4em 0;
  padding-left: 1.25rem;
}

.ai-markdown :deep(ul) {
  list-style: disc;
}

.ai-markdown :deep(ol) {
  list-style: decimal;
}

.ai-markdown :deep(li) {
  margin: 0.2em 0;
}

.ai-markdown :deep(strong) {
  color: #92400e;
  font-weight: 700;
}

.ai-markdown :deep(code) {
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  padding: 0.1em 0.35em;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85em;
}

.ai-markdown :deep(pre) {
  background: #1c1917;
  color: #fde68a;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  overflow-x: auto;
  margin: 0.5em 0;
}

.ai-markdown :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}

.ai-markdown :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5em 0;
  font-size: 0.85em;
}

.ai-markdown :deep(th) {
  background: #fde68a;
  color: #44403c;
  text-align: left;
  padding: 0.4rem 0.6rem;
  border: 1px solid #fcd34d;
}

.ai-markdown :deep(td) {
  padding: 0.4rem 0.6rem;
  border: 1px solid #fde68a;
}

.ai-markdown :deep(blockquote) {
  border-left: 3px solid #f59e0b;
  padding-left: 0.75rem;
  color: #78716c;
  margin: 0.5em 0;
}

.ai-markdown :deep(a) {
  color: #d97706;
  text-decoration: underline;
}

.ai-markdown :deep(hr) {
  border: none;
  border-top: 1px solid #fde68a;
  margin: 0.75em 0;
}
</style>
