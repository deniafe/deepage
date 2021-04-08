import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import VueHead from 'vue-head'

Vue.use(VueHead)

Vue.config.productionTip = false

export const bus = new Vue()

// new Vue({
//   router,
//   render: h => h(App)
// }).$mount("#app");

new Vue({ el: '#app', router, render: h => h(App) })
