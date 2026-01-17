import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guest: true }
    },
    {
      path: '/activate',
      name: 'activate',
      component: () => import('../views/ActivateView.vue'),
      meta: { guest: true }
    },
    {
      path: '/validate/totp',
      name: 'validate-totp',
      component: () => import('../views/TwoFactorView.vue')
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: () => import('../views/UserManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfilePage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
       meta: { requiresAuth: true }
    }
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  console.log('Router guard:', to.path, 'Auth:', authStore.isAuthenticated)
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Redirecting to login (authentication required)')
    next('/login')
  } else if (to.meta.guest && authStore.isAuthenticated) {
    console.log('Redirecting to home (already authenticated)')
    next('/')
  } else {
    next()
  }
})

export default router
