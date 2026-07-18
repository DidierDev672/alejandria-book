package main

import (
	"backup-service/application/services"
	"backup-service/infrastructure/database"
	"backup-service/infrastructure/filesystem"
	httpServer "backup-service/infrastructure/http"
	"backup-service/infrastructure/http/handlers"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	backupDir := getEnv("BACKUP_DIR", "./backups")
	port := getEnv("PORT", "8081")

	fmt.Println("🔧 Initializing backup service...")

	storageService := services.NewStorageService(backupDir)
	if err := storageService.Init(); err != nil {
		log.Fatalf("Failed to initialize storage: %v", err)
	}
	fmt.Printf("📁 Backup directory: %s\n", storageService.GetBackupDir())

	repo, err := database.NewPostgresBackupRepository()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	fmt.Println("✅ Database connected")

	executor := filesystem.NewPgDumpExecutor()

	backupService := services.NewBackupService(repo, executor, storageService)

	topicResearchRepo := database.NewPostgresTopicResearchRepository(database.GetDB())
	if err := topicResearchRepo.Migrate(); err != nil {
		log.Fatalf("Failed to migrate topic_research table: %v", err)
	}
	topicResearchService := services.NewTopicResearchService(topicResearchRepo)

	backupHandler := handlers.NewBackupHandler(backupService)
	statusHandler := handlers.NewStatusHandler(backupService)
	topicResearchHandler := handlers.NewTopicResearchHandler(topicResearchService)

	router := httpServer.NewRouter(backupHandler, statusHandler, topicResearchHandler)

	fmt.Printf("🚀 Server starting on port %s\n", port)
	fmt.Printf("📡 API available at http://localhost:%s/api\n", port)

	if err := httpServer.StartServer(router, port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
