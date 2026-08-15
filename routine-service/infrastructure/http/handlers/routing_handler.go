// ============================================================
// INFRASTRUCTURE - HTTP Handlers (Controladores)
// ============================================================
// Maneja las peticiones HTTP y coordina las respuestas.
// Esta capa traduce HTTP ↔ Domain, pero NO contiene
// lógica de negocio.
//
// Principio SOLID:
// - Single Responsibility: Cada handler maneja una operación HTTP.
// - Dependency Inversion: Recibe el servicio por inyección.
// ============================================================

package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gorilla/mux"

	"routine-service/application/services"
	"routine-service/domain/entities"
)

// RoutineHandler maneja las peticiones HTTP para rutinas.
type RoutineHandler struct {
	service *services.RoutineApplicationService
}

// NewRoutineHandler crea una nueva instancia del handler.
func NewRoutineHandler(service *services.RoutineApplicationService) *RoutineHandler {
	return &RoutineHandler{service: service}
}

// RegisterRoutes registra todas las rutas de rutinas en el router.
func (h *RoutineHandler) RegisterRoutes(router *mux.Router) {
	// Prefijo /api/routines para todas las rutas
	api := router.PathPrefix("/api/routines").Subrouter()

	// Rutas CRUD
	api.HandleFunc("", h.GetAll).Methods("GET", "OPTIONS")
	api.HandleFunc("", h.Create).Methods("POST", "OPTIONS")
	api.HandleFunc("/search", h.Search).Methods("GET", "OPTIONS")
	api.HandleFunc("/{id}", h.GetByID).Methods("GET", "OPTIONS")
	api.HandleFunc("/{id}", h.Update).Methods("PUT", "OPTIONS")
	api.HandleFunc("/{id}", h.Delete).Methods("DELETE", "OPTIONS")
}

// GetAll maneja GET /api/routines
// Retorna todas las rutinas del sistema.
func (h *RoutineHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	routines, err := h.service.GetAllRoutines(ctx)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Error al obtener rutinas", err.Error())
		return
	}

	respondJSON(w, http.StatusOK, entities.RoutineResponse{
		Data: routines,
	})
}

// GetByID maneja GET /api/routines/{id}
// Retorna una rutina específica por su ID.
func (h *RoutineHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Extraer ID de la URL
	vars := mux.Vars(r)
	id := strings.TrimSpace(vars["id"])

	if id == "" {
		respondError(w, http.StatusBadRequest, "El ID es obligatorio", "")
		return
	}

	routine, err := h.service.GetRoutineByID(ctx, id)
	if err != nil {
		if strings.Contains(err.Error(), "no encontrada") {
			respondError(w, http.StatusNotFound, "Rutina no encontrada", err.Error())
			return
		}
		respondError(w, http.StatusInternalServerError, "Error al obtener rutina", err.Error())
		return
	}

	respondJSON(w, http.StatusOK, entities.RoutineResponse{
		Data: routine,
	})
}

// Create maneja POST /api/routines
// Crea una nueva rutina en el sistema.
func (h *RoutineHandler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Decodificar body
	var req entities.CreateRoutineRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "JSON inválido", err.Error())
		return
	}

	// Llamar al servicio
	routine, err := h.service.CreateRoutine(ctx, req)
	if err != nil {
		// Determinar código de error apropiado
		statusCode := http.StatusInternalServerError
		message := "Error al crear rutina"

		if strings.Contains(err.Error(), "validación fallida") {
			statusCode = http.StatusUnprocessableEntity
			message = "Datos inválidos"
		} else if strings.Contains(err.Error(), "ya existe") {
			statusCode = http.StatusConflict
			message = "Conflicto de datos"
		}

		respondError(w, statusCode, message, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, entities.RoutineResponse{
		Data:    routine,
		Message: "Rutina creada exitosamente",
	})
}

// Update maneja PUT /api/routines/{id}
// Actualiza una rutina existente (actualización parcial).
func (h *RoutineHandler) Update(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Extraer ID de la URL
	vars := mux.Vars(r)
	id := strings.TrimSpace(vars["id"])

	if id == "" {
		respondError(w, http.StatusBadRequest, "El ID es obligatorio", "")
		return
	}

	// Decodificar body
	var req entities.UpdateRoutineRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "JSON inválido", err.Error())
		return
	}

	// Llamar al servicio
	routine, err := h.service.UpdateRoutine(ctx, id, req)
	if err != nil {
		// Determinar código de error apropiado
		statusCode := http.StatusInternalServerError
		message := "Error al actualizar rutina"

		if strings.Contains(err.Error(), "no encontrada") {
			statusCode = http.StatusNotFound
			message = "Rutina no encontrada"
		} else if strings.Contains(err.Error(), "validación fallida") {
			statusCode = http.StatusUnprocessableEntity
			message = "Datos inválidos"
		} else if strings.Contains(err.Error(), "ya existe") {
			statusCode = http.StatusConflict
			message = "Conflicto de datos"
		}

		respondError(w, statusCode, message, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, entities.RoutineResponse{
		Data:    routine,
		Message: "Rutina actualizada exitosamente",
	})
}

// Delete maneja DELETE /api/routines/{id}
// Elimina una rutina del sistema.
func (h *RoutineHandler) Delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Extraer ID de la URL
	vars := mux.Vars(r)
	id := strings.TrimSpace(vars["id"])

	if id == "" {
		respondError(w, http.StatusBadRequest, "El ID es obligatorio", "")
		return
	}

	// Llamar al servicio
	if err := h.service.DeleteRoutine(ctx, id); err != nil {
		statusCode := http.StatusInternalServerError
		message := "Error al eliminar rutina"

		if strings.Contains(err.Error(), "no encontrada") {
			statusCode = http.StatusNotFound
			message = "Rutina no encontrada"
		}

		respondError(w, statusCode, message, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, entities.RoutineResponse{
		Message: "Rutina eliminada exitosamente",
	})
}

// Search maneja GET /api/routines/search?q=query
// Busca rutinas por nombre.
func (h *RoutineHandler) Search(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Obtener query parameter
	query := strings.TrimSpace(r.URL.Query().Get("q"))

	routines, err := h.service.SearchRoutines(ctx, query)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Error al buscar rutinas", err.Error())
		return
	}

	respondJSON(w, http.StatusOK, entities.RoutineResponse{
		Data: routines,
	})
}

// ============================================================
// HELPERS - Funciones auxiliares para respuestas HTTP
// ============================================================

// respondJSON envía una respuesta JSON con el código de estado.
func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

// respondError envía una respuesta de error estandarizada.
func respondError(w http.ResponseWriter, status int, message string, details string) {
	respondJSON(w, status, entities.ErrorResponse{
		Error:   message,
		Details: details,
	})
}
