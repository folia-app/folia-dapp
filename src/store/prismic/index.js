import Vue from 'vue'

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
      doc = doc || state.docs.find(doc => doc.uid === uid)
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
        fetchLinks: ['set.title', 'work.title', 'release.release_time', 'work.release_link', 'work.page_layout', 'auction.release_link', 'work.status']
      })
      commit('setDocs', resp.results)
    },

    async getWork ({ state }, uid) {
      const saved = state.docs.find(doc => doc.uid === uid)
      return saved || (await prismic(vue.$prismic.Predicates.at('my.work.uid', uid), { fetchLinks: ['set.title', 'release.release_time'] }))?.results[0]
    }
  }
}

// HELPERS

export const prismic = async (qry, options) => {
  try {
    return await vue.$prismic.client.query(qry, options)
  } catch (e) {
    console.error('Prismic API Error:', e)
  }
}
