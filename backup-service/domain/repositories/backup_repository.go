package repositories

import "backup-service/domain/entities"

type BackupRepository interface {
	Create(backup *entities.Backup) error
	GetByID(id string) (*entities.Backup, error)
	GetAll() ([]*entities.Backup, error)
	Update(backup *entities.Backup) error
	Delete(id string) error
	GetServerStatus() (*entities.ServerStatus, error)
}

type BackupExecutor interface {
	Execute(backupPath string) error
}
