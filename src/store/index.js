import Vue from 'vue'
import Vuex from 'vuex'
// contracts
import Folia from 'folia-contracts/build/contracts/Folia.json'
import FoliaControllerV2 from 'folia-contracts/build/contracts/FoliaControllerV2.json'
// import ReserveAuction from 'folia-contracts/build/contracts/ReserveAuction.json'
// ethers
import { ethers, BigNumber as bn } from 'ethers'
import { readProvider as poolReadProvider, RPCS } from './rpc'
// import Web3 from 'web3'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { exception } from 'vue-gtag'
// modules
import prismic from './prismic'
import auctions from './auctions'

let provider, signer, walletProvider, initializing

const networks = {
  // No rpc url here any more. Reads come from the redundant keyless pool in
  // ./rpc; the Infura key that used to sit in this object shipped in the public
  // bundle for as long as this file has existed.
  1: { name: 'mainnet', layer: 'ethereum', explorer: { name: 'Etherscan', domain: 'https://etherscan.io' } },
  4: { name: 'rinkeby', layer: 'ethereum', explorer: { name: 'Etherscan', domain: 'https://rinkeby.etherscan.io' } }
}

/**
 * Reads go through this, never through the visitor's wallet.
 *
 * Every page that shows a work reads ownerOf() and works() from chain. Those
 * reads used to run on whatever provider the wallet handed over, so a visitor
 * whose wallet sat on Base or a testnet got mainnet contract *addresses*
 * queried against the wrong chain — every call failed and the page rendered
 * nothing. Worse, it failed in the confusing direction: a visitor with no
 * wallet at all fell through to the Infura fallback below and saw the page
 * fine, while a visitor with a wallet on the wrong network saw a blank one.
 *
 * A work's page is public. It should not depend on having a wallet, on that
 * wallet being unlocked, or on which network it happens to be pointed at.
 * The wallet is still used for transactions — those call .connect(signer)
 * explicitly — and the wrong-network banner still tells someone to switch
 * before they try to mint.
 *
 * The endpoints come from ./rpc — free, keyless, and redundant. The hardcoded
 * Infura key that used to serve these reads is gone; VUE_APP_RPCS overrides the
 * list.
 */
const readProvider = poolReadProvider()

let web3
// let provider = window.ethereum || Web3.currentProvider || Web3.givenProvider

