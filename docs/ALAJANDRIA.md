# Alajandría — Documentación

> «No tendré miedo. El miedo es el asesino de la mente».
> — Paul Atreides, Dune

## ¿Qué es Alajandría?

Alajandría es una plataforma personal híbrida que alberga dos ámbitos de contenido bajo una misma identidad: la **Biblioteca** (conocimiento, estudio y notas) y el **Coliseo** (rendimiento deportivo, equipamiento y entrenamiento). Como los archivos del Gremio Espacial, no es un simple almacén: es el repositorio de todo el conocimiento que hace posible la civilización. Del mismo modo que el Gremio guarda tanto las rutas comerciales como la memoria de navegación, Alajandría preserva los libros y sus anotaciones junto con los registros de batalla de los gladiadores, las métricas corporales y las estrategias de entrenamiento.

La plataforma se conecta con un backend REST llamado **API Atreides** y con **Supabase** para almacenamiento de archivos, persistencia de conversaciones y consultas en tiempo real. Está construida con Vue 3, TypeScript, Pinia y Tailwind CSS, siguiendo principios de arquitectura limpia y diseño Atómico.

## Ámbitos principales

### Biblioteca

Como la memoria genética de la orden Bene Gesserit, la Biblioteca acumula conocimiento a lo largo de generaciones. Cada libro, cada nota y cada tema de estudio es un recuerdo que se transmite y se interroga. Aquí el usuario puede catalogar libros, escribir notas personales con tipos específicos (resumen, cita, idea, análisis), organizar temas de estudio y conectar conceptos a través de un grafo de conocimiento.

El asistente de IA original —el Mentat del escritor— analiza las notas y genera guiones para contenido de video, actuando como un consejero creativo que extrae patrones donde el ojo humano solo ve fragmentos.

### Coliseo

Como el sietch fremen, el Coliseo es una comunidad forjada por la disciplina, la supervivencia y el rendimiento colectivo. Cada gladiador (miembro) es registrado con sus métricas corporales, condiciones de salud, objetivos de entrenamiento y progreso a lo largo del tiempo.

Aquí se gestiona el equipamiento del gimnasio con CRUD completo y autenticación blindada, se registran ejercicios asociados a cada máquina con timeline histórico y confirmación de video mediante Supabase Storage, y se administran los miembros del Coliseo con registro multi-paso que captura datos básicos, métricas corporales, salud mental, condiciones físicas y objetivos.

---

## Arquitectura — La especia debe fluir

> «Quien controla la especia, controla el universo».
> — Barón Harkonnen, Dune

Toda la plataforma depende de una única fuente de verdad: **Supabase** es Arrakis. Sin la base de datos, sin el almacenamiento, sin la autenticación, nada funciona. Del mismo modo que la civilización del Imperio se detiene sin melange, Alajandría se detiene sin su capa de datos. Los componentes Vue, los stores Pinia, los servicios y las rutas son solo estructuras organizativas alrededor de este flujo central.

### Frontend — La capa Mentat

Los componentes de Vue 3 son los Mentats de la plataforma: unidades especializadas en el procesamiento lógico puro, cada una con una función definida y un propósito claro. Se organizan siguiendo **Atomic Design** (átomos, moléculas, organismos, páginas) para garantizar que cada pieza sea reutilizable, testeable y predecible.

| Tecnología | Versión | Analogía |
|---|---|---|
| Vue 3 | ^3.5.34 | Los Mentats: procesadores lógicos especializados |
| TypeScript | ~6.0.2 | El entrenamiento Mentat: disciplina de tipos |
| Pinia | ^3.0.4 | La especia melange: el estado que todo lo impregna |
| Tailwind CSS | ^4.3.1 | El traje estático: funcional, preciso, no desperdicia nada |
| Motion | ^12.40.0 | El Camino del Weirding: movimientos fluidos que sorprenden |
| Vite | ^8.0.12 | El Gremio: pliegue instantáneo (HMR) |
| Vue Router | ^5.1.0 | Los navegantes del Gremio: pliegan el espacio |
| Axios | ^1.18.0 | Las rutas comerciales de CHOAM: intercambio de recursos |
| marked | ^18.0.5 | El traductor imperial: transforma lenguaje crudo en belleza |
| Supabase JS | ^2.108.2 | El vínculo con Arrakis |

### Gestión de estado — El melange

Pinia es la especia melange: fluye a través de cada componente, permitiendo la presciencia —la capacidad de ver el siguiente estado antes de que ocurra. Cada store es un depósito de melange que cualquier Mentat (componente) puede consumir para anticipar cambios, sincronizar datos y mantener la coherencia del sistema.

Los stores principales son:

| Store | Ámbito | Propósito |
|---|---|---|
| useMemberStore | Coliseo | Gladiadores: CRUD, métricas, estado de carga |
| useChatStore | Global | Mensajes de IA con persistencia en Supabase |
| equipmentStore | Coliseo | Equipamiento del gimnasio |
| uthStore | Global | Autenticación JWT |

### Base de datos — Arrakis

