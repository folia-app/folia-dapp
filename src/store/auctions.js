export default {
  namespaced: true,
  state: {
    auctions: [],
    minBidWei: 1 * 10 ** 17, // 0.1 ETH - refer to contract
    lowTimeMin: 2
  },

  getters: {
    contract (state, getters, rootState) {
      return rootState.reserveAuctionContract
    },
    auctionEnded: (state, getters) => ({ tokenId, auction }) => {
      auction = auction || state.auctions.find(auc => auc._tokenId === tokenId)
      const time = getters.auctionEndTimeMs({ auction })
      // console.log(time, new Date().getTime())
      return time && time < new Date().getTime()
    },
    auctionEndTimeMs: (state) => ({ tokenId, auction }) => {
      auction = auction || state.auctions.find(auc => auc._tokenId === tokenId)
      let time
      if (auction) {
        time = Number(auction.firstBidTime) + Number(auction.duration) // seconds
        time = time * 1000 // milliseconds (for counters)
      }
      return time
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

        // !! auction expired
        if (getters.auctionEnded({ auction })) throw new Error('!! Auction has ended!')

        // !! less than reserve price
        if (wei < Number(auction.reservePrice)) throw new Error('!! Your bid is below the minimum. Please increase your bid.')

        // !! min bid step (0.1)
        if (wei < Number(auction.amount) + state.minBidWei) throw new Error('!! Your bid is below the minimum. Please increase your bid.')

        // connected wallet ?
        if (!rootState.address) {
          await dispatch('connect', null, { root: true })
        }

        // !! low time confirmation
        const endingSoon = getters.auctionEndTimeMs({ auction }) - new Date().getTime() <= state.lowTimeMin * 60 * 1000
        if (endingSoon) {
          if (!window.confirm('This auction is ending very soon! There is a high chance your bid will result in an error. Continue?')) {
            throw new Error('User cancelled bid because low time')
          }
        }

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
