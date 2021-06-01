<template lang="pug">
  .landing-slide-work.absolute.overlay.overflow-hidden.text-md.lg_text-base.xl_text-lg
    //- media
    figure.absolute.overlay(:style="{background: slice.primary.slide_bg_color}")
      //- (image / video-poster)
      img.absolute.overlay(v-if="slice.primary.image && slice.primary.image.url && !videoAutoplayed", :src="slice.primary.image.url", :alt="slice.primary.image.alt", :style="slice.primary.style_inline", :class="mediaClasses")

      //- (iframe)
      template(v-if="slice.primary.iframe")
        transition(name="fadelate")
          iframe.absolute.overlay.pointer-events-none(v-if="isActive", :src="slice.primary.iframe")
      //- (video)
      video.absolute.overlay(v-else-if="slice.primary.media && slice.primary.media.url", :src="slice.primary.media.url", muted, ref="video", playsinline, loop, :style="slice.primary.style_inline", @load="onVideoLoad", :class="mediaClasses", @playing="videoAutoplayed = true")
      //- (blur?)
      //- .absolute.overlay(:style="{backdropFilter: `blur(12px)`}")

    //- tap areas
    .absolute.overlay.flex
      //- open work
      .flex-1.block.cursor-pointer.relative(@click.stop)
        //- (external)
        prismic-link.absolute.overlay(v-if="slice.primary.link.url", :field="slice.primary.link", :linkResolver="linkResolver", aria-label="View")
        //- (internal)
        button.absolute.overlay.focus_outline-none(v-else, @click.stop="$router.push(linkResolver(slice.primary.link))", aria-label="View")

      //- (next slide)
      button.w-1x3.md_w-1x4.focus_outline-none(v-if="isCarousel", style="cursor:e-resize", aria-label="Next Slide", @click.stop="$emit('next')")

    //- (play btn)
    .absolute.overlay.pointer-events-none.flex.items-center.justify-center(v-if="slice.primary.play_button")
      button.text-black-a45.lg_hover_text-white.pointer-events-auto.p-16.focus_outline-none(@click="onPlayBtn")
        <svg class="block w-36 md_w-48" viewBox="0 0 49 38" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
          <path d="M48.3763 19L0.313892 37.0628L0.313893 0.93723L48.3763 19Z" fill="currentColor" style="transition: all 500ms;" />
        </svg>

    //- (countdown)
    //- countdown-play-btn-overlay.z-10.text-lg(:doc="doc", @released="isReleased = true", :playBtn="false")
    //- .absolute.overlay.flex.items-center.justify-center(v-if="releaseTime && !isReleased")
      prismic-link(:field="slice.primary.link", :linkResolver="linkResolver", @click.native.stop)
        btn.px-8(style="backdrop-filter: blur(20px)")
          countdown(:until="releaseTime", @ended="isReleased = true")

    //- bottom info
    .absolute.bottom-0.w-full.pb-12.px-8.lg_px-12.xl_pb-16.flex.flex-wrap.items-end
      //- title
      //- prismic-link.flex.flex-wrap.justify-start.group-off.mr-20(:field="slice.primary.link", :linkResolver="linkResolver", @click.native.stop)
      .-mt-px(v-for="(chunk, i) in slice.primary.title.split(' | ')", :class="{'w-full md_w-auto': i < slice.primary.title.split(' | ').length - 1, 'hidden md_block': !isNaN(chunk)}")
        prismic-link.flex(:field="slice.primary.link", :linkResolver="linkResolver", @click.stop)
          btn.px-8.lg_px-10.whitespace-no-wrap.backdrop-blur.bg-gray-700-a15 {{ chunk }}
          //-
            btn.px-10 {{ $store.getters.workId(doc.uid, true) }}
            .w-full.md_w-0
            btn.px-10 {{ doc.data.artist.split(',').join(' + ') }}
            .w-full.md_w-0
            btn.px-10 {{ doc.data.title }}
            btn.px-10 {{ doc.data.year }}

      //- btn
      //- 1. custom link
      template(v-if="slice.primary.button_link.link_type !== 'Any'")
        prismic-link.ml-auto(:field="slice.primary.button_link", :linkResolver="linkResolver", @click.stop)
          btn.px-12.bg-black-a03.backdrop-blur.bg-gray-700-a15 {{ slice.primary.button_text || 'LINK' }}
      //- 2. sold out
      template(v-else-if="isSold")
        sold-out-dot.ml-auto.mr-1.md_-mr-2
      //- 3. bid link (remove for custom link...)
      //- template(v-else-if="bidLink")
      //-   template(v-if="!releaseTime || isReleased")
      //-     router-link.ml-auto.focus_outline-none(:to="bidLink", @click.native.stop)
      //-       btn.px-16.bg-black-a0.backdrop-blur BID
      //- 4. buy btn
      template(v-else-if="work")
        button.ml-auto.focus_outline-none(@click.stop="buy")
          btn.px-16.bg-gray-700-a15.backdrop-blur BUY

      //- .group
        span.group-hover_hidden.block.h-8.w-8.rounded-full.bg-red-duller
        .hidden.group-hover_block
          btn.px-8.bg-red-duller.text-xs.pointer-events-none(theme="none", size="small") SOLD
        button.mx-auto.md_m-0.focus_outline-none(@click="$store.dispatch('buy', doc.uid)", :disabled="!isReleased || isSoldOut")
          btn.px-16(:disabled="!isReleased || isSoldOut", :class="{'px-20': !isSoldOut}") {{ isSoldOut ? 'SOLD OUT' : 'BUY' }}

