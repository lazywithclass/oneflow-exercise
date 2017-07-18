import Vue from 'vue'
import Home from './components/home.vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'

Vue.use(VueRouter)
Vue.use(VueResource)

export var router = new VueRouter({
  routes: [
    { path: '/home', component: Home}
  ]
})

new Vue({
  el: '#app',
  router: router,
  render: h => h('router-view')
})
