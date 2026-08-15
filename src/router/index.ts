import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
    },
    {
      path: "/login",
      name: "login",
      component: () =>
        import("@/features/auth/presentation/pages/LoginPage.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () =>
        import("@/features/auth/presentation/pages/RegisterForm.vue"),
    },
    {
      path: "/dashboard",
      component: () =>
        import("@/features/dashboard/presentation/layouts/DashboardLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "dashboard",
          component: () =>
            import("@/features/dashboard/presentation/pages/DashboardOverview.vue"),
        },
        {
          path: "books",
          name: "books",
          component: () =>
            import("@/features/dashboard/presentation/pages/BooksPage.vue"),
        },
        {
          path: "digital-books",
          name: "digital-books",
          component: () =>
            import("@/features/books/presentation/pages/DigitalBookListPage.vue"),
        },
        {
          path: "digital-books/:id",
          name: "digital-book-detail",
          component: () =>
            import("@/features/books/presentation/pages/DigitalBookDetailPage.vue"),
        },
        {
          path: "books/create",
          name: "create-book",
          component: () =>
            import("@/features/books/presentation/pages/DigitalBookCreatePage.vue"),
        },
        {
          path: "authors",
          name: "authors",
          component: () =>
            import("@/features/dashboard/presentation/pages/AuthorsPage.vue"),
        },
        {
          path: "notes",
          name: "notes-list",
          component: () =>
            import("@/features/notes/presentation/components/NoteList.vue"),
        },
        {
          path: "note",
          name: "note",
          component: () =>
            import("@/features/notes/presentation/components/NoteForm.vue"),
        },
        {
          path: "topic",
          name: "topic",
          component: () =>
            import("@/features/topics/presentation/components/TopicForm.vue"),
        },
        {
          path: "topics",
          name: "topics",
          component: () =>
            import("@/features/topics/presentation/components/TopicList.vue"),
        },
        {
          path: "users",
          name: "users",
          component: () =>
            import("@/features/users/presentation/components/UserList.vue"),
        },
        {
          path: "users/create",
          name: "create-user",
          component: () =>
            import("@/features/auth/presentation/components/UserRegisterForm.vue"),
        },
        {
          path: "coliseo/equipment/create",
          name: "create-equipment",
          component: () =>
            import("@/features/maintenance/presentation/components/MaintenanceForm.vue"),
        },
        {
          path: "coliseo/equipment/list",
          name: "equipment-list",
          component: () =>
            import("@/features/maintenance/presentation/components/EquipmentPage.vue"),
        },
        {
          path: "coliseo/exercises",
          name: "exercise-list",
          component: () =>
            import("@/features/exercise/presentation/pages/ExerciseListPage.vue"),
        },
        {
          path: "coliseo/exercises/create",
          name: "exercise-create",
          component: () =>
            import("@/features/exercise/presentation/pages/ExerciseCreatePage.vue"),
        },
        {
          path: "coliseo/members",
          name: "members-list",
          component: () =>
            import("@/features/members/presentation/pages/MemberListPage.vue"),
        },
        {
          path: "coliseo/members/create",
          name: "member-create",
          component: () =>
            import("@/features/members/presentation/pages/MemberCreatePage.vue"),
        },
        {
          path: "coliseo/members/list",
          name: "members-list",
          component: () =>
            import("@/features/members/presentation/pages/MemberListPage.vue"),
        },
        {
          path: "coliseo/objetivo-gladiadores",
          name: "objetivo-gladiadores",
          component: () =>
            import("@/features/member-progress/presentation/pages/MemberProgressCreatePage.vue"),
        },
        {
          path: "coliseo/objetivo-gladiadores/list",
          name: "member-progress-list",
          component: () =>
            import("@/features/member-progress/presentation/pages/MemberProgressListPage.vue"),
        },
        {
          path: "coliseo/objetivo-gladiadores/create",
          name: "member-progress-create",
          component: () =>
            import("@/features/member-progress/presentation/pages/MemberProgressCreatePage.vue"),
        },
        {
          path: "coliseo/progreso-gladiadores",
          name: "progreso-gladiadores",
          component: () =>
            import("@/features/member-progress/presentation/pages/MemberProgressListPage.vue"),
        },
        {
          path: "backups",
          name: "backups",
          component: () =>
            import("@/features/backup/presentation/pages/BackupPage.vue"),
        },
        {
          path: "coliseo/asignar-roles",
          name: "assign-roles",
          component: () =>
            import("@/features/colesio/presentation/pages/AssignRolesPage.vue"),
        },
        {
          path: "coliseo/lista-roles",
          name: "assigned-roles-list",
          component: () =>
            import("@/features/colesio/presentation/pages/AssignedRolesListPage.vue"),
        },
        {
          path: "coliseo/rutinas",
          name: "routines-create",
          component: () =>
            import("@/features/routines/presentation/pages/RoutingCreatePage.vue"),
        },
        {
          path: "coliseo/rutinas/list",
          name: "routines-list",
          component: () =>
            import("@/features/routines/presentation/pages/ListRoutingPage.vue"),
        },
        {
          path: "coliseo/rutinas-miembro/create",
          name: "member-routine-create",
          component: () =>
            import("@/features/member-routines/presentation/pages/MemberRoutineCreatePage.vue"),
        },
        {
          path: "coliseo/rutinas-miembro/list",
          name: "member-routine-list",
          component: () =>
            import("@/features/member-routines/presentation/pages/MemberRoutineListPage.vue"),
        },
        {
          path: "coliseo/rutinas-ai",
          name: "ai-routine-chat",
          component: () =>
            import("@/features/ai-routines/presentation/pages/AiRoutineChatPage.vue"),
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem("auth_token");
  if (to.meta.requiresAuth && !token) {
    return { name: "login" };
  }
});

export default router;
