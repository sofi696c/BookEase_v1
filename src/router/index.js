import { createRouter, createWebHistory } from 'vue-router';
import { getAuth } from 'firebase/auth'; 
import HomeView from '../views/HomeView.vue';


const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  
  {
    path: '/reading-goal',
    name: 'ReadingGoal',
    component: () => import('../views/ReadingGoalView.vue')
  },
  {
    path: '/tbr',
    name: 'TBR',
    component: () => import('../views/TBRView.vue'),
    meta: { requiresAuth: true } // Beskyttet rute
  },
  {
    path: '/read-books',
    name: 'ReadBooks',
    component: () => import('../views/ReadBooksView.vue'),
    meta: { requiresAuth: true } // Beskyttet rute
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Router guard for beskyttede ruter
router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const user = auth.currentUser;

  // Hvis ruten kræver autentificering og brugeren ikke er logget ind
  if (to.matched.some(record => record.meta.requiresAuth) && !user) {
    next({ name: 'home' }); // Omfokuser til home
  } else {
    next(); // Fortsæt til ruten
  }
});

export default router;