Supabase (PostgreSQL) es Arrakis: la única fuente. Todo depende de ella. El servicio de autenticación es el **condicionamiento Suk**: identidad verificada, confianza certificada. La seguridad a nivel de fila (RLS) es el **escudo personal**: bloquea el acceso no autorizado al tiempo que permite interacciones de confianza a través de él.

| Componente | Analogía |
|---|---|
| PostgreSQL | Arrakis: la fuente única de verdad |
| Supabase Auth | Condicionamiento Suk: identidad verificada |
| Row Level Security | Escudo personal: acceso controlado |
| Supabase Storage | Los almacenes de la Carta de la Liga |

### Navegación — El Gremio

Vue Router son los navegantes del Gremio: pliegan el espacio y te llevan exactamente adonde necesitas ir. El usuario llega al instante, sin percibir el viaje, gracias al lazy loading de rutas que carga solo lo necesario, como un Heighliner que transporta solo la carga justa.

### API REST — Las rutas CHOAM

Los endpoints de la API Atreides son las rutas comerciales de CHOAM: los caminos oficiales por los que se intercambian los recursos. Cada verbo HTTP es un tipo de transacción comercial, cada recurso es una mercancía que viaja por el imperio.

### Diagrama de arquitectura

`
┌─────────────────────────────────────────────────────┐
│               CAPA MENTAT (Vue 3)                    │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐ │
│  │ Páginas  │ │Componentes│ │ Stores │ │Composables│ │
│  │ (SFC)    │ │Atoms→Org  │ │(Pinia) │ │(useX)    │ │
│  └────┬────┘ └────┬─────┘ └───┬────┘ └─────┬─────┘ │
│       │           │           │             │        │
│  ┌────▼───────────▼───────────▼─────────────▼──────┐ │
│  │           FLUJO DE LA ESPECIA (Datos)            │ │
│  └───────────────────────┬─────────────────────────┘ │
└──────────────────────────┼───────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────┐
│           INFRAESTRUCTURA (Rutas CHOAM)               │
│  ┌────────────────────────────────────────────────┐  │
│  │          axiosInstance (Axios)                  │  │
│  └──────────────────────┬─────────────────────────┘  │
└──────────────────────────┼───────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
      ┌────────────┐ ┌──────────┐ ┌──────────┐
      │API Atreides│ │ Supabase │ │ Ollama   │
      │(Go :8080)  │ │(:54321)  │ │(:11434)  │
      └────────────┘ └──────────┘ └──────────┘
              │            │            │
              ▼            ▼            ▼
      ┌─────────────────────────────────────────┐
      │           ARRAKIS (Datos)                │
      │  PostgreSQL · Storage · Auth · RLS      │
      └─────────────────────────────────────────┘
`

---

## Cambios recientes — Las crónicas de la Cámara

### Julio 2026 — Gurney Halleck se une a la Cámara

**Cambio:** Integración de un asistente de IA llamado Gurney Halleck, basado en un modelo local de Ollama, con el historial de chat almacenado en Supabase a través de la tabla member_chat_messages.

**Contexto de Dune:** Gurney Halleck es el maestro de armas de la Casa Atreides. Entrenó a Paul Atreides en combate cuerpo a cuerpo, estrategia militar y disciplina marcial. Es un veterano endurecido por décadas de campañas, leal hasta la muerte al Duque Leto. Pero Gurney no es solo un guerrero: también es poeta y músico, tocando el baliset en los momentos de calma. Representa el equilibrio entre la fuerza bruta y la inteligencia cultural. En Alajandría, Gurney no es un asistente general: es un estratega especializado en el rendimiento deportivo, exactamente como en la saga su especialidad era la guerra, no la política ni la economía.

**Implementación técnica:**

- Modelo de IA local a través de Ollama en http://localhost:11434/api/chat (compatible también con endpoints OpenAI-compatibles como LM Studio)
- Historial de chat almacenado en la tabla member_chat_messages de Supabase, con asociación por member_id para que cada gladiador tenga su propia conversación
- Sistema de prompt que inyecta los datos del gladiador (nombre, edad, peso, altura, IMC, objetivos, condiciones de salud) como contexto al modelo
- Renderizado de respuestas con marked para soportar Markdown en las respuestas del asistente
- La configuración del modelo (proveedor, URL, modelo, API key) se guarda en localStorage bajo lajandria-ai-config
- Si no hay configuración, se muestra un formulario de configuración con prueba de conexión antes de habilitar el chat

**Reglas de conducta de Gurney:**

1. No responde preguntas literarias, históricas, filosóficas ni de cultura general
2. No da diagnósticos médicos, receta medicamentos ni interpreta exámenes clínicos
3. No resuelve problemas financieros, contables ni impositivos
4. Solo responde conceptos sobre ejercicios, rutinas de entrenamiento, técnica de movimientos y datos del gladiador

