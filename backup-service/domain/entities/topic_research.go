package entities

import "time"

// TopicResearch representa una investigacion asignada a un tema de estudio.
// Contiene la informacion del usuario y la respuesta generada por la IA.
type TopicResearch struct {
	ID                 string    `json:"id"`
	IDTopic            string    `json:"id_topic"`
	NameResearch       string    `json:"name_research"`
	DescriptionResearch string  `json:"description_research"`
	AnswerAI           string    `json:"answer_ai"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// CreateTopicResearchRequest es el payload para crear una nueva investigacion.
type CreateTopicResearchRequest struct {
	IDTopic              string `json:"id_topic"`
	NameResearch         string `json:"name_research"`
	DescriptionResearch  string `json:"description_research"`
	AnswerAI             string `json:"answer_ai"`
}

// UpdateTopicResearchRequest es el payload para actualizar una investigacion existente.
type UpdateTopicResearchRequest struct {
	NameResearch         string `json:"name_research,omitempty"`
	DescriptionResearch  string `json:"description_research,omitempty"`
	AnswerAI             string `json:"answer_ai,omitempty"`
}

// TopicResearchErrorResponse estructura estandarizada para errores de la API.
type TopicResearchErrorResponse struct {
	Error   string `json:"error"`
	Details string `json:"details,omitempty"`
}
