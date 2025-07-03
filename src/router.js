import {createRouter, createWebHistory} from 'vue-router'

import product from './pages/Product.vue'
import about from './pages/About.vue'
import blogs from './pages/Blogs.vue'
import list from './pages/List.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/product'
        },
        {
            path: '/product',
            component: product
        },
        {
            path: '/about',
            component: about
        },
        {
            path: '/blogs',
            component: blogs
        },
        {
            path: '/product/list',
            component: list
        }
    ]
})

export default router