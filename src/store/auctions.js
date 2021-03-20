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
      // !! no auction or hasn't started
      if (!auction || !Number(auction.firstBidTime)) {
        return false
      }
      // compare to now
      const timeMs = getters.auctionEndTimeMs({ auction })
      return timeMs && timeMs < new Date().getTime()
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
    async get ({ state, getters, commit }, { token }) {
      try {
        // saved ?
        let auction = state.auctions.find(auc => auc._tokenId === token)
        // auction ended? use saved
        if (getters.auctionEnded({ auction })) {
          return auction
        }
        // ...fetch
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
        return auction
      } catch (e) {
        console.error(e)
      }
    },

    async bid ({ state, getters, dispatch, rootState, rootGetters }, { token, wei }) {
      try {
        const auction = await dispatch('get', { token, flush: true })
        const globalPaused = await dispatch('getGlobalPaused')

        // !! all auctions paused
        if (globalPaused) throw new Error('!! Auctions are currently locked. Please wait for release or try again shortly.')

        // !! auction doesn't exist
        if (!auction.exists) throw new Error(`!! Auction for FLA-${token} doesn't exist.`)

        // !! paused
        if (auction.paused) throw new Error(`!! Auction for FLA-${token} is locked. Please wait for release or try again shortly.`)

        // !! auction expired
        if (getters.auctionEnded({ auction })) throw new Error('!! Auction has ended!')

        // !! less than reserve price
        if (wei < Number(auction.reservePrice)) throw new Error('!! Your bid is below the minimum. Please increase your bid.')

        // !! bid below minimum
        const minWei = Number(auction.amount) + state.minBidWei
        const minETH = rootGetters.weiToETH(minWei.toString())
        if (wei < minWei) throw new Error(`!! Minimum bid is ${minETH} ETH. Please increase your bid.`)

        // connected wallet ?
        if (!rootState.address) {
          await dispatch('connect', null, { root: true })
        }

        // !! low time confirmation
        const hasStarted = Number(auction.firstBidTime)
        const endingSoon = getters.auctionEndTimeMs({ auction }) - new Date().getTime() <= state.lowTimeMin * 60 * 1000
        if (hasStarted && endingSoon) {
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
    },

    async getGlobalPaused ({ getters }) {
      let paused
      try {
        if (getters.contract) {
          paused = await getters.contract.methods.globalPaused().call()
        }
      } catch (e) {
        console.error(e)
      }
      return paused
    }
  }
}

// HELPERS
