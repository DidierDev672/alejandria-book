package services

import (
	"fmt"
	"os"
	"path/filepath"
)

type StorageService struct {
	backupDir string
}

func NewStorageService(backupDir string) *StorageService {
	return &StorageService{backupDir: backupDir}
}

func (s *StorageService) Init() error {
	if err := os.MkdirAll(s.backupDir, 0755); err != nil {
		return fmt.Errorf("failed to create backup directory: %w", err)
	}
	return nil
}

func (s *StorageService) GetBackupPath(fileName string) string {
	return filepath.Join(s.backupDir, fileName)
}

func (s *StorageService) GetFileSize(path string) (int64, error) {
	info, err := os.Stat(path)
	if err != nil {
		return 0, err
	}
	return info.Size(), nil
}

func (s *StorageService) DeleteFile(path string) error {
	return os.Remove(path)
}

func (s *StorageService) GetTotalStorage() (int64, error) {
	var totalSize int64
	err := filepath.Walk(s.backupDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			totalSize += info.Size()
		}
		return nil
	})
	return totalSize, err
}

func (s *StorageService) GetBackupDir() string {
	return s.backupDir
}
