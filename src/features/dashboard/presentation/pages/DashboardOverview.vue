<script setup lang="ts">
interface KpiCard {
  label: string
  value: string
  change: string
  positive: boolean
  icon: string
}

const kpis: KpiCard[] = [
  { label: 'Total de libros', value: '1,284', change: '+12%', positive: true, icon: 'books' },
  { label: 'Libros prestados', value: '347', change: '+8%', positive: true, icon: 'loan' },
  { label: 'Temas realizadas', value: '48', change: '+24%', positive: true, icon: 'topics' },
  { label: 'Libros leídos', value: '892', change: '+18%', positive: true, icon: 'read' },
]

const monthlyData = [
  { month: 'Ene', value: 45 },
  { month: 'Feb', value: 52 },
  { month: 'Mar', value: 38 },
  { month: 'Abr', value: 61 },
  { month: 'May', value: 55 },
  { month: 'Jun', value: 72 },
  { month: 'Jul', value: 68 },
  { month: 'Ago', value: 84 },
  { month: 'Sep', value: 59 },
  { month: 'Oct', value: 77 },
  { month: 'Nov', value: 63 },
  { month: 'Dic', value: 90 },
]

const maxValue = Math.max(...monthlyData.map(d => d.value))

interface PopularBook {
  title: string
  author: string
  genre: string
  timesBorrowed: number
  status: string
}

