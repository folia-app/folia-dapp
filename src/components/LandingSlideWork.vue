<template lang="pug">
  .landing-slide-work.absolute.overlay.overflow-hidden
    //- media
    //- img.absolute.overlay.object-cover.object-center(v-if="doc.data.icon.url", :src="doc.data.icon.url", :alt="doc.data.icon.alt")
    video.absolute.overlay.object-cover.object-center.transform.scale-150.origin-center(:src="doc.data.teaser_video.url", muted, ref="video", playsinline, loop)
    //- (blur?)
    //- .absolute.overlay(:style="{backdropFilter: `blur(12px)`}")

    countdown-play-btn-overlay.z-10.text-lg(:doc="doc", @released="isReleased = true")

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
      .mx-auto.md_m-0
      button.mx-auto.md_m-0.focus_outline-none(@click="$store.dispatch('buy', doc.uid)", :disabled="!isReleased || isSoldOut")
        btn.px-16(:disabled="!isReleased || isSoldOut", :class="{'px-20': !isSoldOut}") {{ isSoldOut ? 'SOLD OUT' : 'BUY' }}

</template>

<script>
import Btn from '@/components/Btn'
import CountdownPlayBtnOverlay from '@/components/CountdownPlayBtnOverlay'
export default {
  name: 'LandingSlideWork',
  components: { Btn, CountdownPlayBtnOverlay },
  props: {
    doc: { type: Object, default: undefined }
  },
  data () {
    return {
      isReleased: false // || process.env.VUE_APP_DEV_IGNORE_RELEASES === 'true'
    }
  },
  computed: {
    work () {
      return this.$store.state.works.find(work => work.id === this.doc.uid)
    },
    isSoldOut () {
      return this.work && Number(this.work.editions) ? this.work.printed >= this.work.editions : false
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
