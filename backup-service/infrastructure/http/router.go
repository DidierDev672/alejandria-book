package http

import (
	"backup-service/infrastructure/http/handlers"
	"backup-service/infrastructure/http/middleware"
	"net/http"

	"github.com/gorilla/mux"
)

func NewRouter(
	backupHandler *handlers.BackupHandler,
	statusHandler *handlers.StatusHandler,
	topicResearchHandler *handlers.TopicResearchHandler,
) *mux.Router {
	r := mux.NewRouter()

	r.Use(middleware.CorsMiddleware)

	r.HandleFunc("/api/status", statusHandler.GetServerStatus).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/backups", backupHandler.ListBackups).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/backups/{id}", backupHandler.GetBackup).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/backups", backupHandler.CreateBackup).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/backups", backupHandler.DeleteBackup).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/api/backups/download", backupHandler.DownloadBackup).Methods("GET", "OPTIONS")

	// Topic Research CRUD - usa net/http estandar con mux.HandleFunc
	topicResearchHandler.HandleRouting(r)

	return r
}

func StartServer(router *mux.Router, port string) error {
	return http.ListenAndServe(":"+port, router)
}
