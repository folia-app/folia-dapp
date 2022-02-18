<template lang="pug">
  squishy-thumb.squishy-thumb-token.transition.duration-200.group.text-xs.md_text-md(ref="thumb", @open="open", :style="{background: userIsOwner && '#ffeb00'}", @mediaClick="onMediaClick")

    //- media
    div(slot="media")
      //- image
      resp-img.transition-opacity.duration-500(v-if="token.image && token.image.length",:bg="true", :image="{src: token.image}", :class="{'opacity-0ff': hover && token.drc}", :rawSrc="isMutative")
      //- (video)
      template(v-if="token.animation_thumb")
        observer.absolute.overlay(:threshold="0.01", @visible="onVisible", @hidden="onHidden")
          video.absolute.overlay.object-cover.object-center(v-if="loadVideo", ref="video", :src="token.animation_thumb", autoplay muted loop playsinline)
      //- iframe ?
      //- template(v-if="token.drc && hover")
        .absolute.overlay(:class="{'cursor-wait': !iframeLoaded}")
          iframe.absolute.overlay.pointer-events-none.transition-opacity.duration-500(:src="`https://programmatic-puppet.netlify.app?drc=${encodeURIComponent(token.drc)}`", @load="iframeLoaded = true", :class="{'opacity-0': !iframeLoaded}")

      //- (buy/sold)
      .absolute.top-0.right-0.px-6.sm_px-3.lg_px-5.py-3(v-if="buyBtn")
        template(v-if="owner")
          //- .h-12.lg_h-20.flex.items-center
          sold-out-dot.mx-3
        template(v-else)
          button.lg_opacity-0.lg_group-hover_opacity-100.focus_outline-none(@click.stop="buy(token)")
            btn.px-10.lg_px-12.text-white.lg_text-sm(theme="drkgray") BUY

      //- (custom link overr)
      a.absolute.overlay(v-if="token.link", :href="token.link", target="_blank", rel="noopener noreferrer", @click.stop)

    //- inner content
    .absolute.overlay.flex.items-center.justify-center.group(v-if="opened")
      //- No. (centered) / token link
      a.absolute.top-0.left-0.py-3.px-4(:href="openSeaLink({token: token.tokenId})", target="_blank", rel="noopener noreferrer", :class="{'pointer-events-none': !owner}")
        btn.lg_px-6.lg_hover_bg-black-a15(theme="none", size="small") {{ token.tokenId.slice(-3) }}

      //- open viewer (inner)
      button.focus_outline-none(@click="openViewer")
        btn.px-6.lg_hover_bg-black-a15.flex.items-center(size="small", theme="none")
          span.mr-3.pt-1.text-xs(v-if="is3D") 3D
          svg-eye

      //- owner
      a.absolute.bottom-0.right-0.lg_py-3.lg_px-4(v-if="owner", :href="openSeaLink({account: owner})", target="_blank", rel="noopener noreferrer", :class="{'opacity-0ff group-hover_opacity-100': true || !userIsOwner}")
        btn.lg_px-5.lg_hover_bg-black-a15(theme="none", size="small") {{ userIsOwner ? 'You' : addrShort(owner) }}

    //- open viewer (outer)
    button.absolute.z-20.bottom-0.right-0.lg_py-3.lg_px-4.lg_opacity-0.lg_group-hover_opacity-100.focus_outline-none.blend-difference(slot="outer", v-if="!token.link", @click="openViewer", v-show="!opened", :class="{'hidden md_block': !is3D}")
      btn.px-6.lg_hover_bg-gray-900.flex.items-center.text-white(size="small", theme="none")
        span.mr-3.pt-1.text-xs(v-if="is3D") 3D
        svg-eye
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import SquishyThumb from '@/components/SquishyThumb'
import Btn from '@/components/Btn'
import RespImg from '@/components/RespImg'
import svgEye from '@/components/SVG-Eye'
import Observer from '@/components/Observer'
import SoldOutDot from '@/components/SoldOutDot'
export default {
  name: 'SquishyThumbToken',
  props: ['token', 'buyBtn', 'isMutative'],
  data () {
    return {
      owner: null,
      opened: false,
      hover: false,
      iframeLoaded: false,
      hoverTmout: null,
      visible: false,
      loadVideo: false
    }
  },
  computed: {
    ...mapState({
      userAddress: state => state.address
    }),
    ...mapGetters(['addrShort', 'openSeaLink']),
    userIsOwner () {
      return this.userAddress === this.owner
    },
    is3D () {
      return this.token.drc // || this.token.iframe
    }
  },
  methods: {
    async fetchOwner (flush) {
      const get = () => this.$store.dispatch('getNFTOwnerByTokenId', this.token.tokenId)
      // fetch new ?
      this.owner = flush && !this.owner ? await get()
        : this.owner ?? await get()
    },
    open () {
      this.opened = true
      this.fetchOwner()
      this.$refs.thumb.open()
      // this.onMouseleave() // cancel hover
    },
    close () {
      this.$refs.thumb.close()
      this.opened = false
    },
    openViewer () {
      this.$router.push({ name: 'work-tokenviewer', params: { token: this.token.tokenId } })
    },
    onMediaClick () {
      // close if open
      if (this.opened) {
        return this.close()
      }
      // open viewer if not sold yet (no reason to see squished info...)
      if (this.buyBtn && !this.owner) {
        return this.openViewer()
      }
      // ... else open
      this.open()
    },
    onVisible () {
      this.visible = true
      this.loadVideo = true
      this.playVideo()
      if (this.buyBtn) {
        this.fetchOwner()
      }
    },
    onHidden () {
      this.visible = false
      this.pauseVideo()
    },
    playVideo () {
      return this.$refs.video?.paused && this.$refs.video?.play()
    },
    pauseVideo () {
      return !this.$refs.video?.paused && this.$refs.video?.pause()
    },
    async buy ({ tokenId }) {
      // track
      this.$gtag.event('buyBtnClick', { event_category: 'buy', event_label: 'squishyThumbToken.vue', value: tokenId })
      //
      await this.$store.dispatch('buyByID', { tokenId })
      this.fetchOwner(true)
    }
    // onMouseenter () {
    //   // cancel if opened
    //   if (this.opened) return this.onMouseleave()
    //   // load iframe
    //   this.hoverTmout = setTimeout(() => {
    //     this.hover = true
    //   }, 300)
    // },
    // onMouseleave () {
    //   this.hover = this.iframeLoaded = false
    //   clearTimeout(this.hoverTmout)
    // },
    // onMousemove () {
    //   // cancel until they actually stop for long enough
    //   clearTimeout(this.hoverTmout)
    //   this.onMouseenter()
    // }
  },
  watch: {
    '$route' (to, from) {
      if (to.name?.includes('tokenviewer')) {
        this.pauseVideo()
      } else if (this.visible) {
        this.playVideo()
      }
    }
  },
  components: { Observer, Btn, SquishyThumb, svgEye, RespImg, SoldOutDot }
}
</script>

<style>
</style>
