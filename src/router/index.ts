import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders/create',
    name: 'CreateOrder',
    component: () => import('@/views/OrderCreateView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders',
    name: 'OrdersList',
    component: () => import('@/views/OrdersListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/ReportsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guard untuk auth
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth on first load
  if (!authStore.user && !authStore.isAuthenticated) {
    authStore.initializeAuth()
  }

  const requiresAuth = to.meta.requiresAuth as boolean

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