</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Btn from '@/components/Btn'
// import CountdownPlayBtnOverlay from '@/components/CountdownPlayBtnOverlay'
import Countdown from '@/components/Countdown'
import SoldOutDot from '@/components/SoldOutDot'
import linkResolver from '@/plugins/prismic/link-resolver'
export default {
  name: 'LandingSlideWork',
  components: { Btn, Countdown, SoldOutDot },
  props: {
    slice: { type: Object, default: () => ({}) },
    doc: { type: Object, default: undefined },
    isCarousel: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false }
  },
  data () {
    return {
      isReleased: false, // || process.env.VUE_APP_DEV_IGNORE_RELEASES === 'true'
      videoAutoplayed: false
    }
  },
  computed: {
    ...mapState(['foliaControllerContract']),
    ...mapGetters(['isSoldOut']),
    workId () {
      const link = this.slice?.primary?.link
      return link?.type === 'work' ? link.uid : undefined
    },
    work () {
      return this.$store.state.works.find(work => work.id === this.workId)
    },
    // buyDisabled () {
    //   return !this.work?.exists || this.isReleased === false
    // },
    canPlay () {
      return this.$route.name === 'index'
    },
    releaseTime () {
      return this.slice.primary?.release_link?.data?.release_time
    },
    isAuction () {
      return this.slice.primary?.link?.data?.page_layout === 'token-unit-sale'
    },
    isSold () {
      return this.isSoldOut(this.work) || this.slice.primary?.link?.data?.status === 'sold'
    },
    bidLink () {
      if (this.slice.primary.auction_link?.link_type === 'Document') {
        return linkResolver(this.slice.primary.auction_link)
      }
      // TODO add release check for button?
      // return { name: 'work-auctions', params: { work: this.slice.primary.link.uid } }
      return null
    },
    auctionExpiration () {
      const token = this.slice.primary.auction_link?.uid
      const auctionDoc = this.$store.getters['prismic/auctions'].find(doc => doc.uid === token)
      return auctionDoc?.data?.expires
    },
    mediaClasses () {
      const defaults = 'object-cover object-center'
      return this.slice.primary?.media_custom_css_classes || defaults
    }
  },
  methods: {
    linkResolver,
    play () {
      return this.$refs.video?.paused && this.canPlay && this.$refs.video.play()
    },
    pause () {
      return this.$refs.video?.pause()
    },
    observe () {
      const observer = new IntersectionObserver((entries) => {
        return entries[0].isIntersecting ? this.play() : this.pause()
      })
      observer.observe(this.$el)
    },
    getMetadata () {
      if (this.isReleased && this.workId) {
        this.$store.dispatch('getMetadata', { work: this.workId })
      }
    },
    getWork () {
      return !this.work && this.$store.dispatch('getWork', { id: this.workId, flush: true })
    },
    async buy () {
      this.$router.push({ name: 'work', params: { work: this.workId } })
      await this.$store.dispatch('buy', this.workId)
    },
    onPlayBtn () {
      const token = this.workId ? Number(this.workId) * 1000000 + 1 : false
      if (token) {
        this.$router.push('/view/' + token)
      }
    },
    onVideoLoad ($event) {
      // custom playback rate?
      $event.target.playbackRate = this.slice.primary.video_speed || 1
    },
    openLink () {
      if (this.slice.primary.link?.url) {
        const url = linkResolver(this.slice.primary.link)
        console.log(url)
      }
    }
  },

  // lifecycle
  created () {
    this.getMetadata()
    this.getWork()
  },
  mounted () {
    this.observe()
  },
  watch: {
    isReleased () {
      this.getMetadata()
    },
    '$route' (to, from) {
      return this.canPlay ? this.play() : this.pause()
    },
    foliaControllerContract () {
      this.getWork()
    }
  }
}
</script>

<style>
.fadelate-enter-active{
  transition: none;
}
/* fade/leave after slides off */
.fadelate-leave-active{
  transition:  opacity 0 1000ms;
}
.fadelate-leave-to{
  opacity: 0;
}
</style>
