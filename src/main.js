import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import 'lazysizes'
import PrismicVue from '@prismicio/vue'
import linkResolver from '@/plugins/prismic/link-resolver.js'
import VueMeta from 'vue-meta'
import analytics from './plugins/vue-gtag'

// netlify pre-rendering (set to true elsewhere in app, otherwise rendered after 10s)
window.prerenderReady = false

// import { PortisProvider } from 'portis'
// import Web3 from 'web3'

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
  endpoint: `https://${process.env.VUE_APP_PRISMIC_REPO}.cdn.prismic.io/api/v2`,
  linkResolver
})

Vue.use(VueMeta)

const pwd = async cb => {
  // disabled
  if (!process.env.VUE_APP_SITE_PWD_ENABLED) {
    return cb()
  }
  // check pwd...
  const p = sessionStorage.getItem('p') || window.prompt('password')
  const checkPwd = (p) => fetch('/.netlify/functions/pwd', { method: 'POST', body: p })

  if ((await checkPwd(p)).status === 200) {
    sessionStorage.setItem('p', p)
    cb()
  } else {
    // ask again
    sessionStorage.removeItem('p')
    pwd(cb)
  }
}

pwd(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>',
    mounted () {
      analytics()
      console.log('mntd')
    }
  })
})
