// ============================================================
// DOMAIN REPOSITORY - Routine Repository Interface (Puerto)
// ============================================================
// Define el contrato abstracto para el acceso a datos.
// Esta interfaz pertenece al dominio y NO conoce detalles
// de implementación (PostgreSQL, MongoDB, archivos, etc.)
//
// Principio SOLID:
// - Dependency Inversion: El dominio define el puerto,
//   la infraestructura lo implementa.
// ============================================================

package repositories

import (
	"context"

	"routine-service/domain/entities"
)

// RoutineRepository define las operaciones de persistencia
// para la entidad Routine. Cualquier implementación debe
// cumplir este contrato.
type RoutineRepository interface {
	// FindAll retorna todas las rutinas ordenadas por fecha de creación (descendente).
	// Retorna un slice vacío si no hay rutinas, nunca nil.
	FindAll(ctx context.Context) ([]entities.Routine, error)

	// FindByID busca una rutina por su ID único.
	// Retorna nil y nil si no se encuentra (no es error).
	FindByID(ctx context.Context, id string) (*entities.Routine, error)

	// Create inserta una nueva rutina en la base de datos.
	// Asigna automáticamente ID, CreatedAt y UpdatedAt.
	// Retorna error si la inserción falla.
	Create(ctx context.Context, routine *entities.Routine) error

	// Update actualiza una rutina existente.
	// Solo modifica los campos no-nulos del request.
	// Actualiza el campo UpdatedAt automáticamente.
	// Retorna error si la actualización falla.
	Update(ctx context.Context, routine *entities.Routine) error

	// Delete elimina una rutina por su ID.
	// Retorna error si la eliminación falla.
	Delete(ctx context.Context, id string) error

	// ExistsByName verifica si ya existe una rutina con el nombre dado.
	// Retorna true si existe, false si no. Útil para validación de duplicados.
	ExistsByName(ctx context.Context, name string, excludeID string) (bool, error)
}
