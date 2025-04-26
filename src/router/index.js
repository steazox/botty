import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Feed from '@/views/Feed.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/register',
      component: () => import('@/views/Register.vue'),
    },
    {
      path: '/login',
      component: () => import('@/views/SignIn.vue'),
    },
    {
      path: '/feed',
      component: Feed,
      meta: {
        requireAuth: true,
      },
    },
    {
      path: '/profile/:userId',
      component: () => import('@/views/Profile.vue'),
      meta: {
        requireAuth: true,
      },
    },
  ],
});

// Fonction pour obtenir l'utilisateur actuel
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const auth = getAuth();
    const removeListener = onAuthStateChanged(
      auth,
      (user) => {
        removeListener();
        resolve(user);
      },
      (error) => {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
        reject(error);
      }
    );
  });
};

// Middleware de navigation
router.beforeEach(async (to, from, next) => {
  try {
    const currentUser = await getCurrentUser();

    // Si la route nécessite une authentification
    if (to.matched.some((record) => record.meta.requireAuth)) {
      if (currentUser) {
        next(); // L'utilisateur est connecté
      } else {
        next('/login'); // Redirection vers la page de connexion
      }
    } else if ((to.path === '/login' || to.path === '/register') && currentUser) {
      // Empêche un utilisateur connecté d'accéder à /login ou /register
      next('/feed');
    } else {
      next(); // Pas d'authentification requise
    }
  } catch (error) {
    console.error('Erreur lors de la gestion des routes protégées :', error);
    next('/'); // Redirection en cas de problème
  }
});

export default router;
