<script setup lang="ts">
/**
 * SQL requerido para la tabla de mensajes de IA por gladiador:
 *
 * create table if not exists member_chat_messages (
 *   id         uuid primary key default gen_random_uuid(),
 *   member_id  text not null,
 *   role       text not null check (role in ('user', 'assistant')),
 *   content    text not null,
 *   created_at timestamptz default now()
 * );
 *
 * create index if not exists idx_member_chat_messages_member
 *   on member_chat_messages (member_id, created_at asc);
 */

import { marked } from 'marked'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../../../lib/supabase'
import BaseModal from '../../../../utils/components/BaseModal.vue'
import { useMemberStore } from '../../application/stores/useMemberStore'
import type { Member } from '../../domain/entities/Member.types'
import { MemberDomainService } from '../../domain/services/MemberDomainService'
import BMIIndicator from '../components/atoms/BMIIndicator.vue'

interface AiConfig {
  provider: 'ollama' | 'openai-compat'
  baseUrl: string
  model: string
  apiKey: string
}

const router = useRouter()
const memberStore = useMemberStore()

const searchQuery = ref('')

// ── Detail Modal ──
const detailModalOpen = ref(false)
const detailMember = ref<Member | null>(null)

function openDetailModal(member: Member) {
  detailMember.value = member
  detailModalOpen.value = true
}

// ── Delete Modal ──
const deleteModalOpen = ref(false)
const deleteTarget = ref<Member | null>(null)

function openDeleteModal(member: Member) {
  deleteTarget.value = member
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await memberStore.deleteMember(deleteTarget.value.id)
    deleteModalOpen.value = false
    deleteTarget.value = null
  } catch (e: any) {
    alert(`Error al eliminar: ${e?.message || 'Error desconocido'}`)
  }
}

// ── AI Modal ──
const aiModalOpen = ref(false)
const aiMember = ref<Member | null>(null)
const aiChatMessages = ref<{ role: 'user' | 'assistant'; content: string }[]>([])
const aiChatInput = ref('')
const aiLoading = ref(false)
const showAiConfig = ref(false)
const aiConfig = ref<AiConfig>({
  provider: 'ollama',
  baseUrl: 'http://localhost:11434',
  model: '',
  apiKey: '',
})
const configTestError = ref('')
const isTestingConfig = ref(false)

function loadAiConfig() {
  try {
    const raw = localStorage.getItem('alajandria-ai-config')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.provider && parsed.baseUrl) {
        aiConfig.value = parsed
        showAiConfig.value = false
        return true
      }
    }
  } catch { }
  showAiConfig.value = true
  return false
}

