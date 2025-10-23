import {createRouter, createWebHistory} from 'vue-router'
import { useAuthStore } from './stores/auth'

import Product from './pages/Product.vue'
import About from './pages/About.vue'
import Blogs from './pages/Blogs.vue'
import List from './pages/List.vue'
import Admin from './pages/Admin.vue'
import Login from './pages/Login.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/product'
        },
        {
            path: '/product',
            component: Product
        },
        {
            path: '/about',
            component: About
        },
        {
            path: '/blogs',
            component: Blogs
        },
        {
            path: '/product/list',
            component: List
        },
        {
            path: '/admin',
            component: Admin,
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/login',
            component: Login
        }
    ]
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Ensure auth state is initialized before checking routes
    if (authStore.isAuthLoading) {
        await new Promise(resolve => {
            const unsubscribe = authStore.$subscribe((mutation, state) => {
                if (!state.authLoading) {
                    unsubscribe()
                    resolve()
                }
            })
        })
    }

    // Check if the route requires authentication
    if (to.meta.requiresAuth) {
        if (!authStore.isAuthenticated) {
            next({
                path: '/login',
                query: { redirect: to.fullPath } // <--- Pass original path
            })
        } else if (to.meta.requiresAdmin) {
            if (!authStore.isAdmin) {
                alert('Access Denied: You do not have administrator privileges.')
                next('/product')
            } else {
                next()
            }
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router