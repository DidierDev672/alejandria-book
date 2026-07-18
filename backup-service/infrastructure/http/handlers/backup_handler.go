package handlers

import (
	"backup-service/application/services"
	"backup-service/domain/entities"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

type BackupHandler struct {
	service *services.BackupService
}

func NewBackupHandler(service *services.BackupService) *BackupHandler {
	return &BackupHandler{service: service}
}

func (h *BackupHandler) CreateBackup(w http.ResponseWriter, r *http.Request) {
	var req entities.CreateBackupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body", err.Error())
		return
	}

	backup, err := h.service.CreateBackup(req.Name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create backup", err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, backup)
}

func (h *BackupHandler) ListBackups(w http.ResponseWriter, r *http.Request) {
	backups, err := h.service.ListBackups()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list backups", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, backups)
}

func (h *BackupHandler) GetBackup(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if id == "" {
		writeError(w, http.StatusBadRequest, "missing backup id", "")
		return
	}

	backup, err := h.service.GetBackup(id)
	if err != nil {
		writeError(w, http.StatusNotFound, "backup not found", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, backup)
}

func (h *BackupHandler) DeleteBackup(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "missing backup id", "")
		return
	}

	if err := h.service.DeleteBackup(id); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete backup", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "backup deleted"})
}

func (h *BackupHandler) DownloadBackup(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "missing backup id", "")
		return
	}

	filePath, fileName, err := h.service.GetBackupFilePath(id)
	if err != nil {
		writeError(w, http.StatusNotFound, "backup not found", err.Error())
		return
	}

	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))
	http.ServeFile(w, r, filePath)
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string, details string) {
	writeJSON(w, status, entities.ErrorResponse{
		Error:   message,
		Details: details,
	})
}
