# Routine Service - API REST

Microservicio para la gestión de rutinas de entrenamiento.
Arquitectura Vertical Slicing + Onion con principios SOLID.

## Estructura

```
routine-service/
├── cmd/server/           # Entry point
│   └── main.go
├── domain/               # Capa de Dominio (centro de la cebolla)
│   ├── entities/
│   │   └── routine.go    # Entidades y DTOs
│   ├── repositories/
│   │   └── routing_repository.go  # Interfaces (Puertos)
│   └── services/
│       └── routing_validation.go  # Reglas de negocio
├── application/          # Capa de Aplicación
│   └── services/
│       └── routing_service.go     # Casos de uso
├── infrastructure/       # Capa de Infraestructura
│   ├── database/
│   │   └── postgres_routine.go    # Repositorio PostgreSQL
│   └── http/
│       ├── handlers/
│       │   └── routing_handler.go # Controladores HTTP
│       └── middleware/
│           └── middleware.go      # CORS, Logging
└── go.mod
```

## Endpoints

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| `GET` | `/api/routines` | Listar todas las rutinas | 200 |
| `GET` | `/api/routines/{id}` | Obtener rutina por ID | 200, 404 |
| `POST` | `/api/routines` | Crear nueva rutina | 201, 400, 409, 422 |
| `PUT` | `/api/routines/{id}` | Actualizar rutina | 200, 400, 404, 409, 422 |
| `DELETE` | `/api/routines/{id}` | Eliminar rutina | 200, 404 |
| `GET` | `/api/routines/search?q=` | Buscar por nombre | 200 |

## Request/Response Examples

### POST /api/routines

**Request:**
```json
{
  "name": "Rutina de pecho y tríceps",
  "section": 1,
  "repetitions": 12,
  "time_minutes": 45,
  "notes": "Descanso 60 segundos entre series"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "RUT-20260718-1234",
    "name": "Rutina de pecho y tríceps",
    "section": 1,
    "repetitions": 12,
    "time_minutes": 45,
    "notes": "Descanso 60 segundos entre series",
    "created_at": "2026-07-18T20:30:00Z",
    "updated_at": "2026-07-18T20:30:00Z"
  },
  "message": "Rutina creada exitosamente"
}
```

### PUT /api/routines/{id}

**Request (actualización parcial):**
```json
{
  "time_minutes": 60,
  "notes": "Aumentar peso en la última serie"
}
```

**Response 200:**
```json
{
  "data": {
    "id": "RUT-20260718-1234",
    "name": "Rutina de pecho y tríceps",
    "section": 1,
    "repetitions": 12,
    "time_minutes": 60,
    "notes": "Aumentar peso en la última serie",
    "created_at": "2026-07-18T20:30:00Z",
    "updated_at": "2026-07-18T21:00:00Z"
  },
  "message": "Rutina actualizada exitosamente"
}
```

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `8081` |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `` |
| `DB_NAME` | Nombre de la base de datos | `postgres` |
| `DB_SSLMODE` | Modo SSL | `disable` |

## Ejecutar

```bash
# Instalar dependencias
go mod tidy

# Ejecutar
go run cmd/server/main.go

# O compilar
go build -o routine-service cmd/server/main.go
./routine-service
```

## Arquitectura

### Vertical Slicing
Cada feature (en este caso "routines") tiene todas sus capas agrupadas:
- Domain → Application → Infrastructure → Presentation

### Onion Architecture
El flujo de dependencias es hacia adentro:
```
Infrastructure → Application → Domain
     ↓               ↓           ↓
  (frameworks)   (use cases)  (entities)
```

### Principios SOLID
- **S**ingle Responsibility: Cada archivo tiene una responsabilidad
- **O**pen/Closed: Abierto a extensión, cerrado a modificación
- **L**iskov Substitution: Las implementaciones cumplen contratos
- **I**nterface Segregation: Interfaces pequeñas y específicas
- **D**ependency Inversion: El dominio define puertos, la infraestructura los implementa
