import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/register',
      component: () => import('../views/Register.vue'),
    },
    {
      path: '/login',
      component: () => import('../views/SignIn.vue'),
    },
    {
      path: '/feed',
      component: () => import('../views/Feed.vue'),
      meta: {
        requireAuth: true,
      },
    },
  ],
});

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const auth = getAuth();
    const removeListener = onAuthStateChanged(
      auth,
      (user) => {
        removeListener();
        resolve(user);
      },
      reject
    );
  });
};

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requireAuth)) {
    if (await getCurrentUser()) {
      next();
    } else {
      next('/');
    }
  } else {
    next();
  }
});

export default router;
