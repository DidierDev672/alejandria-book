package entities

import "time"

type BackupStatus string

const (
	StatusPending  BackupStatus = "pending"
	StatusRunning  BackupStatus = "running"
	StatusComplete BackupStatus = "completed"
	StatusFailed   BackupStatus = "failed"
)

type Backup struct {
	ID        string       `json:"id"`
	Name      string       `json:"name"`
	FileName  string       `json:"file_name"`
	SizeBytes int64        `json:"size_bytes"`
	Status    BackupStatus `json:"status"`
	Error     string       `json:"error,omitempty"`
	CreatedAt time.Time    `json:"created_at"`
}

type ServerStatus struct {
	DatabaseName  string  `json:"database_name"`
	DatabaseHost  string  `json:"database_host"`
	DatabasePort  string  `json:"database_port"`
	TotalStorage  int64   `json:"total_storage_bytes"`
	UsedStorage   int64   `json:"used_storage_bytes"`
	BackupCount   int     `json:"backup_count"`
	IsConnected   bool    `json:"is_connected"`
}

type CreateBackupRequest struct {
	Name string `json:"name"`
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Details string `json:"details,omitempty"`
}
