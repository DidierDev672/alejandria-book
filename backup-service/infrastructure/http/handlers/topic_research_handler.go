package handlers

import (
	"backup-service/application/services"
	"backup-service/domain/entities"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

// TopicResearchHandler maneja las peticiones HTTP para investigaciones.
type TopicResearchHandler struct {
	service *services.TopicResearchService
}

// NewTopicResearchHandler crea una nueva instancia del handler.
func NewTopicResearchHandler(service *services.TopicResearchService) *TopicResearchHandler {
	return &TopicResearchHandler{service: service}
}

// HandleRouting configura las rutas HTTP para investigaciones en un mux.Router.
func (h *TopicResearchHandler) HandleRouting(r *mux.Router) {
	r.HandleFunc("/topic-research", h.router).Methods("GET", "POST", "PUT", "DELETE", "OPTIONS")
	r.HandleFunc("/topic-research/{id}", h.router).Methods("GET", "PUT", "DELETE", "OPTIONS")
}

// router despacha las peticiones segun el metodo HTTP y los parametros de URL.
func (h *TopicResearchHandler) router(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/topic-research")
	path = strings.TrimPrefix(path, "/")

	switch r.Method {
	case http.MethodGet:
		if path != "" {
			h.GetByID(w, r, path)
		} else if idTopic := r.URL.Query().Get("id_topic"); idTopic != "" {
			h.GetByIDTopic(w, r)
		} else {
			h.GetAll(w, r)
		}
	case http.MethodPost:
		h.Create(w, r)
	case http.MethodPut:
		if path != "" {
			h.Update(w, r, path)
		} else {
			writeTopicResearchError(w, http.StatusBadRequest, "id is required in URL path", "")
		}
	case http.MethodDelete:
		if path != "" {
			h.Delete(w, r, path)
		} else {
			writeTopicResearchError(w, http.StatusBadRequest, "id is required in URL path", "")
		}
	default:
		writeTopicResearchError(w, http.StatusMethodNotAllowed, "method not allowed", "")
	}
}

// Create maneja POST /topic-research - crea una nueva investigacion.
func (h *TopicResearchHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req entities.CreateTopicResearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeTopicResearchError(w, http.StatusBadRequest, "invalid request body", err.Error())
		return
	}

	research, err := h.service.Create(req.IDTopic, req.NameResearch, req.DescriptionResearch, req.AnswerAI)
	if err != nil {
		writeTopicResearchError(w, http.StatusBadRequest, "failed to create research", err.Error())
		return
	}

	writeTopicResearchJSON(w, http.StatusCreated, research)
}

// GetByID maneja GET /topic-research/{id} - retorna una investigacion por ID.
func (h *TopicResearchHandler) GetByID(w http.ResponseWriter, r *http.Request, id string) {
	research, err := h.service.GetByID(id)
	if err != nil {
		writeTopicResearchError(w, http.StatusNotFound, "research not found", err.Error())
		return
	}

	writeTopicResearchJSON(w, http.StatusOK, research)
}

// GetByIDTopic maneja GET /topic-research?id_topic={id} - retorna investigaciones de un tema.
func (h *TopicResearchHandler) GetByIDTopic(w http.ResponseWriter, r *http.Request) {
	idTopic := r.URL.Query().Get("id_topic")
	researches, err := h.service.GetByIDTopic(idTopic)
	if err != nil {
		writeTopicResearchError(w, http.StatusInternalServerError, "failed to get researches", err.Error())
		return
	}

	writeTopicResearchJSON(w, http.StatusOK, researches)
}

// GetAll maneja GET /topic-research - retorna todas las investigaciones.
func (h *TopicResearchHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	researches, err := h.service.GetAll()
	if err != nil {
		writeTopicResearchError(w, http.StatusInternalServerError, "failed to get researches", err.Error())
		return
	}

	writeTopicResearchJSON(w, http.StatusOK, researches)
}

// Update maneja PUT /topic-research/{id} - actualiza una investigacion existente.
func (h *TopicResearchHandler) Update(w http.ResponseWriter, r *http.Request, id string) {
	var req entities.UpdateTopicResearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeTopicResearchError(w, http.StatusBadRequest, "invalid request body", err.Error())
		return
	}

	research, err := h.service.Update(id, req)
	if err != nil {
		writeTopicResearchError(w, http.StatusBadRequest, "failed to update research", err.Error())
		return
	}

	writeTopicResearchJSON(w, http.StatusOK, research)
}

// Delete maneja DELETE /topic-research/{id} - elimina una investigacion.
func (h *TopicResearchHandler) Delete(w http.ResponseWriter, r *http.Request, id string) {
	if err := h.service.Delete(id); err != nil {
		writeTopicResearchError(w, http.StatusNotFound, "research not found", err.Error())
		return
	}

	writeTopicResearchJSON(w, http.StatusOK, map[string]string{"message": "research deleted"})
}

// writeTopicResearchJSON escribe una respuesta JSON con el codigo de estado HTTP.
func writeTopicResearchJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// writeTopicResearchError escribe una respuesta de error en formato JSON.
func writeTopicResearchError(w http.ResponseWriter, status int, message string, details string) {
	writeTopicResearchJSON(w, status, entities.TopicResearchErrorResponse{
		Error:   message,
		Details: details,
	})
}
