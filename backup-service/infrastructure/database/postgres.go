package database

import (
	"backup-service/domain/entities"
	"database/sql"
	"fmt"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
)

var globalDB *sql.DB

// GetDB retorna la conexion global a la base de datos.
func GetDB() *sql.DB {
	return globalDB
}

type PostgresBackupRepository struct {
	db           *sql.DB
	databaseName string
	databaseHost string
	databasePort string
}

func NewPostgresBackupRepository() (*PostgresBackupRepository, error) {
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

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	globalDB = db

	repo := &PostgresBackupRepository{
		db:           db,
		databaseName: dbname,
		databaseHost: host,
		databasePort: port,
	}

	if err := repo.migrate(); err != nil {
		return nil, fmt.Errorf("failed to migrate: %w", err)
	}

	return repo, nil
}

func (r *PostgresBackupRepository) migrate() error {
	query := `
	CREATE TABLE IF NOT EXISTS backups (
		id VARCHAR(36) PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		file_name VARCHAR(255) NOT NULL,
		size_bytes BIGINT DEFAULT 0,
		status VARCHAR(20) DEFAULT 'pending',
		error TEXT,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
	)`
	_, err := r.db.Exec(query)
	return err
}

func (r *PostgresBackupRepository) Create(backup *entities.Backup) error {
	query := `
	INSERT INTO backups (id, name, file_name, size_bytes, status, error, created_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.Exec(query,
		backup.ID, backup.Name, backup.FileName,
		backup.SizeBytes, backup.Status, backup.Error, backup.CreatedAt,
	)
	return err
}

func (r *PostgresBackupRepository) GetByID(id string) (*entities.Backup, error) {
	query := `SELECT id, name, file_name, size_bytes, status, error, created_at FROM backups WHERE id = $1`
	backup := &entities.Backup{}
	err := r.db.QueryRow(query, id).Scan(
		&backup.ID, &backup.Name, &backup.FileName,
		&backup.SizeBytes, &backup.Status, &backup.Error, &backup.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return backup, nil
}

func (r *PostgresBackupRepository) GetAll() ([]*entities.Backup, error) {
	query := `SELECT id, name, file_name, size_bytes, status, error, created_at FROM backups ORDER BY created_at DESC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var backups []*entities.Backup
	for rows.Next() {
		backup := &entities.Backup{}
		if err := rows.Scan(
			&backup.ID, &backup.Name, &backup.FileName,
			&backup.SizeBytes, &backup.Status, &backup.Error, &backup.CreatedAt,
		); err != nil {
			return nil, err
		}
		backups = append(backups, backup)
	}
	return backups, nil
}

func (r *PostgresBackupRepository) Update(backup *entities.Backup) error {
	query := `UPDATE backups SET size_bytes = $1, status = $2, error = $3 WHERE id = $4`
	_, err := r.db.Exec(query, backup.SizeBytes, backup.Status, backup.Error, backup.ID)
	return err
}

func (r *PostgresBackupRepository) Delete(id string) error {
	query := `DELETE FROM backups WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *PostgresBackupRepository) GetServerStatus() (*entities.ServerStatus, error) {
	var size sql.NullInt64
	err := r.db.QueryRow(`SELECT pg_database_size($1)`, r.databaseName).Scan(&size)
 isConnected := err == nil

	var backupCount int
	r.db.QueryRow(`SELECT COUNT(*) FROM backups`).Scan(&backupCount)

	var usedStorage int64
	if size.Valid {
		usedStorage = size.Int64
	}

	return &entities.ServerStatus{
		DatabaseName: r.databaseName,
		DatabaseHost: r.databaseHost,
		DatabasePort: r.databasePort,
		TotalStorage: 0,
		UsedStorage:  usedStorage,
		BackupCount:  backupCount,
		IsConnected:  isConnected,
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
