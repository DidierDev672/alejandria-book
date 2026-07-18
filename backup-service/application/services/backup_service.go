package services

import (
	"backup-service/domain/entities"
	"backup-service/domain/repositories"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type BackupService struct {
	repo     repositories.BackupRepository
	executor repositories.BackupExecutor
	storage  *StorageService
}

func NewBackupService(
	repo repositories.BackupRepository,
	executor repositories.BackupExecutor,
	storage *StorageService,
) *BackupService {
	return &BackupService{
		repo:     repo,
		executor: executor,
		storage:  storage,
	}
}

func (s *BackupService) CreateBackup(name string) (*entities.Backup, error) {
	if name == "" {
		name = fmt.Sprintf("backup_%s", time.Now().Format("20060102_150405"))
	}

	backup := &entities.Backup{
		ID:        uuid.New().String(),
		Name:      name,
		FileName:  fmt.Sprintf("%s.sql", name),
		SizeBytes: 0,
		Status:    entities.StatusPending,
		CreatedAt: time.Now(),
	}

	if err := s.repo.Create(backup); err != nil {
		return nil, fmt.Errorf("failed to create backup record: %w", err)
	}

	go s.executeBackup(backup)

	return backup, nil
}

func (s *BackupService) executeBackup(backup *entities.Backup) {
	backup.Status = entities.StatusRunning
	s.repo.Update(backup)

	backupPath := s.storage.GetBackupPath(backup.FileName)

	if err := s.executor.Execute(backupPath); err != nil {
		backup.Status = entities.StatusFailed
		backup.Error = err.Error()
		s.repo.Update(backup)
		return
	}

	size, err := s.storage.GetFileSize(backupPath)
	if err != nil {
		backup.Status = entities.StatusFailed
		backup.Error = fmt.Sprintf("backup created but failed to get size: %v", err)
		s.repo.Update(backup)
		return
	}

	backup.SizeBytes = size
	backup.Status = entities.StatusComplete
	s.repo.Update(backup)
}

func (s *BackupService) GetBackup(id string) (*entities.Backup, error) {
	return s.repo.GetByID(id)
}

func (s *BackupService) ListBackups() ([]*entities.Backup, error) {
	return s.repo.GetAll()
}

func (s *BackupService) DeleteBackup(id string) error {
	backup, err := s.repo.GetByID(id)
	if err != nil {
		return fmt.Errorf("backup not found: %w", err)
	}

	filePath := s.storage.GetBackupPath(backup.FileName)
	if err := s.storage.DeleteFile(filePath); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	return s.repo.Delete(id)
}

func (s *BackupService) GetBackupFilePath(id string) (string, string, error) {
	backup, err := s.repo.GetByID(id)
	if err != nil {
		return "", "", fmt.Errorf("backup not found: %w", err)
	}

	filePath := s.storage.GetBackupPath(backup.FileName)
	return filePath, backup.FileName, nil
}

func (s *BackupService) GetServerStatus() (*entities.ServerStatus, error) {
	return s.repo.GetServerStatus()
}
