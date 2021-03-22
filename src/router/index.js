import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/views/Index'
// import Work from '@/views/Work'
// import ViewWork from '@/views/ViewWork'
const WorkTokens = () => import(/* webpackChunkName: "work-tokens" */ '../views/work/WorkTokens.vue')

// import Home from '@/views/Home'
// import Admin from '@/views/Admin'
Vue.use(Router)

/*
index (patches, users)
user/wallet: name?, addr, patches, patchesCount?
patch: artist, title, EditionId, printNum, currentPrice, currentUserThisPatch [tokenIds], transactionList (tokenId, addr/owner (isCurrent?), price, date)
(search?)
*/

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
    },
    {
      path: '/view/:token',
      name: 'view-token',
      component: Index
      // component: ViewWork
    },
    {
      path: '/works/:work',
      component: Index,
      children: [
        {
          path: '',
          name: 'work',
          meta: { layout: 'panel' },
          component: WorkTokens
        },
        {
          path: 'info',
          name: 'work-info',
          meta: { layout: 'panel' },
          component: () => import(/* webpackChunkName: "work" */ '../views/work/WorkInfo.vue')
        },
        {
          path: 'details',
          name: 'work-details',
          meta: { layout: 'panel' },
          component: () => import(/* webpackChunkName: "work" */ '../views/work/WorkDetails.vue')
        },
        {
          path: 'collectors',
          name: 'work-owners',
          meta: { layout: 'panel' },
          component: () => import(/* webpackChunkName: "work" */ '../views/work/WorkOwners.vue')
        },
        {
          path: 'auctions',
          name: 'work-auctions',
          meta: { layout: 'panel' },
          component: () => import(/* webpackChunkName: "work" */ '../views/work/WorkAuctions.vue')
        },
        {
          path: 'auctions/:token',
          name: 'work-auctions-token',
          meta: { layout: 'panel', panelWide: true, workView: 'auctions' },
          // component: () => import(/* webpackChunkName: "work" */ '../views/work/WorkAuctions.vue')
          components: {
            default: () => import(/* webpackChunkName: "work-auction" */ '../views/work/WorkAuctions.vue'),
            sidebar: () => import(/* webpackChunkName: "work-auction" */ '../views/work/WorkAuctionsToken.vue')
            // sidebar: component: () => import(/* webpackChunkName: "work" */ '../views/work/WorkAuctions.vue')
          }
        },

        // !! METADATA/OPENSEA "external_url" is /work/2/:token
        {
          path: ':token',
          name: 'work-token',
          meta: { layout: 'panel' },
          component: WorkTokens
        }
      ]
    },
    {
      path: '/sets/:set',
      name: 'set',
      component: Index,
      meta: { layout: 'panel' }
    }
  ]
})
