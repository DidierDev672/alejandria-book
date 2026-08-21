export interface ColiseoNavItem {
  label: string
  icon: string
  route: string
}

export interface ColiseoNavSection {
  id: string
  label: string
  items: ColiseoNavItem[]
}

export const coliseoSections: ColiseoNavSection[] = [
  {
    id: 'gladiadores',
    label: 'Gladiadores',
    items: [
      { label: 'Registrar gladiador', icon: 'gladiator-plus', route: '/dashboard/coliseo/members/create' },
      { label: 'Lista de gladiadores', icon: 'gladiator-list', route: '/dashboard/coliseo/members/list' },
      { label: 'Objetivos de gladiadores', icon: 'gladiator-goals', route: '/dashboard/coliseo/objetivo-gladiadores' },
      { label: 'Progreso de gladiadores', icon: 'gladiator-progress', route: '/dashboard/coliseo/progreso-gladiadores' },
      { label: 'Asignar ejercicios', icon: 'exercise-assign', route: '/dashboard/coliseo/asignar-ejercicios' },
      { label: 'Lista de asignaciones', icon: 'assignment-list', route: '/dashboard/coliseo/asignar-ejercicios/list' },
      { label: 'Historial de ejercicios', icon: 'exercise-list', route: '/dashboard/coliseo/exercises' },
    ],
  },
  {
    id: 'equipos',
    label: 'Equipos',
    items: [
      { label: 'Crear equipo', icon: 'equipment', route: '/dashboard/coliseo/equipment/create' },
      { label: 'Lista de equipos', icon: 'equipment-list', route: '/dashboard/coliseo/equipment/list' },
    ],
  },
  {
    id: 'roles',
    label: 'Roles',
    items: [
      { label: 'Asignar roles', icon: 'assign-roles', route: '/dashboard/coliseo/asignar-roles' },
      { label: 'Lista de roles', icon: 'role-list', route: '/dashboard/coliseo/lista-roles' },
    ],
  },
  {
    id: 'rutinas',
    label: 'Rutinas',
    items: [
      { label: 'Rutinas genéricas', icon: 'timer', route: '/dashboard/coliseo/rutinas' },
      { label: 'Lista de rutinas', icon: 'routine-list', route: '/dashboard/coliseo/rutinas/list' },
      { label: 'Crear rutina de ejercicio', icon: 'routine-create', route: '/dashboard/coliseo/rutinas-miembro/create' },
      { label: 'Lista de rutinas asignadas', icon: 'routine-assigned', route: '/dashboard/coliseo/rutinas-miembro/list' },
    ],
  },
  {
    id: 'inteligencia',
    label: 'Inteligencia',
    items: [
      { label: 'Rutinas asistidas por AI', icon: 'ai-sparkle', route: '/dashboard/coliseo/rutinas-ai' },
    ],
  },
]
