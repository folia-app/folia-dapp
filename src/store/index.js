import Vue from 'vue'
import Vuex from 'vuex'
import prismic from './prismic'
import { Folia, FoliaController } from 'folia-contracts'
// import FoliaController from 'folia-contracts/build/contracts/FoliaController.json'
// import FoliaContract from 'folia-contracts/build/contracts/FoliaContract.json'
import Web3 from 'web3'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'

let web3
let provider = Web3.currentProvider || Web3.givenProvider
let foliaControllerContract
let foliaContract

// setup web3, contract
if (provider) {
  web3 = new Web3(provider)
  foliaControllerContract = new web3.eth.Contract(
    FoliaController.abi,
    FoliaController.networks[4].address // rinkeby
  )
  foliaContract = new web3.eth.Contract(
    Folia.abi,
    Folia.networks[4].address // rinkeby
  )
}

// provider options
const providerOptions = {
  /* See Provider Options Section */
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: '1363143c08464562ba87cc807ac77020' // required
    }
  }
}

// setup web3 modal
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
    networkId: null,
    works: [],
    tokens: []
  },
  getters: {
    weiToETH: () => (wei) => web3?.utils.fromWei(wei) ?? '-',
    workId: () => (uid, prefix) => {
      const id = Number(uid) / 1000000
      return prefix ? ('00' + id).slice(-3) // 001
        : id // 1 - for contract communication
    },
    addrShort: () => (addr) => addr.slice(0, 6) + '...' + addr.slice(-4)
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
    },
    SAVE_WORK (state, work) {
      const i = state.works.findIndex(svd => svd.id === work.id)
      if (i > -1) state.works[i] = work
      else state.works.push(work)
    },
    SAVE_TOKEN (state, token) {
      state.tokens.push(token) // [tokenId, ownerAddr]
    }
  },
  actions: {
    async init ({ dispatch }) {
      // auto-connect?
      if (web3Modal.cachedProvider) {
        dispatch('connect')
      }
    },

    /* connect wallet */
    async connect ({ commit, dispatch }) {
      try {
        // connect and update provider, web3
        provider = await web3Modal.connect()
        web3 = new Web3(provider)
        // save account
        const accounts = await web3.eth.getAccounts()
        const address = accounts[0]
        const networkId = await web3.eth.net.getId()
        // const chainId = await web3.eth.chainId(); // not a function??
        commit('SIGN_IN', address)
        commit('SET_NETWORK', networkId)
        // listen to events
        dispatch('listenToProvider')
      } catch (e) {
        console.error(e)
      }
    },

    /* connect wallet */
    disconnect ({ commit }) {
      // clear so they can re-select from scratch
      web3Modal.clearCachedProvider()
      // provider.off('accountsChanged')
      // provider.off('disconnect')
      commit('SIGN_OUT')
    },

    /* wallet events */
    listenToProvider ({ commit, dispatch }) {
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

    /* buy artwork */
    async buy ({ state, dispatch }, workId) {
      if (!state.address) return dispatch('connect')
      try {
        const work = await dispatch('getWork', { id: workId, flush: true })
        // !! unavailable
        if (!work.exists) throw new Error("Work doesn't exist")
        if (work.paused || Number(work.printed) >= Number(work.editions)) throw new Error('Work is unavailable')
        // buy
        await foliaControllerContract.methods
          .buy(state.address, workId)
          .send({ from: state.address, value: work.price })
      } catch (e) {
        console.error('oops', e)
      }
    },

    /* read artwork */
    async getWork ({ state, commit }, { id, flush }) {
      let work = state.works.find(work => work.id === id)
      if (!flush && work) return work
      // get new data
      if (foliaControllerContract && id) {
        work = await foliaControllerContract.methods.works(id).call()
        work = { id, ...work } // add id
        commit('SAVE_WORK', work)
      }
      return work
    },

    /* get owner by token id */
    async getNFTOwnerByTokenId ({ state, commit }, tokenId) {
      try {
        const token = state.tokens.find(token => token[0] === tokenId) || []
        let owner = token && token[1]
        if (owner) return owner
        // get new data
        if (foliaContract) {
          owner = await foliaContract.methods.ownerOf(tokenId).call()
          commit('SAVE_TOKEN', [tokenId, owner])
          return owner
        }
        return null
      } catch (e) {
        console.error('get owner error', e)
      }
    }
  }
})
