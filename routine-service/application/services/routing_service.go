// ============================================================
// APPLICATION SERVICE - Routine Use Cases
// ============================================================
// Orquesta los casos de uso de rutinas. Coordina entre
// el dominio (entidades, validaciones) y la infraestructura
// (repositorio, base de datos).
//
// Principio SOLID:
// - Single Responsibility: Cada método es un caso de uso.
// - Dependency Inversion: Depende de abstractions (interfaces).
// ============================================================

package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"routine-service/domain/entities"
	"routine-service/domain/repositories"
	domainServices "routine-service/domain/services"
)

// RoutineApplicationService orquesta los casos de uso
// para la gestión de rutinas.
type RoutineApplicationService struct {
	repo            repositories.RoutineRepository
	validationSvc   *domainServices.RoutineValidationService
}

// NewRoutineApplicationService crea una nueva instancia del servicio.
// Recibe el repositorio por inyección de dependencias (DIP).
func NewRoutineApplicationService(repo repositories.RoutineRepository) *RoutineApplicationService {
	return &RoutineApplicationService{
		repo:          repo,
		validationSvc: domainServices.NewRoutineValidationService(),
	}
}

// GetAllRoutines obtiene todas las rutinas del sistema.
// Caso de uso: LISTAR RUTINAS
func (s *RoutineApplicationService) GetAllRoutines(ctx context.Context) ([]entities.Routine, error) {
	routines, err := s.repo.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("error al obtener rutinas: %w", err)
	}
	return routines, nil
}

// GetRoutineByID obtiene una rutina por su ID.
// Caso de uso: OBTENER RUTINA POR ID
func (s *RoutineApplicationService) GetRoutineByID(ctx context.Context, id string) (*entities.Routine, error) {
	if strings.TrimSpace(id) == "" {
		return nil, fmt.Errorf("el ID es obligatorio")
	}

	routine, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("error al obtener rutina: %w", err)
	}
	if routine == nil {
		return nil, fmt.Errorf("rutina no encontrada con ID: %s", id)
	}

	return routine, nil
}

// CreateRoutine crea una nueva rutina en el sistema.
// Caso de uso: CREAR RUTINA
// 1. Valida los datos de entrada
// 2. Verifica duplicados por nombre
// 3. Genera ID y timestamps
// 4. Persiste en la base de datos
func (s *RoutineApplicationService) CreateRoutine(ctx context.Context, req entities.CreateRoutineRequest) (*entities.Routine, error) {
	// 1. Validar datos
	if err := s.validationSvc.ValidateCreateRequest(req); err != nil {
		return nil, fmt.Errorf("validación fallida: %w", err)
	}

	// 2. Verificar duplicados
	exists, err := s.repo.ExistsByName(ctx, strings.TrimSpace(req.Name), "")
	if err != nil {
		return nil, fmt.Errorf("error al verificar duplicados: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("ya existe una rutina con el nombre '%s'", strings.TrimSpace(req.Name))
	}

	// 3. Crear entidad
	now := time.Now()
	routine := &entities.Routine{
		ID:          s.validationSvc.GenerateRoutineID(),
		Name:        strings.TrimSpace(req.Name),
		Section:     req.Section,
		Repetitions: req.Repetitions,
		TimeMinutes: req.TimeMinutes,
		Notes:       strings.TrimSpace(req.Notes),
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	// 4. Persistir
	if err := s.repo.Create(ctx, routine); err != nil {
		return nil, fmt.Errorf("error al crear rutina: %w", err)
	}

	return routine, nil
}

// UpdateRoutine actualiza una rutina existente.
// Caso de uso: ACTUALIZAR RUTINA
// 1. Valida los datos de entrada
// 2. Verifica que la rutina exista
// 3. Verifica duplicados de nombre (si cambia)
// 4. Aplica cambios parciales
// 5. Persiste los cambios
func (s *RoutineApplicationService) UpdateRoutine(ctx context.Context, id string, req entities.UpdateRoutineRequest) (*entities.Routine, error) {
	// 1. Validar ID
	if strings.TrimSpace(id) == "" {
		return nil, fmt.Errorf("el ID es obligatorio")
	}

	// 2. Validar datos
	if err := s.validationSvc.ValidateUpdateRequest(req); err != nil {
		return nil, fmt.Errorf("validación fallida: %w", err)
	}

	// 3. Obtener rutina existente
	existing, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("error al obtener rutina: %w", err)
	}
	if existing == nil {
		return nil, fmt.Errorf("rutina no encontrada con ID: %s", id)
	}

	// 4. Verificar duplicados de nombre (si se está cambiando)
	if req.Name != nil && strings.TrimSpace(*req.Name) != existing.Name {
		exists, err := s.repo.ExistsByName(ctx, strings.TrimSpace(*req.Name), id)
		if err != nil {
			return nil, fmt.Errorf("error al verificar duplicados: %w", err)
		}
		if exists {
			return nil, fmt.Errorf("ya existe otra rutina con el nombre '%s'", strings.TrimSpace(*req.Name))
		}
	}

	// 5. Aplicar cambios parciales
	if req.Name != nil {
		existing.Name = strings.TrimSpace(*req.Name)
	}
	if req.Section != nil {
		existing.Section = req.Section
	}
	if req.Repetitions != nil {
		existing.Repetitions = req.Repetitions
	}
	if req.TimeMinutes != nil {
		existing.TimeMinutes = *req.TimeMinutes
	}
	if req.Notes != nil {
		existing.Notes = strings.TrimSpace(*req.Notes)
	}
	existing.UpdatedAt = time.Now()

	// 6. Persistir cambios
	if err := s.repo.Update(ctx, existing); err != nil {
		return nil, fmt.Errorf("error al actualizar rutina: %w", err)
	}

	return existing, nil
}

// DeleteRoutine elimina una rutina del sistema.
// Caso de uso: ELIMINAR RUTINA
// 1. Verifica que la rutina exista
// 2. Elimina de la base de datos
func (s *RoutineApplicationService) DeleteRoutine(ctx context.Context, id string) error {
	// 1. Validar ID
	if strings.TrimSpace(id) == "" {
		return fmt.Errorf("el ID es obligatorio")
	}

	// 2. Verificar que exista
	existing, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return fmt.Errorf("error al obtener rutina: %w", err)
	}
	if existing == nil {
		return fmt.Errorf("rutina no encontrada con ID: %s", id)
	}

	// 3. Eliminar
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("error al eliminar rutina: %w", err)
	}

	return nil
}

// SearchRoutines busca rutinas por nombre.
// Caso de uso: BUSCAR RUTINAS
func (s *RoutineApplicationService) SearchRoutines(ctx context.Context, query string) ([]entities.Routine, error) {
	routines, err := s.repo.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("error al buscar rutinas: %w", err)
	}

	// Filtrar por nombre (búsqueda parcial, case-insensitive)
	query = strings.ToLower(strings.TrimSpace(query))
	if query == "" {
		return routines, nil
	}

	var results []entities.Routine
	for _, r := range routines {
		if strings.Contains(strings.ToLower(r.Name), query) {
			results = append(results, r)
		}
	}

	return results, nil
}
