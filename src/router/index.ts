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
          path: "books/create",
          name: "create-book",
          component: () =>
            import("@/features/books/presentation/components/BookForm.vue"),
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
