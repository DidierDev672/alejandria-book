<script setup lang="ts">
import { animateMini } from 'motion'
import { computed, onUnmounted, ref } from 'vue'
import { coliseoSections, type ColiseoNavItem, type ColiseoNavSection } from '../data/coliseoNavSections'

const props = defineProps<{
  currentPath: string
  query?: string
}>()

const emit = defineEmits<{
  navigate: [path: string]
}>()

const coliseoOpen = ref(false)
const openSectionId = ref<string | null>(null)
let coliseoCloseTimer: ReturnType<typeof setTimeout> | null = null

const EMPTY_ITEMS: ColiseoNavItem[] = []

function normalizeText(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const normalizedQuery = computed(() => normalizeText(props.query ?? '').trim())
const isSearching = computed(() => normalizedQuery.value.length > 0)

const filteredSections = computed(() => {
  if (!isSearching.value) return coliseoSections
  const query = normalizedQuery.value
  if (normalizeText('Coliseo').includes(query)) return coliseoSections

  return coliseoSections
    .map((section) => {
      const sectionMatches = normalizeText(section.label).includes(query)
      return {
        ...section,
        items: sectionMatches
          ? section.items
          : section.items.filter((item) => normalizeText(item.label).includes(query)),
      }
    })
    .filter((section) => section.items.length > 0)
})

const hasSearchMatches = computed(() => filteredSections.value.length > 0)
const showColiseoBody = computed(() => (isSearching.value ? hasSearchMatches.value : coliseoOpen.value))

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]
const SECTION_STAGGER_MS = 90
const ITEM_STAGGER_S = 0.045
const ITEM_ENTER_DURATION_S = 0.3
const ITEM_LEAVE_DURATION_S = 0.25

function accordionLeaveMs(itemCount: number) {
  return Math.round((ITEM_LEAVE_DURATION_S + Math.max(0, itemCount - 1) * ITEM_STAGGER_S) * 1000)
}

function clearColiseoCloseTimer() {
  if (coliseoCloseTimer) {
    clearTimeout(coliseoCloseTimer)
    coliseoCloseTimer = null
  }
}

function toggleColiseo() {
  if (isSearching.value) return
  clearColiseoCloseTimer()
  if (!coliseoOpen.value) {
    coliseoOpen.value = true
    return
  }

  const openSection = coliseoSections.find((section) => section.id === openSectionId.value)
  const waitMs = openSection ? accordionLeaveMs(openSection.items.length) : 0
  openSectionId.value = null

  if (waitMs === 0) {
    coliseoOpen.value = false
    return
  }

  coliseoCloseTimer = setTimeout(() => {
    coliseoOpen.value = false
    coliseoCloseTimer = null
  }, waitMs)
}

function toggleSection(id: string) {
  if (isSearching.value) return
  openSectionId.value = openSectionId.value === id ? null : id
}

function isSectionOpen(id: string) {
  if (isSearching.value) return filteredSections.value.some((section) => section.id === id)
  return openSectionId.value === id
}

function itemsFor(section: ColiseoNavSection) {
  return isSectionOpen(section.id) ? section.items : EMPTY_ITEMS
}

function sectionHasActive(section: ColiseoNavSection) {
  return section.items.some((item) => item.route === props.currentPath)
}

function navigateTo(path: string) {
  emit('navigate', path)
}

function isActive(path: string) {
  return props.currentPath === path
}

function sectionTransition(sectionIndex: number) {
  return { duration: 350, delay: sectionIndex * SECTION_STAGGER_MS, ease: EASE_OUT_EXPO }
}

function onAccordionEnter(el: Element, done: () => void) {
  const element = el as HTMLElement
  const index = Number(element.dataset.index ?? 0)
  element.style.opacity = '0'
  void animateMini(
    element,
    { opacity: [0, 1], x: [-15, 0] },
    { duration: ITEM_ENTER_DURATION_S, delay: index * ITEM_STAGGER_S, easing: 'easeOut' },
  ).then(() => done(), () => done())
}

function onAccordionLeave(el: Element, done: () => void) {
  const element = el as HTMLElement
  const index = Number(element.dataset.index ?? 0)
  const count = Number(element.dataset.count ?? 1)
  const reverseIndex = Math.max(0, count - 1 - index)
  void animateMini(
    element,
    { opacity: [1, 0], x: [0, -12] },
    { duration: ITEM_LEAVE_DURATION_S, delay: reverseIndex * ITEM_STAGGER_S, easing: 'easeIn' },
  ).then(() => done(), () => done())
}

function onLineEnter(el: Element, done: () => void) {
  const element = el as HTMLElement
  element.style.transformOrigin = 'top'
  element.style.opacity = '0'
  void animateMini(
    element,
    { scaleY: [0, 1], opacity: [0, 1] },
    { duration: 0.42, delay: 0.04, easing: 'easeOut' },
  ).then(() => done(), () => done())
}

