package database

import (
	"backup-service/domain/entities"
	"database/sql"
	"fmt"
)

// PostgresTopicResearchRepository implementa TopicResearchRepository
// usando PostgreSQL como almacenamiento persistente.
type PostgresTopicResearchRepository struct {
	db *sql.DB
}

// NewPostgresTopicResearchRepository crea una nueva instancia del repositorio.
func NewPostgresTopicResearchRepository(db *sql.DB) *PostgresTopicResearchRepository {
	return &PostgresTopicResearchRepository{db: db}
}

// Migrate crea la tabla topic_research si no existe.
func (r *PostgresTopicResearchRepository) Migrate() error {
	query := `
	CREATE TABLE IF NOT EXISTS topic_research (
		id VARCHAR(36) PRIMARY KEY,
		id_topic VARCHAR(36) NOT NULL,
		name_research VARCHAR(500) NOT NULL,
		description_research TEXT DEFAULT '',
		answer_ai TEXT DEFAULT '',
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
	)`
	_, err := r.db.Exec(query)
	return err
}

// Create inserta un nuevo registro de investigacion en la base de datos.
func (r *PostgresTopicResearchRepository) Create(research *entities.TopicResearch) error {
	query := `
	INSERT INTO topic_research (id, id_topic, name_research, description_research, answer_ai, created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.Exec(query,
		research.ID, research.IDTopic, research.NameResearch,
		research.DescriptionResearch, research.AnswerAI,
		research.CreatedAt, research.UpdatedAt,
	)
	return err
}

// GetByID busca una investigacion por su ID unico.
func (r *PostgresTopicResearchRepository) GetByID(id string) (*entities.TopicResearch, error) {
	query := `
	SELECT id, id_topic, name_research, description_research, answer_ai, created_at, updated_at
	FROM topic_research WHERE id = $1`

	research := &entities.TopicResearch{}
	err := r.db.QueryRow(query, id).Scan(
		&research.ID, &research.IDTopic, &research.NameResearch,
		&research.DescriptionResearch, &research.AnswerAI,
		&research.CreatedAt, &research.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return research, nil
}

// GetByIDTopic retorna todas las investigaciones asociadas a un tema.
func (r *PostgresTopicResearchRepository) GetByIDTopic(idTopic string) ([]*entities.TopicResearch, error) {
	query := `
	SELECT id, id_topic, name_research, description_research, answer_ai, created_at, updated_at
	FROM topic_research WHERE id_topic = $1 ORDER BY created_at DESC`

	rows, err := r.db.Query(query, idTopic)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var researches []*entities.TopicResearch
	for rows.Next() {
		research := &entities.TopicResearch{}
		if err := rows.Scan(
			&research.ID, &research.IDTopic, &research.NameResearch,
			&research.DescriptionResearch, &research.AnswerAI,
			&research.CreatedAt, &research.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan research: %w", err)
		}
		researches = append(researches, research)
	}
	return researches, nil
}

// GetAll retorna todas las investigaciones ordenadas por fecha de creacion.
func (r *PostgresTopicResearchRepository) GetAll() ([]*entities.TopicResearch, error) {
	query := `
	SELECT id, id_topic, name_research, description_research, answer_ai, created_at, updated_at
	FROM topic_research ORDER BY created_at DESC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var researches []*entities.TopicResearch
	for rows.Next() {
		research := &entities.TopicResearch{}
		if err := rows.Scan(
			&research.ID, &research.IDTopic, &research.NameResearch,
			&research.DescriptionResearch, &research.AnswerAI,
			&research.CreatedAt, &research.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan research: %w", err)
		}
		researches = append(researches, research)
	}
	return researches, nil
}

// Update modifica un registro existente en la base de datos.
func (r *PostgresTopicResearchRepository) Update(research *entities.TopicResearch) error {
	query := `
	UPDATE topic_research
	SET name_research = $1, description_research = $2, answer_ai = $3, updated_at = $4
	WHERE id = $5`
	_, err := r.db.Exec(query,
		research.NameResearch, research.DescriptionResearch,
		research.AnswerAI, research.UpdatedAt, research.ID,
	)
	return err
}

// Delete elimina una investigacion por su ID.
func (r *PostgresTopicResearchRepository) Delete(id string) error {
	query := `DELETE FROM topic_research WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
