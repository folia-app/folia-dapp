export default {
  namespaced: true,
  state: {
    auctions: []
  },

  getters: {
    contract (state, getters, rootState) {
      return rootState.reserveAuctionContract
    }
  },

  mutations: {
    SAVE_AUCTION (state, auction) {
      state.auctions.push(auction)
    }
  },

  actions: {
    async get ({ state, getters, commit }, { token, flush = false }) {
      try {
        // saved ?
        let auction = state.auctions.find(auc => auc._tokenId === token)
        // ...fetch
        if (!auction || flush) {
          // !! contract missing
          if (!getters.contract) {
            console.warn('contract not set')
            return auction
          }
          // fetch...
          auction = await getters.contract.methods.auctions(token).call()
          // save
          if (auction) {
            // format
            auction = { _tokenId: token, ...auction }
            // save
            commit('SAVE_AUCTION', auction)
          }
        }
        return auction
      } catch (e) {
        console.error(e)
      }
    },

    async bid ({ state, getters, dispatch, rootState }, { token, wei }) {
      try {
        const auction = await dispatch('get', { token, flush: true })

        // !! auction doesn't exist
        if (!auction.exists) throw new Error(`!! Auction for FLA-${token} doesn't exist.`)
        // auction expired ?
        // if (Number(auction.amount) && )
        // !! less than reserve price
        if (wei < Number(auction.reservePrice)) throw new Error('!! Your bid is below the minimum. Please increase your bid.')
        // !! less than current bid
        if (wei <= Number(auction.amount)) throw new Error('!! Your bid must exceed the current bid. Please increase your bid.')

        // bid !
        await getters.contract.methods
          .createBid(token)
          .send({ from: rootState.address, value: wei })

        // refresh auction
        // dispatch('get', { token, flush: true })

      // errors...
      } catch (e) {
        console.error('@bid:', e)
        // TODO - more elegant UX error ?
        if (e.message?.includes('!! ')) {
          alert(e.message.replace('!! ', ''))
        }
      }
    }
  }
}

// HELPERS