const popularBooks: PopularBook[] = [
  { title: 'Cien años de soledad', author: 'Gabriel García Márquez', genre: 'Realismo mágico', timesBorrowed: 142, status: 'Disponible' },
  { title: '1984', author: 'George Orwell', genre: 'Distopía', timesBorrowed: 98, status: 'Prestado' },
  { title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', genre: 'Clásico', timesBorrowed: 87, status: 'Disponible' },
  { title: 'Orgullo y prejuicio', author: 'Jane Austen', genre: 'Romance', timesBorrowed: 76, status: 'Disponible' },
  { title: 'El principito', author: 'Antoine de Saint-Exupéry', genre: 'Fábula', timesBorrowed: 65, status: 'Prestado' },
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-500">Resumen general de tu biblioteca digital.</p>
    </div>
    <!-- Gráfico de barras + Tabla -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <!-- Barras -->
      <div
        class="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-stone-200/50 backdrop-blur-sm p-6 shadow-2xl lg:col-span-2">
        <!-- Decorador SVG -->
        <div class="pointer-events-none absolute right-0 top-0 opacity-20">
          <svg width="140" height="100" viewBox="0 0 140 100" fill="none">
            <circle cx="120" cy="-5" r="60" fill="#f59e0b" />
            <circle cx="100" cy="15" r="30" fill="#ea580c" />
          </svg>
        </div>

        <!-- Header -->
        <div class="mb-6 flex items-center gap-3">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
            <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 class="font-serif text-base font-bold text-amber-500">Libros leídos por mes</h2>
            <p class="text-xs text-stone-400">Actividad de lectura anual</p>
          </div>
        </div>

        <!-- Gráfica de barras -->
        <div class="flex items-end justify-between gap-1.5" style="height: 140px">
          <div v-for="d in monthlyData" :key="d.month"
            class="group relative flex flex-1 flex-col items-center justify-end">
            <!-- Tooltip -->
            <div
              class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-amber-500/20 bg-stone-900/50 px-2 py-1 text-xs font-semibold text-amber-300 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
              {{ d.value }}
            </div>

            <!-- Barra -->
            <div
              class="relative w-full overflow-hidden rounded-t-lg bg-gradient-to-t from-amber-500 to-amber-300 transition-all duration-300 group-hover:from-orange-400 group-hover:to-amber-200"
              :style="{ height: (d.value / maxValue) * 100 + '%' }">
              <!-- Brillo interior -->
              <div class="absolute inset-x-0 top-0 h-1/3 rounded-t-lg bg-stone-900/50" />
            </div>

            <!-- Base track -->
            <div class="absolute bottom-0 h-full w-full rounded-t-lg bg-stone-900/50" style="z-index: -1" />

            <!-- Label mes -->
            <span
              class="mt-2 text-[10px] font-medium uppercase tracking-wider text-stone-500 group-hover:text-amber-400 transition-colors duration-150">
              {{ monthlyData.month }}
            </span>
          </div>
        </div>

        <!-- Footer con línea base y total -->
        <div class="mt-5 flex items-center justify-between border-t border-stone-300/60 pt-4">
          <span class="text-xs text-stone-400">
            Total:
            <span class="ml-1 font-semibold text-amber-400">
              {{monthlyData.reduce((s, d) => s + d.value, 0)}} libros
            </span>
          </span>
          <span class="flex items-center gap-1.5 text-xs text-stone-500">
            <span class="inline-block h-2 w-2 rounded-sm bg-gradient-to-t from-amber-500 to-amber-300" />
            Libros leídos
          </span>
        </div>
      </div>

      <!-- Tabla libros populares -->
      <div
        class="relative overflow-hidden rounded-3xl border border-orange-200/50 bg-white/40 p-6 shadow-2xl lg:col-span-3">
        <!-- Decorador SVG esquina superior derecha -->
        <div class="pointer-events-none absolute right-0 top-0 opacity-10">
          <svg width="180" height="120" viewBox="0 0 180 120" fill="none">
            <circle cx="160" cy="-10" r="80" fill="#f59e0b" />
            <circle cx="140" cy="20" r="40" fill="#ea580c" />
          </svg>
        </div>
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- Icono decorativo -->
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
              <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 class="font-serif text-base font-bold text-amber-500">Libros más populares</h2>
              <p class="text-xs text-stone-400">Ranking por prestamos</p>
            </div>
          </div>

          <!-- Badge de periodo -->
          <span
            class="rounded-full border border-amber-500/60 bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-600">Últimos
            30 días</span>
        </div>
        <!-- Tabla -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-stone-700/60 text-xs font-semibold uppercase tracking-wider text-stone-500">
                <th class="pb-3 pr-4 text-xs font-semibold uppercase tracking-widest text-stone-500">Título</th>
                <th class="pb-3 pr-4 text-xs font-semibold uppercase tracking-widest text-stone-500">Autor</th>
                <th class="pb-3 pr-4 text-xs font-semibold uppercase tracking-widest text-stone-500">Género</th>
                <th class="pb-3 pr-4 text-xs font-semibold uppercase tracking-widest text-stone-500">Veces prestado</th>
                <th class="pb-3 pr-4 text-xs font-semibold uppercase tracking-widest text-stone-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(book, idx) in popularBooks" :key="book.title"
                class="group border-b border-stone-600/60 transition-colors duration-150 hover:bg-amber-400/50 hover:text-stone-900 border-amber-50 rounded-2xl">
                <!-- Titulo con numero de ranking -->
                <td class="py-3.5 pr-4">
                  <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold" :class="idx === 0
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-500/40'
                    : 'bg-yellow-400/20 text-yellow-500'">
                    {{ idx + 1 }}
                  </div>
                  <span class="font-medium text-orange-800 group-hover:text-stone-900 transition-colors duration-150">
                    {{ book.title }}
                  </span>
                </td>
                <td class="py-3 pr-4 text-gray-600">{{ book.author }}</td>
                <td class="py-3 pr-4 text-gray-600">
                  <span
                    class="rounded-md bg-orange-500/5 px-2 py-0.5 text-xs font-medium text-orange-400 border border-orange-400/20">
                    {{ book.genre }}
                  </span>
                </td>
                <!-- Prestamos con mini barra -->
                <td class="py-3 pr-4 text-right font-medium text-gray-900">
                  <div class="flex items-center justify-end gap-2">
                    <div class="h-1 w-16 overflow-hidden rounded-full bg-stone-600/50">
                      <div class="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                        :style="{ width: Math.min((book.timesBorrowed / 100) * 100, 100) + '%' }" />
                    </div>
                  </div>
                  <span class="min-w-[2rem] font-semibold text-amber-400">{{ book.timesBorrowed }}</span>
                </td>
                <!-- Estado -->
                <td class="py-3 text-right">
                  <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    :class="book.status === 'Disponible'
                      ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'">
                    <span class="h-1.5 w-1.5 rounded-full"
                      :class="book.status === 'Disponible' ? 'bg-emerald-400' : 'bg-amber-400'"></span>
                    <span class="text-xs font-medium"
                      :class="book.status === 'Disponible' ? 'text-emerald-700' : 'text-amber-700'">
                      {{ book.status }}
                    </span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer link -->
        <div class="mt-5 flex justify-end border-t border-stone-300/60 pt-4">
          <button
            class="flex items-center gap-1.5 text-xs font-medium text-amber-500 transition-colors hover:text-amber-400">
            Ver catálogo completo
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
