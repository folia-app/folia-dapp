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
      //- slice body (manually added tokens)
      //- template(v-if="doc && doc.data.tokens_body.length")
        //- slices...
        template(v-for="slice in doc.data.tokens_body")
          //- (token grid)
          template(v-if="slice.slice_type === 'token_grid'")
            ul.text-white
              li.flex.w-full.items-center.justify-between(v-for="item in slice.items")
                div {{ item.token_id }}
                div {{ doc.data.price_eth }}ETH
                btn.px-8.md_px-12(theme="drkgray", @click="$store.dispatch('buyByID', {tokenId: 10000000})") BUY

      //- default / API
      //- template(v-else)

      //- tokens...
      squishy-thumb-token(v-for="(token, i) in tokensFiltered", :token="token", :key="token.tokenId", :buyBtn="doc.data.sale_type === 'buy by ID'", :isMutative="doc.data.mutative_edition === true")

      //- buy block
      div(v-if="canBuy && doc.data.sale_type === 'generative'")
        .relative.pb-full.overflow-hidden.bg-gray-900
          //- (teaser video as background)
          video.absolute.overlay.object-cover.object-contain.opacity-25(:src="doc.data.teaser_video.url", loop, playsinline, muted, autoplay, v-if="work.printed === '0'")
          //- buy btn
          button.absolute.overlay.flex.items-center.justify-center.pb-6.pr-6.focus_outline-none(@click="$emit('buy')", :style="work.printed === '0' && 'mix-blend-mode:difference;backdrop-filter:blur(10px)'")
            <svg style="width:50%" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
              <line x1="10.165" y1="10.1227" x2="94.7885" y2="94.7462" stroke="rgb(255,255,255,0.8)" stroke-width="0.75" />
              <line x1="54.9753" y1="10.8298" x2="10.165" y2="55.6401" stroke="rgb(255,255,255,0.8)" stroke-width="0.75" />
              <line x1="32.8277" y1="64.3025" x2="32.8277" y2="0.931187" stroke="rgb(255,255,255,0.8)" stroke-width="0.75" />
              <line x1="0.530937" y1="32.8311" x2="63.9023" y2="32.8311" stroke="rgb(255,255,255,0.8)" stroke-width="0.75" />
            </svg>

      //- .flex-1.flex.items-center.justify-center(v-else)
        svg-fleuron.text-gray-800.h-24.xl_h-32

    //- lazyloader
    observer.w-full(:style="{height: '200vh', marginTop: tokensFiltered.length > 12 ? '-50vh' : '0'}", :threshold="0.01", @visible="loadTokens", v-if="tokens && limit < tokens.length")
</template>

<script>
import { mapState } from 'vuex'
import SquishyThumbToken from '@/components/SquishyThumbToken'
import Btn from '@/components/Btn'
import Observer from '@/components/Observer'
import SvgFleuron from '@/components/SVG-Fleuron'
export default {
  name: 'WorkTokens',
  props: {
    doc: { type: Object, default: undefined },
    work: Object,
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
      // const id = this.$route.params.token
      // if (id) {
      //   return this.tokens?.filter(tkn => tkn.tokenId === id)
      // }

      // ...else
      let tokens = this.tokens?.slice() || []
      // sort
      if (this.$route.query.sort !== 'index' && this.isGenerative) {
        tokens.sort((a, b) => a.tokenId > b.tokenId ? -1 : 0)
      }
      // limited ?
      tokens = tokens.slice(0, this.limit)
      return tokens
    },
    gridCols () {
      // custom classes
      if (this.doc.data.grid_classes_custom) {
        return this.doc.data.grid_classes_custom
      }
      // default
      const grids = {
        '2 cols': 'grid-cols-1 md_grid-cols-2 xl_grid-cols-3',
        '3 cols': 'grid-cols-2 md_grid-cols-3 xl_grid-cols-4',
        '4 cols': 'grid-cols-3 md_grid-cols-4 xl_grid-cols-5',
        '5 cols': 'grid-cols-3 sm_grid-cols-4 md_grid-cols-5 xl_grid-cols-6'
      }
      const cols = this.doc.data?.grid || '3 cols'
      return grids[cols]
    },
    isGenerative () {
      return this.doc.data.sale_type === 'generative' || this.doc.data.page_layout === 'generative'
    }
  },
  methods: {
    async getTokens () {
      if (!this.networkId) return console.warn('no network')
      let endpoint = `/.netlify/functions/work/${this.doc.uid}` // default
      endpoint = this.doc.data.tokens_endpoint || endpoint // custom ?
      try {
        let resp = await fetch(`${endpoint}?network=${this.networkId}`)
        resp = await resp.json()
        this.tokens = resp.tokens // ?.reverse()
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
        // delay in case media is being generated
        setTimeout(() => {
          this.getTokens()
          this.$emit('newToken')
        }, 3000)
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
  components: { SquishyThumbToken, Btn, Observer, SvgFleuron }
}
</script>

<style>
</style>
