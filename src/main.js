import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import store from './store'
//var ApplicationConfig = require('./assets/default-config.json')

Vue.config.productionTip = false

//Vue.prototype.$config = ApplicationConfig

new Vue({
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')
