<template lang="pug">
  .work-tokens.flex.flex-wrap.align-start.text-black.text-sm.lg_text-md
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
      .w-1x2.md_w-1x3.xl_w-1x4(v-if="tokens", v-for="token in tokens", :key="token.image + n")
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

</template>

<script>
import { mapState } from 'vuex'
import SquishyThumbToken from '@/components/SquishyThumbToken'
export default {
  name: 'WorkTokens',
  props: {
    doc: { type: Object, default: undefined },
    canBuy: { type: Boolean, default: true }
  },
  data () {
    return {
      tokens: null
    }
  },
  computed: {
    ...mapState(['networkId'])
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
    }
  },
  created () {
    this.getTokens()
  },
  watch: {
    networkId () {
      this.getTokens()
    }
  },
  components: { SquishyThumbToken }
}
</script>

<style>
</style>
