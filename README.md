# Alejandría Book

> *«El conocimiento no es tuyo hasta que lo has catalogado, lo has interrogado y has comprendido cómo se relaciona con todo lo demás.»*  
> — Principio de la Gran Biblioteca, adoptado por la Casa Atreides

---

## 📖 Descripción del Proyecto

**Alejandría Book** es una plataforma SPA híbrida construida con Vue 3 Composition API. Combina dos dominios de conocimiento bajo una misma identidad visual: la **Biblioteca de Alejandría** (preservar y catalogar el saber) y el **Coliseo** (gestión de equipamiento y ejercicios de gimnasio).

El proyecto toma su nombre y filosofía de la **Casa Atreides**: gobernar con rigor, actuar con honor y tratar el conocimiento como el recurso más valioso. La habilidad de **investigación** —leer entre líneas, cruzar fuentes, conectar lo disperso— no es solo un rasgo de los Mentat; es el método con que este proyecto fue construido, capa por capa.

La aplicación se conecta con un backend REST denominado **API Atreides** y con **Supabase** para almacenamiento de archivos, persistencia de conversaciones y consultas en tiempo real.

---

## ✨ Módulos de la Plataforma

| Módulo | Dominio | Descripción | Estado |
|--------|---------|-------------|--------|
| 🔐 **Autenticación** | Global | Login/registro con JWT, guard de rutas | ✅ Funcional |
| 📚 **Libros** | Biblioteca | CRUD completo vía API `/books` | ✅ Funcional |
| ✍️ **Autores** | Biblioteca | CRUD completo vía API `/authors` | ✅ Funcional |
| 📝 **Notas** | Biblioteca | CRUD, cuadernos, tipos (resumen/cita/idea/análisis) | ✅ Funcional |
| 🤖 **Asistente IA** | Biblioteca | Chat contextual con LLM local, guiones de contenido | ✅ Funcional |
| 🏷️ **Topics** | Biblioteca | CRUD con tipos (research/tech/literature/philosophy) | ✅ Funcional |
| 👥 **Usuarios** | Global | Lista con búsqueda y detalle | ✅ Funcional |
| 🏗️ **Equipamiento** | Coliseo | CRUD con imagen, interceptores Auth corregidos | ✅ Funcional |
| ⚡ **Ejercicios** | Coliseo | Timeline histórico, CRUD + Modal de confirmación de videos | ✅ Funcional |
| 🛡️ **Gladiadores (Miembros)** | Coliseo | Registro multi-paso, lista, arquitectura Onion + Atomic Design | ✅ Frontend listo |
| 📈 **Progreso de Gladiadores** | Coliseo | Registro mensual de objetivos, lista con nombres reales vía `/members/{id}` | ✅ Frontend listo |
| ⏳ **LoadingView** | Global | Pantalla de carga imperial antes del render de la app | ✅ Funcional |
| 📊 **Dashboard** | Global | KPIs y vista general del catálogo | ⚠️ Mock data |
| 🌐 **Tracking** | Global | Registro de visitantes (IP, geo, fingerprint) | ✅ Funcional |

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Rol |
|------------|---------|-----|
| [Vue 3](https://vuejs.org/) | ^3.5 | Framework reactivo (Composition API + `<script setup>`) |
| [TypeScript](https://www.typescriptlang.org/) | ~6.0 | Tipado estático |
| [Vite](https://vitejs.dev/) | ^8.0 | Bundler y dev server con HMR |
| [Vue Router](https://router.vuejs.org/) | ^5.1 | Enrutamiento SPA con lazy loading |
| [Pinia](https://pinia.vuejs.org/) | ^3.0 | Gestión de estado global |
| [Axios](https://axios-http.com/) | ^1.18 | Cliente HTTP con interceptores |
| [Tailwind CSS](https://tailwindcss.com/) | ^4.3 | Estilos utility-first |
| [@vueuse/motion](https://motion.vueuse.org/) | ^3.0 | Animaciones y transiciones |
| [Supabase](https://supabase.com/) | ^2.x | Storage, base de datos, persistencia de chat |
| [marked](https://marked.js.org/) | ^18.x | Renderizado de Markdown en respuestas de IA |

---

## 📋 Prerrequisitos

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **API Atreides** ejecutándose en `http://localhost:8080`
- **Supabase local** ejecutándose en `http://127.0.0.1:54321` (vía `supabase start`)

---

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd alajandria-book
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

```env
VITE_API_ATREIDES=http://localhost:8080

# Supabase local
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
VITE_SUPABASE_SERVICE_KEY=<tu-service-key>
VITE_SUPABASE_VIDEO_BUCKET=gallary
```

### 4. Iniciar Supabase local

```bash
npx supabase start
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### 📜 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev server con HMR (puerto 5173) |
| `npm run build` | Type-check + build de producción → `dist/` |
| `npm run preview` | Vista previa del build en `dist/` |

---

## 📁 Estructura de Carpetas

```
alajandria-book/
├── public/
├── src/
│   ├── main.ts                          # Entry point: Vue + Pinia + Router + MotionPlugin
│   ├── App.vue                          # LoadingView global + RouterView condicional
│   ├── style.css
│   │
│   ├── lib/
│   │   └── supabase.ts                  # Cliente Supabase compartido (singleton)
│   │
│   ├── stores/
│   │   ├── equipmentStore.js            # Store global de equipamiento (axiosInstance)
│   │   └── chatStore.ts                 # Store de chat IA con persistencia en Supabase
│   │
│   ├── router/
│   │   └── index.ts                     # Rutas SPA + navigation guard
│   │
│   ├── infrastructure/
│   │   └── http/
│   │       └── axiosInstance.ts         # Cliente HTTP centralizado → API Atreides
│   │
│   ├── utils/
│   │   ├── loading/                     # ⏳ Módulo de carga (Onion)
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/icons/
│   │   │   └── presentation/components/LoadingView.vue
│   │   └── components/
│   │       ├── BaseLoading.vue          # Spinner reutilizable
│   │       ├── BaseErrorDisplay.vue     # Visualizador de errores
│   │       ├── CustomVideoPlayer.vue    # Reproductor de video personalizado
│   │       ├── ImageViewer.vue          # Visor de imágenes
│   │       └── EmptyBox.vue             # Estado vacío
│   │
│   └── features/
│       ├── auth/                        # 🔐 Autenticación JWT
│       ├── books/                       # 📚 Libros
│       ├── authors/                     # ✍️ Autores
│       ├── notes/
│       │   └── presentation/
│       │       └── components/
│       │           └── NotebookSpread.vue  # 📔 Cuaderno digital + Asistente IA
│       ├── topics/                      # 🏷️ Topics
│       ├── users/                       # 👥 Usuarios
│       ├── members/                     # 🛡️ Gladiadores del Coliseo (Vertical Slice)
│       │   ├── domain/                  # Entidades, repositorios (ports), servicios de dominio
│       │   ├── application/             # MemberService, useMemberStore (Pinia)
│       │   ├── infrastructure/http/     # HttpMemberRepository (adapter Axios)
│       │   └── presentation/
│       │       ├── components/          # Atomic Design: atoms → molecules → organisms
│       │       └── pages/
│       │           ├── MemberCreatePage.vue
│       │           └── MemberListPage.vue
│       ├── member-progress/             # 📈 Cuaderno de bitácora del Coliseo
│       │   ├── domain/                  # MemberProgress.types, repositorio, dominio
│       │   ├── application/             # MemberProgressService, useMemberProgressStore
│       │   ├── infrastructure/http/     # HttpMemberProgressRepository
│       │   └── presentation/
│       │       ├── components/          # Atomic Design: ProgressInput, MemberSelectorModal…
│       │       └── pages/
│       │           ├── MemberProgressListPage.vue
│       │           └── MemberProgressCreatePage.vue
│       ├── exercise/
│       │   └── presentation/
│       │       └── pages/
│       │           ├── ExerciseCreatePage.vue  # Crear ejercicio + confirmación video Supabase
│       │           └── ExerciseListPage.vue    # ⚡ Timeline de ejercicios
│       ├── maintenance/                 # 🏗️ Equipamiento (CRUD + video upload)
│       ├── video/                       # 🎬 Servicio Supabase Storage (videos)
│       │   ├── domain/
│       │   ├── application/
│       │   └── infrastructure/
│       │       ├── config/supabase.ts
│       │       └── repositories/SupabaseVideoRepository.ts
│       ├── dashboard/                   # 📊 Layout + vista general + sidebar Coliseo
│       └── tracking/                    # 🌐 Registro de visitantes
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DUNE-ALEXANDRIA.md
├── graphify-out/
├── .env.example
└── package.json
```

---

## 🌐 Rutas de la Aplicación

| Ruta | Nombre | Auth | Descripción |
|------|--------|------|-------------|
| `/` | — | — | Redirect → `/dashboard` |
| `/login` | `login` | Pública | Inicio de sesión |
| `/register` | `register` | Pública | Registro de usuario |
| `/dashboard` | `dashboard` | ✅ | Vista general con KPIs |
| `/dashboard/books` | `books` | ✅ | Lista de libros |
| `/dashboard/books/create` | `create-book` | ✅ | Formulario crear libro |
| `/dashboard/authors` | `authors` | ✅ | Lista de autores |
| `/dashboard/notes` | `notes-list` | ✅ | Lista de notas |
| `/dashboard/note` | `note` | ✅ | Formulario crear nota |
| `/dashboard/topics` | `topics` | ✅ | Lista de topics |
| `/dashboard/topic` | `topic` | ✅ | Formulario crear topic |
| `/dashboard/users` | `users` | ✅ | Lista de usuarios |
| `/dashboard/users/create` | `create-user` | ✅ | Registro de usuario |
| `/dashboard/coliseo/equipment/create` | `create-equipment` | ✅ | Crear equipamiento |
| `/dashboard/coliseo/equipment/list` | `equipment-list` | ✅ | Lista de equipamiento + ejercicios |
| `/dashboard/coliseo/exercises` | `exercise-list` | ✅ | Timeline histórico de ejercicios |
| `/dashboard/coliseo/exercises/create` | `exercise-create` | ✅ | Crear ejercicio + confirmación de video Supabase |
| `/dashboard/coliseo/members` | `members-list` | ✅ | Lista de gladiadores del Coliseo |
| `/dashboard/coliseo/members/create` | `member-create` | ✅ | Registro multi-paso de gladiador |
| `/dashboard/coliseo/progreso-gladiadores` | `progreso-gladiadores` | ✅ | Lista de progreso mensual de objetivos |
| `/dashboard/coliseo/objetivo-gladiadores` | `objetivo-gladiadores` | ✅ | Registrar progreso de un gladiador |
| `/dashboard/coliseo/objetivo-gladiadores/list` | `member-progress-list` | ✅ | Lista de progreso (ruta alternativa) |
| `/dashboard/coliseo/objetivo-gladiadores/create` | `member-progress-create` | ✅ | Crear progreso (ruta alternativa) |

---

## 🔑 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_ATREIDES` | URL base del backend REST | `http://localhost:8080` |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | `http://127.0.0.1:54321` |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase | `eyJhbGci...` |
| `VITE_SUPABASE_SERVICE_KEY` | Service key (bypass RLS, solo dev) | `eyJhbGci...` |
| `VITE_SUPABASE_VIDEO_BUCKET` | Nombre del bucket de videos | `gallary` |

> ⚠️ El `VITE_SUPABASE_SERVICE_KEY` omite Row Level Security. Úsalo **solo en desarrollo local**. En producción, configura RLS apropiado y usa únicamente el `ANON_KEY`.

---

## 🗄️ Base de Datos Supabase — Migraciones

### Tabla `chat_messages`

```sql
create table if not exists chat_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz default now()
);

create index if not exists chat_messages_user_created
  on chat_messages (user_id, created_at asc);
```

> `user_id` corresponde al `id` del usuario autenticado por la API Atreides (guardado en `localStorage` bajo la clave `auth_user`). No usa Supabase Auth.

---

## 📅 Sesiones de Desarrollo 

### 📖 Sesión del Cuaderno de Bitácora — 10 de Julio, 2026
> *«Un buen archivo no solo guarda nombres: guarda el avance de cada guerrero, mes a mes, como las crónicas que los escribas del Coliseo llevaban en sus tablillas de cera.»*

**IX. El Cuaderno de Bitácora — Módulo `member-progress/`**

Se añadió un nuevo anexo del Coliseo para registrar y consultar el **progreso mensual de objetivos** de cada gladiador. Como un cuaderno de bitácora en los anaqueles de la Biblioteca: cada entrada dice *quién* avanzó, *cuánto* y *en qué mes*.

| Pieza | Analogía | Función |
|-------|----------|---------|
| `MemberProgressListPage` | El índice maestro | Tabla con todos los registros, estados de carga y error |
| `MemberProgressCreatePage` | La mesa del escriba | Formulario para registrar avance mensual |
| `GET /progress-member` | Consultar el catálogo de crónicas | Trae todos los registros de progreso |
| `GET /members/{id}` | La ficha de referencia cruzada | Obtiene el nombre completo y datos básicos del gladiador |
| Caché `memberById` | La ficha a mano del bibliotecario | Evita repetir consultas al mismo miembro |
| Proxy Vite | El pasillo interno | Conecta el frontend con la API sin problemas de CORS |

**La lista como bibliotecario diligente:**

La página de listado usa Vue 3 Composition API con el patrón directo que todo desarrollador reconoce:

```typescript
const list = ref<MemberProgress[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(() => fetchProgressMember())
```

- **`loading`** — El velo de polvo mientras el mensajero (Axios) busca los pergaminos.
- **`error`** — El aviso cuando el estante está vacío o el depósito no responde.
- **`v-for`** — Recorrer el índice del catálogo, fila por fila.

**Enriquecimiento de miembros:**

El registro de progreso solo guarda el `user_id`. Para mostrar nombres reales, la página consulta `GET /members/{id}` y guarda el resultado en caché. En la tabla se ve `name_full`; en el modal de detalle se despliegan también tipo de documento, número y género.

**Sidebar Coliseo:** nuevos ítems *Objetivo de gladiadores* y *Progreso de gladiadores* en el menú del Coliseo.

---

### 📜 Sesión Imperial — 5 de Julio, 2026
> *«Como los ingenieros de los ornítopteros Atreides refinan cada engranaje hasta lograr el vuelo perfecto, hemos forjado el sistema de carga de videos hasta convertirlo en un ritual digno de la disciplina imperial.»*

**⚔️ La Forja del Gladius Tecnológico — Sistema de Videos Supabase**

En esta sesión, el sistema de videos alcanzó la perfección de un **gladius** romano: elegante, letal y absolutamente confiable. Como los gladiadores del Coliseo que perfeccionan cada movimiento antes de enfrentar a las fieras, refinamos cada aspecto del flujo de confirmación de videos.

**🎬 El Ritual de Confirmación Imperial**

Al igual que en Dune, donde cada acto ceremonial tiene múltiples capas de significado, implementamos el **Modal de Confirmación de Videos** que transforma la simple subida de archivos en un proceso digno de los archivistas de la Casa Atreides:

1. **La Carga Silenciosa**: El video se sube a Supabase Storage sin intervención del usuario
2. **El Oráculo Visual**: Se abre un modal mostrando la URL pública y reproduciendo el video con nuestro `CustomVideoPlayer` 
3. **La Decisión Imperial**: Dos caminos, como las opciones que enfrenta Paul en el desierto:
   - **"Confirmar URL y crear ejercicio"** — El video pasa a formar parte del registro eterno
   - **"Reintentar"** — Se reinicia el proceso, como un Mentat que detecta un error en sus cálculos

**🏛️ La Arquitectura de los Colosos**

Como las máquinas masivas del Imperio en Dune que requieren mantenimiento preciso, corregimos errores estructurales críticos:

- **Interceptores Axios Heredados**: Los `axiosEquipment` no heredaban la autenticación del `axiosInstance` central — cada petición de equipamiento fallaba con 401, como soldados imperiales sin sus identificaciones correctas
- **Plantillas HTML Quebradas**: Etiquetas `<div>` desalineadas causaban errores de parsing — las reparamos con la precisión de un arquitecto que reconstruye los pilares del Coliseo
- **Tipos TypeScript Discordantes**: Aserciones de tipos en plantillas Vue causaban conflictos — las refinamos como un Mentat que corrige inconsistencias lógicas

### 📚 El Legado de la Biblioteca — 2 de Julio, 2026

*Como haría un investigador de la Biblioteca que en un solo día consulta pergaminos dispares y los conecta en un tratado coherente, esta sesión amplió la plataforma en cuatro frentes simultáneos.*

---

**🔧 Los Protocolos de Integridad Imperial**

- **Error de Formulario Roto**: Como un ornítoptero con el fuselaje dañado, el formulario de ejercicios tenía etiquetas HTML mal anidadas que impedían su funcionamiento
- **Gestión de Estado Reactivo**: Refinamos el manejo de `validationErrors` y `isSubmitting` con la precisión de un navegante espacial que calibra sus instrumentos antes de cada salto
- **Interceptores de Autenticación**: Los módulos de equipamiento no heredaban la configuración de tokens JWT — cada petición era rechazada como un guardia que no reconoce el sello de la Casa

**🎯 El Resultado: Un Arsenal Perfeccionado**

Al final de esta sesión, el sistema de videos funciona con la confiabilidad de la maquinaria Atreides: cada componente cumple su función, cada error se maneja con gracia, y la experiencia del usuario fluye como la melange a través del desierto.

---

### 🛡️ Sesión del Coliseo — 5–6 de Julio, 2026
> *«Antes de entrar a la arena, el gladiador es inscrito en los registros del lanista. Cuerpo, mente y objetivo quedan archivados como un pergamino más en la Biblioteca del Imperio.»*

**IV. El Censo de Gladiadores — Módulo `members/`**

Se implementó el slice vertical completo para registrar y listar **miembros del Coliseo**, siguiendo **Vertical Slicing + Onion Architecture + SOLID + Atomic Design**:

| Capa | Contenido |
|------|-----------|
| **Domain** | `Member.types.ts`, `MemberRepository` (port), `MemberDomainService` (BMI, edad, mapeo form→DTO) |
| **Application** | `MemberService` (casos de uso), `useMemberStore` (Pinia) |
| **Infrastructure** | `HttpMemberRepository` — orquestación HTTP en cascada |
| **Presentation** | Atoms → Molecules → Organisms → Pages |

**Formulario de registro (`MemberCreatePage`) — 2 pasos:**

1. **Información personal + métricas corporales** — datos básicos, peso, altura, medidas, IMC calculado en tiempo real
2. **Salud y objetivos** — salud mental, condiciones físicas (dinámicas), objetivos del miembro (dinámicos)

**Integración con API Atreides (flujo en cascada):**

```
POST /members                          → datos básicos (devuelve id)
POST /members/{id}/body-metrics        → métricas corporales
POST /members/{id}/health-conditions   → una petición por condición
POST /members/{id}/mental-health        → salud mental
POST /members/{id}/goals               → una petición por objetivo (is_achieved no se envía)
```

**Mapeos frontend → API:**

| Campo interno | Enviado al backend |
|---------------|-------------------|
| `gender: MASCULINO` | `genre: "masculino"` |
| `stress_level: 5` (1–10) | `stress_level: "moderado"` |
| `mood: NEUTRO` | `mood: "neutro"` |
| `goal_type: PERDIDA_PESO` | `goal_type: "pérdida de peso"` |

**Lista de gladiadores (`MemberListPage`):** tabla con búsqueda, IMC, badges de género/objetivos y estadísticas agregadas. Normalización defensiva cuando el API devuelve miembros sin arrays anidados (`goals`, `health_conditions`).

**Sidebar:** nuevo ítem **Registrar galiador** en el dropdown Coliseo → `/dashboard/coliseo/members/create`.

---

**V. El Velo de Entrada — `LoadingView` global**

Como el ritual de apertura de los archivos de la Casa Atreides, la app ahora muestra `LoadingView` **antes** de renderizar cualquier ruta:

- `App.vue` monta el loader con `isAppReady = false`
- Inicializa chat (`loadFromCloud`) + `router.isReady()`
- Solo entonces renderiza `<RouterView />`
- Animaciones CSS puras (sin `<motion.div>` — incompatible con `@vueuse/motion`)

---

**VI. Protocolos de Autenticación Reforzados**

| Archivo | Problema | Solución |
|---------|----------|----------|
| `axiosEquipment.ts` | `axiosInstance.create()` no hereda interceptores → 401 | Instancia propia con interceptor JWT + manejo 401 |
| `equipmentStore.js` | Axios crudo con `Bearer null` | Migrado a `axiosInstance` centralizado |

---

**VII. Correcciones de Campo de Batalla**

- **`ExerciseCreatePage`**: `isSubmitting` se resetea antes del modal de confirmación de video; HTML anidado corregido; `validationErrors` con `delete` en lugar de `undefined`
- **`LoadingView`**: `withDefaults`, `watch(() => props.isLoading)`, reemplazo de `<motion.*>` por CSS
- **`MemberListPage`**: crash `member.goals.length` cuando el API no incluye `goals` → `normalizeMember()` en repositorio
- **`MemberCreatePage`**: `novalidate` en formulario + validación propia por pasos

---

**VIII. Grafo de Conocimiento Actualizado**

```bash
graphify update .   # 69 archivos nuevos/modificados
```

| Métrica | Valor |
|---------|-------|
| Nodos | **1.358** |
| Aristas | **1.800** |
| Comunidades | **144** |
| God Node nuevo | `Member` (18 edges) |

Backup automático en `graphify-out/2026-07-05/`.

---

### I. Los Anales del Coliseo — `ExerciseListPage`

> *En la Biblioteca, no basta con archivar. Un buen investigador traza la línea del tiempo: cuándo apareció cada fragmento, de dónde provino y con qué otro saber está enlazado.*

Se creó la página `/dashboard/coliseo/exercises` con una **vista de línea de tiempo** (timeline vertical) que muestra todos los ejercicios registrados. Cada ítem del timeline revela el ejercicio y el equipo al que pertenece, de la misma manera en que un manuscrito siempre debe citarse junto a su colección de origen.

**Lógica de carga investigativa:**
1. Se obtienen todos los equipos del store global.
2. Por cada equipo, se consulta la API con `equipment_id` como filtro.
3. Los resultados se ejecutan en paralelo (`Promise.allSettled`) — si un equipo falla, los demás continúan.
4. Los ejercicios se enriquecen con el nombre y tipo del equipo antes de renderizarse.

**Acciones por ejercicio (botones de acción):**

| Botón | Ícono | Función |
|-------|-------|---------|
| **Ver** | Ojo | Abre modal de detalle con vínculo equipo-ejercicio, estado del equipo, último mantenimiento y video |
| **Editar** | Lápiz | Abre modal de edición con formulario (nombre, grupo muscular, dificultad, URL de video) |
| **Eliminar** | Papelera | Disponible para implementar |

**Modal de detalle:** muestra el ejercicio en su contexto completo — como una ficha de catálogo que no solo describe la pieza sino también el estante, la sala y el estado de conservación del archivo donde reposa.

**Modal de edición:** formulario contextual que actualiza el ejercicio vía `PUT /exercises/{id}`. Aplica actualización optimista: la lista se actualiza localmente sin esperar una recarga completa.

**Modal de video:** usa `CustomVideoPlayer` para reproducir el video de referencia directamente dentro de la interfaz, sin abandonar la página — como consultar un códice sin sacarlo de la sala de lectura.

---

### II. El Oráculo del Cuaderno — Asistente IA en `NotebookSpread`

> *Los Mentat de la Casa Atreides no memorizan datos: los sintetizan. Se les entrena para leer entre las líneas de lo que existe y proyectar lo que aún no se ha escrito. Este asistente es el Mentat del escritor.*

Se añadió un **botón flotante con ícono de libro** al componente `NotebookSpread`. Al pulsarlo se abre un modal de chat que actúa como consejero creativo: analiza las notas del cuaderno activo y ayuda a decidir si el contenido es más adecuado para un **video largo** o un **short**, generando además el guión estructurado.

**Flujo de la primera vez (sin modelo configurado):**

1. El usuario ve una pantalla de configuración que le pide elegir proveedor, URL y modelo.
2. Antes de guardar, se realiza un **ping real** al endpoint de IA para verificar conectividad.
3. Si la prueba pasa, la configuración se persiste en `localStorage` y el chat se inicia.

**Proveedores soportados:**

| Proveedor | URL por defecto | Ejemplos de modelos |
|-----------|----------------|---------------------|
| **Ollama** | `http://localhost:11434` | `llama3`, `mistral`, `gemma2` |
| **OpenAI-compatible** | `http://localhost:1234` | LM Studio, Jan, cualquier servidor `/v1/chat/completions` |

**Prompt de sistema dinámico:** se construye en tiempo de ejecución a partir de las notas del cuaderno actual — título, tipo y contenido de cada nota — dando al modelo el contexto necesario para responder con pertinencia.

**Sugerencias rápidas al iniciar el chat:**
- ¿Video largo o short para estas notas?
- Generar guión para video largo
- Generar guión para short

**Renderizado de respuestas:** las respuestas del asistente se procesan con `marked` y se muestran como HTML con estilos tipográficos propios (headings en amber, listas, código, blockquotes), de modo que un guión numerado se lee como un guión, no como texto plano.

---

### III. Los Archivos Eternos — `chatStore` + Supabase

> *Una biblioteca sin memoria es solo una sala con muebles. La verdadera investigación requiere que cada conversación, cada hipótesis anotada al margen, persista más allá de la sesión individual. La Casa Atreides guarda sus registros durante generaciones.*

El historial del chat de IA, que antes solo existía en memoria (se perdía al cerrar la ventana), ahora se persiste en Supabase.

**Arquitectura de persistencia:**

```
Usuario escribe → saveMessage('user', texto)  → INSERT en chat_messages
                → callAiApi(historial + system prompt)
                → saveMessage('assistant', respuesta) → INSERT en chat_messages
```

**`src/lib/supabase.ts`** — Cliente Supabase compartido:  
Un singleton que centraliza la conexión. Como el catálogo maestro de la Biblioteca: una sola fuente de verdad a la que todos los módulos consultan, en lugar de abrir conexiones dispersas.

**`src/stores/chatStore.ts`** — Store Pinia con persistencia:

| Acción | Comportamiento |
|--------|---------------|
| `loadFromCloud()` | Carga los últimos 100 mensajes del usuario al montar la app |
| `sendMessage(texto, contexto)` | Guarda el mensaje del usuario → llama a la IA → guarda la respuesta |
| `clearHistory()` | Elimina todos los mensajes del usuario en Supabase y limpia el estado local |

**Resiliencia:** si Supabase no está disponible o el usuario no está autenticado, el chat funciona igualmente en modo local. El mensaje se muestra aunque no se haya persistido — como un investigador que anota en una libreta de bolsillo cuando no tiene acceso al archivo principal.

**Indicadores visuales:**
- `loading` (spinner de 3 puntos) → la IA está generando una respuesta
- `saving` (texto "Guardando en la nube…") → Supabase está escribiendo
- `error` → el modelo no respondió, con botón para reconfigurar

**Inicialización en `App.vue`:** al montar la app, `LoadingView` cubre la pantalla mientras se carga el historial del chat (si hay sesión) y se resuelve la ruta inicial. Solo entonces se renderiza el contenido — como abrir los portones de la Biblioteca solo cuando los archivistas han preparado el salón de lectura.

---

## 📊 Estado del Arsenal Imperial

Como los reportes de estado que los Mentat de la Casa Atreides entregan al Duque cada amanecer, aquí se documenta el poder de combate actual de nuestras fuerzas tecnológicas:

| Arsenal | Estado de Combate | Notas del Comandante |
|---------|------------------|---------------------|
| **Sistemas de Acceso** | ⚔️ Operativo | Portal de autenticación imperial sincronizado con API Atreides |
| **Registro de Nuevos Reclutas** | ⚠️ Solo validación local | Faltan protocolos de backend para incorporación oficial |
| **Censo de Gladiadores** | ⚔️ Frontend operativo | Registro multi-paso + lista; requiere `POST /members` en API Atreides |
| **Cuaderno de Bitácora** | ⚔️ Frontend operativo | Progreso mensual de objetivos + lista con nombres reales vía `/members/{id}` |
| **Archivos de Pergaminos** | ⚔️ Operativo | CRUD completo de libros, como los catálogos de Alejandría |
| **Registro de Escribas** | ⚔️ Operativo | Gestión de autores con la precisión de archivistas imperiales |
| **Cuadernos de Campo** | ⚔️ Operativo | Sistema de notas con IA integrada, como un Mentat personal |
| **Taxonomía del Saber** | ⚔️ Operativo | Clasificación de topics con rigor académico |
| **Censo de Usuarios** | ⚔️ Operativo | Registro de todos los ciudadanos del dominio digital |
| **Arsenal del Coliseo** | ⚔️ Operativo | CRUD de equipamiento con autenticación blindada y videos Supabase |
| **Anales de Combate** | ⚔️ Operativo | Timeline de ejercicios con modalización de videos y confirmación imperial |
| **Oráculo de Escritura** | ⚔️ Operativo | Asistente IA para análisis de notas (Ollama + OpenAI-compatible) |
| **Memoria Eterna** | ⚔️ Operativo | Persistencia de conversaciones IA en Supabase |
| **Centro de Comando** | ⚠️ Datos simulados | KPIs y métricas aún en fase de demostración |
| **Vigilancia Territorial** | ⚔️ Operativo | Tracking de visitantes como los espías Atreides |
| **Protocolos de Prueba** | ❌ Sin implementar | Las defensas no han sido probadas contra asedio |

---

## 📚 Documentación Adicional

| Documento | Contenido |
|-----------|-----------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arquitectura por capas, patrones, flujo de datos |
| [docs/API.md](./docs/API.md) | Contratos de la API Atreides, endpoints y modelos |
| [docs/ALAJANDRIA.md](./docs/ALAJANDRIA.md) | Documentación narrativa, cambios recientes y analogías |
| [docs/DUNE-ALEXANDRIA.md](./docs/DUNE-ALEXANDRIA.md) | Ensayo: paralelos entre Dune, la Biblioteca y el software |

---

## 🕸️ Grafo de Conocimiento

El proyecto incluye un grafo de conocimiento generado con Graphify en `graphify-out/`:

| Archivo | Descripción |
|---------|-------------|
| **`graph.html`** | Grafo interactivo (abre en navegador) |
| **`graph.json`** | Datos crudos — **1.358 nodos**, **1.800 aristas** |
| **`GRAPH_REPORT.md`** | Reporte de auditoría con God Nodes y conexiones |

**God Nodes actuales:** `Member`, `Alejandría Book`, `Video`, `MemberDomainService`, `SupabaseVideoRepository`.

```bash
graphify update .   # Actualización incremental (solo archivos modificados)
graphify .          # Regeneración completa tras cambios masivos
```

---

## 📦 Guía de Despliegue

```bash
npm run build    # TypeScript check + bundle → dist/
npm run preview  # Vista previa en http://localhost:4173
```

| Plataforma | Notas |
|------------|-------|
| **Netlify / Vercel** | Framework preset: Vite, build command: `npm run build` |
| **Nginx** | `cp -r dist/* /var/www/html/` + configurar SPA fallback |
| **Docker** | Multi-stage: `node:18-alpine` build + `nginx:alpine` serve |

---

## 📜 Licencia

Proyecto privado. Todos los derechos reservados.

---

---

## 🏺 Filosofía de Desarrollo: El Código de los Tres Mundos

Este proyecto nace de la fusión de tres grandes civilizaciones del conocimiento y la disciplina:

### 📚 **La Biblioteca de Alejandría** — El Saber Preservado
> *«Solo quien cataloga puede comprender; solo quien comprende puede enseñar.»*

Como los antiguos bibliotecarios que salvaron los pergaminos del incendio, nuestro código preserva cada fragmento de conocimiento. Cada componente Vue es un pergamino digital, cada store de Pinia es un archivo clasificado, cada endpoint una consulta a los anaqueles eternos.

### ⚔️ **El Coliseo Romano** — La Disciplina del Entrenamiento  
> *«Gladiator non nascitur, fit» — No se nace gladiador, se hace*

El módulo de equipamiento y ejercicios refleja la disciplina romana: cada movimiento registrado, cada equipo catalogado con la precisión de un *lanista* que prepara a sus guerreros. Los videos de ejercicios son como los manuales de combate — técnica preservada para las generaciones futuras.

### 🏜️ **El Imperio de Dune** — La Visión Estratégica
> *«El que controla la melange, controla el universo.»*

Nuestra arquitectura sigue los principios de la Casa Atreides: honor en el código, lealtad a los estándares, y la sabiduría Mentat de conectar datos aparentemente dispersos en patrones coherentes. Cada interceptor Axios es como un escudo Holtzman — protección invisible pero esencial. Cada validación TypeScript es como la Voz Bene Gesserit — poder que guía sin ser visto.

---

## 🔮 El Legado del Código

*«Un Mentat no adivina. Investiga, conecta, sintetiza. Solo entonces ejecuta.»*

*Forjado con honor, como lo ordenaría el Duque Leto Atreides.*  
*Preservado para la eternidad, como lo haría el último bibliotecario de Alejandría.*  
*Perfeccionado en combate, como lo haría un gladiador del Coliseo.*

**Per aspera ad astra** — A través de las dificultades hacia las estrellas.  
**Sic transit gloria mundi** — Así pasa la gloria del mundo, pero el código permanece.
