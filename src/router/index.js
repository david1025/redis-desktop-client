import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Welcome from '../views/Welcome.vue'
import RedisStatus from '../views/RedisStatus.vue'
import KeyValues from '../views/KeyValues.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: Welcome
  },
  {
    path: '/Home',
    name: 'Home',
    component: Home,
    children: [
      {
        path: '/RedisStatus',
        name: 'RedisStatus',
        component: RedisStatus
      },
      {
        path: '/KeyValues',
        name: 'KeyValues',
        component: KeyValues
      }
    ]
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
