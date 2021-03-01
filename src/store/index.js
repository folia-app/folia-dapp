import Vue from 'vue'
import Vuex from 'vuex'
import prismic from './prismic'
import { Folia, FoliaController } from 'folia-contracts'
// import FoliaController from 'folia-contracts/build/contracts/FoliaController.json'
// import FoliaContract from 'folia-contracts/build/contracts/FoliaContract.json'
import Web3 from 'web3'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'

const networks = {
  mainnet: { id: 1, infura: 'https://mainnet.infura.io/v3/1363143c08464562ba87cc807ac77020' },
  rinkeby: { id: 4, infura: 'https://rinkeby.infura.io/v3/1363143c08464562ba87cc807ac77020' }
}

let web3
let provider = window.ethereum || Web3.currentProvider || Web3.givenProvider
let foliaControllerContract
let foliaContract

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
  // network: 'rinkeby', // optional
  cacheProvider: true, // optional
  providerOptions // required
})

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { prismic },
  state: {
    address: null,
    networkId: null,

    foliaContract,

    works: [],
    tokens: [],
    metadatas: []
  },
  getters: {
    weiToETH: () => (wei) => web3?.utils.fromWei(wei) ?? '-',
    workId: () => (uid, prefix) => {
      const id = Number(uid) / 1000000
      return prefix ? ('00' + id).slice(-3) // 001
        : id // 1 - for contract communication
    },
    addrShort: () => (addr) => addr.slice(0, 6) + '...' + addr.slice(-4),
    contractAddr: (state) => state.foliaContract?._address,
    isSoldOut: () => (work) => {
      return work && Number(work.editions) && Number(work.printed) >= Number(work.editions)
    }
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
      // remove existing ?
      if (i > -1) state.works.splice(i, 1)
      // push so app updates
      state.works.push(work)
    },
    SAVE_TOKEN (state, token) {
      state.tokens.push(token) // [tokenId, ownerAddr]
    },
    SAVE_METADATA (state, metadata) {
      state.metadatas.push(metadata)
    },
    SET_CONTRACT (state, contract) {
      state.foliaContract = contract
    }
  },
  actions: {
    /* setup web3, contracts */
    async init ({ state, commit, dispatch }) {
      try {
        // auto-connect?
        if (web3Modal.cachedProvider) {
          await dispatch('connect')
        }

        // setup web3
        if (!web3) {
          if (provider) {
            web3 = new Web3(provider)
          } else {
            web3 = new Web3(new Web3.providers.HttpProvider(networks.mainnet.infura))
          }
        }

        // setup contracts
        const network = state.networkId || await web3.eth.net.getId() || networks.mainnet.id
        console.log('network:', network)
        setContracts(network)
        commit('SET_CONTRACT', foliaContract)

        // listen to provider events
        dispatch('listenToProvider')
      } catch (e) {
        console.error('@init', e)
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
      } catch (e) {
        console.error('@connect', e)
        // clear in case
        web3Modal.clearCachedProvider()
      }
    },

    /* disconnect wallet */
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

      // changed network
      provider.on('chainChanged', chainId => {
        console.log('network changed', chainId)
        // reload page so data is correct...
        window.location.reload()
      })

      // random disconnection? (doesn't fire on account disconnect)
      provider.on('disconnect', error => {
        console.error('disconnected?', error)
        dispatch('disconnect')
      })
    },

    /* buy artwork */
    async buy ({ state, dispatch }, workId) {
      try {
        const work = await dispatch('getWork', { id: workId, flush: true })
        // !! unavailable
        if (!work.exists) throw new Error(`!! Work ${workId} doesn't exist`)
        if (Number(work.printed) >= Number(work.editions)) throw new Error(`!! Work ${1} is sold out`)
        if (work.paused) throw new Error(`!! Work ${workId} is locked. Please wait for release or try again shortly.`)
        // wallet connected ?
        if (!state.address) {
          await dispatch('connect')
        }
        // buy
        await foliaControllerContract.methods
          .buy(state.address, workId)
          .send({ from: state.address, value: work.price })
        // refresh work data for app
        dispatch('getWork', { id: workId, flush: true })
      } catch (e) {
        console.error('@buy:', e)
        // TODO - more elegant UX error ?
        if (e.message?.includes('!! ')) {
          alert(e.message.replace('!! ', ''))
        }
      }
    },

    /* read artwork */
    async getWork ({ state, commit }, { id, flush }) {
      let work = state.works.find(work => work.id === id)
      if (!flush && work) return work
      // get new data
      if (foliaControllerContract && id) {
        try {
          work = await foliaControllerContract.methods.works(id).call()
          work = { id, ...work } // add id
          commit('SAVE_WORK', work)
        } catch (e) {
          console.error('@getWork', e)
        }
      }
      return work
    },

    /* get metadata of work (if released) */
    async getMetadata ({ state, commit }, { token, work }) {
      try {
        token = token || Number(work) * 1000000
        work = work || Math.floor(Number(token) / 1000000)
        // return saved ?
        const saved = state.metadatas.find(metadata => metadata._token === token)
        const now = new Date().getTime()
        const release = saved && saved.release && new Date(saved.release).getTime()
        const hasSinceReleased = release && release > 0 && now >= release
        if (saved && !hasSinceReleased) {
          return saved
        }
        // fetch new
        const url = `/.netlify/functions/metadata/${token}?network=${state.networkId}`
        let metadata = await fetch(url).then(resp => resp.json())
        if (metadata && metadata.name) {
          metadata = { _work: work, _token: token, ...metadata }
          commit('SAVE_METADATA', metadata)
          return metadata
        }
        return null
      } catch (e) {
        console.error(e)
      }
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

const setContracts = (network) => {
  if (!web3) return new Error('web3 not defined')
  foliaControllerContract = new web3.eth.Contract(
    FoliaController.abi,
    FoliaController.networks[network].address
  )

  foliaContract = new web3.eth.Contract(
    Folia.abi,
    Folia.networks[network].address
  )
}
