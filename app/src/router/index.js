import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/Main.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: MainView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
