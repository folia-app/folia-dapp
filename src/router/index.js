import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/views/Index'
// import Work from '@/views/Work'
// import ViewWork from '@/views/ViewWork'

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
      component: Index,
      children: [
        {
          path: '/view/:token',
          name: 'view-token'
          // component: ViewWork
        },
        {
          path: '/works/:work/:token?',
          name: 'work'
          // component: Work,
          // props: true,
          // meta: { isSingle: true }
        }
      ]
    }
    // {
    //   path: '/badmin',
    //   name: 'Admin',
    //   component: Admin
    // }
    /*
    {
      path: '/users',
      name: 'Users',
      component: Index,
      children: [
        {
          path: '/:userAddr',
          name: 'User',
          comp
        }
      ]
    }
    */
  ]
})
