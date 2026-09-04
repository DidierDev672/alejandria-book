<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { DigitalBook } from '../../../domain/entities/DigitalBook.types'
import { DigitalBookCoverResolver } from '../../../domain/services/DigitalBookCoverResolver'
import CoverFadeImage from '../atoms/CoverFadeImage.vue'
import GenreBadge from '../atoms/GenreBadge.vue'

const props = defineProps<{
  book: DigitalBook
  colorIndex?: number
}>()

const root = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const reduceMotion = ref(false)
let observer: IntersectionObserver | null = null

const coverSrc = computed(() => DigitalBookCoverResolver.fromBook(props.book))
const visibleGenres = computed(() => props.book.genres.slice(0, 4))
const extraGenres = computed(() => Math.max(0, props.book.genres.length - 4))

const CARD_COLORS = ['#F26616', '#A62F03', '#0D0D0D', '#FFE3B3'] as const

const cardBg = computed(() => CARD_COLORS[(props.colorIndex ?? 0) % CARD_COLORS.length])
const isDarkBg = computed(() => ['#A62F03', '#0D0D0D'].includes(cardBg.value))
const titleClass = computed(() =>
  isDarkBg.value ? 'text-white' : 'text-stone-800',
)
const authorClass = computed(() =>
  isDarkBg.value ? 'text-white/70' : 'text-stone-500',
)
const extraClass = computed(() =>
  isDarkBg.value
    ? 'text-white/70 bg-white/10 border-white/20'
    : 'text-stone-500 bg-white/70 border-amber-200',
)

onMounted(() => {
  reduceMotion.value =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      isVisible.value = true
      observer?.disconnect()
    },
    { rootMargin: '96px 0px', threshold: 0.12 },
  )

  if (root.value) observer.observe(root.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <article ref="root" class="min-h-[22rem]">
    <div
      v-if="isVisible"
      v-motion
      :initial="
        reduceMotion
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 28, scale: 0.97 }
      "
      :enter="{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: reduceMotion ? 0 : 0.45 },
      }"
      class="group h-full overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md cursor-pointer"
      :style="{ backgroundColor: cardBg, borderColor: isDarkBg ? 'rgba(255,255,255,0.15)' : 'rgba(217,186,119,0.4)' }"
    >
      <CoverFadeImage :src="coverSrc" :alt="`Portada de ${book.name}`" />

      <div class="space-y-3 p-5">
        <div>
          <h3 class="font-serif text-lg font-semibold leading-snug line-clamp-2" :class="titleClass">
            {{ book.name }}
          </h3>
          <p class="mt-1 text-sm" :class="authorClass">{{ book.author }}</p>
        </div>

        <div v-if="visibleGenres.length" class="flex flex-wrap gap-1.5">
          <GenreBadge v-for="genre in visibleGenres" :key="genre" :label="genre" />
          <span
            v-if="extraGenres > 0"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            :class="extraClass"
          >
            +{{ extraGenres }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