function onLineLeave(el: Element, done: () => void) {
  const element = el as HTMLElement
  element.style.transformOrigin = 'top'
  const count = Number(element.dataset.count ?? 1)
  void animateMini(
    element,
    { scaleY: [1, 0], opacity: [1, 0] },
    { duration: ITEM_LEAVE_DURATION_S + Math.max(0, count - 1) * ITEM_STAGGER_S, easing: 'easeIn' },
  ).then(() => done(), () => done())
}

onUnmounted(() => {
  clearColiseoCloseTimer()
})
</script>

<template>
  <div
    v-if="!isSearching || hasSearchMatches"
    v-motion
    :initial="{ opacity: 0, x: -20 }"
    :enter="{ opacity: 1, x: 0 }"
    :transition="{ duration: 400, delay: 150, ease: EASE_OUT_EXPO }"
    class="space-y-0.5"
  >
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-400 transition-all duration-200 hover:bg-stone-800 hover:text-amber-100"
      @click="toggleColiseo"
    >
      <div class="flex items-center gap-3">
        <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <span>Coliseo</span>
      </div>
      <svg
        class="h-4 w-4 shrink-0 transition-transform duration-300"
        :class="{ 'rotate-180': showColiseoBody }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="showColiseoBody" class="ml-2 space-y-3 border-l border-amber-500/20 py-1 pl-3">
        <section
          v-for="(section, sectionIndex) in filteredSections"
          :key="section.id"
          v-motion
          :initial="{ opacity: 0, y: -10 }"
          :enter="{ opacity: 1, y: 0 }"
          :transition="sectionTransition(sectionIndex)"
          class="space-y-0.5"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors duration-200 hover:bg-stone-800/60"
            :class="isSectionOpen(section.id) || sectionHasActive(section)
              ? 'text-amber-700'
              : 'text-amber-800/80'"
            :aria-expanded="isSectionOpen(section.id)"
            @click="toggleSection(section.id)"
          >
            <span class="font-serif text-[10px] font-semibold uppercase tracking-[0.16em]">
              {{ section.label }}
            </span>
            <svg
              class="h-3.5 w-3.5 shrink-0 transition-transform duration-300"
              :class="{ 'rotate-180': isSectionOpen(section.id) }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div class="relative">
            <Transition :css="false" @enter="onLineEnter" @leave="onLineLeave">
              <span
                v-if="isSectionOpen(section.id) && section.items.length > 1"
                :key="`${section.id}-line`"
                :data-count="section.items.length"
                class="pointer-events-none absolute top-3 bottom-3 left-[7px] w-px origin-top bg-gradient-to-b from-amber-500/60 via-amber-400/35 to-amber-500/15"
              />
            </Transition>

            <TransitionGroup
              tag="div"
              class="relative"
              :css="false"
              @enter="onAccordionEnter"
              @leave="onAccordionLeave"
            >
              <button
                v-for="(item, itemIndex) in itemsFor(section)"
                :key="item.route"
                :data-index="itemIndex"
                :data-count="section.items.length"
                type="button"
                class="relative flex w-full items-center gap-2.5 rounded-xl py-2 pr-2 pl-5 text-sm font-medium transition-all duration-200"
                :class="isActive(item.route)
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-500 shadow-sm ring-1 ring-amber-500/20'
                  : 'text-stone-400 hover:bg-stone-800 hover:text-amber-100'"
                @click="navigateTo(item.route)"
              >
              <span
                class="absolute top-1/2 left-[7px] h-px w-2.5 -translate-y-1/2 bg-amber-500/40"
                aria-hidden="true"
              />
              <span
                class="absolute top-1/2 left-[4px] z-10 h-1.5 w-1.5 -translate-y-1/2 rounded-full ring-2 ring-stone-200/90"
                :class="isActive(item.route) ? 'bg-amber-500' : 'bg-amber-400/70'"
                aria-hidden="true"
              />

              <svg
                v-if="item.icon === 'gladiator-plus'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <svg
                v-else-if="item.icon === 'gladiator-list'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <svg
                v-else-if="item.icon === 'gladiator-goals'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else-if="item.icon === 'gladiator-progress'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <svg
                v-else-if="item.icon === 'exercise-assign'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <svg
                v-else-if="item.icon === 'assignment-list'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 6h16M4 10h16M4 14h10M4 18h7"
                />
              </svg>
              <svg
                v-else-if="item.icon === 'exercise-list'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <svg
                v-else-if="item.icon === 'equipment'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <svg
                v-else-if="item.icon === 'equipment-list'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <svg
                v-else-if="item.icon === 'assign-roles'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <svg
                v-else-if="item.icon === 'role-list'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <svg
                v-else-if="item.icon === 'timer'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else-if="item.icon === 'routine-list'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <svg
                v-else-if="item.icon === 'routine-create'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else-if="item.icon === 'routine-assigned'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <svg
                v-else-if="item.icon === 'ai-sparkle'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                />
              </svg>

              <span class="text-left leading-snug">{{ item.label }}</span>
            </button>
            </TransitionGroup>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>
