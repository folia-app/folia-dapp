import Vue from 'vue'
import { loadDocs } from './resilient'

const vue = new Vue()

export default {
  namespaced: true,
  state: {
    docs: []
  },
  getters: {
    works (state) {
      return state.docs.filter(doc => doc.type === 'work')
    },
    auctions (state) {
      return state.docs.filter(doc => doc.type === 'auction')
    },
    isReleased: (state) => ({ uid, doc }) => {
      doc = doc || state.docs.find(doc => doc.uid === uid && doc.type === 'work')
      const time = doc?.data?.release_link?.data?.release_time
      return !time ? true
        : new Date(time).getTime() < new Date().getTime()
    }
  },
  mutations: {
    setDocs (state, docs) {
      state.docs = docs
    }
  },
  actions: {
    async getDocs ({ commit }) {
      const resp = await prismic('', {
        pageSize: 100,
        fetchLinks: FETCH_LINKS
      })
      // prismic() logs and returns undefined when the API fails, so reading
      // .results off it threw an uncaught TypeError and left the app with no
      // documents and no indication why. Leave the existing docs alone instead.
      if (!resp?.results) return
      commit('setDocs', resp.results)
    },

    /**
     * getDocs, but backed by the cache and the build-time snapshot.
     *
     * Not dispatched anywhere yet -- App.vue still calls getDocs. This is here
     * to be exercised and watched before it takes over; swapping them is a
     * one-line change once there is confidence in it.
     */
    async getDocsResilient ({ commit }) {
      const { results, source } = await loadDocs(() =>
        vue.$prismic.client.query('', { pageSize: 100, fetchLinks: FETCH_LINKS }))
      if (results.length) commit('setDocs', results)
      return source
    },

    async getWork ({ state }, uid) {
      const saved = state.docs.find(doc => doc.uid === uid && doc.type === 'work')
      return saved || (await prismic(vue.$prismic.Predicates.at('my.work.uid', uid), { fetchLinks: ['set.title', 'release.release_time'] }))?.results[0]
    }
  }
}

// HELPERS

// One definition, because scripts/snapshot-prismic.js has to bake the same
// shape this asks for; a snapshot built from a different query is not a
// stand-in for this one.
export const FETCH_LINKS = ['set.title', 'work.title', 'release.release_time', 'work.release_link', 'work.page_layout', 'auction.release_link', 'work.status']

export const prismic = async (qry, options) => {
  try {
    return await vue.$prismic.client.query(qry, options)
  } catch (e) {
    console.error('Prismic API Error:', e)
  }
}
