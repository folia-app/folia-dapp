<template lang="pug">
  .landing-slide-work.absolute.overlay.overflow-hidden
    //- media
    figure.absolute.overlay(style="filter: invert(100%)")
      //- (image / poster)
      img.absolute.overlay.object-cover.object-center(v-if="slice.primary.image && slice.primary.image.url", :src="slice.primary.image.url", :alt="slice.primary.image.alt")
      //- (video)
      video.absolute.overlay.object-cover.object-center.transform.scale-150.origin-center(v-if="slice.primary.media && slice.primary.media.url", :src="slice.primary.media.url", muted, ref="video", playsinline, loop)
      //- (blur?)
      //- .absolute.overlay(:style="{backdropFilter: `blur(12px)`}")

    //- countdown-play-btn-overlay.z-10.text-lg(:doc="doc", @released="isReleased = true", :playBtn="false")

    //- bottom info
    .absolute.bottom-0.z-10.w-full.pb-12.md_px-12.xl_pb-16.text-md.lg_text-base.xl_text-lg.flex.flex-wrap.items-end.justiy-center.md_justify-between
      //- title
      prismic-link.w-full.md_w-auto.flex.flex-wrap.justify-center.group-off(:field="slice.primary.link", :linkResolver="linkResolver")
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
        button.mx-auto.md_m-0.focus_outline-none(@click="$store.dispatch('buy', doc.uid)", :disabled="!isReleased", :class="{'opacity-50': !isReleased}")
          btn.px-16(:disabled="!isReleased") BUY

      //- .group
        span.group-hover_hidden.block.h-8.w-8.rounded-full.bg-red-duller
        .hidden.group-hover_block
          btn.px-8.bg-red-duller.text-xs.pointer-events-none(theme="none", size="small") SOLD
        button.mx-auto.md_m-0.focus_outline-none(@click="$store.dispatch('buy', doc.uid)", :disabled="!isReleased || isSoldOut")
          btn.px-16(:disabled="!isReleased || isSoldOut", :class="{'px-20': !isSoldOut}") {{ isSoldOut ? 'SOLD OUT' : 'BUY' }}

</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@/components/Btn'
import CountdownPlayBtnOverlay from '@/components/CountdownPlayBtnOverlay'
import SoldOutDot from '@/components/SoldOutDot'
import linkResolver from '@/plugins/prismic/link-resolver'
export default {
  name: 'LandingSlideWork',
  components: { Btn, CountdownPlayBtnOverlay, SoldOutDot },
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
    ...mapGetters(['isSoldOut']),
    workId () {
      return this.slice?.primary.link?.uid
    },
    work () {
      return this.$store.state.works.find(work => work.id === this.workId)
    }
  },
  methods: {
    linkResolver,
    play () {
      return this.$refs.video?.paused && this.$refs.video.play()
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
      return !isNaN(this.workId) && this.$store.dispatch('getWork', { id: this.workId })
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
      const isIndex = to.name === 'index'
      return isIndex ? this.$refs.video?.play() : this.$refs.video?.pause()
    }
  }
}
</script>

<style>
</style>
