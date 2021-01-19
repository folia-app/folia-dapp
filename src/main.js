import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import PrismicVue from '@prismicio/vue'
// import { PortisProvider } from 'portis'
// import Web3 from 'web3'
import linkResolver from '@/plugins/prismic/link-resolver.js'
// import '@/plugins/register-vue-components.js'
// router.afterEach((to, from, next) => {
//   if (ga) ga('send', 'pageview')
// })

// Vue.config.productionTip = false

// if (typeof window.web3 !== 'undefined') {
//   // Use Mist/MetaMask's provider
//   global.web3 = new Web3(window.web3.currentProvider)
// } else {
//   // Fallback - use Portis
//   global.web3 = new Web3(
//     new PortisProvider({
//       apiKey: 'e1d5ea735b084b248c33c221873d08dc',
//       network: 'rinkeby'
//     })
//   )
// }

Vue.use(PrismicVue, {
  endpoint: process.env.VUE_APP_PRISMIC_ENDPOINT,
  linkResolver
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
