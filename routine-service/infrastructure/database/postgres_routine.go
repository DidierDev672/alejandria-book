// ============================================================
// INFRASTRUCTURE - PostgreSQL Routine Repository
// ============================================================
// Implementación concreta del repositorio usando PostgreSQL.
// Esta capa conoce los detalles de la base de datos pero
// NO conoce la lógica de negocio.
//
// Principio SOLID:
// - Dependency Inversion: Implementa la interfaz del dominio.
// - Single Responsibility: Solo maneja acceso a datos.
// ============================================================

package database

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"

	"routine-service/domain/entities"
)

// PostgresRoutineRepository implementa RoutineRepository
// usando PostgreSQL como backend de persistencia.
type PostgresRoutineRepository struct {
	db *sql.DB
}

// NewPostgresRoutineRepository crea una nueva instancia del repositorio.
// Establece la conexión a PostgreSQL y ejecuta las migraciones.
func NewPostgresRoutineRepository() (*PostgresRoutineRepository, error) {
	// Construir DSN desde variables de entorno
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "")
	dbname := getEnv("DB_NAME", "postgres")
	sslmode := getEnv("DB_SSLMODE", "disable")

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode,
	)

	// Abrir conexión
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, fmt.Errorf("error al abrir conexión a BD: %w", err)
	}

	// Verificar conexión
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error al conectar a BD: %w", err)
	}

	repo := &PostgresRoutineRepository{db: db}

	// Ejecutar migraciones
	if err := repo.migrate(); err != nil {
		return nil, fmt.Errorf("error al migrar BD: %w", err)
	}

	return repo, nil
}

// migrate crea las tablas necesarias si no existen.
func (r *PostgresRoutineRepository) migrate() error {
	query := `
	CREATE TABLE IF NOT EXISTS routines (
		id VARCHAR(20) PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		section INTEGER,
		repetitions INTEGER,
		time_minutes INTEGER NOT NULL,
		notes TEXT,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
	);

	-- Índice para búsquedas por nombre
	CREATE INDEX IF NOT EXISTS idx_routines_name ON routines (name);

	-- Índice para ordenamiento por fecha
	CREATE INDEX IF NOT EXISTS idx_routines_created_at ON routines (created_at DESC);
	`
	_, err := r.db.Exec(query)
	return err
}

// FindAll retorna todas las rutinas ordenadas por fecha de creación (descendente).
func (r *PostgresRoutineRepository) FindAll(ctx context.Context) ([]entities.Routine, error) {
	query := `
		SELECT id, name, section, repetitions, time_minutes, notes, created_at, updated_at
		FROM routines
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error al consultar rutinas: %w", err)
	}
	defer rows.Close()

	var routines []entities.Routine
	for rows.Next() {
		var routine entities.Routine
		var section, repetitions sql.NullInt64
		var notes sql.NullString

		err := rows.Scan(
			&routine.ID,
			&routine.Name,
			&section,
			&repetitions,
			&routine.TimeMinutes,
			&notes,
			&routine.CreatedAt,
			&routine.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error al escanear rutina: %w", err)
		}

		// Convertir NULLs a punteros
		if section.Valid {
			v := int(section.Int64)
			routine.Section = &v
		}
		if repetitions.Valid {
			v := int(repetitions.Int64)
			routine.Repetitions = &v
		}
		if notes.Valid {
			routine.Notes = notes.String
		}

		routines = append(routines, routine)
	}

	// Retornar slice vacío en lugar de nil
	if routines == nil {
		routines = []entities.Routine{}
	}

	return routines, nil
}

// FindByID busca una rutina por su ID único.
func (r *PostgresRoutineRepository) FindByID(ctx context.Context, id string) (*entities.Routine, error) {
	query := `
		SELECT id, name, section, repetitions, time_minutes, notes, created_at, updated_at
		FROM routines
		WHERE id = $1
	`

	var routine entities.Routine
	var section, repetitions sql.NullInt64
	var notes sql.NullString

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&routine.ID,
		&routine.Name,
		&section,
		&repetitions,
		&routine.TimeMinutes,
		&notes,
		&routine.CreatedAt,
		&routine.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil // No encontrado, no es error
	}
	if err != nil {
		return nil, fmt.Errorf("error al consultar rutina: %w", err)
	}

	// Convertir NULLs a punteros
	if section.Valid {
		v := int(section.Int64)
		routine.Section = &v
	}
	if repetitions.Valid {
		v := int(repetitions.Int64)
		routine.Repetitions = &v
	}
	if notes.Valid {
		routine.Notes = notes.String
	}

	return &routine, nil
}

// Create inserta una nueva rutina en la base de datos.
func (r *PostgresRoutineRepository) Create(ctx context.Context, routine *entities.Routine) error {
	query := `
		INSERT INTO routines (id, name, section, repetitions, time_minutes, notes, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	_, err := r.db.ExecContext(ctx, query,
		routine.ID,
		routine.Name,
		routine.Section,
		routine.Repetitions,
		routine.TimeMinutes,
		routine.Notes,
		routine.CreatedAt,
		routine.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("error al insertar rutina: %w", err)
	}

	return nil
}

// Update actualiza una rutina existente en la base de datos.
func (r *PostgresRoutineRepository) Update(ctx context.Context, routine *entities.Routine) error {
	query := `
		UPDATE routines
		SET name = $2, section = $3, repetitions = $4, time_minutes = $5, notes = $6, updated_at = $7
		WHERE id = $1
	`

	result, err := r.db.ExecContext(ctx, query,
		routine.ID,
		routine.Name,
		routine.Section,
		routine.Repetitions,
		routine.TimeMinutes,
		routine.Notes,
		time.Now(),
	)

	if err != nil {
		return fmt.Errorf("error al actualizar rutina: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error al verificar actualización: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("rutina no encontrada con ID: %s", routine.ID)
	}

	return nil
}

// Delete elimina una rutina por su ID.
func (r *PostgresRoutineRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM routines WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("error al eliminar rutina: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error al verificar eliminación: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("rutina no encontrada con ID: %s", id)
	}

	return nil
}

// ExistsByName verifica si ya existe una rutina con el nombre dado.
func (r *PostgresRoutineRepository) ExistsByName(ctx context.Context, name string, excludeID string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM routines WHERE LOWER(name) = LOWER($1) AND id != $2)`

	var exists bool
	err := r.db.QueryRowContext(ctx, query, name, excludeID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("error al verificar nombre: %w", err)
	}

	return exists, nil
}

// getEnv obtiene una variable de entorno con valor por defecto.
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return strings.TrimSpace(value)
	}
	return defaultValue
}