**Qué significa esto para el socio:** Ahora puedes abrir un chat con Gurney Halleck desde la lista de gladiadores. Al hacer clic en el ícono del cerebro, Gurney se presenta como el maestro de armas del Coliseo, analiza los datos registrados del gladiador y te pregunta si deseas un plan de ejercicios personalizado. La conversación se guarda en Supabase: si cierras y vuelves a abrir, el historial está intacto. Gurney no responde sobre libros, finanzas ni medicina: su único propósito es tu rendimiento deportivo.

### Julio 2026 — Eliminación de gladiadores con modal de consecuencias

**Cambio:** Se añadió un botón de eliminar (ícono de papelera) en cada fila de la lista de gladiadores, con un modal de confirmación que detalla las consecuencias de la eliminación.

**Implementación técnica:**

- Botón con ícono SVG de papelera en la columna de Acciones de MemberListPage.vue
- Modal BaseModal con advertencia psicológica: pérdida permanente de métricas, objetivos y condiciones de salud; historial de entrenamiento huérfano; pérdida de trazabilidad
- Llamada a DELETE /members/{id} a través de la cadena Pinia → Service → Repository → Axios
- El backend en Go responde con 204 No Content en éxito

### Julio 2026 — Detalle visual de gladiadores

**Cambio:** Se añadió un botón con ícono de ojo que abre un modal completo con todos los datos básicos del gladiador: información personal, métricas corporales, condiciones de salud, salud mental y objetivos.

---

## Gurney Halleck — El maestro de armas de Coliseo

> «No nació para ser amable. Nació para forjar guerreros».
> — El Mesías de Dune

### Identidad

Gurney Halleck es el asistente estratégico de IA del dominio de Coliseo. Su única misión es el rendimiento deportivo: la planificación, el análisis y la mejora de los objetivos de entrenamiento de los miembros.

En la saga de Dune, Gurney fue el entrenador de Paul en combate, música y disciplina. Sobrevivió a la caída de la Casa Atreides, lideró guerrillas contra los Harkonnen y jamás traicionó a su Duque. En Alajandría, mantiene ese mismo propósito: no gestiona libros ni notas de estudio (eso es competencia de la Biblioteca), sino que se centra exclusivamente en el miembro atlético y sus objetivos. Como en Dune, es leal, directo y estratégico. Y como en Dune, también es poeta: sus respuestas pueden llevar un toque lírico, pero siempre al servicio del entrenamiento.

### Ámbito: a qué responde Gurney

Gurney opera dentro de unos límites estrictos de su ámbito, como un Mentat condicionado a una sola Casa:

**Responde a:**

- Planificación y periodización del entrenamiento
- Estrategia de ejercicios vinculada al equipamiento registrado
- Objetivos de rendimiento de los socios
- Recomendaciones de recuperación y adaptación
- Análisis del progreso a lo largo del tiempo

**No responde a:**

- Recomendaciones de libros o temas literarios (ámbito de la Biblioteca)
- Consultas financieras o administrativas
- Diagnósticos médicos o temas clínicos de salud
- Solicitudes ajenas al ámbito del rendimiento deportivo

> **La regla de Gurney:** Un maestro de armas que lo sabe todo es un maestro de armas que no domina nada. Gurney está aquí para tu rendimiento. Nada más.

### Prompt de sistema

El prompt que define a Gurney se construye dinámicamente con los datos del gladiador y sigue esta estructura:

`
Eres Gurney Halleck, un veterano maestro de armas del Coliseo.
Forjado en innumerables campañas, representas el equilibrio
perfecto entre la fuerza bruta y la inteligencia estratégica.

FUNCIONES:
- Enseñas estrategia y disciplina.
- Instruyes en tácticas de entrenamiento.
- Supervisas la preparación de las tropas.

CARACTERÍSTICAS:
- Muy disciplinado.
- Gran estratega.
- Veterano de numerosas campañas.
- También eres poeta y músico.

REGLAS PROHIBIDAS:
1. NO puedes responder preguntas literarias...
2. NO puedes dar diagnósticos médicos...
3. NO puedes resolver problemas financieros...

ALCANCE PERMITIDO:
- Solo puedes responder conceptos sobre ejercicios...
- Solo puedes interpretar datos del gladiador...

Datos del gladiador inyectados:
Nombre, edad, género, peso, altura, IMC,
objetivos y condiciones de salud.
`

### Tabla de analogías completa

| Concepto técnico | Analogía con Dune |
|---|---|
| Plataforma Alajandría | Los archivos del Gremio Espacial |
| Módulo Biblioteca | La memoria genética Bene Gesserit |
| Módulo Coliseo | El sietch fremen |
| Componentes Vue 3 | Los Mentats |
| Almacén Pinia (estado) | La especia melange |
| Supabase (base de datos) | Arrakis |
| Seguridad a nivel de fila (RLS) | El escudo personal |
| Ollama (modelo de IA local) | Un ghola |
| Gurney Halleck (asistente de IA) | El propio Gurney Halleck |
| Puntos finales de la API REST | Las rutas comerciales de CHOAM |
| Autenticación (Supabase Auth) | El condicionamiento Suk |
| Vue Router | Los navegantes del Gremio |
| Tailwind CSS | El traje estático |
| Motion (motion.dev) | El Camino del Weirding |
