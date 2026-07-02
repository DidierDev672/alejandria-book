# Alejandría Book

> *«El conocimiento es poder, y el poder es peligroso. Pero el ignorar el conocimiento es la mayor de las locuras.»*  
> — Inspirado en la tradición de la Gran Biblioteca y la Casa Atreides

---

## 📖 Descripción del Proyecto

**Alejandría Book** es una aplicación SPA de gestión de biblioteca digital construida con Vue 3 Composition API. El proyecto combina dos referencias culturales: la **Biblioteca de Alejandría** (preservar y catalogar el saber) y la **Casa Atreides** de *Dune* de Frank Herbert (custodiar el conocimiento con integridad).

La app permite a usuarios autenticados gestionar un catálogo completo de libros, autores, notas, topics y equipamiento, conectando con un backend REST denominado **API Atreides**.

### ✨ Características principales

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| 🔐 **Autenticación** | Login/registro con JWT, persistencia en localStorage, guard de rutas | ✅ Funcional |
| 📚 **Libros** | CRUD completo vía API (`/books`), formulario con validación | ✅ Funcional |
| ✍️ **Autores** | CRUD completo vía API (`/authors`) | ✅ Funcional |
| 📝 **Notas** | CRUD, agrupación por cuaderno, tipos (resumen/cita/idea/análisis) | ✅ Funcional |
| 🏷️ **Topics** | CRUD con tipos (research/tech_stack/literature/philosophy) | ✅ Funcional |
| 👥 **Usuarios** | Lista con búsqueda y modal de detalle | ✅ Funcional |
| 🔧 **Mantenimiento** | CRUD de equipamiento con paginación | ✅ Funcional |
| 📊 **Dashboard** | KPIs y vista general del catálogo | ⚠️ Mock data |
| 🌐 **Tracking** | Registro de visitantes (IP, geo, fingerprint) | ✅ Funcional |

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Rol |
|------------|---------|-----|
| [Vue 3](https://vuejs.org/) | ^3.5 | Framework reactivo (Composition API + `<script setup>`) |
| [TypeScript](https://www.typescriptlang.org/) | ~6.0 | Tipado estático |
| [Vite](https://vitejs.dev/) | ^8.0 | Bundler y dev server con HMR |
| [Vue Router](https://router.vuejs.org/) | ^5.1 | Enrutamiento SPA con lazy loading |
| [Pinia](https://pinia.vuejs.org/) | ^3.0 | Gestión de estado |
| [Axios](https://axios-http.com/) | ^1.18 | Cliente HTTP con interceptores |
| [Tailwind CSS](https://tailwindcss.com/) | ^4.3 | Estilos utility-first |
| [@vueuse/motion](https://motion.vueuse.org/) | ^3.0 | Animaciones y transiciones |
| [Supabase](https://supabase.com/) | ^2.x | Backend-as-a-Service (auth, DB, storage) |

---

## 📋 Prerrequisitos

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **API Atreides** ejecutándose en `http://localhost:8080` (backend REST)

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

Edita `.env` con la URL de tu backend:

```env
VITE_API_ATREIDES=http://localhost:8080
```

### 4. Iniciar el servidor de desarrollo

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
├── public/                          # Assets estáticos (favicon, iconos)
├── src/
│   ├── main.ts                      # Entry point: Vue + Pinia + Router + Motion
│   ├── App.vue                      # Shell raíz con <RouterView />
│   ├── style.css                    # Tailwind CSS v4 + estilos globales
│   │
│   ├── router/
│   │   └── index.ts                 # Rutas SPA + navigation guard (auth)
│   │
│   ├── infrastructure/
│   │   └── http/
│   │       └── axiosInstance.ts     # Cliente HTTP centralizado → API Atreides
│   │
│   ├── components/                  # Componentes compartidos (reutilizables)
│   │
│   └── features/                    # Arquitectura por features (Clean Architecture)
│       ├── auth/                    # 🔐 Módulo de autenticación
│       │   ├── domain/              #   Entidades (User), contratos (AuthRepository)
│       │   ├── application/         #   AuthService (casos de uso)
│       │   ├── infrastructure/      #   AuthApi (implementación HTTP)
│       │   ├── usesCases/           #   Composables (useRegisterForm)
│       │   └── presentation/        #   Pages (LoginPage, RegisterForm), stores
│       │
│       ├── books/                   # 📚 Módulo de libros
│       │   ├── domain/              #   Book entity, BookFactory, BookRepository
│       │   ├── infrastructure/      #   AxiosBookRepository
│       │   ├── application/         #   useBookStore (Pinia)
│       │   └── presentation/        #   BookForm, BookList components
│       │
│       ├── authors/                 # ✍️ Módulo de autores (misma estructura)
│       │
│       ├── notes/                   # 📝 Módulo de notas
│       │   ├── domain/              #   Note entity, NoteFactory, NoteType
│       │   ├── infrastructure/      #   AxiosNoteRepository
│       │   ├── application/         #   useNoteStore (Pinia)
│       │   └── presentation/        #   NoteForm, NoteList, NotebookSpread
│       │
│       ├── topics/                  # 🏷️ Módulo de topics
│       │   ├── domain/              #   Topic entity, TopicFactory, TopicType
│       │   ├── infrastructure/      #   AxiosTopicRepository
│       │   ├── application/         #   useTopicStore (Pinia)
│       │   └── presentation/        #   TopicForm, TopicList
│       │
│       ├── users/                   # 👥 Módulo de usuarios
│       │   └── presentation/        #   UserList (llamadas directas a API)
│       │
│       ├── maintenance/             # 🔧 Módulo de equipamiento
│       │   ├── stores/              #   useEquipmentStore (Pinia)
│       │   ├── http/                #   axiosEquipment (instancia dedicada)
│       │   └── presentation/        #   MaintenanceForm
│       │
│       ├── dashboard/               # 📊 Dashboard principal
│       │   ├── domain/              #   BookEntity, AuthorEntity (legacy)
│       │   ├── infrastructure/      #   BookApi, AuthorApi
│       │   └── presentation/        #   DashboardLayout, DashboardOverview,
│       │                            #   BooksPage, AuthorsPage
│       │
│       └── tracking/                # 🌐 Seguimiento de visitantes
│           └── components/          #   URLTracker (IP, geo, fingerprint)
│
├── docs/                            # 📚 Documentación técnica
│   ├── ARCHITECTURE.md              #   Arquitectura por capas y patrones
│   ├── API.md                       #   Contratos de la API Atreides
│   └── DUNE-ALEXANDRIA.md           #   Ensayo: paralelos Dune × Alejandría
│
├── graphify-out/                    # 🕸️ Grafo de conocimiento (Graphify)
│   ├── graph.html                   #   Grafo interactivo
│   ├── graph.json                   #   Datos crudos del grafo
│   └── GRAPH_REPORT.md              #   Reporte de auditoría
│
├── index.html                       # HTML raíz
├── vite.config.ts                   # Configuración de Vite + alias @/
├── tsconfig.json                    # Configuración TypeScript base
├── tsconfig.app.json                # TypeScript config (app)
├── tsconfig.node.json               # TypeScript config (Node/Vite)
├── package.json                     # Dependencias y scripts
├── .env.example                     # Variables de entorno (plantilla)
└── .env                             # Variables de entorno (local)
```

### 🏗️ Arquitectura por Features

Cada módulo sigue un patrón de **Clean Architecture** simplificado:

```
feature/
├── domain/          # 📦 Entidades, contratos de repositorio, tipos
├── application/     # ⚙️ Casos de uso (stores Pinia, services)
├── infrastructure/  # 🔌 Implementaciones HTTP (Axios repositories)
├── usesCases/       # 🧩 Composables reutilizables
└── presentation/    # 🖼️ Componentes Vue, páginas, layouts
```

**Flujo de datos:**
```
Componente (Vue) → Store (Pinia) → Repository (interface) → AxiosRepository (HTTP) → API Atreides
```

---

## 🌐 Rutas de la Aplicación

| Ruta | Nombre | Auth | Descripción |
|------|--------|------|-------------|
| `/` | — | — | Redirect → `/dashboard` |
| `/login` | `login` | Pública | Inicio de sesión |
| `/register` | `register` | Pública | Registro de usuario (18+) |
| `/dashboard` | `dashboard` | ✅ Requerida | Vista general con KPIs |
| `/dashboard/books` | `books` | ✅ Requerida | Lista de libros |
| `/dashboard/books/create` | `create-book` | ✅ Requerida | Formulario crear libro |
| `/dashboard/authors` | `authors` | ✅ Requerida | Lista de autores |
| `/dashboard/notes` | `notes-list` | ✅ Requerida | Lista de notas |
| `/dashboard/note` | `note` | ✅ Requerida | Formulario crear nota |
| `/dashboard/topics` | `topics` | ✅ Requerida | Lista de topics |
| `/dashboard/topic` | `topic` | ✅ Requerida | Formulario crear topic |
| `/dashboard/users` | `users` | ✅ Requerida | Lista de usuarios |
| `/dashboard/users/create` | `create-user` | ✅ Requerida | Formulario registro usuario |
| `/dashboard/coliseo/equipment/create` | `create-equipment` | ✅ Requerida | Formulario equipamiento |

---

## 🔑 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (usa `.env.example` como plantilla):

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_ATREIDES` | URL base del backend REST | `http://localhost:8080` |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase | `eyJhbGciOiJIUzI1NiIs...` |

```env
# .env
VITE_API_ATREIDES=http://localhost:8080

# Supabase
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ Las variables `VITE_*` se exponen al cliente. **Nunca** pongas secrets aquí. El `anon key` de Supabase es seguro para el cliente ya que las reglas de seguridad se controlan en el backend (Row Level Security).

---

## 📦 Guía de Despliegue

### Build de producción

```bash
npm run build
```

Este comando ejecuta:
1. `vue-tsc -b` — Verificación de tipos TypeScript
2. `vite build` — Bundle optimizado → carpeta `dist/`

### Vista previa del build

```bash
npm run preview
```

Abre `http://localhost:4173` para verificar el build antes de desplegar.

### Despliegue estático

La carpeta `dist/` contiene archivos estáticos listos para:

| Plataforma | Comando |
|------------|---------|
| **Netlify** | Arrastra `dist/` o configura build command: `npm run build` |
| **Vercel** | Framework preset: `Vite`, build command: `npm run build` |
| **GitHub Pages** | Configura `base: '/nombre-repo/'` en `vite.config.ts` |
| **Nginx** | `cp -r dist/* /var/www/html/` |
| **Docker** | Multi-stage: `node:18` build + `nginx:alpine` serve |

### Ejemplo con Docker

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## 📊 Estado del Proyecto

| Área | Estado |
|------|--------|
| Login | ✅ Integrado con API |
| Registro | ⚠️ Validación local; sin endpoint backend |
| CRUD Libros | ✅ API implementada |
| CRUD Autores | ✅ Funcional |
| CRUD Notas | ✅ Funcional |
| CRUD Topics | ✅ Funcional |
| CRUD Usuarios | ✅ Funcional |
| CRUD Equipamiento | ✅ Funcional |
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

El proyecto incluye un grafo de conocimiento generado con [Graphify](https://github.com/safishamsi/graphify) en `graphify-out/`:

- **`graph.html`** — Grafo interactivo (abre en navegador)
- **`graph.json`** — Datos crudos para análisis
- **`GRAPH_REPORT.md`** — Reporte de auditoría con God Nodes y conexiones

Para regenerar el grafo tras cambios significativos:

```bash
graphify .
```

---

## 📜 Licencia

Proyecto privado. Todos los derechos reservados.

---

*«Arrakis teaches the attitude of the mind which can accept anything that happens.»* — Frank Herbert, *Dune*

*Desarrollado con honor, como lo haría la Casa Atreides.*
