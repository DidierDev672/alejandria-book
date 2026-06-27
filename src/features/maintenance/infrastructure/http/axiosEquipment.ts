import axiosInstance from "@/infrastructure/http/axiosInstance";

/**
 * Instancia de Axios configurada para el módulo de Equipment
 * Reutiliza los interceptores del axiosInstance central
 */
const axiosEquipment = axiosInstance.create({
  baseURL: "/equipment",
  timeout: 10000,
});

// Debug interceptor para desarrollo
axiosEquipment.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(
        `[Equipment API] ${config.method?.toUpperCase()} ${config.url}`,
        config.params || config.data || "",
      );
    }
    return config;
  },
  (error) => {
    console.error("[Equipment API] Error en request:", error);
    return Promise.reject(error);
  },
);

axiosEquipment.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(
        `[Equipment API] Response ${response.status}:`,
        response.data,
      );
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.error || error.message;

    switch (status) {
      case 403:
        console.error("[Equipment API] Acceso denegado:", errorMessage);
        break;
      case 404:
        console.error("[Equipment API] Recurso no encontrado:", errorMessage);
        break;
      case 422:
        console.error(
          "[Equipment API] Error de validación:",
          error.response?.data?.errors,
        );
        break;
      case 500:
        console.error("[Equipment API] Error del servidor:", errorMessage);
        break;
    }

    return Promise.reject(error);
  },
);

export default axiosEquipment;
