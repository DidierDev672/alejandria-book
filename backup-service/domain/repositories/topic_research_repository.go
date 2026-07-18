package repositories

import "backup-service/domain/entities"

// TopicResearchRepository define las operaciones de acceso a datos
// para investigaciones. Sigue el principio de inversion de dependencias (DIP).
type TopicResearchRepository interface {
	Create(research *entities.TopicResearch) error
	GetByID(id string) (*entities.TopicResearch, error)
	GetByIDTopic(idTopic string) ([]*entities.TopicResearch, error)
	GetAll() ([]*entities.TopicResearch, error)
	Update(research *entities.TopicResearch) error
	Delete(id string) error
}
