<template lang="pug">
  .landing-slide-work.absolute.overlay.overflow-hidden.text-md.lg_text-base.xl_text-lg
    //- media
    figure.absolute.overlay
      //- (image / poster)
      img.absolute.overlay.object-cover.object-center(v-if="slice.primary.image && slice.primary.image.url", :src="slice.primary.image.url", :alt="slice.primary.image.alt", :style="slice.primary.style_inline")
      //- (video)
      video.absolute.overlay.object-cover(v-if="slice.primary.media && slice.primary.media.url", :src="slice.primary.media.url", muted, ref="video", playsinline, loop, :style="slice.primary.style_inline", @load="$event => $event.target.playbackRate = slice.primary.video_speed || 1")
      //- (blur?)
      //- .absolute.overlay(:style="{backdropFilter: `blur(12px)`}")

    //- (countdown)
    //- countdown-play-btn-overlay.z-10.text-lg(:doc="doc", @released="isReleased = true", :playBtn="false")
    .absolute.overlay.flex.items-center.justify-center(v-if="releaseTime && !isReleased")
      prismic-link(:field="slice.primary.link", :linkResolver="linkResolver", @click.native.stop)
        btn.px-8(style="backdrop-filter: blur(20px)")
          countdown(:until="releaseTime", @ended="isReleased = true")

    //- bottom info
    .absolute.bottom-0.z-10.w-full.pb-12.px-8.lg_px-12.xl_pb-16.flex.flex-wrap.items-end.justiy-center.md_justify-between
      //- title
      prismic-link.w-full.md_w-auto.flex.flex-wrap.justify-center.group-off(:field="slice.primary.link", :linkResolver="linkResolver", @click.native.stop)
        .w-full.md_w-auto.flex.justify-center(v-for="chunk in slice.primary.title.split(' | ')")
          btn.px-10(style="backdrop-filter:blur(20px)") {{ chunk }}
        //-
          btn.px-10 {{ $store.getters.workId(doc.uid, true) }}
          .w-full.md_w-0
          btn.px-10 {{ doc.data.artist.split(',').join(' + ') }}
          .w-full.md_w-0
          btn.px-10 {{ doc.data.title }}
          btn.px-10 {{ doc.data.year }}

      //- buy btn
      //- .mx-auto.md_m-0
      //- template(v-if="isSoldOut")
      template(v-if="isSoldOut(work)")
        sold-out-dot.ml-auto.mr-12.md_mr-0
      template(v-else-if="work")
        button.mx-auto.md_m-0.focus_outline-none(@click.stop="buy", :disabled="!isReleased", :class="{'opacity-50': !isReleased}")
          btn.px-16(:disabled="!isReleased", style="backdrop-filter:blur(20px)") BUY

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
    doc: { type: Object, default: undefined }
  },
  data () {
    return {
      isReleased: false // || process.env.VUE_APP_DEV_IGNORE_RELEASES === 'true'
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
    canPlay () {
      return this.$route.name === 'index'
    },
    releaseTime () {
      return this.slice.primary?.release_link?.data?.release_time
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
</style>
