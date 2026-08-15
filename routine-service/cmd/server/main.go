// ============================================================
// MAIN - Routine Service Entry Point
// ============================================================
// Punto de entrada del microservicio de rutinas.
// Configura la conexión a la base de datos, inyecta
// dependencias y arranca el servidor HTTP.
//
// Arquitectura:
// - main.go orquesta la composición de dependencias
// - Cada capa solo conoce la capa inmediata inferior
// - El dominio es independiente de todo
// ============================================================

package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	routineServices "routine-service/application/services"
	"routine-service/infrastructure/database"
	"routine-service/infrastructure/http/handlers"
	"routine-service/infrastructure/http/middleware"
)

func main() {
	// ============================================================
	// 1. CONFIGURACIÓN
	// ============================================================

	// Cargar variables de entorno desde .env
	if err := godotenv.Load(); err != nil {
		log.Printf("⚠️  No se encontró archivo .env, usando variables de entorno del sistema")
	}

	port := getEnv("PORT", "8081")
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "postgres")
	_ = getEnv("DB_PASSWORD", "")
	dbName := getEnv("DB_NAME", "postgres")

	log.Printf("🚀 Iniciando Routine Service...")
	log.Printf("   Puerto: %s", port)
	log.Printf("   Base de datos: %s@%s:%s/%s", dbUser, dbHost, dbPort, dbName)

	// ============================================================
	// 2. INYECCIÓN DE DEPENDENCIAS (Composition Root)
	// ============================================================

	// Infrastructure: Crear repositorio PostgreSQL
	repo, err := database.NewPostgresRoutineRepository()
	if err != nil {
		log.Fatalf("❌ Error al conectar a la base de datos: %v", err)
	}
	log.Printf("✅ Conexión a PostgreSQL establecida")

	// Application: Crear servicio con repositorio inyectado
	service := routineServices.NewRoutineApplicationService(repo)

	// Infrastructure: Crear handler con servicio inyectado
	handler := handlers.NewRoutineHandler(service)

	// ============================================================
	// 3. CONFIGURACIÓN DEL ROUTER
	// ============================================================

	router := mux.NewRouter()

	// Aplicar middleware global
	router.Use(middleware.CORS)
	router.Use(middleware.Logger)

	// Health check
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","service":"routine-service"}`))
	}).Methods("GET")

	// Registrar rutas de rutinas
	handler.RegisterRoutes(router)

	// ============================================================
	// 4. ARRANCAR SERVIDOR
	// ============================================================

	addr := ":" + port
	log.Printf("🌐 Servidor escuchando en http://localhost%s", addr)
	log.Printf("📋 Rutas disponibles:")
	log.Printf("   GET    /api/routines          - Listar todas")
	log.Printf("   GET    /api/routines/{id}      - Obtener por ID")
	log.Printf("   POST   /api/routines           - Crear nueva")
	log.Printf("   PUT    /api/routines/{id}      - Actualizar")
	log.Printf("   DELETE /api/routines/{id}      - Eliminar")
	log.Printf("   GET    /api/routines/search?q= - Buscar")
	log.Printf("   GET    /api/routines/search?q= - Buscar")
	log.Printf("   GET    /health                 - Health check")

	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatalf("❌ Error al arrancar servidor: %v", err)
	}
}

// getEnv obtiene una variable de entorno con valor por defecto.
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return strings.TrimSpace(value)
	}
	return defaultValue
}

// PrintBanner muestra un banner de inicio en la consola.
func PrintBanner() {
	banner := `
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║          🏋️  ROUTINE SERVICE - API REST  🏋️              ║
║                                                          ║
║   Gestión de rutinas de entrenamiento para el Coliseo    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`
	fmt.Println(banner)
}
