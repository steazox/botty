import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import('../views/Home.vue')
    },
    {
      path: "/register",
      component: () => import('../views/Register.vue')
    },
    {
      path: "/login",
      component: () => import('../views/SignIn.vue')
    },
    {
      path: "/feed",
      component: () => import('../views/feed.vue')
    },
  ],
})

export default router
