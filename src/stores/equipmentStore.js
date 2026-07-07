import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axiosInstance from "@/infrastructure/http/axiosInstance";

/**
 * Store de Pinia para gestionar la lista de equipos del gimnasio
 * Endpoint: GET /equipment
 */
export const useEquipmentStore = defineStore("equipment", () => {
  // ==========================================================
  // STATE
  // ==========================================================

  /** Array con la lista de equipos obtenidos del API */
  const equipmentList = ref([]);

  /** Estado de carga (true mientras se hace la petición) */
  const loading = ref(false);

  /** Mensaje de error en caso de fallo del API */
  const error = ref(null);

  // ==========================================================
  // GETTERS (Computed)
  // ==========================================================

  /** Total de equipos en la lista */
  const totalEquipment = computed(() => equipmentList.value.length);

  /** Verifica si hay equipos disponibles */
  const hasEquipment = computed(() => equipmentList.value.length > 0);

  // ==========================================================
  // ACTIONS
  // ==========================================================

  /**
   * Obtiene la lista de equipos desde el backend
   * GET /equipments
   */
  async function fetchEquipment() {
    // Activar estado de carga y limpiar error previo
    loading.value = true;
    error.value = null;

    try {
      // axiosInstance ya resuelve baseURL, inyecta el token
      // y maneja 401 (limpia sesión y redirige a /login)
      const response = await axiosInstance.get("/equipment");

      // Manejar ambos casos: array o objeto único
      const data = response.data;
      if (Array.isArray(data)) {
        // Si es un array, usarlo directamente
        equipmentList.value = data;
      } else if (data && typeof data === "object") {
        // Si es un objeto único, envolverlo en un array
        equipmentList.value = [data];
      } else {
        // Si no hay datos o formato inesperado, usar array vacío
        equipmentList.value = [];
      }
    } catch (err) {
      // Manejar error y guardar mensaje descriptivo
      error.value =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar los equipos";
      console.error("[equipmentStore] fetchEquipment error:", err);
    } finally {
      // Siempre desactivar el estado de carga
      loading.value = false;
    }
  }

  /**
   * Limpiar el estado de error
   */
  function clearError() {
    error.value = null;
  }

  /**
   * Resetear el store a su estado inicial
   */
  function resetStore() {
    equipmentList.value = [];
    loading.value = false;
    error.value = null;
  }

  // ==========================================================
  // RETURN (API Pública)
  // ==========================================================

  return {
    // State
    equipmentList,
    loading,
    error,

    // Getters
    totalEquipment,
    hasEquipment,

    // Actions
    fetchEquipment,
    clearError,
    resetStore,
  };
});
