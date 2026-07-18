package services

import (
	"backup-service/domain/entities"
	"backup-service/domain/repositories"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// TopicResearchService encapsula la logica de negocio para investigaciones.
// Depende de la interfaz TopicResearchRepository (DIP).
type TopicResearchService struct {
	repo repositories.TopicResearchRepository
}

// NewTopicResearchService crea una nueva instancia del servicio.
func NewTopicResearchService(repo repositories.TopicResearchRepository) *TopicResearchService {
	return &TopicResearchService{repo: repo}
}

// Create genera una nueva investigacion con validaciones basicas.
func (s *TopicResearchService) Create(
	idTopic, nameResearch, descriptionResearch, answerAI string,
) (*entities.TopicResearch, error) {
	if idTopic == "" {
		return nil, fmt.Errorf("id_topic is required")
	}
	if nameResearch == "" {
		return nil, fmt.Errorf("name_research is required")
	}

	now := time.Now()
	research := &entities.TopicResearch{
		ID:                  uuid.New().String(),
		IDTopic:             idTopic,
		NameResearch:        nameResearch,
		DescriptionResearch: descriptionResearch,
		AnswerAI:            answerAI,
		CreatedAt:           now,
		UpdatedAt:           now,
	}

	if err := s.repo.Create(research); err != nil {
		return nil, fmt.Errorf("failed to create research: %w", err)
	}

	return research, nil
}

// GetByID retorna una investigacion por su ID.
func (s *TopicResearchService) GetByID(id string) (*entities.TopicResearch, error) {
	if id == "" {
		return nil, fmt.Errorf("id is required")
	}
	return s.repo.GetByID(id)
}

// GetByIDTopic retorna todas las investigaciones de un tema.
func (s *TopicResearchService) GetByIDTopic(idTopic string) ([]*entities.TopicResearch, error) {
	if idTopic == "" {
		return nil, fmt.Errorf("id_topic is required")
	}
	return s.repo.GetByIDTopic(idTopic)
}

// GetAll retorna todas las investigaciones.
func (s *TopicResearchService) GetAll() ([]*entities.TopicResearch, error) {
	return s.repo.GetAll()
}

// Update modifica una investigacion existente.
func (s *TopicResearchService) Update(
	id string, req entities.UpdateTopicResearchRequest,
) (*entities.TopicResearch, error) {
	if id == "" {
		return nil, fmt.Errorf("id is required")
	}

	research, err := s.repo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("research not found: %w", err)
	}

	if req.NameResearch != "" {
		research.NameResearch = req.NameResearch
	}
	if req.DescriptionResearch != "" {
		research.DescriptionResearch = req.DescriptionResearch
	}
	if req.AnswerAI != "" {
		research.AnswerAI = req.AnswerAI
	}
	research.UpdatedAt = time.Now()

	if err := s.repo.Update(research); err != nil {
		return nil, fmt.Errorf("failed to update research: %w", err)
	}

	return research, nil
}

// Delete elimina una investigacion por su ID.
func (s *TopicResearchService) Delete(id string) error {
	if id == "" {
		return fmt.Errorf("id is required")
	}

	if _, err := s.repo.GetByID(id); err != nil {
		return fmt.Errorf("research not found: %w", err)
	}

	return s.repo.Delete(id)
}
