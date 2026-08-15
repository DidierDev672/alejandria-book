<script setup lang="ts">
/**
 * PAGE - Registrar libro digital
 * Atomic Design + Pinia + axios POST /digital-books
 */
import {
  computed,
  defineAsyncComponent,
  onMounted,
  onBeforeUnmount,
  ref,
  shallowRef,
} from 'vue'
import { storeToRefs } from 'pinia'
import { BookFactory } from '../../domain/entities/Book'
import { useDigitalBookStore } from '../../application/useDigitalBookStore'
import type { DigitalBookFeedbackCopy } from '../../domain/services/DigitalBookFeedbackMessages'

const IdentityFields = defineAsyncComponent(
  () => import('../components/molecules/DigitalBookIdentityFields.vue'),
)
const GenresField = defineAsyncComponent(
  () => import('../components/molecules/DigitalBookGenresField.vue'),
)
const FilePickButton = defineAsyncComponent(
  () => import('../components/atoms/FilePickButton.vue'),
)
const CoverPreviewBounce = defineAsyncComponent(
  () => import('../components/molecules/CoverPreviewBounce.vue'),
)
const DigitalBookSuccessModal = defineAsyncComponent(
  () => import('../components/organisms/DigitalBookSuccessModal.vue'),
)
const DigitalBookErrorModal = defineAsyncComponent(
  () => import('../components/organisms/DigitalBookErrorModal.vue'),
)

const digitalBookStore = useDigitalBookStore()
const { isSubmitting } = storeToRefs(digitalBookStore)

const form = ref(BookFactory.createEmpty())
const photoFile = shallowRef<File | null>(null)
const digitalBookFile = shallowRef<File | null>(null)

const showIdentity = ref(false)
const showGenres = ref(false)
const showCover = ref(false)
const showPdf = ref(false)
const showActions = ref(false)

const photoInputRef = ref<HTMLInputElement | null>(null)
const pdfInputRef = ref<HTMLInputElement | null>(null)

const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const modalFeedback = ref<DigitalBookFeedbackCopy | null>(null)

let revealTimers: ReturnType<typeof setTimeout>[] = []

onMounted(() => {
  revealTimers = [
    setTimeout(() => (showIdentity.value = true), 80),
    setTimeout(() => (showGenres.value = true), 220),
    setTimeout(() => (showCover.value = true), 380),
    setTimeout(() => (showPdf.value = true), 540),
    setTimeout(() => (showActions.value = true), 700),
  ]
})

onBeforeUnmount(() => {
  revealTimers.forEach(clearTimeout)
})

const isFormValid = computed(() => {
  return (
    form.value.title.trim().length > 0 &&
    form.value.author.trim().length > 0 &&
    Boolean(photoFile.value) &&
    Boolean(digitalBookFile.value)
  )
})

function openPhotoPicker() {
  photoInputRef.value?.click()
}

function openPdfPicker() {
  pdfInputRef.value?.click()
}

function onPhotoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  photoFile.value = file
  const reader = new FileReader()
  reader.onload = () => {
    const result = String(reader.result ?? '')
    form.value.bookPhoto = result
    form.value.photos = result ? [result] : []
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function onPdfSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  digitalBookFile.value = file
  form.value.digitalBookName = file.name
  input.value = ''
}

function clearCover() {
  photoFile.value = null
  form.value.bookPhoto = ''
  form.value.photos = []
}

function clearPdf() {
  digitalBookFile.value = null
  form.value.digitalBookName = ''
}

function closeSuccessModal() {
  showSuccessModal.value = false
  modalFeedback.value = null
}

function closeErrorModal() {
  showErrorModal.value = false
  modalFeedback.value = null
}

async function handleSubmit() {
  if (!isFormValid.value || isSubmitting.value) return
  if (!photoFile.value || !digitalBookFile.value) return

  const result = await digitalBookStore.registerDigitalBook({
    title: form.value.title,
    author: form.value.author,
    genres: form.value.genres,
    photoFiles: [photoFile.value],
    pdfFile: digitalBookFile.value,
  })

  modalFeedback.value = result.feedback

  if (result.ok) {
    form.value = BookFactory.createEmpty()
    photoFile.value = null
    digitalBookFile.value = null
    showSuccessModal.value = true
    return
  }

  showErrorModal.value = true
}
</script>

