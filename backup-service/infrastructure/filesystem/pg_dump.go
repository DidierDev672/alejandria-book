package filesystem

import (
	"fmt"
	"os"
	"os/exec"
)

type PgDumpExecutor struct {
	host     string
	port     string
	user     string
	password string
	dbName   string
}

func NewPgDumpExecutor() *PgDumpExecutor {
	return &PgDumpExecutor{
		host:     getEnv("DB_HOST", "localhost"),
		port:     getEnv("DB_PORT", "5432"),
		user:     getEnv("DB_USER", "postgres"),
		password: getEnv("DB_PASSWORD", ""),
		dbName:   getEnv("DB_NAME", "postgres"),
	}
}

func (e *PgDumpExecutor) Execute(backupPath string) error {
	cmd := exec.Command("C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump",
		"-h", e.host,
		"-p", e.port,
		"-U", e.user,
		"-d", e.dbName,
		"-F", "p",
		"-f", backupPath,
	)

	cmd.Env = append(os.Environ(), fmt.Sprintf("PGPASSWORD=%s", e.password))

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("pg_dump failed: %s - %w", string(output), err)
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
