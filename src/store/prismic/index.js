import Vue from 'vue'

const vue = new Vue()

export default {
  namespaced: true,
  state: {
    works: []
  },
  mutations: {
    setWorks (state, docs) {
      state.works = docs
    }
  },
  actions: {
    async getWorks ({ commit }) {
      const resp = await prismic(vue.$prismic.Predicates.at('document.type', 'work'))
      commit('setWorks', resp.results)
    },
    async getWork ({ state }, uid) {
      const saved = state.works.find(doc => doc.uid === uid)
      return saved || (await prismic(vue.$prismic.Predicates.at('my.work.uid', uid)))?.results[0]
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
