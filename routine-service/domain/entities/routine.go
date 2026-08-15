// ============================================================
// DOMAIN ENTITIES - Routine
// ============================================================
// Define la entidad central del dominio y los tipos de datos
// que representan una rutina de entrenamiento.
// ============================================================

package entities

import (
	"time"
)

// Routine representa una rutina de entrenamiento en el sistema.
// Es la entidad central del dominio que encapsula toda la información
// necesaria para definir un plan de ejercicio.
type Routine struct {
	// ID identificador único de la rutina (formato: RUT-YYYYMMDD-XXXX)
	ID string `json:"id"`

	// Name nombre descriptivo de la rutina (requerido, 2-100 caracteres)
	Name string `json:"name"`

	// Section número de sección o grupo al que pertenece la rutina (opcional)
	// Por ejemplo: 1 = Pecho, 2 = Espalda, 3 = Piernas
	Section *int `json:"section,omitempty"`

	// Repetitions número de repeticiones por serie (opcional)
	// Por ejemplo: 12, 15, 20
	Repetitions *int `json:"repetitions,omitempty"`

	// TimeMinutes duración estimada de la rutina en minutos (requerido)
	// Mínimo 1 minuto, máximo 600 minutos (10 horas)
	TimeMinutes int `json:"time_minutes"`

	// Notes notas adicionales, instrucciones o consejos (opcional)
	// Máximo 500 caracteres
	Notes string `json:"notes,omitempty"`

	// CreatedAt timestamp de creación (se asigna automáticamente)
	CreatedAt time.Time `json:"created_at"`

	// UpdatedAt timestamp de última actualización (se asigna automáticamente)
	UpdatedAt time.Time `json:"updated_at"`
}

// CreateRoutineRequest representa el payload esperado para crear una rutina.
// Los campos con `binding:"required"` son obligatorios.
type CreateRoutineRequest struct {
	Name        string `json:"name" binding:"required,min=2,max=100"`
	Section     *int   `json:"section,omitempty"`
	Repetitions *int   `json:"repetitions,omitempty"`
	TimeMinutes int    `json:"time_minutes" binding:"required,min=1,max=600"`
	Notes       string `json:"notes,omitempty" binding:"max=500"`
}

// UpdateRoutineRequest representa el payload esperado para actualizar una rutina.
// Todos los campos son opcionales (actualización parcial).
type UpdateRoutineRequest struct {
	Name        *string `json:"name,omitempty" binding:"omitempty,min=2,max=100"`
	Section     *int    `json:"section,omitempty"`
	Repetitions *int    `json:"repetitions,omitempty"`
	TimeMinutes *int    `json:"time_minutes,omitempty" binding:"omitempty,min=1,max=600"`
	Notes       *string `json:"notes,omitempty" binding:"omitempty,max=500"`
}

// RoutineResponse representa la respuesta estándar del API.
// Envuelve los datos en un objeto con campo `data` para
// facilitar el manejo de respuestas paginadas en el futuro.
type RoutineResponse struct {
	Data    interface{} `json:"data"`
	Message string      `json:"message,omitempty"`
}

// ErrorResponse representa una respuesta de error estandarizada.
type ErrorResponse struct {
	Error   string `json:"error"`
	Details string `json:"details,omitempty"`
}
