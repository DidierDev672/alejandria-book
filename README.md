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
| 🏗️ **Equipamiento** | Coliseo | CRUD con imagen, paginación, subida de video | ✅ Funcional |
| ⚡ **Ejercicios** | Coliseo | Timeline histórico por equipo, CRUD con video | ✅ Funcional |
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
│   ├── main.ts                          # Entry point: Vue + Pinia + Router + carga de historial IA
│   ├── App.vue
│   ├── style.css
│   │
│   ├── lib/
│   │   └── supabase.ts                  # Cliente Supabase compartido (singleton)
│   │
│   ├── stores/
│   │   ├── equipmentStore.js            # Store global de equipamiento
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
│       ├── exercise/
│       │   └── presentation/
│       │       └── pages/
│       │           └── ExerciseListPage.vue  # ⚡ Timeline de ejercicios
│       ├── maintenance/                 # 🏗️ Equipamiento (CRUD + video upload)
│       ├── video/                       # 🎬 Servicio Supabase Storage (videos)
│       │   ├── domain/
│       │   ├── application/
│       │   └── infrastructure/
│       │       ├── config/supabase.ts
│       │       └── repositories/SupabaseVideoRepository.ts
│       ├── dashboard/                   # 📊 Layout + vista general
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
| `/dashboard/coliseo/exercises` | `exercise-list` | ✅ | **Timeline histórico de ejercicios** |

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

## 📅 Sesión de Desarrollo — 2 de Julio, 2026

*Como haría un investigador de la Biblioteca que en un solo día consulta pergaminos dispares y los conecta en un tratado coherente, esta sesión amplió la plataforma en cuatro frentes simultáneos.*

---

### I. El Historial del Coliseo — `ExerciseListPage`

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

**Inicialización en `main.ts`:** antes de montar la aplicación, se verifica si hay una sesión activa (`auth_user` en `localStorage`) y se carga el historial de forma asíncrona. La app monta solo cuando este proceso termina, garantizando que los mensajes estén disponibles desde el primer render.

---

## 📊 Estado del Proyecto

| Área | Estado |
|------|--------|
| Login | ✅ Integrado con API Atreides |
| Registro | ⚠️ Validación local; sin endpoint backend activo |
| CRUD Libros | ✅ Funcional |
| CRUD Autores | ✅ Funcional |
| CRUD Notas | ✅ Funcional |
| CRUD Topics | ✅ Funcional |
| CRUD Usuarios | ✅ Funcional |
| CRUD Equipamiento | ✅ Funcional (con imagen y video en Supabase) |
| Timeline de Ejercicios | ✅ Funcional (ver / editar / video modal) |
| Asistente IA (Notas) | ✅ Funcional (Ollama + OpenAI-compatible) |
| Historial IA en Supabase | ✅ Funcional |
| Dashboard KPIs | ⚠️ Datos de demostración (mock) |
| Tracking Visitantes | ✅ Funcional |
| Tests | ❌ No implementados |

---

## 📚 Documentación Adicional

| Documento | Contenido |
|-----------|-----------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arquitectura por capas, patrones, flujo de datos |
| [docs/API.md](./docs/API.md) | Contratos de la API Atreides, endpoints y modelos |
| [docs/DUNE-ALEXANDRIA.md](./docs/DUNE-ALEXANDRIA.md) | Ensayo: paralelos entre Dune, la Biblioteca y el software |

---

## 🕸️ Grafo de Conocimiento

El proyecto incluye un grafo de conocimiento generado con Graphify en `graphify-out/`:

- **`graph.html`** — Grafo interactivo (abre en navegador)
- **`graph.json`** — Datos crudos para análisis
- **`GRAPH_REPORT.md`** — Reporte de auditoría con God Nodes y conexiones

```bash
graphify .   # Regenerar tras cambios significativos
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

*«Un Mentat no adivina. Investiga, conecta, sintetiza. Solo entonces habla.»*

*Desarrollado con honor, como lo haría la Casa Atreides.*  
*Preservado para la eternidad, como lo haría la Biblioteca de Alejandría.*