async function testAiConnection() {
  configTestError.value = ''
  isTestingConfig.value = true
  try {
    const res = await fetch(`${aiConfig.value.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: aiConfig.value.model,
        messages: [{ role: 'user', content: 'test' }],
        stream: false,
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (!data.message?.content && !data.response) throw new Error('Respuesta vacía')
  } catch (e: any) {
    configTestError.value = e?.message ?? 'No se pudo conectar'
    isTestingConfig.value = false
    return
  }
  isTestingConfig.value = false
  localStorage.setItem('alajandria-ai-config', JSON.stringify(aiConfig.value))
  showAiConfig.value = false
}

async function saveMessageToSupabase(memberId: string, role: string, content: string) {
  try {
    await supabase.from('member_chat_messages').insert({
      member_id: memberId,
      role,
      content,
    })
  } catch (e) {
    console.error('[MemberListPage] Error saving chat message:', e)
  }
}

async function loadChatHistory(memberId: string): Promise<{ role: 'user' | 'assistant'; content: string }[]> {
  try {
    const { data } = await supabase
      .from('member_chat_messages')
      .select('role, content')
      .eq('member_id', memberId)
      .order('created_at', { ascending: true })
    return (data ?? []) as { role: 'user' | 'assistant'; content: string }[]
  } catch (e) {
    console.error('[MemberListPage] Error loading chat history:', e)
    return []
  }
}

async function openAiModal(member: Member) {
  aiMember.value = member
  aiChatMessages.value = []
  aiChatInput.value = ''
  if (!loadAiConfig()) { showAiConfig.value = true; aiModalOpen.value = true; return }
  aiModalOpen.value = true

  const history = await loadChatHistory(member.id)
  if (history.length > 0) {
    aiChatMessages.value = history
  } else {
    sendInitialGreeting()
  }
}

async function sendInitialGreeting() {
  aiLoading.value = true
  const greetingFallback = `Soy Gurney Halleck, maestro de armas del Coliseo. He entrenado a guerreros en innumerables campañas y conozco el valor de un plan bien trazado.
He revisado tu ficha, soldado: ${calculateAge(aiMember.value!.date_of_birth)} años, ${aiMember.value!.weight_kg} kg, ${aiMember.value!.height_cm} cm. Dime, ¿deseas que elabore un plan de ejercicios a tu medida? La disciplina es el puente entre tus metas y la gloria.`
  try {
    const history = [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: 'Preséntate como Gurney Halleck, maestro de armas del Coliseo, y pregúntame si quiero un plan de ejercicios según mis datos.' },
    ]
    const reply = await callAi(history)
    const content = reply || greetingFallback
    aiChatMessages.value.push({ role: 'assistant', content })
    if (aiMember.value) saveMessageToSupabase(aiMember.value.id, 'assistant', content)
  } catch {
    aiChatMessages.value.push({ role: 'assistant', content: greetingFallback })
    if (aiMember.value) saveMessageToSupabase(aiMember.value.id, 'assistant', greetingFallback)
  } finally {
    aiLoading.value = false
  }
}

function buildSystemPrompt(): string {
  return `Eres Gurney Halleck, un veterano maestro de armas del Coliseo. Forjado en innumerables campañas, representas el equilibrio perfecto entre la fuerza bruta y la inteligencia estratégica.

FUNCIONES:
- Enseñas estrategia y disciplina.
- Instruyes en tácticas de entrenamiento.
- Supervisas la preparación de las tropas.

CARACTERÍSTICAS:
- Muy disciplinado.
- Gran estratega.
- Veterano de numerosas campañas.
- También eres poeta y músico, lo que aporta una dimensión cultural a tu carácter.

REGLAS PROHIBIDAS:
1. NO puedes responder preguntas literarias, históricas, filosóficas ni de cultura general.
2. NO puedes dar diagnósticos médicos, recetar medicamentos ni interpretar exámenes clínicos.
3. NO puedes resolver problemas financieros, contables ni impositivos.

ALCANCE PERMITIDO:
- Solo puedes responder conceptos sobre ejercicios, rutinas de entrenamiento, técnica de movimientos, anatomía funcional básica, nutrición deportiva general y recuperación física.
- Solo puedes interpretar y comentar sobre los datos básicos del gladiador (edad, peso, altura, IMC, objetivos, condiciones de salud reportadas) en el contexto de entrenamiento.

Si te preguntan algo fuera de este alcance, responde con autoridad marcial que tu especialidad es el entrenamiento, no esos temas.

Datos del gladiador:
Nombre: ${aiMember.value?.name_full}
Edad: ${aiMember.value ? calculateAge(aiMember.value.date_of_birth) : ''} años
Género: ${aiMember.value ? MemberDomainService.getGenderLabel(aiMember.value.gender) : ''}
Peso: ${aiMember.value?.weight_kg} kg
Altura: ${aiMember.value?.height_cm} cm
IMC: ${aiMember.value?.bmi ?? 'N/A'}
Objetivos: ${(aiMember.value?.goals ?? []).map(g => MemberDomainService.getGoalTypeLabel(g.goal_type)).join(', ') || 'Ninguno'}
Condiciones de salud: ${(aiMember.value?.health_conditions ?? []).map(h => h.condition_name).join(', ') || 'Ninguna'}
Responde en español como Gurney Halleck: con disciplina marcial, sabiduría de veterano y el toque culto de un poeta.`
}

async function callAi(history: { role: string; content: string }[]): Promise<string> {
  const cfg = aiConfig.value
  if (cfg.provider === 'ollama') {
    const res = await fetch(`${cfg.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: cfg.model, messages: history, stream: false }),
    })
    if (!res.ok) throw new Error(`Ollama error ${res.status}`)
    const data = await res.json()
    return data.message?.content ?? data.response ?? ''
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cfg.apiKey) headers['Authorization'] = `Bearer ${cfg.apiKey}`
  const res = await fetch(`${cfg.baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: cfg.model, messages: history }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

async function sendAiMessage() {
  const text = aiChatInput.value.trim()
  if (!text || aiLoading.value) return
  aiChatInput.value = ''
  aiChatMessages.value.push({ role: 'user', content: text })
  aiLoading.value = true

  const memberId = aiMember.value?.id
  if (memberId) saveMessageToSupabase(memberId, 'user', text)

  try {
    const history = [
      { role: 'system', content: buildSystemPrompt() },
      ...aiChatMessages.value.map(m => ({ role: m.role, content: m.content })),
    ]
    const reply = await callAi(history)
    aiChatMessages.value.push({ role: 'assistant', content: reply })
    if (memberId) saveMessageToSupabase(memberId, 'assistant', reply)
  } catch (e: any) {
    const errorMsg = `⚠️ Error: ${e?.message ?? 'No se pudo conectar con el modelo.'}`
    aiChatMessages.value.push({ role: 'assistant', content: errorMsg })
    if (memberId) saveMessageToSupabase(memberId, 'assistant', errorMsg)
  } finally {
    aiLoading.value = false
  }
}

onMounted(async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    router.push({ name: 'login' })
    return
  }

  await memberStore.fetchMembers()
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function calculateAge(dateOfBirth: string): number {
  return MemberDomainService.calculateAge(dateOfBirth)
}

function getGenderBadgeClass(gender: string): string {
  switch (gender) {
    case 'MASCULINO': return 'bg-blue-100 text-blue-700'
    case 'FEMENINO': return 'bg-pink-100 text-pink-700'
    default: return 'bg-purple-100 text-purple-700'
  }
}

function renderMarkdown(text: string): string {
  return marked.parse(text, { async: false }) as string
}

function getSeverityBadgeClass(severity: string): string {
  switch (severity) {
    case 'GRAVE': return 'bg-red-100 text-red-700 border-red-200'
    case 'MODERADO': return 'bg-amber-100 text-amber-700 border-amber-200'
    default: return 'bg-green-100 text-green-700 border-green-200'
  }
}

function getMoodLabel(mood: string): string {
  const labels: Record<string, string> = { POSITIVO: 'Positivo', NEUTRO: 'Neutro', NEGATIVO: 'Negativo' }
  return labels[mood] || mood
}

async function handleSearch() {
  if (searchQuery.value.trim()) {
    await memberStore.searchMembers(searchQuery.value.trim())
  } else {
    await memberStore.fetchMembers()
  }
}

function getMemberGoals(member: { goals?: { is_achieved: boolean }[] }) {
  return member.goals ?? []
}

function goToCreate() {
  router.push({ name: 'member-create' })
}

function handleErrorDismiss() {
  memberStore.clearError()
}

async function handleRetry() {
  memberStore.clearError()
  if (searchQuery.value.trim()) {
    await memberStore.searchMembers(searchQuery.value.trim())
  } else {
    await memberStore.fetchMembers()
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-stone-100 px-6 py-8">

    <!-- Decoradores globales -->
    <div class="pointer-events-none fixed right-0 top-0 opacity-10 -z-10">
      <svg width="400" height="280" viewBox="0 0 400 280" fill="none">
        <circle cx="360" cy="-25" r="180" fill="#f59e0b" />
        <circle cx="305" cy="65" r="90" fill="#ea580c" />
      </svg>
    </div>
    <div class="pointer-events-none fixed bottom-0 left-0 opacity-5 -z-10">
      <svg width="260" height="210" viewBox="0 0 260 210" fill="none">
        <circle cx="0" cy="210" r="155" fill="#f59e0b" />
      </svg>
    </div>

    <div class="max-w-7xl mx-auto space-y-6">

      <!-- ── Page Header ── -->
      <div
        class="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-white/80 backdrop-blur-sm px-8 py-6 shadow-xl shadow-amber-100/60">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
        <div class="pointer-events-none absolute right-0 top-0 opacity-10">
          <svg width="220" height="140" viewBox="0 0 220 140" fill="none">
            <circle cx="200" cy="-10" r="100" fill="#f59e0b" />
            <circle cx="160" cy="40" r="55" fill="#ea580c" />
          </svg>
        </div>
        <div class="relative flex items-center gap-4">
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 class="font-serif text-2xl font-bold text-stone-800">Gladiadores del Coliseo</h1>
            <p class="text-xs text-stone-400 mt-0.5">Registro de guerreros inscritos en el Coliseo de Alejandría</p>
          </div>
        </div>
      </div>

      <!-- ── Actions Bar ── -->
      <div
        class="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-white/80 backdrop-blur-sm p-4 shadow-lg shadow-amber-100/40">
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">

          <!-- Search -->
          <div class="relative flex-1 max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input v-model="searchQuery" @keyup.enter="handleSearch" type="text"
              placeholder="Buscar por nombre o documento..."
              class="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-amber-200/60 rounded-xl bg-amber-50/40 text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200" />
          </div>

          <!-- Buttons -->
          <div class="flex items-center gap-2 shrink-0">
            <button @click="handleSearch"
              class="inline-flex items-center gap-2 border-2 border-amber-300 text-amber-700 hover:bg-amber-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>

            <button @click="goToCreate"
              class="relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl active:scale-95 group">
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <svg class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="relative">Registrar Gladiador</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ── Aviso backend no disponible ── -->
      <div v-if="memberStore.listFallbackActive"
        class="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3 shadow-sm">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div
          class="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
          <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-sm text-amber-800">
          El backend aún no expone
          <code
            class="text-xs bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-lg font-mono">GET /members</code>.
          Se muestran los gladiadores registrados en esta sesión o en caché local.
        </p>
      </div>

      <!-- ── Loading ── -->
      <div v-if="memberStore.isLoading"
        class="flex items-center justify-center py-16 rounded-3xl border border-amber-200/60 bg-white/70 backdrop-blur-sm shadow-lg">
        <div class="w-8 h-8 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
        <span class="ml-3 text-sm text-stone-400">Cargando gladiadores…</span>
      </div>

      <!-- ── Error ── -->
      <div v-else-if="memberStore.hasError" class="flex flex-col items-center gap-4 py-8">
        <ErrorNotification type="error" title="Error al cargar gladiadores"
          :message="memberStore.error ?? 'No se pudo obtener la lista del Coliseo. Verifica tu conexión e inténtalo de nuevo.'"
          :duration="0" :on-close="handleErrorDismiss" />
        <button type="button" @click="handleRetry"
          class="inline-flex items-center gap-2 border-2 border-amber-300 text-amber-700 hover:bg-amber-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reintentar carga
        </button>
      </div>

      <!-- ── Empty State ── -->
      <div v-else-if="!memberStore.hasMembers"
        class="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 py-16 px-8 text-center shadow-xl shadow-amber-100/40">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div class="relative inline-flex mb-5">
          <div
            class="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-lg scale-110" />
          <div
            class="relative w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 ring-4 ring-amber-100">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <h3 class="font-serif text-lg font-bold text-stone-700 mb-2">No hay gladiadores registrados</h3>
        <p class="text-sm text-stone-400 max-w-xs mx-auto mb-6">
          El Coliseo aguarda a sus primeros guerreros. Registra el primer gladiador para comenzar.
        </p>
        <button @click="goToCreate"
          class="relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 active:scale-95 group">
          <div
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <svg class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="relative">Registrar primer gladiador</span>
        </button>
      </div>

      <!-- ── Tabla ── -->
      <div v-else
        class="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 backdrop-blur-sm shadow-xl shadow-amber-100/40">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div class="overflow-x-auto">
          <table class="w-full text-sm">

            <!-- Head -->
            <thead>
              <tr class="border-b border-amber-100 bg-amber-50/60">
                <th class="px-5 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Gladiador
                </th>
                <th class="px-5 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Documento
                </th>
                <th class="px-5 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Edad</th>
                <th class="px-5 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Género
                </th>
                <th class="px-5 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">IMC</th>
                <th class="px-5 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Objetivos
                </th>
                <th class="px-5 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-widest">Registro
                </th>
                <th class="px-5 py-4 text-right text-xs font-semibold text-stone-400 uppercase tracking-widest">Acciones
                </th>
              </tr>
            </thead>

            <!-- Body -->
            <tbody class="divide-y divide-amber-50">
              <tr v-for="member in memberStore.members" :key="member.id"
                class="group hover:bg-amber-50/50 transition-colors duration-150 cursor-pointer"
                @click="memberStore.selectMember(member)">
                <!-- Gladiador -->
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/30 to-orange-500/20 border border-amber-200 flex items-center justify-center shrink-0">
                      <span class="text-xs font-bold text-amber-700">
                        {{ member.name_full?.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div>
                      <div
                        class="font-semibold text-stone-800 group-hover:text-amber-800 transition-colors duration-150">
                        {{ member.name_full }}
                      </div>
                      <div class="text-xs text-stone-400">{{ member.phone_number }}</div>
                    </div>
                  </div>
                </td>

                <!-- Documento -->
                <td class="px-5 py-4">
                  <div class="font-semibold text-stone-700 font-mono text-xs">{{ member.number_document }}</div>
                  <div class="text-xs text-stone-400 mt-0.5">
                    {{ MemberDomainService.getDocumentTypeLabel(member.type_document) }}
                  </div>
                </td>

                <!-- Edad -->
                <td class="px-5 py-4">
                  <span class="inline-flex items-center gap-1 text-stone-600 text-sm">
                    {{ calculateAge(member.date_of_birth) }}
                    <span class="text-xs text-stone-400">años</span>
                  </span>
                </td>

                <!-- Género -->
                <td class="px-5 py-4">
                  <span
                    :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', getGenderBadgeClass(member.gender)]">
                    {{ MemberDomainService.getGenderLabel(member.gender) }}
                  </span>
                </td>

                <!-- IMC -->
                <td class="px-5 py-4">
                  <BMIIndicator :bmi="member.bmi" size="sm" />
                </td>

                <!-- Objetivos -->
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-stone-700 text-sm">{{ getMemberGoals(member).length }}</span>
                    <span v-if="getMemberGoals(member).some(g => !g.is_achieved)"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Activo
                    </span>
                    <span v-else-if="getMemberGoals(member).length > 0"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Completos
                    </span>
                  </div>
                </td>

                <!-- Fecha -->
                <td class="px-5 py-4 text-xs text-stone-400 font-mono">
                  {{ formatDate(member.created_at) }}
                </td>

                <!-- Acciones -->
                <td class="px-5 py-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button @click.stop="openDetailModal(member)"
                      class="p-2 rounded-xl text-stone-400 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all duration-200 active:scale-90"
                      title="Ver datos del gladiador">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button @click.stop="openAiModal(member)"
                      class="p-2 rounded-xl text-stone-400 hover:text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-200 transition-all duration-200 active:scale-90"
                      title="Consultar IA local sobre este gladiador">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button @click.stop="openDeleteModal(member)"
                      class="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all duration-200 active:scale-90"
                      title="Eliminar gladiador">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer tabla -->
        <div class="px-5 py-3.5 bg-amber-50/40 border-t border-amber-100 flex items-center justify-between">
          <p class="text-xs text-stone-400">
            Total: <span class="font-bold text-amber-600 ml-1">{{ memberStore.members.length }}</span> gladiadores
          </p>
          <div class="flex items-center gap-1.5">
            <span class="inline-block h-2 w-2 rounded-sm bg-gradient-to-br from-amber-400 to-orange-500" />
            <span class="text-xs text-stone-400">Coliseo activo</span>
          </div>
        </div>
      </div>

      <!-- ── Stats Footer ── -->
      <div v-if="memberStore.hasMembers"
        class="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 backdrop-blur-sm p-6 shadow-xl shadow-amber-100/40">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div class="pointer-events-none absolute right-0 top-0 opacity-8">
          <svg width="160" height="110" viewBox="0 0 160 110" fill="none">
            <circle cx="140" cy="-8" r="75" fill="#f59e0b" />
            <circle cx="105" cy="28" r="38" fill="#ea580c" />
          </svg>
        </div>
        <div class="relative grid grid-cols-1 sm:grid-cols-3 gap-4">

          <!-- Stat: Total -->
          <div
            class="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-amber-50/50 px-5 py-4 text-center group hover:border-amber-300 hover:bg-amber-50 transition-all duration-200">
            <div
              class="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
            <div class="flex justify-center mb-2">
              <div
                class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-300/40">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div class="text-3xl font-bold text-amber-600 font-serif">{{ memberStore.totalMembers }}</div>
            <div class="text-xs text-stone-400 uppercase tracking-widest mt-1 font-medium">Total Gladiadores</div>
          </div>

          <!-- Stat: Activos -->
          <div
            class="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-emerald-50/40 px-5 py-4 text-center group hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200">
            <div
              class="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
            <div class="flex justify-center mb-2">
              <div
                class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-300/40">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="text-3xl font-bold text-emerald-600 font-serif">{{ memberStore.activeMembers.length }}</div>
            <div class="text-xs text-stone-400 uppercase tracking-widest mt-1 font-medium">Con Objetivos Activos</div>
          </div>

          <!-- Stat: IMC -->
          <div
            class="relative overflow-hidden rounded-2xl border border-orange-200/60 bg-orange-50/40 px-5 py-4 text-center group hover:border-orange-300 hover:bg-orange-50 transition-all duration-200">
            <div
              class="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />
            <div class="flex justify-center mb-2">
              <div
                class="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-300/40">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div class="text-3xl font-bold text-orange-600 font-serif">{{ memberStore.averageBMI }}</div>
            <div class="text-xs text-stone-400 uppercase tracking-widest mt-1 font-medium">IMC Promedio</div>
          </div>

        </div>
      </div>

    </div>
  </div>

  <!-- ═══ MODAL: Detalle del Gladiador ═══ -->
  <BaseModal :is-open="detailModalOpen" max-with-class="max-w-2xl" :expandable="false" @close="detailModalOpen = false">

    <!-- ── Header ── -->
    <template #header>
      <div class="flex items-center gap-3">
        <div class="relative inline-flex">
          <div class="absolute inset-0 rounded-xl bg-white/20 blur-sm scale-110" />
          <div
            class="relative w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>
        <div>
          <h3 class="font-serif text-xl font-bold text-white leading-tight">{{ detailMember?.name_full }}</h3>
          <p class="text-xs text-amber-100/60 mt-0.5 flex items-center gap-1.5">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Perfil del gladiador
          </p>
        </div>
      </div>
    </template>

    <!-- ── Content ── -->
    <template #content>
      <div v-if="detailMember" class="space-y-6">

        <!-- ══════════════════════════════
           § 1  IDENTIDAD
      ══════════════════════════════ -->
        <section aria-label="Datos básicos">

          <!-- Encabezado de sección — patrón consistente en todo el modal -->
          <header class="flex items-center gap-2 mb-3">
            <span
              class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shrink-0">
              <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <h4 class="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">Identidad</h4>
            <div class="flex-1 h-px bg-gradient-to-r from-amber-200/70 to-transparent" />
          </header>

          <!--
          Fila primaria — nombre grande como ancla visual de la sección.
          El nombre es lo que el lector busca primero (patrón F-scan).
        -->
          <div
            class="mb-2.5 bg-gradient-to-r from-amber-50 to-orange-50/40 rounded-2xl px-5 py-4 border border-amber-100">
            <span class="text-[9px] font-black text-amber-600/70 uppercase tracking-[0.18em]">Nombre completo</span>
            <p class="font-serif font-bold text-stone-800 text-lg leading-tight mt-0.5">{{ detailMember.name_full }}</p>
          </div>

          <!--
          Fila secundaria — datos en 2 columnas.
          Agrupación Gestalt por proximidad: pares relacionados juntos.
        -->
          <div class="grid grid-cols-2 gap-2 mb-2">
            <DataCell label="Documento" :mono="true">
              {{ detailMember.number_document }}
              <template #sub>{{ MemberDomainService.getDocumentTypeLabel(detailMember.type_document) }}</template>
            </DataCell>
            <DataCell label="Teléfono" :mono="true">{{ detailMember.phone_number }}</DataCell>
            <DataCell label="Edad">
              <span class="font-bold text-stone-800">{{ calculateAge(detailMember.date_of_birth) }}</span>
              <span class="text-stone-400 text-xs ml-1">años</span>
            </DataCell>
            <DataCell label="Género">{{ MemberDomainService.getGenderLabel(detailMember.gender) }}</DataCell>
          </div>

          <!-- Dirección — ancho completo, menor jerarquía -->
          <div class="bg-amber-50/40 rounded-xl px-4 py-3 border border-amber-100/80 flex items-start gap-2">
            <svg class="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="text-sm text-stone-600 leading-relaxed">{{ detailMember.address }}</p>
          </div>
        </section>

        <SectionDivider color="amber" />

        <!-- ══════════════════════════════
           § 2  CUERPO
      ══════════════════════════════ -->
        <section aria-label="Métricas corporales">

          <header class="flex items-center gap-2 mb-3">
            <span
              class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shrink-0">
              <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            <h4 class="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">Composición Corporal</h4>
            <div class="flex-1 h-px bg-gradient-to-r from-emerald-200/70 to-transparent" />
          </header>

          <!--
          Tres KPIs de mayor jerarquía — tamaño de fuente grande, serif.
          La diferencia de tamaño crea ritmo visual y reduce carga cognitiva.
        -->
          <div class="grid grid-cols-3 gap-2 mb-2">
            <KpiCard color="emerald" label="Peso" unit="kg" :value="detailMember.weight_kg" />
            <KpiCard color="emerald" label="Altura" unit="cm" :value="detailMember.height_cm" />
            <KpiCard color="emerald" label="IMC" :value="detailMember.bmi ?? '—'" unit="kg/m²" />
          </div>

          <!--
          Métricas secundarias — tipografía más pequeña, sin acento de color.
          El contraste de jerarquía guía el ojo: primero los 3 KPIs, luego el detalle.
        -->
          <div
            v-if="detailMember.body_fat_percentage || detailMember.muscle_mass_kg || detailMember.chest_cm || detailMember.waist_cm || detailMember.hip_cm || detailMember.arm_cm || detailMember.leg_cm"
            class="grid grid-cols-4 gap-1.5">
            <MiniStat v-if="detailMember.body_fat_percentage" label="Grasa" :value="detailMember.body_fat_percentage"
              unit="%" />
            <MiniStat v-if="detailMember.muscle_mass_kg" label="Músculo" :value="detailMember.muscle_mass_kg"
              unit="kg" />
            <MiniStat v-if="detailMember.chest_cm" label="Pecho" :value="detailMember.chest_cm" unit="cm" />
            <MiniStat v-if="detailMember.waist_cm" label="Cintura" :value="detailMember.waist_cm" unit="cm" />
            <MiniStat v-if="detailMember.hip_cm" label="Cadera" :value="detailMember.hip_cm" unit="cm" />
            <MiniStat v-if="detailMember.arm_cm" label="Brazo" :value="detailMember.arm_cm" unit="cm" />
            <MiniStat v-if="detailMember.leg_cm" label="Pierna" :value="detailMember.leg_cm" unit="cm" />
          </div>
        </section>

        <!-- ══════════════════════════════
           § 3  SALUD FÍSICA
      ══════════════════════════════ -->
        <template v-if="detailMember.health_conditions?.length">
          <SectionDivider color="rose" />

          <section aria-label="Condiciones de salud">
            <header class="flex items-center gap-2 mb-3">
              <span
                class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-rose-500 to-rose-600 shadow-sm shrink-0">
                <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </span>
              <h4 class="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">Salud Física</h4>
              <div class="flex-1 h-px bg-gradient-to-r from-rose-200/70 to-transparent" />
              <!--
              Contador de condiciones — reduce el trabajo de contar para el usuario
              (principio de minimizar la carga cognitiva de Miller)
            -->
              <span
                class="shrink-0 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5">
                {{detailMember.health_conditions.filter(c => c.is_active).length}}
                activa{{detailMember.health_conditions.filter(c => c.is_active).length !== 1 ? 's' : ''}}
                · {{ detailMember.health_conditions.length }} total
              </span>
            </header>

            <div class="space-y-1.5">
              <div v-for="(condition, idx) in detailMember.health_conditions" :key="idx"
                class="flex items-center gap-3 rounded-xl px-4 py-3 border" :class="condition.is_active
                  ? 'bg-rose-50/50 border-rose-200/70'
                  : 'bg-stone-50/50 border-stone-200/50'">
                <!--
                Semáforo visual — punto + texto diminuto.
                Pre-attentive feature: el color es procesado antes que el texto.
              -->
                <div class="shrink-0 flex flex-col items-center gap-0.5 w-8 text-center">
                  <div class="w-2 h-2 rounded-full" :class="condition.is_active ? 'bg-rose-500' : 'bg-stone-300'" />
                  <span class="text-[8px] font-bold uppercase tracking-wide leading-none"
                    :class="condition.is_active ? 'text-rose-400' : 'text-stone-300'">
                    {{ condition.is_active ? 'activa' : 'pasada' }}
                  </span>
                </div>

                <!-- Nombre y notas — jerarquía clara dentro del ítem -->
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-stone-800 text-sm leading-tight truncate">{{ condition.condition_name }}</p>
                  <p v-if="condition.notes" class="text-[11px] text-stone-400 mt-0.5 leading-relaxed line-clamp-1">
                    {{ condition.notes }}
                  </p>
                </div>

                <!-- Badge de severidad a la derecha — posición constante facilita el escaneo vertical -->
                <span
                  :class="['shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-lg border', getSeverityBadgeClass(condition.severity)]">
                  {{ condition.severity }}
                </span>
              </div>
            </div>
          </section>
        </template>

        <!-- ══════════════════════════════
           § 4  SALUD MENTAL
      ══════════════════════════════ -->
        <template v-if="detailMember.mental_health">
          <SectionDivider color="violet" />

          <section aria-label="Salud mental">
            <header class="flex items-center gap-2 mb-3">
              <span
                class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm shrink-0">
                <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>
              <h4 class="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">Salud Mental</h4>
              <div class="flex-1 h-px bg-gradient-to-r from-violet-200/70 to-transparent" />
            </header>

            <div class="grid grid-cols-3 gap-2 mb-2">
              <!--
              Estrés con barra de progreso — convierte un número abstracto en señal
              visual inmediata (codificación dual: número + color + longitud de barra).
            -->
              <div
                class="relative overflow-hidden rounded-2xl border border-violet-200/80 bg-violet-50/50 px-4 py-4 text-center">
                <div
                  class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
                <span class="text-[9px] font-black text-stone-400 uppercase tracking-[0.15em]">Estrés</span>
                <div class="flex items-baseline justify-center gap-0.5 mt-1">
                  <p class="font-serif font-bold text-violet-700 text-2xl leading-none">
                    {{ detailMember.mental_health.stress_level }}</p>
                  <span class="text-xs text-violet-300 font-normal">/10</span>
                </div>
                <!-- Barra semáforo: verde bajo, ámbar medio, rojo alto -->
                <div class="mt-2.5 h-1.5 rounded-full bg-violet-100 overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700" :class="detailMember.mental_health.stress_level <= 3
                    ? 'bg-emerald-400'
                    : detailMember.mental_health.stress_level <= 6
                      ? 'bg-amber-400'
                      : 'bg-rose-500'"
                    :style="{ width: (detailMember.mental_health.stress_level / 10 * 100) + '%' }" />
                </div>
              </div>

              <div
                class="relative overflow-hidden rounded-2xl border border-violet-200/80 bg-violet-50/50 px-4 py-4 text-center">
                <div
                  class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
                <span class="text-[9px] font-black text-stone-400 uppercase tracking-[0.15em]">Ánimo</span>
                <p class="font-serif font-bold text-violet-700 text-base mt-1.5 leading-tight">
                  {{ getMoodLabel(detailMember.mental_health.mood) }}
                </p>
              </div>

              <div
                class="relative overflow-hidden rounded-2xl border border-violet-200/80 bg-violet-50/50 px-4 py-4 text-center">
                <div
                  class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
                <span class="text-[9px] font-black text-stone-400 uppercase tracking-[0.15em]">Sueño</span>
                <div class="flex items-baseline justify-center gap-0.5 mt-1">
                  <p class="font-serif font-bold text-violet-700 text-2xl leading-none">
                    {{ detailMember.mental_health.sleep_hours }}</p>
                  <span class="text-xs text-violet-300 font-normal">h</span>
                </div>
              </div>
            </div>

            <div v-if="detailMember.mental_health.notes"
              class="flex items-start gap-2.5 bg-violet-50/40 border border-violet-200/50 rounded-xl px-4 py-3">
              <svg class="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p class="text-xs text-stone-500 leading-relaxed italic">{{ detailMember.mental_health.notes }}</p>
            </div>
          </section>
        </template>

        <!-- ══════════════════════════════
           § 5  OBJETIVOS
      ══════════════════════════════ -->
        <template v-if="detailMember.goals?.length">
          <SectionDivider color="amber" />

          <section aria-label="Objetivos">
            <header class="flex items-center gap-2 mb-3">
              <span
                class="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shrink-0">
                <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h4 class="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">Objetivos</h4>
              <div class="flex-1 h-px bg-gradient-to-r from-amber-200/70 to-transparent" />

              <!--
              Barra de progreso inline — visualiza la proporción completada
              sin que el usuario cuente los ítems individualmente.
            -->
              <div class="shrink-0 flex items-center gap-2">
                <div class="w-16 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                    :style="{ width: (detailMember.goals.filter(g => g.is_achieved).length / detailMember.goals.length * 100) + '%' }" />
                </div>
                <span
                  class="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 whitespace-nowrap">
                  {{detailMember.goals.filter(g => g.is_achieved).length}}/{{ detailMember.goals.length }}
                </span>
              </div>
            </header>

            <!--
            Lista de objetivos — ícono + texto + badge en línea horizontal.
            Posición constante del badge (derecha) permite escaneo vertical rápido.
          -->
            <div class="space-y-1.5">
              <div v-for="(goal, idx) in detailMember.goals" :key="idx"
                class="flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors duration-150" :class="goal.is_achieved
                  ? 'bg-emerald-50/50 border-emerald-200/70'
                  : 'bg-amber-50/50 border-amber-200/70'">
                <!-- Ícono de estado — señal pre-atentiva de color -->
                <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" :class="goal.is_achieved
                  ? 'bg-emerald-100 border border-emerald-200'
                  : 'bg-amber-100 border border-amber-200'">
                  <svg v-if="goal.is_achieved" class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else class="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <!-- Tipo de objetivo + meta — jerarquía clara en dos líneas -->
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-stone-800 text-sm leading-tight truncate">
                    {{ MemberDomainService.getGoalTypeLabel(goal.goal_type) }}
                  </p>
                  <p class="text-[11px] text-stone-400 mt-0.5">
                    Meta: <span class="font-semibold text-stone-600">{{ goal.target_value }}</span>
                  </p>
                </div>

                <!-- Estado — badge compacto, posición estable -->
                <span class="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border" :class="goal.is_achieved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'">
                  <span class="w-1.5 h-1.5 rounded-full"
                    :class="goal.is_achieved ? 'bg-emerald-500' : 'bg-amber-500'" />
                  {{ goal.is_achieved ? 'Listo' : 'Activo' }}
                </span>
              </div>
            </div>
          </section>
        </template>

      </div>
    </template>

  </BaseModal>

  <!-- ═══ MODAL: Confirmar eliminación ═══ -->
  <BaseModal :is-open="deleteModalOpen" max-with-class="max-w-md" :expandable="false" @close="deleteModalOpen = false">

    <!-- ── Header ── -->
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-rose-500/30 border border-rose-300/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div>
          <h3 class="font-serif text-xl font-bold text-white">Eliminar gladiador</h3>
          <p class="text-xs text-amber-100/70 mt-0.5">
            Esta acción es <span class="font-semibold text-rose-300">permanente e irreversible</span>
          </p>
        </div>
      </div>
    </template>

    <!-- ── Content ── -->
    <template #content>
      <div class="space-y-5">

        <!-- Ícono + pregunta central -->
        <div class="text-center pt-1">
          <div class="relative inline-flex mb-4">
            <div class="absolute inset-0 rounded-2xl bg-rose-400/20 blur-lg scale-125" />
            <div
              class="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200 flex items-center justify-center shadow-md shadow-rose-200/40">
              <svg class="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
          </div>

          <p class="font-serif text-base font-bold text-stone-800 leading-snug">
            ¿Eliminar a
            <span class="text-rose-600">{{ deleteTarget?.name_full }}</span>
            del Coliseo?
          </p>
          <p class="text-xs text-stone-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Estás a punto de borrar permanentemente todos los datos de este gladiador del sistema.
          </p>
        </div>

        <!-- Divider -->
        <div class="h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent" />

        <!-- Consecuencias -->
        <div class="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/60 p-5">
          <div
            class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

          <p class="text-xs font-bold text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2">
            <svg class="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Lo que se perderá para siempre
          </p>

          <ul class="space-y-2.5">
            <li class="flex items-start gap-3">
              <span
                class="mt-0.5 w-5 h-5 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
                <svg class="w-3 h-3 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              <p class="text-sm text-stone-600 leading-relaxed">
                Todo el progreso de
                <strong class="text-stone-800">{{ deleteTarget?.name_full?.split(' ')[0] }}</strong>:
                métricas, objetivos y condiciones de salud.
              </p>
            </li>
            <li class="flex items-start gap-3">
              <span
                class="mt-0.5 w-5 h-5 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
                <svg class="w-3 h-3 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              <p class="text-sm text-stone-600 leading-relaxed">
                El historial de entrenamiento y los planes asignados quedarán huérfanos en el sistema.
              </p>
            </li>
            <li class="flex items-start gap-3">
              <span
                class="mt-0.5 w-5 h-5 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
                <svg class="w-3 h-3 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              <p class="text-sm text-stone-600 leading-relaxed">
                Si está en un programa activo, entrenadores y compañeros perderán toda la trazabilidad de su evolución.
              </p>
            </li>
          </ul>

          <!-- Cita épica -->
          <div class="mt-4 pt-3 border-t border-amber-200/60">
            <p class="text-xs text-amber-700 leading-relaxed italic text-center">
              "Un guerrero que entra al Coliseo deja huella. Eliminarlo borra no solo sus datos,
              sino el registro de su paso por la arena."
            </p>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

        <!-- Botones de acción -->
        <div class="flex flex-col sm:flex-row gap-3">

          <!-- Cancelar -->
          <button @click="deleteModalOpen = false"
            class="flex-1 px-5 py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-semibold text-sm hover:border-amber-200 hover:bg-amber-50 hover:text-stone-700 transition-all duration-200 active:scale-95">
            Cancelar — no eliminar
          </button>

          <!-- Confirmar eliminación -->
          <button @click="confirmDelete"
            class="relative overflow-hidden flex-1 px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/35 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group">
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <svg class="w-4 h-4 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span class="relative">Sí, eliminar gladiador</span>
          </button>

        </div>

      </div>
    </template>

  </BaseModal>

  <!-- ═══ MODAL: IA Local (Ollama) ═══ -->
  <BaseModal :is-open="aiModalOpen" max-with-class="max-w-4xl" :expandable="false" @close="aiModalOpen = false">

    <!-- ── Header ── -->
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-sm">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 class="font-serif text-xl font-bold text-white">Gurney Halleck</h3>
          <p class="text-xs text-amber-100/70 mt-0.5">
            Maestro de armas — consultando sobre
            <span class="font-semibold text-amber-100">{{ aiMember?.name_full }}</span>
          </p>
        </div>
      </div>
    </template>

    <!-- ── Content ── -->
    <template #content>

      <!-- ════════════════════════════════════
         PANEL: Configuración de IA
    ════════════════════════════════════ -->
      <div v-if="showAiConfig" class="space-y-5">

        <!-- Intro -->
        <div class="text-center pt-2 pb-1">
          <div class="relative inline-flex mb-3">
            <div
              class="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-md scale-110" />
            <div
              class="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-600/15 border border-amber-500/30 flex items-center justify-center shadow-sm">
              <svg class="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 class="font-serif text-base font-bold text-stone-800">Configurar modelo de IA local</h3>
          <p class="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
            Conecta Ollama o un modelo compatible para consultarlo sobre este gladiador.
          </p>
        </div>

        <!-- Divider -->
        <div class="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />

        <!-- Proveedor -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold text-stone-400 uppercase tracking-widest">Proveedor</label>
          <div class="grid grid-cols-2 gap-2">
            <button @click="aiConfig.provider = 'ollama'; aiConfig.baseUrl = 'http://localhost:11434'" :class="[
              'flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 active:scale-95',
              aiConfig.provider === 'ollama'
                ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-sm shadow-amber-200/60'
                : 'bg-stone-50 border-stone-200 text-stone-500 hover:border-amber-200 hover:bg-amber-50/40',
            ]">
              <span class="text-xl">🦙</span>
              <span>Ollama</span>
              <span class="text-[10px] font-normal text-stone-400">llama3, mistral…</span>
            </button>
            <button @click="aiConfig.provider = 'openai-compat'; aiConfig.baseUrl = 'http://localhost:1234'" :class="[
              'flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 active:scale-95',
              aiConfig.provider === 'openai-compat'
                ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-sm shadow-amber-200/60'
                : 'bg-stone-50 border-stone-200 text-stone-500 hover:border-amber-200 hover:bg-amber-50/40',
            ]">
              <span class="text-xl">⚡</span>
              <span>OpenAI-compatible</span>
              <span class="text-[10px] font-normal text-stone-400">LM Studio, Jan…</span>
            </button>
          </div>
        </div>

        <!-- URL base -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-stone-400 uppercase tracking-widest">URL base</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <input v-model="aiConfig.baseUrl" type="text" placeholder="http://localhost:11434"
              class="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-amber-200/60 rounded-xl bg-amber-50/40 text-stone-700 placeholder-stone-400 font-mono focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200" />
          </div>
        </div>

        <!-- Modelo -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-stone-400 uppercase tracking-widest">Nombre del modelo</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input v-model="aiConfig.model" type="text"
              :placeholder="aiConfig.provider === 'ollama' ? 'llama3, mistral, gemma2…' : 'nombre-del-modelo'"
              class="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-amber-200/60 rounded-xl bg-amber-50/40 text-stone-700 placeholder-stone-400 font-mono focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200" />
          </div>
        </div>

        <!-- API Key -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-stone-400 uppercase tracking-widest">
            API Key
            <span class="normal-case text-stone-300 font-normal ml-1">(opcional)</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <input v-model="aiConfig.apiKey" type="password" placeholder="sk-… o vacío para modelos locales"
              class="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-amber-200/60 rounded-xl bg-amber-50/40 text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200" />
          </div>
        </div>

        <!-- Error de conexión -->
        <div v-if="configTestError"
          class="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
          <svg class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p class="text-xs text-rose-600 leading-relaxed">{{ configTestError }}</p>
        </div>

        <!-- Divider -->
        <div class="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />

        <!-- Botón conectar -->
        <button @click="testAiConnection"
          :disabled="!aiConfig.model.trim() || !aiConfig.baseUrl.trim() || isTestingConfig"
          class="relative overflow-hidden w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl active:scale-[0.98] group">
          <div
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <svg v-if="isTestingConfig" class="w-4 h-4 animate-spin relative" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <svg v-else class="w-4 h-4 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="relative">{{ isTestingConfig ? 'Probando conexión…' : 'Conectar y comenzar' }}</span>
        </button>

        <p class="text-center text-[11px] text-stone-400">La configuración se guarda localmente en tu navegador.</p>
      </div>

      <!-- ════════════════════════════════════
         PANEL: Chat con IA
    ════════════════════════════════════ -->
      <div v-else class="flex flex-col h-[420px]">

        <!-- Mensajes -->
        <div class="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">

          <!-- Empty state -->
          <div v-if="aiChatMessages.length === 0"
            class="h-full flex flex-col items-center justify-center text-center px-6">
            <div class="relative inline-flex mb-4">
              <div
                class="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-md scale-125" />
              <div
                class="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-600/15 border border-amber-300/40 flex items-center justify-center shadow-sm">
                <svg class="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p class="font-serif text-sm font-semibold text-stone-700">Gurney Halleck te observa, soldado</p>
            <p class="text-xs text-stone-400 mt-1.5">Estrategia, disciplina, entrenamiento, táctica…</p>
          </div>

          <!-- Burbujas -->
          <div v-for="(msg, idx) in aiChatMessages" :key="idx"
            :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <!-- Avatar asistente -->
            <div v-if="msg.role === 'assistant'"
              class="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 mt-1 mr-2 shadow-sm">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <div :class="[
              'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
              msg.role === 'user'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-300/30'
                : 'bg-amber-50/80 border border-amber-200/60 text-stone-700',
            ]">
              <div v-if="msg.role === 'assistant'" class="leading-relaxed prose prose-sm max-w-none prose-stone"
                v-html="renderMarkdown(msg.content)" />
              <p v-else class="leading-relaxed whitespace-pre-wrap text-sm">{{ msg.content }}</p>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="aiLoading" class="flex justify-start">
            <div
              class="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 mt-1 mr-2 shadow-sm">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="bg-amber-50/80 border border-amber-200/60 rounded-2xl px-4 py-3 shadow-sm">
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 0ms" />
                <span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 150ms" />
                <span class="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style="animation-delay: 300ms" />
              </div>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent mb-3" />

        <!-- Input de chat -->
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <input v-model="aiChatInput" @keyup.enter="sendAiMessage" type="text"
              placeholder="Pregunta sobre este gladiador…"
              class="w-full border-2 border-amber-200/60 rounded-xl px-4 py-2.5 text-sm text-stone-700 placeholder-stone-400 bg-amber-50/40 focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200" />
          </div>
          <button @click="sendAiMessage" :disabled="!aiChatInput.trim() || aiLoading"
            class="relative overflow-hidden p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-90 hover:shadow-lg hover:shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 group">
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            <svg class="w-4 h-4 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>

        <!-- Footer del chat -->
        <div class="mt-2.5 flex justify-between items-center">
          <button @click="showAiConfig = true; loadAiConfig()"
            class="text-[11px] text-stone-400 hover:text-amber-600 transition-colors duration-200 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Cambiar configuración de IA
          </button>
          <span v-if="aiConfig.model"
            class="text-[11px] text-stone-400 font-mono bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-lg">
            {{ aiConfig.model }}
          </span>
        </div>
      </div>

    </template>
  </BaseModal>
</template>