<template>
  <div class="min-h-screen bg-[#FFFBF5] px-4 sm:px-6 py-10">
    <div class="pointer-events-none fixed right-0 top-0 opacity-10 -z-10">
      <svg width="320" height="240" viewBox="0 0 320 240" fill="none">
        <circle cx="280" cy="-10" r="140" fill="#f59e0b" />
        <circle cx="230" cy="60" r="70" fill="#ea580c" />
      </svg>
    </div>

    <div class="max-w-3xl mx-auto space-y-8">
      <header
        v-motion
        :initial="{ opacity: 0, y: 24 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 0.45 } }"
        class="relative overflow-hidden rounded-3xl px-6 py-6
               bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600
               shadow-xl shadow-orange-500/25"
      >
        <h1 class="font-serif text-3xl sm:text-4xl font-bold text-white">
          Registrar libro digital
        </h1>
        <p class="mt-1 text-sm text-orange-50/95 max-w-xl">
          Completa el formulario. Al guardar, convertimos portada y PDF a base64 y los enviamos a
          /digital-books.
        </p>
      </header>

      <form
        class="rounded-3xl border border-amber-200 bg-white/90 backdrop-blur-sm
               shadow-xl shadow-amber-100/70 overflow-hidden"
        @submit.prevent="handleSubmit"
      >
        <div class="px-6 sm:px-8 py-8 space-y-8">
          <section
            v-if="showIdentity"
            v-motion
            :initial="{ opacity: 0, y: 28 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }"
          >
            <h2 class="font-serif text-xl font-bold text-stone-900 mb-4">Datos del libro</h2>
            <Suspense>
              <IdentityFields
                v-model:title="form.title"
                v-model:author="form.author"
                v-model:description="form.description"
              />
              <template #fallback>
                <p class="text-sm text-stone-500">Cargando campos…</p>
              </template>
            </Suspense>
          </section>

          <section
            v-if="showGenres"
            v-motion
            :initial="{ opacity: 0, y: 28 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }"
          >
            <Suspense>
              <GenresField v-model:genres="form.genres" />
              <template #fallback>
                <p class="text-sm text-stone-500">Cargando géneros…</p>
              </template>
            </Suspense>
          </section>

          <section
            v-if="showCover"
            v-motion
            :initial="{ opacity: 0, y: 28 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }"
            class="space-y-4"
          >
            <h2 class="font-serif text-xl font-bold text-stone-900">Foto de la portada</h2>
            <input
              ref="photoInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onPhotoSelected"
            />
            <Suspense>
              <FilePickButton
                label="Seleccionar la imagen del libro"
                hint="JPG o PNG · se enviará en base64"
                variant="image"
                @click="openPhotoPicker"
              />
              <template #fallback>
                <p class="text-sm text-stone-500">Cargando selector de imagen…</p>
              </template>
            </Suspense>

            <Suspense v-if="form.bookPhoto">
              <CoverPreviewBounce
                :src="form.bookPhoto"
                :title="form.title"
                @remove="clearCover"
              />
            </Suspense>
          </section>

          <section
            v-if="showPdf"
            v-motion
            :initial="{ opacity: 0, y: 28 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }"
            class="space-y-3"
          >
            <h2 class="font-serif text-xl font-bold text-stone-900">Libro digital (PDF)</h2>
            <input
              ref="pdfInputRef"
              type="file"
              accept="application/pdf,.pdf"
              class="hidden"
              @change="onPdfSelected"
            />
            <Suspense>
              <FilePickButton
                label="Seleccionar el PDF"
                hint="Archivo .pdf · se enviará en base64 (filePDF)"
                variant="pdf"
                @click="openPdfPicker"
              />
              <template #fallback>
                <p class="text-sm text-stone-500">Cargando selector de PDF…</p>
              </template>
            </Suspense>

            <div
              v-if="form.digitalBookName"
              v-motion
              :initial="{ opacity: 0, scale: 0.95 }"
              :enter="{ opacity: 1, scale: 1 }"
              class="flex items-center justify-between gap-3 rounded-xl border border-amber-200
                     bg-amber-50 px-4 py-3 text-sm text-amber-950"
            >
              <span class="truncate font-medium">{{ form.digitalBookName }}</span>
              <button type="button" class="shrink-0 text-rose-700 hover:underline" @click="clearPdf">
                Quitar
              </button>
            </div>
          </section>
        </div>

        <div
          v-if="showActions"
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 0.35 } }"
          class="px-6 sm:px-8 py-6 border-t border-amber-100 bg-amber-50/60
                 flex flex-col sm:flex-row gap-3"
        >
          <button
            type="submit"
            :disabled="!isFormValid || isSubmitting"
            class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                   bg-amber-600 text-white font-semibold shadow-lg shadow-amber-600/25
                   hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
          >
            <svg v-if="isSubmitting" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            {{ isSubmitting ? 'Registrando…' : 'Registrar libro digital' }}
          </button>
        </div>
      </form>
    </div>

    <DigitalBookSuccessModal
      :visible="showSuccessModal"
      :title="modalFeedback?.title ?? '¡Libro digital guardado!'"
      :message="modalFeedback?.message ?? 'Tu libro se almacenó con éxito.'"
      @close="closeSuccessModal"
    />

    <DigitalBookErrorModal
      :visible="showErrorModal"
      :title="modalFeedback?.title ?? 'No pudimos guardar el libro'"
      :message="modalFeedback?.message ?? 'Revisa la información e inténtalo de nuevo.'"
      @close="closeErrorModal"
    />
  </div>
</template>
