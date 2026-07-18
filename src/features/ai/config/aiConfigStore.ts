import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AiConfig } from '@/stores/chatStore';

const AI_CONFIG_KEY = 'alajandria-ai-config';

export const useAiConfigStore = defineStore('aiConfig', () => {
  const config = ref<AiConfig | null>(null);
  const isConfigOpen = ref(false);

  const isConfigured = computed(() => !!config.value?.model && !!config.value?.baseUrl);

  function load(): boolean {
    try {
      const stored = localStorage.getItem(AI_CONFIG_KEY);
      if (stored) {
        config.value = JSON.parse(stored);
        return true;
      }
    } catch {
      /* ignore parse errors */
    }
    return false;
  }

  function save(cfg: AiConfig) {
    config.value = cfg;
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(cfg));
  }

  function openConfig() {
    isConfigOpen.value = true;
  }

  function closeConfig() {
    isConfigOpen.value = false;
  }

  function reset() {
    config.value = null;
    localStorage.removeItem(AI_CONFIG_KEY);
  }

  async function testConnection(cfg: AiConfig): Promise<{ ok: boolean; error?: string }> {
    try {
      if (cfg.provider === 'ollama') {
        const res = await fetch(`${cfg.baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: cfg.model,
            messages: [{ role: 'user', content: 'ping' }],
            stream: false,
          }),
        });
        if (!res.ok) {
          const body = await res.text();
          return { ok: false, error: `Error ${res.status}: ${body}` };
        }
        return { ok: true };
      } else {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (cfg.apiKey) headers['Authorization'] = `Bearer ${cfg.apiKey}`;
        const res = await fetch(`${cfg.baseUrl}/v1/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: cfg.model,
            messages: [{ role: 'user', content: 'ping' }],
          }),
        });
        if (!res.ok) {
          const body = await res.text();
          return { ok: false, error: `Error ${res.status}: ${body}` };
        }
        return { ok: true };
      }
    } catch (e: any) {
      return { ok: false, error: e?.message ?? 'No se pudo conectar' };
    }
  }

  async function sendMessage(messages: { role: string; content: string }[]): Promise<string> {
    if (!config.value) throw new Error('Modelo de IA no configurado');

    const cfg = config.value;

    if (cfg.provider === 'ollama') {
      const res = await fetch(`${cfg.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: cfg.model, messages, stream: false }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Ollama error ${res.status}: ${body}`);
      }
      const data = await res.json();
      return data.message?.content ?? data.response ?? '';
    } else {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (cfg.apiKey) headers['Authorization'] = `Bearer ${cfg.apiKey}`;
      const res = await fetch(`${cfg.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ model: cfg.model, messages }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`API error ${res.status}: ${body}`);
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? '';
    }
  }

  // Auto-load on init
  load();

  return {
    config,
    isConfigOpen,
    isConfigured,
    load,
    save,
    openConfig,
    closeConfig,
    reset,
    testConnection,
    sendMessage,
  };
});
