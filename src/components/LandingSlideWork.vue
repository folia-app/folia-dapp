<template lang="pug">
  .landing-slide-work.absolute.overlay.overflow-hidden
    //- media
    img.absolute.overlay.object-cover.object-center(v-if="doc.data.teaser_image.url", :src="doc.data.teaser_image.url", :alt="doc.data.teaser_image.alt")
    video.absolute.overlay.object-cover.object-center.transform.scale-150.origin-center(:src="doc.data.teaser_video.url", muted, ref="video", playsinline, loop, @loadedmetadata="$event => $event.target.playbackRate = 0.17")
    //- (blur?)
    //- .absolute.overlay(:style="{backdropFilter: `blur(12px)`}")

    countdown-play-btn-overlay.z-10.text-lg(:doc="doc", @released="isReleased = true", :playBtn="false")

    //- bottom info
    .absolute.bottom-0.z-10.w-full.pb-12.md_px-12.xl_pb-16.text-md.lg_text-base.xl_text-lg.flex.flex-wrap.items-end.justiy-center.md_justify-between
      //- title
      router-link(:to="'/works/' + doc.uid").w-full.md_w-auto.flex.flex-wrap.justify-center.group-off
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
      template(v-else)
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
export default {
  name: 'LandingSlideWork',
  components: { Btn, CountdownPlayBtnOverlay, SoldOutDot },
  props: {
    doc: { type: Object, default: undefined }
  },
  data () {
    return {
      isReleased: false // || process.env.VUE_APP_DEV_IGNORE_RELEASES === 'true'
    }
  },
  computed: {
    ...mapGetters(['isSoldOut']),
    work () {
      return this.$store.state.works.find(work => work.id === this.doc.uid)
    }
  },
  methods: {
    play () {
      return this.$refs.video?.play()
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
      if (this.isReleased) {
        this.$store.dispatch('getMetadata', { work: this.doc.uid })
      }
    }
  },

  // lifecycle
  created () {
    this.getMetadata()
    this.$store.dispatch('getWork', { id: this.doc.uid })
  },
  mounted () {
    this.observe()
  },
  watch: {
    isReleased () {
      this.getMetadata()
    }
  }
}
</script>

<style>
</style>
