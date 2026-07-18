import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

// ============================================================
// TYPES
// ============================================================

export interface TopicResearch {
  id: string
  id_topic: string
  name_research: string
  description_research: string
  answer_ai: string
  created_at: string
  updated_at: string
}

export interface CreateTopicResearchPayload {
  id_topic: string
  name_research: string
  description_research: string
  answer_ai: string
}

// ============================================================
// STORE
// ============================================================

export const useTopicResearchStore = defineStore('topicResearch', () => {
  const researches = ref<TopicResearch[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastSaved = ref<TopicResearch | null>(null)

  const API_BASE = import.meta.env.VITE_API_BACKUP || 'http://localhost:8081'

  async function create(payload: CreateTopicResearchPayload): Promise<TopicResearch | null> {
    loading.value = true
    error.value = null

    try {
      const { data } = await axios.post<TopicResearch>(
        `${API_BASE}/topic-research`,
        payload,
        { headers: { 'Content-Type': 'application/json' } },
      )
      lastSaved.value = data
      researches.value.unshift(data)
      return data
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Error al guardar la investigacion'
      error.value = msg
      console.error('[topicResearchStore] Error creating:', msg)
      return null
    } finally {
      loading.value = false
    }
  }

  async function getByTopicId(idTopic: string): Promise<TopicResearch[]> {
    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get<TopicResearch[]>(
        `${API_BASE}/topic-research`,
        { params: { id_topic: idTopic } },
      )
      researches.value = data
      return data
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Error al obtener investigaciones'
      error.value = msg
      console.error('[topicResearchStore] Error fetching by topic:', msg)
      return []
    } finally {
      loading.value = false
    }
  }

  async function getAll(): Promise<TopicResearch[]> {
    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get<TopicResearch[]>(`${API_BASE}/topic-research`)
      researches.value = data
      return data
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Error al obtener investigaciones'
      error.value = msg
      console.error('[topicResearchStore] Error fetching all:', msg)
      return []
    } finally {
      loading.value = false
    }
  }

  async function update(id: string, payload: Partial<CreateTopicResearchPayload>): Promise<TopicResearch | null> {
    loading.value = true
    error.value = null

    try {
      const { data } = await axios.put<TopicResearch>(
        `${API_BASE}/topic-research/${id}`,
        payload,
        { headers: { 'Content-Type': 'application/json' } },
      )
      const idx = researches.value.findIndex((r) => r.id === id)
      if (idx !== -1) researches.value[idx] = data
      lastSaved.value = data
      return data
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Error al actualizar investigacion'
      error.value = msg
      console.error('[topicResearchStore] Error updating:', msg)
      return null
    } finally {
      loading.value = false
    }
  }

  async function remove(id: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await axios.delete(`${API_BASE}/topic-research/${id}`)
      researches.value = researches.value.filter((r) => r.id !== id)
      return true
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Error al eliminar investigacion'
      error.value = msg
      console.error('[topicResearchStore] Error deleting:', msg)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    researches,
    loading,
    error,
    lastSaved,
    create,
    getByTopicId,
    getAll,
    update,
    remove,
  }
})
