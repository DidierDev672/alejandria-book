# API Atreides — Contrato de integración

La **API Atreides** es el backend de la biblioteca digital de la Casa Atreides. Alejandría Book (frontend Vue) se comunica con ella a través del cliente HTTP centralizado `axiosInstance`.

> En *Dune*, la Casa Atreides no gobierna en el vacío: depende de acuerdos, mensajeros y fuentes de información. De igual modo, el frontend no es dueño de los datos; **Atreides** es la fuente de verdad.

---

## Configuración

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_ATREIDES` | URL base del backend | `http://localhost:8080` |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase | `eyJhbGciOiJIUzI1NiIs...` |

Definidas en `.env` en la raíz del proyecto. Solo variables con prefijo `VITE_` son accesibles desde el código cliente.

### Supabase

El proyecto utiliza Supabase como Backend-as-a-Service para:
- **Autenticación**: Gestión de usuarios y sesiones
- **Base de datos**: PostgreSQL gestionado
- **Storage**: Almacenamiento de archivos (imágenes, videos)

Configuración requerida en el dashboard de Supabase:
1. Crear proyecto en [supabase.com](https://supabase.com)
- Ir a **Settings → API**
- Copiar `Project URL` y `anon public` key
- Configurar en `.env`

### Supabase Storage

El proyecto utiliza Supabase Storage para almacenar videos de ejercicios.

**Bucket:** `gallary`

**URL pública:**
```
https://{project-ref}.supabase.co/storage/v1/object/public/gallary/{filename}
```

**Subida de video:**
- Endpoint: `POST /storage/v1/object/gallary/{filename}`
- Headers: `Authorization: Bearer {service-key}`, `Content-Type: video/mp4`
- Límite: 2GB por archivo
- Return: URL pública del archivo

**Implementación:** `SupabaseVideoRepository.uploadToSupabase()`

---

## Autenticación

### Esquema

Todas las peticiones autenticadas incluyen:

```
Authorization: Bearer <token>
```

El token se obtiene en el login y se almacena en `localStorage` bajo la clave `auth_token`.

### Comportamiento ante 401

El interceptor de Axios elimina `auth_token` del `localStorage` cuando recibe una respuesta `401 Unauthorized`. El usuario deberá volver a autenticarse — equivalente a perder el acceso al archivo tras la caída de la Casa en Arrakis.

---

## Endpoints

### Autenticación

#### `POST /auth/login`

Inicia sesión y devuelve token JWT + datos del usuario.

**Request body:**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**Response 200:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name_full": "Paul Atreides",
    "email": "paul@atreides.caladan",
    "phone": "+34 600 000 000",
    "id_number": "12345678A",
    "date_of_birth": "1990-01-15",
    "roles": ["reader", "librarian"]
  }
}
```

**Errores:**

```json
{
  "error": "Credenciales inválidas"
}
```

**Implementación frontend:** `AuthApi.login()` → `AuthService.login()` → `authStore.login()`

---

#### `POST /auth/register` *(planificado)*

> ⚠️ El formulario de registro (`RegisterForm.vue`) existe en el frontend pero **aún no llama a este endpoint**. Actualmente simula éxito con un `setTimeout`.

---

### Libros

Entidad central del catálogo — los «pergaminos digitales» de la biblioteca.

#### `GET /books`

Lista todos los libros.

**Response 200:**

```json
[
  {
    "id": "uuid",
    "title": "Dune",
    "description": "La novela fundacional del universo de Arrakis",
    "author": "Frank Herbert",
    "genres": ["Ciencia ficción", "Fantasía"],
    "photos": ["data:image/jpeg;base64,..."],
    "publicationDate": "1965-08-01",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-06-01T00:00:00Z"
  }
]
```

**Implementación frontend:** `BookApi.getAll()`

---

#### `GET /books/:id`

Obtiene un libro por identificador.

**Implementación frontend:** `BookApi.getById(id)`

---

#### `POST /books`

Crea un nuevo libro.

**Request body:**

```json
{
  "title": "El mesías de Dune",
  "description": "Segunda novela de la saga",
  "author": "Frank Herbert",
  "genres": ["Ciencia ficción"],
  "photos": [],
  "publicationDate": "1969-01-01"
}
```

**Implementación frontend:** `BookApi.create(payload)`

---

#### `PUT /books/:id`

Actualiza un libro existente.

**Request body:** igual que `POST /books`

**Implementación frontend:** `BookApi.update(id, payload)`

---

#### `DELETE /books/:id`

Elimina un libro del catálogo.

**Implementación frontend:** `BookApi.remove(id)`

---

### Autores

Los «escribas» del catálogo: quienes producen el saber que la biblioteca preserva.

#### `GET /authors`

Lista todos los autores.

**Response 200:**

```json
[
  {
    "id": "uuid",
    "name": "Frank Herbert",
    "country": "Estados Unidos",
    "genres": ["Ciencia ficción", "Filosofía"],
    "birthDay": "1920-10-08",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-06-01T00:00:00Z"
  }
]
```

**Implementación frontend:** `AuthorApi.getAll()`

---

#### `GET /authors/:id`

Obtiene un autor por identificador.

**Implementación frontend:** `AuthorApi.getById(id)`

---

#### `POST /authors`

Crea un nuevo autor.

**Request body:**

```json
{
  "name": "Frank Herbert",
  "country": "Estados Unidos",
  "genres": ["Ciencia ficción"],
  "birthDay": "1920-10-08"
}
```

**Implementación frontend:** `AuthorApi.create(payload)`

---

#### `PUT /authors/:id`

Actualiza un autor existente.

**Implementación frontend:** `AuthorApi.update(id, payload)`

---

#### `DELETE /authors/:id`

Elimina un autor.

**Implementación frontend:** `AuthorApi.remove(id)`

---

### Ejercicios

Ejercicios vinculados a equipamiento del gimnasio.

#### `GET /exercises`

Lista ejercicios con filtros opcionales.

**Query params:**
- `equipment_id` - Filtrar por equipo
- `muscle_group` - Filtrar por grupo muscular
- `difficulty` - Filtrar por dificultad

**Response 200:**

```json
{
  "data": [
    {
      "id": "EX20260627001",
      "name": "Press de banca",
      "muscleGroup": "Pectorales",
      "difficulty": "INTERMEDIATE",
      "video": "https://...",
      "equipmentId": "EQ001",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Implementación frontend:** `axiosExercise.get('', { params })`

---

#### `GET /exercises/:id`

Obtiene un ejercicio por identificador.

**Implementación frontend:** `ExerciseService.getById(id)`

---

#### `POST /exercises`

Crea un nuevo ejercicio. Acepta JSON o `multipart/form-data` (para subir video).

**Request body (JSON):**

```json
{
  "equipmentId": "EQ001",
  "name": "Press de banca",
  "muscleGroup": "Pectorales",
  "difficulty": "INTERMEDIATE"
}
```

**Request body (FormData con video):**

```javascript
const formData = new FormData()
formData.append('equipmentId', 'EQ001')
formData.append('name', 'Press de banca')
formData.append('muscleGroup', 'Pectorales')
formData.append('difficulty', 'INTERMEDIATE')
formData.append('video', file) // File object
```

**Implementación frontend:** `axiosExercise.post('', payload)`

---

#### `PUT /exercises/:id`

Actualiza un ejercicio existente. Acepta actualización **parcial** — solo se modifican los campos enviados.

**Comportamiento:**
- `equipment_id` es **inmutable** (ignorado en actualizaciones)
- `name` se valida individualmente (longitud ≤ 100 caracteres)
- `difficulty` se valida individualmente (enum: BEGINNER, INTERMEDIATE, ADVANCED)
- `video_url` siempre se sobrescribe (puede ser vacío para limpiar el video)

**Request body (ejemplo parcial):**

```json
{
  "name": "Press de banca inclinado",
  "difficulty": "ADVANCED",
  "video_url": "https://xxx.supabase.co/storage/v1/object/public/gallary/video.mp4"
}
```

**Request body (solo actualizar video):**

```json
{
  "video_url": "https://xxx.supabase.co/storage/v1/object/public/gallary/nuevo-video.mp4"
}
```

**Request body (limpiar video):**

```json
{
  "video_url": ""
}
```

**Errores:**

| Código | Significado |
|--------|-------------|
| `400` | Nombre vacío o demasiado largo (>100), difficulty inválido |
| `404` | Ejercicio no encontrado |

**Implementación frontend:** `ExerciseService.update(id, payload)`

---

#### `DELETE /exercises/:id`

Elimina un ejercicio vinculado a un equipo.

**Implementación frontend:** `axiosExercise.delete('/{id}')`

---

### Progreso de gladiadores

> *Cada gladiador lleva un cuaderno de bitácora en los anaqueles del Coliseo. Este endpoint es el índice de esas crónicas mensuales.*

#### `GET /progress-member`

Devuelve todos los registros de progreso de objetivos.

**Response 200 (array):**

```json
[
  {
    "id": "uuid",
    "user_id": "20260710232910B",
    "month_year": "2026-07-01",
    "recorded_value": 85,
    "notes": "Buen avance en resistencia",
    "created_at": "2026-07-10T23:29:10.368358-05:00",
    "updated_at": "2026-07-10T23:29:10.368358-05:00"
  }
]
```

**Implementación frontend:** `MemberProgressListPage` usa Axios directo; `HttpMemberProgressRepository.findAll()` usa `axiosInstance`.

#### `POST /progress-member`

Registra el progreso mensual de un gladiador.

**Request body:**

```json
{
  "user_id": "20260710232910B",
  "month_year": "2026-07-01",
  "recorded_value": 85,
  "notes": "Observaciones opcionales"
}
```

**Errores frecuentes:**

| Código | Significado |
|--------|-------------|
| `409` | Ya existe un registro para ese miembro y mes |
| `422` | Datos inválidos (valor vacío, usuario inexistente) |

**Implementación frontend:** `useMemberProgressStore.createProgress()` → `HttpMemberProgressRepository.create()`

#### `GET /progress-member/{id}`

Obtiene un registro de progreso por su identificador.

#### `PUT /progress-member/{id}`

Actualiza un registro existente.

#### `DELETE /progress-member/{id}`

Elimina un registro de progreso.

**Implementación frontend:** `MemberProgressListPage.confirmDelete()` usa Axios directo.

---

### Miembros del Coliseo (consulta individual)

> *El registro de progreso guarda solo el código del gladiador. Para leer su nombre completo, hay que consultar su ficha en el archivo de miembros — como una referencia cruzada en el margen de un manuscrito.*

#### `GET /members/{id}`

Devuelve los datos básicos de un gladiador.

**Response 200:**

```json
{
  "id": "20260710232910B",
  "name_full": "John Doe",
  "type_document": "CC",
  "number_document": "12345",
  "date_of_birth": "1990-01-01",
  "genre": "masculino",
  "phone_number": "1234567890",
  "address": "123 Main St",
  "createdAt": "2026-07-10T23:29:10.368358-05:00",
  "updatedAt": "2026-07-10T23:29:10.368358-05:00"
}
```

**Uso en progreso de gladiadores:**

| Campo | Dónde se muestra |
|-------|------------------|
| `name_full` | Columna Miembro en la tabla de progreso |
| `name_full`, `type_document`, `number_document`, `genre` | Modal "Detalle del Progreso" → sección Miembro |

**Implementación frontend:** `MemberProgressListPage.fetchMemberById()` con caché en `memberById`.

---

## Modelos de datos (TypeScript)

### User

```typescript
interface User {
  id: string
  name_full: string
  email: string
  phone?: string
  id_number?: string
  date_of_birth?: string
  roles?: string[]
}
```

### Book

```typescript
interface Book {
  id: string
  title: string
  description: string
  author: string
  genres: string[]
  photos: string[]
  publicationDate: string
  createdAt: string
  updatedAt: string
}

interface CreateBookPayload {
  title: string
  description: string
  author: string
  genres: string[]
  photos?: string[]
  publicationDate?: string
}
```

### Author

```typescript
interface Author {
  id: string
  name: string
  country: string
  genres: string[]
  birthDay: string
  createdAt: string
  updatedAt: string
}
```

### Exercise

```typescript
interface Exercise {
  id: string
  name: string
  muscleGroup: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  video?: string
  equipmentId: string
  createdAt?: string
  updatedAt?: string
}

interface CreateExercisePayload {
  equipmentId: string
  name: string
  muscleGroup: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  video?: File | string
}
```

### MemberProgress

```typescript
interface MemberProgress {
  id: string
  user_id: string
  user_name?: string
  month_year: string       // formato "YYYY-MM-01"
  recorded_value: number
  notes?: string
  created_at: string
  updated_at: string
}

interface CreateMemberProgressDTO {
  user_id: string
  month_year: string
  recorded_value: number
  notes?: string
}
```

### Member (consulta básica)

```typescript
interface MemberBasicInfo {
  id: string
  name_full: string
  type_document: string
  number_document: string
  genre: string
}
```

### Error estándar

```typescript
interface ApiError {
  error: string
}
```

---

## Clases API en el frontend

| Clase | Archivo | Métodos |
|-------|---------|---------|
| `AuthApi` | `src/features/auth/infrastructure/AuthApi.ts` | `login()` |
| `BookApi` | `src/features/dashboard/infrastructure/BookApi.ts` | `getAll`, `getById`, `create`, `update`, `remove` |
| `AuthorApi` | `src/features/dashboard/infrastructure/AuthorApi.ts` | `getAll`, `getById`, `create`, `update`, `remove` |
| `ExerciseService` | `src/features/exercise/infrastructure/services/exerciseService.ts` | `getAll`, `getById`, `create`, `update`, `delete`, `getByEquipmentId`, `uploadVideo` |
| `HttpMemberProgressRepository` | `src/features/member-progress/infrastructure/http/HttpMemberProgressRepository.ts` | `findAll`, `findById`, `create`, `update`, `delete` |
| `HttpMemberRepository` | `src/features/members/infrastructure/http/HttpMemberRepository.ts` | `findAll`, `findById`, `create`, `update`, `delete` |

- `AuthApi`, `BookApi`, `AuthorApi` utilizan `axiosInstance` importado desde `@/infrastructure/http/axiosInstance`
- `ExerciseService` utiliza `axiosExercise` importado desde `@/features/exercise/infrastructure/http/axiosExercise` (usa proxy Vite)
- `MemberProgressListPage` usa Axios directo para `GET /progress-member` y `GET /members/{id}` (con caché local)

---

## Manejo de errores en la UI

| Feature | Estrategia |
|---------|------------|
| Login | Mensaje en store (`authStore.error`) mostrado en `LoginPage` |
| Autores | Mensaje inline en la página |
| Libros | `alert()` nativo del navegador |

Se recomienda unificar con un sistema de notificaciones toast en futuras versiones.

---

## Persistencia local

| Clave | Contenido | Uso |
|-------|-----------|-----|
| `auth_token` | JWT string | Header Authorization |
| `auth_user` | JSON serializado de `User` | Avatar, nombre en sidebar |

---

*El Gremio Espacial abre los caminos; Axios los recorre. La API Atreides responde en el otro extremo del universo de datos.*
