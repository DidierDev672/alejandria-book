package handlers

import (
	"backup-service/application/services"
	"net/http"
)

type StatusHandler struct {
	service *services.BackupService
}

func NewStatusHandler(service *services.BackupService) *StatusHandler {
	return &StatusHandler{service: service}
}

func (h *StatusHandler) GetServerStatus(w http.ResponseWriter, r *http.Request) {
	status, err := h.service.GetServerStatus()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get server status", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, status)
}
