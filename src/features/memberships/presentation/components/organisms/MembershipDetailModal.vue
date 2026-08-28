<script setup lang="ts">
/**
 * MembershipDetailModal.vue
 *
 * Ventana modal reutilizable para visualizar el detalle de una membresía.
 * - Recibe la prop booleana `isOpen` para controlar la visibilidad.
 * - Emite `close` al hacer clic en la 'X', en el overlay o al presionar Escape.
 * - Usa la etiqueta nativa <Transition> para animar la aparición/desaparición.
 * - Expone un slot por defecto (contenido), un slot `header` y un slot `footer` opcionales.
 */
import { computed, onMounted, onUnmounted, watch } from 'vue'
import type { MembershipPlanPayload } from '../../../domain/entities/Membership.types'

interface Props {
  isOpen: boolean
  membership?: MembershipPlanPayload | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function handleClose(): void {
  emit('close')
}

/* ────────────── Accesibilidad: cierre con tecla Escape ────────────── */
function handleEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.isOpen) {
    handleClose()
  }
}

function onKeydown(event: KeyboardEvent): void {
  handleEscape(event)
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

/* ────────────── Bloqueo de scroll del fondo mientras está abierto ────────────── */
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)

/* ────────────── Formato de datos del detalle ────────────── */
const TYPE_LABELS: Record<string, string> = {
  BY_PERIOD: 'Por periodo',
  BY_CLASS: 'Por clase',
}

const INTERVAL_LABELS: Record<string, string> = {
  BY_PERIOD: 'Duración del plan',
  BY_CLASS: 'Clases incluidas',
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

const detailRows = computed(() => {
  return [
    { id: 'type', label: 'Tipo de membresía', value: TYPE_LABELS[props.membership?.type ?? ''] ?? '—' },
    { id: 'interval', label: INTERVAL_LABELS[props.membership?.type ?? ''] ?? 'Detalle', value: intervalValue() },
    { id: 'price', label: 'Precio del plan', value: formatPrice(props.membership?.price ?? 0) },
    { id: 'pricePerClass', label: 'Precio por clase', value: props.membership?.price_per_class ? formatPrice(props.membership.price_per_class) : '—' },
    { id: 'status', label: 'Estado', value: props.membership?.is_active ? 'Activo' : 'Inactivo' },
  ]
})

/* Badge soft (naranja/amarillo) para el tipo de membresía y el nombre */
const TYPE_BADGE = 'inline-flex items-center rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-3 py-0.5 text-base font-semibold text-orange-800'

function isTypeRow(id: string): boolean {
  return id === 'type'
}

function isStatusRow(id: string): boolean {
  return id === 'status'
}

/* Variantes de color para el badge de estado */
const STATUS_BADGE = {
  active: 'inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-base font-semibold text-emerald-700',
  inactive:
    'inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-base font-semibold text-amber-700',
}

function intervalValue(): string {
  const plan = props.membership
  if (!plan) return '—'
  if (plan.type === 'BY_PERIOD') {
    const days = plan.duration_days
    if (!days) return '—'
    return `${days} días`
  }
  return plan.classes_included > 0 ? `${plan.classes_included} clase${plan.classes_included !== 1 ? 's' : ''}` : 'Sin tope'
}
</script>

<template>
  <Teleport to="body">
    <!-- Contenedor fijo que envuelve overlay + panel -->
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <!-- Overlay con animación de fundido -->
      <Transition name="fade">
        <div
          v-if="isOpen"
          class="absolute inset-0 bg-black/45 backdrop-blur-sm"
          aria-hidden="true"
          @click="handleClose"
        />
      </Transition>

      <!-- Panel del modal con animación de escala + deslizamiento -->
      <Transition name="modal">
        <div
          v-if="isOpen"
          role="dialog"
          aria-modal="true"
          aria-label="Detalle de membresía"
          class="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-2xl"
        >
          <!-- Encabezado -->
          <div class="flex items-start justify-between gap-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <slot name="header">
                <h3 class="font-serif text-lg font-bold text-stone-800">Detalle de membresía</h3>
                <span
                  v-if="membership?.name"
                  class="mt-1"
                  :class="TYPE_BADGE"
                >
                  {{ membership.name }}
                </span>
              </slot>
            </div>

            <button
              type="button"
              aria-label="Cerrar modal"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-amber-100 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              @click="handleClose"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Contenido (slot por defecto) con fade-in mediante Motion -->
          <div
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { duration: 0.8 } }"
            class="flex-1 overflow-y-auto px-5 py-5 sm:px-6"
          >
            <slot>
              <!-- Detalle por defecto si no se pasa contenido -->
              <dl v-if="membership" class="space-y-3">
                <div
                  v-for="row in detailRows"
                  :key="row.id"
                  class="flex items-center justify-between gap-4 rounded-lg border border-amber-100 bg-[#FFFBF5] px-4 py-3"
                >
                  <dt class="text-sm text-stone-500">{{ row.label }}</dt>

                  <!-- Badge de tipo de membresía (soft naranja/amarillo) -->
                  <dd v-if="isTypeRow(row.id)" class="min-w-0">
                    <span :class="TYPE_BADGE">
                      {{ row.value }}
                    </span>
                  </dd>

                  <!-- Badge de estado (verde activo / amarillo inactivo) -->
                  <dd v-else-if="isStatusRow(row.id)">
                    <span :class="membership.is_active ? STATUS_BADGE.active : STATUS_BADGE.inactive">
                      <span
                        class="h-2 w-2 rounded-full"
                        :class="membership.is_active ? 'bg-emerald-500' : 'bg-amber-500'"
                        aria-hidden="true"
                      />
                      {{ row.value }}
                    </span>
                  </dd>

                  <!-- Resto de filas en texto plano -->
                  <dd v-else class="text-sm font-semibold text-stone-800">{{ row.value }}</dd>
                </div>
              </dl>
            </slot>
          </div>

          <!-- Pie de página opcional -->
          <footer v-if="$slots.footer" class="border-t border-amber-100 bg-stone-50/70 px-5 py-4 sm:px-6">
            <slot name="footer" />
          </footer>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
/* Animación del overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animación del panel del modal */
.modal-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.95);
}
</style>
