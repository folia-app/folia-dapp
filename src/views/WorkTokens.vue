<template lang="pug">
  .work-tokens.relative.flex.flex-wrap.align-start.text-black.text-sm.lg_text-md
    nav.absolute.z-20.top-0.right-0.p-8.pb-12.text-white.transform.-translate-y-full.text-md
      //- (clear filter)
      button.focus_outline-none(v-if="$route.params.token", @click="$router.replace({name: 'work', params: { work: doc.uid }})")
        btn.px-8.md_px-12(theme="drkgray") VIEW ALL
      //- sort
      button.focus_outline-none.py-2.px-4.lg_mr-6(@click="changeSort", v-else-if="tokensFiltered.length > 20")
        //- btn.px-8.bg-black-a30.uppercase.text-md.opacity-50(theme="drkgray") {{ $route.query.sort || 'RECENT' }}
        .border-t.border-r.border-white.transform.h-6.w-6(:class="$route.query.sort ? '-rotate-45 translate-y-1' : 'rotate-135 -translate-y-1'")

    //- buy block
    .w-1x2.md_w-1x3.xl_w-1x4(v-if="canBuy")
      .relative.pb-full.overflow-hidden
        //- (teaser video as background)
        video.absolute.overlay.object-cover.object-contain.opacity-25.transform.scale-180(:src="doc.data.teaser_video.url", loop, playsinline, muted, autoplay, @loadedmetadata="$event => $event.target.playbackRate = 0.25")
        //- buy btn
        button.absolute.overlay.flex.items-center.justify-center.pb-6.pr-6(@click="$emit('buy')", style="mix-blend-mode:difference")
          <svg style="width:50%" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
            <line x1="10.165" y1="10.1227" x2="94.7885" y2="94.7462" stroke="rgb(255,255,255,0.8)"/>
            <line x1="54.9753" y1="10.8298" x2="10.165" y2="55.6401" stroke="rgb(255,255,255,0.8)"/>
            <line x1="32.8277" y1="64.3025" x2="32.8277" y2="0.931187" stroke="rgb(255,255,255,0.8)"/>
            <line x1="0.530937" y1="32.8311" x2="63.9023" y2="32.8311" stroke="rgb(255,255,255,0.8)"/>
          </svg>
    //- tokens
    template(v-for="n in 1")
      .w-1x2.md_w-1x3.xl_w-1x4(v-for="(token, i) in tokensFiltered", v-if="i < limit", :key="token.image + n")
        //- .pb-full.border.border-white
        squishy-thumb-token(:token="token")
        //- squishy-thumb
          resp-img(slot="media", :bg="true", :image="{src: token.image}")
          //- inner content
          .absolute.overlay.flex.items-center.justify-center.group
            //- router-link.absolute.overlay(:to="{name: 'view-token', params: {token: token.tokenId}}", style="cursor: zoom-in")
            a.relative.z-10(:href="$store.getters.openSeaLink({token: token.tokenId})", target="_blank", rel="noopener noreferrer")
              btn.px-8.hover_bg-black-a15(theme="none") {{ token.tokenId.slice(-3) }}
            //- view large
            router-link.absolute.bottom-0.right-0.py-3.px-4.opacity-0.group-hover_opacity-100(:to="{name: 'view-token', params: {token: token.tokenId}}")
              btn.px-6.hover_bg-black-a15(size="small", theme="none")
                <svg style="display:block;width:3rem" viewBox="0 0 512 512" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio>
                  <g fill="currentColor">
                    <path d="m34,256l26.2,26.2c108,108 283.7,108 391.7,0l26.1-26.2-26.2-26.2c-108-108-283.7-108-391.7,0l-26.1,26.2zm222,126.2c-75.8,0-151.6-28.9-209.3-86.6l-32.9-32.9c-3.7-3.7-3.7-9.7 0-13.5l32.9-32.9c115.4-115.4 303.2-115.4 418.6,0l32.9,32.9c3.7,3.7 3.7,9.7 0,13.5l-32.9,32.9c-57.7,57.7-133.5,86.6-209.3,86.6z"/>
                    <path d="m256,183.5c-40,0-72.5,32.5-72.5,72.5s32.5,72.5 72.5,72.5c40,0 72.5-32.5 72.5-72.5s-32.5-72.5-72.5-72.5zm0,164c-50.5,0-91.5-41.1-91.5-91.5 0-50.5 41.1-91.5 91.5-91.5s91.5,41.1 91.5,91.5c0,50.5-41,91.5-91.5,91.5z"/>
                  </g>
                </svg>
      observer.w-full(style="height:200vh;margin-top:-50vh", :threshold="0.01", @visible="loadTokens", v-if="limit < tokensFiltered.length")
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
    canBuy: { type: Boolean, default: true }
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
      const tokens = this.tokens?.slice() || []
      // filter by one?
      const id = this.$route.params.token
      if (id) {
        return tokens.filter(tkn => tkn.tokenId === id)
      }
      // sort
      if (this.$route.query.sort === 'index') {
        tokens.sort((a, b) => a.tokenId < b.tokenId ? -1 : 0)
      }
      return tokens
    }
  },
  methods: {
    async getTokens () {
      console.log('get')
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
      if (this.foliaControllerContract && !this.listening && this.canBuy) {
        this.foliaControllerContract.events
          .editionBought()
          .on('data', this.onEditionBought)
          .on('error', (error) => console.error(error))
        this.listening = true
        console.log('listening!')
      }
    },
    onEditionBought (event) {
      console.log(event)
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
    }
  },
  components: { SquishyThumbToken, Btn, Observer }
}
</script>

<style>
</style>