// setup web3 modal
const web3Modal = new Web3Modal({
  // network: 'rinkeby', // optional
  cacheProvider: true, // optional
  providerOptions: { // required
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        // WalletConnect v1 accepts an rpc map instead of an infuraId, which
        // keeps this off a keyed provider like everything else here.
        rpc: { 1: RPCS[0] }
      }
    }
  }
})

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { prismic, auctions },
  state: {
    address: null,
    networkId: null,

    foliaContract: null,
    foliaControllerContract: null,
    reserveAuctionContract: null,

    works: [],
    tokens: [],
    metadatas: [],
    addresses: {}
  },
  getters: {
    // weiToETH: () => (wei) => web3?.utils.fromWei(wei) ?? '-',
    weiToETH: () => wei => ethers.utils.formatUnits(wei) ?? '...',
    // ethToWei: () => (eth) => web3?.utils.toWei(eth) ?? '-',
    ethToWei: () => (eth) => ethers.utils.parseUnits(eth).toString() ?? '-',
    workId: () => (uid, prefix) => {
      const id = Number(uid) // / 1000000
      return prefix ? ('00' + id).slice(-3) // 001
        : id // 1 - for contract communication
    },
    addrShort: () => (addr) => addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : '...',
    userBalance: (state) => (addr) => provider?.getBalance(addr || state.address) || '0', // wei
    contractAddr: (state) => state.foliaContract?.address,
    isSoldOut: () => (work) => {
      return work && Number(work.editions) && Number(work.printed) >= Number(work.editions)
    },
    openSeaLink: (state, getters) => ({ token, account, chainId, contract }) => {
      const chains = {
        1: 'ethereum',
        8453: 'base',
        11155111: 'sepolia',
        84532: 'base-sepolia'
      }
      const chain = chains[chainId ?? state.networkId] || 'ethereum'
      const addr = contract || getters.contractAddr
      const path = token ? `/item/${chain}/${addr}/${token}`
        : account ? `/${account}`
          : ''
      return 'https://opensea.io' + path
    },
    meta: state => ({ title, descrip, img }) => {
      const meta = []
      // defaults
      const siteTitle = 'Folia'
      const siteDescrip = 'Seeding NFT collections since 11860832 𐡸'
      const siteImg = 'https://www.folia.app/folia-logo-twitter-black.png'
      // custom
      title = title ? `${title}` : siteTitle
      descrip = descrip || siteDescrip
      img = img || siteImg
      // add
      meta.push({ property: 'og:title', content: title })
      meta.push({ property: 'og:site_name', content: siteTitle })
      meta.push({ property: 'og:type', content: 'website' })
      meta.push({ name: 'description', content: descrip })
      meta.push({ property: 'og:description', content: descrip })
      meta.push({ property: 'og:image', content: img })
      // twitter?
      meta.push({ name: 'twitter:card', content: 'summary_large_image' })
      meta.push({ name: 'twitter:domain', content: 'folia.app' })
      // meta.push({ property: 'og:url', content: ##ADDCANNONICAL## })
      return meta
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
    SET_NETWORK_ID (state, id) {
      state.networkId = id
      console.log('network:', id)
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
    // SET_CONTRACTS (state, { web3, networkId }) {
    //   if (!web3) return new Error('web3 not defined')
    //   // folia
    //   state.foliaContract = new web3.eth.Contract(
    //     Folia.abi,
    //     Folia.networks[networkId].address
    //   )
    //   console.log('folia addr', Folia.networks[networkId].address)
    //   // controller
    //   state.foliaControllerContract = new web3.eth.Contract(
    //     FoliaControllerV2.abi,
    //     FoliaControllerV2.networks[networkId].address
    //   )
    //   console.log('controller addr', FoliaControllerV2.networks[networkId].address)
    //   // auctions
    //   if (ReserveAuction.networks[networkId]) {
    //     state.reserveAuctionContract = new web3.eth.Contract(
    //       ReserveAuction.abi,
    //       ReserveAuction.networks[networkId].address
    //     )
    //     console.log('auction addr', ReserveAuction.networks[networkId].address)
    //   }
    // },
    SET_CONTRACTS_ETHERS (state, { chainId, provider }) {
      if (!networks[chainId]) {
        console.warn(`Unsupported network: (id: ${chainId}). Default will be used for contracts (id: 1)`)
        chainId = 1
      }
      // Bind to readProvider, not the wallet's provider. The addresses already
      // fell back to mainnet for an unrecognised chain, but the provider did
      // not, which left mainnet addresses being queried on the wrong network.
      // Transactions are unaffected: they call .connect(signer) themselves.
      const readAt = networks[chainId] && chainId !== 1 ? provider : readProvider
      // folia
      state.foliaContract = new ethers.Contract(Folia.networks[chainId].address, Folia.abi, readAt)
      console.log('folia:', Folia.networks[chainId].address)
      // controller
      state.foliaControllerContract = new ethers.Contract(FoliaControllerV2.networks[chainId].address, FoliaControllerV2.abi, readAt)
      console.log('controller:', FoliaControllerV2.networks[chainId].address)
      // auctions
      // state.reserveAuctionContract = new ethers.Contract(ReserveAuction.networks[chainId].address, ReserveAuction.abi, provider)
      // console.log('auctions:', ReserveAuction.networks[chainId].address)
    },
    SAVE_ADDRESS (state, { address, ens }) {
      const addrs = JSON.parse(JSON.stringify(state.addresses))
      addrs[address.toLowerCase()] = { ens }
      state.addresses = addrs
    }
  },
  actions: {
    // setup provider -> network/contracts
    async init ({ state, commit, dispatch }) {
      // de-dupe
      if (initializing) {
        return initializing
      }

      const setup = async () => {
        try {
          // auto-connect?
          if (web3Modal.cachedProvider) {
            await dispatch('connect')
          }

          // fallback provider
          if (!provider) {
            await dispatch('setupFallbackProvider')
          }

          initializing = false
        } catch (e) {
          console.error('@init', e)
          initializing = false
          throw e
        }
      }

      // create a promise for the handler
      initializing = new Promise((resolve, reject) => setup().then(resolve).catch(reject))

      return initializing
    },

    async setupFallbackProvider ({ dispatch }) {
      try {
        const givenProvider = window.ethereum // || Web3.currentProvider || Web3.givenProvider
        if (givenProvider) {
          // metamask/browser
          provider = new ethers.providers.Web3Provider(givenProvider)
        } else {
          // no wallet: read through the redundant keyless pool
          provider = poolReadProvider()
        }

        await dispatch('getNetwork', provider)

        return true
      } catch (e) {
        console.error(e)
      }
    },

    // getNetworkId ({ commit }, provider) {
    //   return provider.getNetwork()
    //     .then(network => commit('SET_NETWORK_ID', network.chainId))
    //     .catch(console.error)
    // },

    async getNetwork ({ commit }, provider) {
      try {
        const { chainId } = await provider.getNetwork()
        // set network
        commit('SET_NETWORK_ID', chainId)
        // set contracts
        commit('SET_CONTRACTS_ETHERS', { chainId, provider })

        return chainId
      } catch (e) {
        console.error(e)
        throw e
      }
    },

    /* connect wallet */
    async connect ({ state, commit, dispatch }) {
      try {
        // connect and update provider, signer
        walletProvider = await web3Modal.connect()
        provider = new ethers.providers.Web3Provider(walletProvider)
        signer = provider.getSigner()

        // set user address
        const address = await signer.getAddress()
        commit('SIGN_IN', address)

        // set network id
        await dispatch('getNetwork', provider)

        // commit('SET_CONTRACTS', provider)

        dispatch('listenToWalletProvider')
        return
      } catch (e) {
        console.error('@connect', e)
        // clear wallet in case
        dispatch('disconnect')
        // throw error so stops any flows (closes modal too)
        throw e
      }
    },

    /* disconnect wallet */
    disconnect ({ commit, dispatch }) {
      // clear so they can re-select from scratch
      web3Modal.clearCachedProvider()
      // manually clear walletconnect --- https://github.com/Web3Modal/web3modal/issues/354
      localStorage.removeItem('walletconnect')

      // if (walletProvider.off) {
      //   walletProvider.off('accountsChanged')
      //   walletProvider.off('disconnect')
      // }

      commit('SIGN_OUT')
      dispatch('setupFallbackProvider')
      signer = null
    },

    /* wallet events */
    listenToWalletProvider ({ commit, dispatch }) {
      if (!walletProvider?.on) return

      // account changed (or disconnected)
      walletProvider.on('accountsChanged', accounts => {
        console.log('accountsChanged', accounts)
        if (!accounts.length) {
          return dispatch('disconnect')
        }
        commit('SIGN_IN', accounts[0])
      })

      // changed network
      walletProvider.on('chainChanged', chainId => {
        console.log('network changed', chainId)
        // reload page so data is correct...
        window.location.reload()
      })

      // random disconnection? (doesn't fire on account disconnect)
      walletProvider.on('disconnect', error => {
        console.error('disconnected?', error)
        dispatch('disconnect')
      })
    },

    /* setup web3, contracts */
    // async init ({ state, commit, dispatch }) {
    //   try {
    //     // auto-connect?
    //     if (web3Modal.cachedProvider) {
    //       await dispatch('connect')
    //     }

    //     // setup web3
    //     if (!web3) {
    //       if (provider) {
    //         web3 = new Web3(provider)
    //       } else {
    //         const n = process.env.NODE_ENV === 'development' ? 'rinkeby' : 'mainnet'
    //         web3 = new Web3(new Web3.providers.WebsocketProvider(networks[n].infura))
    //       }
    //     }

    //     // setup contracts
    //     const networkId = state.networkId || await web3.eth.net.getId() || networks.mainnet.id
    //     console.log('network:', networkId)
    //     commit('SET_NETWORK', networkId)
    //     commit('SET_CONTRACTS', { web3, networkId })

    //     // listen to provider events
    //     dispatch('listenToProvider')
    //   } catch (e) {
    //     console.error('@init', e)
    //   }
    // },

    getWeb3 () {
      // TODO better handler for this
      return web3
    },

    /* connect wallet */
    // async connect ({ commit, dispatch }) {
    //   try {
    //     // connect and update provider, web3
    //     provider = await web3Modal.connect()
    //     web3 = new Web3(provider)
    //     // save account
    //     const accounts = await web3.eth.getAccounts()
    //     const address = accounts[0]
    //     const networkId = await web3.eth.net.getId()
    //     // const chainId = await web3.eth.chainId(); // not a function??
    //     commit('SIGN_IN', address)
    //     commit('SET_NETWORK', networkId)
    //   } catch (e) {
    //     console.error('@connect', e)
    //     // clear in case
    //     web3Modal.clearCachedProvider()
    //   }
    // },

    /* disconnect wallet */
    // disconnect ({ commit }) {
    //   // clear so they can re-select from scratch
    //   web3Modal.clearCachedProvider()
    //   // manually remove WC so can choose new account
    //   localStorage.removeItem('walletconnect')
    //   // provider.off('accountsChanged')
    //   // provider.off('disconnect')
    //   commit('SIGN_OUT')
    // },

    /* wallet events */
    // listenToProvider ({ commit, dispatch }) {
    //   if (!provider?.on) return

    //   // account changed (or disconnected)
    //   provider.on('accountsChanged', accounts => {
    //     console.log('accountsChanged', accounts)
    //     if (!accounts.length) {
    //       return dispatch('disconnect')
    //     }
    //     commit('SIGN_IN', accounts[0])
    //   })

    //   // changed network
    //   provider.on('chainChanged', chainId => {
    //     console.log('network changed', chainId)
    //     // reload page so data is correct...
    //     window.location.reload()
    //   })

    //   // random disconnection? (doesn't fire on account disconnect)
    //   provider.on('disconnect', error => {
    //     console.error('disconnected?', error)
    //     dispatch('disconnect')
    //   })
    // },

    /* buy artwork */
    // async buy ({ state, dispatch }, workId) {
    //   try {
    //     const work = await dispatch('getWork', { id: workId, flush: true })
    //     // !! unavailable
    //     if (!work.exists) throw new Error(`!! Work ${workId} doesn't exist`)
    //     if (Number(work.printed) >= Number(work.editions)) throw new Error(`!! Work ${workId} is sold out`)
    //     if (work.paused) throw new Error(`!! Work ${workId} is locked. Please wait for release or try again shortly.`)
    //     // wallet connected ?
    //     if (!state.address) {
    //       await dispatch('connect')
    //     }
    //     // buy
    //     await state.foliaControllerContract.methods
    //       .buy(state.address, workId)
    //       .send({ from: state.address, value: work.price })
    //     // refresh work data for app
    //     dispatch('getWork', { id: workId, flush: true })
    //   } catch (e) {
    //     console.error('@buy:', e)
    //     // track
    //     exception({ description: `@buy: ${e.message}`, fatal: false })
    //     // TODO - more elegant UX error ?
    //     if (e.message?.includes('!! ')) {
    //       alert(e.message.replace('!! ', ''))
    //     }
    //   }
    // },

    /* buy artwork */
    async buy ({ state, dispatch, rootGetters }, workId) {
      try {
        const work = await dispatch('getWork', { id: workId, flush: true })
        // !! unavailable
        if (!work.exists) throw new Error(`!! Work ${workId} doesn't exist`)
        if (Number(work.printed) >= Number(work.editions)) throw new Error(`!! Work ${workId} is sold out`)
        if (work.paused) throw new Error(`!! Work ${workId} is locked. Please wait for release or try again shortly.`)

        // TODO insuff balance

        // wallet connected ?
        if (!state.address || !signer) await dispatch('connect')

        // !! insufficient balance
        const balance = await rootGetters.userBalance()
        if (bn.from(balance).lt(work.price)) throw new Error(`!! Insufficient funds in your wallet\n${state.address}`)

        // sign...
        const contractSigner = state.foliaControllerContract.connect(signer)
        // tx
        return contractSigner.buy(state.address, workId, { value: work.price })

        // refresh work data for app
        // dispatch('getWork', { id: workId, flush: true })
      } catch (e) {
        console.error('@buy:', e)
        // track
        exception({ description: `@buy: ${e.message}`, fatal: false })
        // TODO - more elegant UX error ?
        if (e.message?.includes('!! ')) {
          alert(e.message.replace('!! ', ''))
        }
      }
    },

    /* buy by ID */
    // async buyByID ({ state, dispatch, rootGetters }, { tokenId }) {
    //   try {
    //     const workId = Math.floor(tokenId / 1000000)
    //     const workSpace = workId * 1000000
    //     const editionId = tokenId - workSpace
    //     const bn = mixed => new web3.utils.BN(mixed)

    //     const work = await dispatch('getWork', { id: workId, flush: true })
    //     // !! unavailable
    //     if (!work.exists) throw new Error(`!! Work ${workId} doesn't exist`)
    //     // !! paused
    //     if (work.paused) throw new Error(`!! Work ${workId} is locked. Please wait for release or try again shortly.`)

    //     // wallet connected ?
    //     if (!state.address) {
    //       await dispatch('connect')
    //     }

    //     // !! not enough ETH
    //     const balance = await rootGetters.userBalance()
    //     const insufficientFunds = bn(balance).lt(bn(work.price))
    //     if (insufficientFunds) throw new Error(`!! Insufficient funds in your wallet\n${state.address}`)

    //     // buy
    //     await state.foliaControllerContract.methods
    //       .buyByID(state.address, workId, editionId)
    //       .send({ from: state.address, value: work.price })
    //     // refresh work data for app
    //     dispatch('getWork', { id: workId, flush: true })
    //   } catch (e) {
    //     console.error('@buyByID:', e)
    //     // track
    //     exception({ description: `@buyByID: ${e.message}`, fatal: false })
    //     // TODO - more elegant UX error ?
    //     if (e.message?.includes('!! ')) {
    //       alert(e.message.replace('!! ', ''))
    //     }
    //   }
    // },

    /* buy token by id */
    async buyByID ({ state, dispatch, rootGetters }, { tokenId }) {
      try {
        const workId = Math.floor(tokenId / 1000000) // 12
        const workSpace = workId * 1000000 // 12000000
        const editionId = tokenId - workSpace // 1

        // get work...
        const work = await dispatch('getWork', { id: workId, flush: true })

        // !! unavailable
        if (!work.exists) throw new Error(`!! Work ${workId} doesn't exist`)
        // !! paused
        if (work.paused) throw new Error(`!! Work ${workId} is locked. Please wait for release or try again shortly.`)

        // wallet connected ?
        if (!state.address || !signer) await dispatch('connect')

        // !! not enough ETH
        const balance = await rootGetters.userBalance()
        if (bn.from(balance).lt(work.price)) throw new Error(`!! Insufficient funds in your wallet\n${state.address}`)

        // sign...
        const contractSigner = state.foliaControllerContract.connect(signer)
        // tx
        return contractSigner.buyByID(state.address, workId, editionId, { value: work.price })

        // refresh work data for app
        // dispatch('getWork', { id: workId, flush: true })
      } catch (e) {
        console.error('@buyByID:', e)
        // track
        exception({ description: `@buyByID: ${e.message}`, fatal: false })
        // TODO - more elegant UX error ?
        if (e.message?.includes('!! ')) {
          alert(e.message.replace('!! ', ''))
        }
      }
    },

    /* read artwork */
    // async getWork ({ state, commit }, { id, flush }) {
    //   let work = state.works.find(work => work.id === id)
    //   if (!flush && work) return work

    //   if (!state.foliaControllerContract) {
    //     console.warn('controller not set yet')
    //     return
    //   }
    //   // get new data
    //   if (id && !isNaN(id)) {
    //     try {
    //       work = await state.foliaControllerContract.methods.works(id).call()
    //       work = { id, ...work } // add id
    //       commit('SAVE_WORK', work)
    //     } catch (e) {
    //       console.error('@getWork', e)
    //     }
    //   }
    //   return work
    // },

    /* read work from chain */
    async getWork ({ state, commit, dispatch }, { id, flush }) {
      try {
        // saved?
        let work = state.works.find(work => work.id === id)
        if (!flush && work) return work

        // !! invalid id
        if (!id || isNaN(id)) {
          return null
        }

        if (!state.foliaControllerContract) {
          await dispatch('init')
        }

        // fetch...
        work = await state.foliaControllerContract.works(id)
        work = { id, ...work } // add id
        // save
        commit('SAVE_WORK', work)
        return work
      } catch (e) {
        console.warn('@getWork', e)
        return null
      }
    },

    /* get metadata of work (if released) */
    async getMetadata ({ state, commit }, { token, work, isViewer = false }) {
      try {
        const numericWork = Number(work)
        if (!token && isNaN(numericWork)) {
          return null
        }

        token = token || (numericWork * 1000000)
        work = work || Math.floor(Number(token) / 1000000)
        token = Number(token)

        // !! is not a number
        if (isNaN(token)) throw new Error(`Token ID is not a number: ${token}`)

        // return saved ?
        const saved = state.metadatas.find(metadata => metadata._token === token)
        const now = new Date().getTime()
        const release = saved && saved.release && new Date(saved.release).getTime()
        const hasSinceReleased = release && release > 0 && now >= release
        if (saved && !hasSinceReleased) {
          return saved
        }
        // fetch new
        // query parameters
        let params = []
        if (state.networkId) params.push(`network=${state.networkId}`)
        if (isViewer) params.push('viewer=1')
        params = params.length ? '?' + params.join('&') : ''
        const url = `/.netlify/functions/metadata/${token}${params}`
        // go!
        let metadata = await fetch(url).then(resp => resp.json())
        // process
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

    // /* get owner by token id */
    // async getNFTOwnerByTokenId ({ state, commit }, tokenId) {
    //   try {
    //     const token = state.tokens.find(token => token[0] === tokenId) || []
    //     let owner = token && token[1]
    //     if (owner) return owner
    //     // get new data
    //     if (state.foliaContract) {
    //       owner = await state.foliaContract.methods.ownerOf(tokenId).call()
    //       commit('SAVE_TOKEN', [tokenId, owner])
    //       return owner
    //     }
    //     return null
    //   } catch (e) {
    //     // seems to error if token doesn't exist...
    //     console.error("get owner error / token doesn't exist?", tokenId, e)
    //     return 0
    //   }
    // }

    /* read owner by token id from chain */
    async getNFTOwnerByTokenId ({ state, commit, dispatch }, tokenId) {
      try {
        // saved?
        const token = state.tokens.find(token => token[0] === tokenId) || []
        let owner = token && token[1]
        if (owner) return owner
        // fetch...
        if (!state.foliaContract) await dispatch('init')
        owner = await state.foliaContract.ownerOf(tokenId)
        // save
        commit('SAVE_TOKEN', [tokenId, owner])
        return owner
      } catch {
        // seems to error if token doesn't exist...
        console.warn(`get owner error / token doesn't exist? (${tokenId})`)
        return 0
      }
    },

    // method for signing typed data
    // web3.js currently has no method (v1.7)
    // adapted from this guide:
    // * https://medium.com/metamask/scaling-web3-with-signtypeddata-91d6efc8b290
    async signMessage ({ state, dispatch }, message = 'Please sign this message to continue.') {
      try {
        if (!state.address) await dispatch('connect')

        // build msg(s)
        const msgParams = [
          {
            type: 'string', // Any valid solidity type
            name: 'Message', // Any string label you want
            value: message // The value to sign
          }
          // {
          //   type: 'uint32',
          //      name: 'A number',
          //      value: '1337'
          //  }
        ]

        // sign...
        return new Promise((resolve, reject) => {
          web3.currentProvider.sendAsync({
            method: 'eth_signTypedData',
            params: [msgParams, state.address],
            from: state.address
          }, (err, result) => {
            // errors
            err = err || result.error
            if (err) {
              reject(err)
            }
            console.log('Signed message: ', result)
            // return signature
            resolve({ msgParams, signature: result.result })
          })
        })
      } catch (e) {
        console.error(e)
        throw e
      }
    },

    async signMessageEthers ({ state, dispatch }, message = 'Please sign this message to continue.') {
      try {
        if (!signer) await dispatch('connect')

        // const provider = new ethers.providers.Web3Provider(window.ethereum)

        // MetaMask requires requesting permission to connect users accounts
        // await provider.send("eth_requestAccounts", []);

        // const signer = provider.getSigner()

        // message = 'hello world'
        const signature = await signer.signMessage(message)
        console.log({ signature })

        return { signature }
      } catch (e) {
        console.error(e)
        throw e
      }
    },

    async resolveAddress ({ state, getters, commit, dispatch }, { address }) {
      try {
        // sanitize
        address = (address || '').toLowerCase()
        // saved?
        const saved = state.addresses[address]
        if (saved && saved.ens !== undefined) {
          return saved
        }

        // fetch new...
        if (!provider) await dispatch('init')
        const ens = await provider.lookupAddress(address)

        // save even if null so we don't have to lookup again
        commit('SAVE_ADDRESS', { address, ens })

        // if (ens) {
        //   // get records async...
        //   const resolver = await provider.getResolver(ens)
        //   const records = ['avatar', 'url', 'com.twitter', 'vnd.twitter', 'com.github', 'vnd.github', 'com.discord', 'vnd.discord']
        //   // records...
        //   records.forEach(name => {
        //     resolver.getText(name)
        //       .then(value => commit('SAVE_ADDRESS_RECORD', { address, record: { name, value } }))
        //       // .catch(e => console.error(`Error getting ENS text record (${name} from ${ens}): ` + e ))
        //   })
        // }

        return { ens }
      } catch (e) {
        console.error(e)
        return null
      }
    }
  }
})
