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
    async get ({ state, getters, commit }, token) {
      try {
        // saved ?
        let auction = state.auctions.find(auc => auc._tokenId === token)
        // ...fetch
        if (!auction) {
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

    bid ({ getters }) {
      // if (!getters.contract) return console
      // try {
      //   if ()
      // } catch (e) {
      //   console.error(e)
      // }
    }
  }
}

// HELPERS
