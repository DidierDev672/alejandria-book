// ============================================================
// DOMAIN SERVICE - Routine Validation Service
// ============================================================
// Contiene las reglas de negocio puras para validación
// de rutinas. No depende de infraestructura ni frameworks.
//
// Principio SOLID:
// - Single Responsibility: Solo valida reglas de negocio.
// - Dependency Inversion: No depende de implementaciones.
// ============================================================

package services

import (
	"fmt"
	"strings"
	"time"

	"routine-service/domain/entities"
)

// RoutineValidationService proporciona métodos de validación
// para la entidad Routine basados en reglas de negocio.
type RoutineValidationService struct{}

// NewRoutineValidationService crea una nueva instancia del servicio.
func NewRoutineValidationService() *RoutineValidationService {
	return &RoutineValidationService{}
}

// ValidateCreateRequest valida los datos para crear una nueva rutina.
// Retorna un error descriptivo si la validación falla, nil si es válida.
func (s *RoutineValidationService) ValidateCreateRequest(req entities.CreateRoutineRequest) error {
	// Validar nombre
	if strings.TrimSpace(req.Name) == "" {
		return fmt.Errorf("el nombre de la rutina es obligatorio")
	}
	if len(strings.TrimSpace(req.Name)) < 2 {
		return fmt.Errorf("el nombre debe tener al menos 2 caracteres")
	}
	if len(strings.TrimSpace(req.Name)) > 100 {
		return fmt.Errorf("el nombre no puede exceder 100 caracteres")
	}

	// Validar tiempo (requerido)
	if req.TimeMinutes < 1 || req.TimeMinutes > 600 {
		return fmt.Errorf("el tiempo debe estar entre 1 y 600 minutos")
	}

	// Validar sección (opcional)
	if req.Section != nil {
		if *req.Section < 1 || *req.Section > 100 {
			return fmt.Errorf("la sección debe estar entre 1 y 100")
		}
	}

	// Validar repeticiones (opcional)
	if req.Repetitions != nil {
		if *req.Repetitions < 1 || *req.Repetitions > 1000 {
			return fmt.Errorf("las repeticiones deben estar entre 1 y 1000")
		}
	}

	// Validar notas (opcional)
	if len(req.Notes) > 500 {
		return fmt.Errorf("las notas no pueden exceder 500 caracteres")
	}

	return nil
}

// ValidateUpdateRequest valida los datos para actualizar una rutina.
func (s *RoutineValidationService) ValidateUpdateRequest(req entities.UpdateRoutineRequest) error {
	// Validar nombre si se proporciona
	if req.Name != nil {
		if len(strings.TrimSpace(*req.Name)) < 2 {
			return fmt.Errorf("el nombre debe tener al menos 2 caracteres")
		}
		if len(strings.TrimSpace(*req.Name)) > 100 {
			return fmt.Errorf("el nombre no puede exceder 100 caracteres")
		}
	}

	// Validar tiempo si se proporciona
	if req.TimeMinutes != nil {
		if *req.TimeMinutes < 1 || *req.TimeMinutes > 600 {
			return fmt.Errorf("el tiempo debe estar entre 1 y 600 minutos")
		}
	}

	// Validar sección si se proporciona
	if req.Section != nil {
		if *req.Section < 1 || *req.Section > 100 {
			return fmt.Errorf("la sección debe estar entre 1 y 100")
		}
	}

	// Validar repeticiones si se proporcionan
	if req.Repetitions != nil {
		if *req.Repetitions < 1 || *req.Repetitions > 1000 {
			return fmt.Errorf("las repeticiones deben estar entre 1 y 1000")
		}
	}

	// Validar notas si se proporcionan
	if req.Notes != nil && len(*req.Notes) > 500 {
		return fmt.Errorf("las notas no pueden exceder 500 caracteres")
	}

	return nil
}

// GenerateRoutineID genera un ID único para una rutina.
// Formato: RUT-YYYYMMDD-XXXX (donde XXXX es un número aleatorio)
func (s *RoutineValidationService) GenerateRoutineID() string {
	now := time.Now()
	// Usar timestamp en milisegundos como parte del ID para unicidad
	return fmt.Sprintf("RUT-%s-%04d",
		now.Format("20060102"),
		now.UnixNano()%10000)
}

// FormatTimeLabel formatea los minutos en una etiqueta legible.
// Ejemplos: "20 minutos", "1 hora 30 minutos", "2 horas"
func (s *RoutineValidationService) FormatTimeLabel(minutes int) string {
	if minutes < 60 {
		if minutes == 1 {
			return "1 minuto"
		}
		return fmt.Sprintf("%d minutos", minutes)
	}

	hours := minutes / 60
	remaining := minutes % 60

	if remaining == 0 {
		if hours == 1 {
			return "1 hora"
		}
		return fmt.Sprintf("%d horas", hours)
	}

	hourLabel := "hora"
	if hours > 1 {
		hourLabel = "horas"
	}
	minLabel := "minuto"
	if remaining > 1 {
		minLabel = "minutos"
	}

	return fmt.Sprintf("%d %s %d %s", hours, hourLabel, remaining, minLabel)
}
