import axios from "axios";
import { SESSION_EXPIRED_EVENT } from "@/infrastructure/http/axiosInstance";

const axiosEquipment = axios.create({
  baseURL: "/equipment",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

axiosEquipment.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(
        `[Equipment API] ${config.method?.toUpperCase()} ${config.url}`,
        config.params || config.data || "",
      );
      console.log(`[Equipment API] Token presente: ${!!token}`);
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
    const errorCode = error.response?.data?.code;

    switch (status) {
      case 401:
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent(SESSION_EXPIRED_EVENT, {
              detail: { message: errorMessage, code: errorCode },
            }),
          );
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login?error=session_expired";
          }
        }
        break;
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
