<template lang="pug">
  section.work-tokens.relative.text-black.text-sm.lg_text-md
    h3.sr-only Tokens
    //- (sort / view all)
    nav.absolute.z-20.top-0.right-0.p-8.pb-12.text-white.transform.-translate-y-full.text-md
      //- (clear filter)
      button.focus_outline-none(v-if="$route.params.token", @click="$router.replace({name: 'work', params: { work: doc.uid }})")
        btn.px-8.md_px-12(theme="drkgray") VIEW ALL
      //- sort
      button.focus_outline-none.py-6.px-4.lg_mr-6(@click="changeSort", v-else-if="tokensFiltered.length > 10")
        //- btn.px-8.bg-black-a30.uppercase.text-md.opacity-50(theme="drkgray") {{ $route.query.sort || 'RECENT' }}
        .border-t.border-r.border-white.transform.h-6.w-6(:class="$route.query.sort ? '-rotate-45 translate-y-1' : 'rotate-135 -translate-y-1'")

    //- grid
    .w-full.grid(:class="[gridCols]")
      //- buy block
      //- div(v-if="canBuy")
        .relative.pb-full.overflow-hidden
          //- (teaser video as background)
          video.absolute.overlay.object-cover.object-contain.opacity-25(:src="doc.data.teaser_video.url", loop, playsinline, muted, autoplay)
          //- buy btn
          button.absolute.overlay.flex.items-center.justify-center.pb-6.pr-6.focus_outline-none(@click="$emit('buy')", style="mix-blend-mode:difference;backdrop-filter:blur(10px)")
            <svg style="width:50%" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
              <line x1="10.165" y1="10.1227" x2="94.7885" y2="94.7462" stroke="rgb(255,255,255,0.8)" stroke-width="0.75" />
              <line x1="54.9753" y1="10.8298" x2="10.165" y2="55.6401" stroke="rgb(255,255,255,0.8)" stroke-width="0.75" />
              <line x1="32.8277" y1="64.3025" x2="32.8277" y2="0.931187" stroke="rgb(255,255,255,0.8)" stroke-width="0.75" />
              <line x1="0.530937" y1="32.8311" x2="63.9023" y2="32.8311" stroke="rgb(255,255,255,0.8)" stroke-width="0.75" />
            </svg>

      //- tokens...
      squishy-thumb-token(v-for="(token, i) in tokensFiltered", :token="token", :key="token.image")

    //- lazyloader
    observer.w-full(:style="{height: '200vh', marginTop: tokensFiltered.length > 12 ? '-50vh' : '0'}", :threshold="0.01", @visible="loadTokens", v-if="tokens && limit < tokens.length")
</template>

<script>
import { mapState } from 'vuex'
import SquishyThumbToken from '@/components/SquishyThumbToken'
import Btn from '@/components/Btn'
import Observer from '@/components/Observer'
export default {
  name: 'WorkTokens',
  props: {
    doc: { type: Object, default: undefined },
    canBuy: { type: Boolean, default: false }
  },
  data () {
    return {
      tokens: null,
      listening: false,
      limit: 12
    }
  },
  computed: {
    ...mapState(['networkId', 'foliaControllerContract']),
    tokensFiltered () {
      // filter by one?
      const id = this.$route.params.token
      if (id) {
        return this.tokens?.filter(tkn => tkn.tokenId === id)
      }

      // ...else
      let tokens = this.tokens?.slice() || []
      // sort
      if (this.$route.query.sort === 'index') {
        tokens.sort((a, b) => a.tokenId < b.tokenId ? -1 : 0)
      }
      // limited ?
      tokens = tokens.slice(0, this.limit)
      return tokens
    },
    gridCols () {
      return this.doc.data?.grid === '2 cols' ? 'grid-cols-1 md_grid-cols-2 xl_grid-cols-3'
        : 'grid-cols-2 md_grid-cols-3 xl_grid-cols-4'
    }
  },
  methods: {
    async getTokens () {
      if (!this.networkId) return console.warn('no network')
      try {
        let resp = await fetch(`/.netlify/functions/work/${this.doc.uid}?network=${this.networkId}`)
        resp = await resp.json()
        this.tokens = resp.tokens?.reverse()
      } catch (e) {
        console.error('@getTokens', e)
      }
    },
    listenToContract () {
      if (!this.listening && this.foliaControllerContract && this.canBuy) {
        this.foliaControllerContract.events
          .editionBought()
          .on('data', this.onEditionBought)
          .on('error', (error) => console.error(error))
        this.listening = true
        console.log('listening!')
      }
    },
    onEditionBought (event) {
      // re-fetch tokens if bought from current work
      if (event.returnValues?.workId === this.doc?.uid) {
        this.getTokens()
      }
    },
    changeSort () {
      const query = { ...this.$route.query }
      query.sort = !query.sort ? 'index' : undefined // TODO: add "you" ?
      // no query if default
      if (!query.sort) delete query.sort
      this.resetLimit()
      this.$router.replace({ query })
    },
    resetLimit () {
      this.limit = 12
    },
    loadTokens () {
      this.limit = this.limit + 12
    }
  },
  created () {
    this.getTokens()
    this.listenToContract()
  },
  watch: {
    networkId () {
      this.getTokens()
    },
    foliaControllerContract () {
      this.listenToContract()
    },
    canBuy () {
      this.listenToContract()
    }
  },
  components: { SquishyThumbToken, Btn, Observer }
}
</script>

<style>
</style>
