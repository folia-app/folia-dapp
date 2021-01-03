import Vue from 'vue'
import Vuex from 'vuex'
import prismic from './prismic'
import { FoliaController } from 'folia-contracts'
import Web3 from 'web3'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'

const networks = {
  rinkeby: 4,
  ganache: 5777,
  mainnet: 1
}

let web3
let provider = Web3Modal.cachedProvider || Web3.currentProvider || Web3.givenProvider
let foliaControllerContract
if (provider) {
  web3 = new Web3(provider)
  foliaControllerContract = new web3.eth.Contract(
    FoliaController.abi,
    FoliaController.networks[networks.rinkeby].address
  )
}

const providerOptions = {
  /* See Provider Options Section */
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: '1363143c08464562ba87cc807ac77020' // required
    }
  }
}

const web3Modal = new Web3Modal({
  network: 'rinkeby', // optional
  cacheProvider: true, // optional
  providerOptions // required
})

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { prismic },
  state: {
    address: null,
    networkId: null
    // chainId: null,
    // web3 stuff
    // web3Enabled: false,
    // enabled: false,
    // waitToPing: true,
    // unlocked: false,
    // querying: false,
    // tryAgain: false,
    // networkId: null,
    // correctNetwork: 1,
    // contractsDeployed: false,
    // nullAddress: '0x0000000000000000000000000000000000000000'
  },
  mutations: {
    SIGN_IN (state, address) {
      state.address = address
    },
    SIGN_OUT (state) {
      state.address = null
    },
    SET_NETWORK (state, id) {
      state.networkId = id
    }
  },
  actions: {
    async init ({ dispatch }) {
      if (web3Modal.cachedProvider) {
        dispatch('connect')
      }
    },
    async connect ({ commit, dispatch }) {
      provider = await web3Modal.connect()
      web3 = new Web3(provider)
      const accounts = await web3.eth.getAccounts()
      const address = accounts[0]
      const networkId = await web3.eth.net.getId()
      // const chainId = await web3.eth.chainId(); // not a function??
      commit('SIGN_IN', address)
      commit('SET_NETWORK', networkId)
      dispatch('subscribeEvents')
    },

    disconnect ({ commit }) {
      web3Modal.clearCachedProvider()
      // provider.off('accountsChanged')
      // provider.off('disconnect')
      commit('SIGN_OUT')
    },

    subscribeEvents ({ commit, dispatch }) {
      if (!provider?.on) return

      // account changed (or disconnected)
      provider.on('accountsChanged', accounts => {
        console.log('accountsChanged', accounts)
        if (!accounts.length) {
          return dispatch('disconnect')
        }
        commit('SIGN_IN', accounts[0])
      })

      // random disconnection? doesn't fire on account disconnect
      provider.on('disconnect', error => {
        console.error(error)
        dispatch('disconnect')
      })
    },

    async get () {
      console.log('get?')
      const work = await foliaControllerContract.methods
        .works(1)
        .call()
      console.log(work)
    },

    async buy ({ state, dispatch }, { workId }) {
      if (!state.address) return dispatch('connect')
      try {
        const work = await foliaControllerContract.methods
          .works(workId)
          .call()
        // !! unavailable
        if (!work.exists) throw new Error("Work doesn't exist")
        if (work.paused || work.printed >= work.editions) throw new Error('Work is unavailable')
        // buy
        await foliaControllerContract.methods
          .buy(state.address, workId)
          .send({ from: state.address, value: work.price })
      } catch (e) {
        console.error('oops', e)
      }
    }
  }
})
