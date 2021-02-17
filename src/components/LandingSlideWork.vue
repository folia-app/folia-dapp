<template lang="pug">
  .landing-slide-work.absolute.overlay.overflow-hidden
    //- media
    //- img.absolute.overlay.object-cover.object-center(v-if="work.data.icon.url", :src="work.data.icon.url", :alt="work.data.icon.alt")
    video.absolute.overlay.object-cover.object-center.transform.scale-150.origin-center(:src="work.data.teaser_video.url", muted, ref="video", playsinline, loop)
    //- (blur?)
    //- .absolute.overlay(:style="{backdropFilter: `blur(12px)`}")

    countdown-play-btn-overlay.z-10.text-lg(:work="work", @released="isReleased = true")
    //- .absolute.z-10.overlay.flex.items-center.justify-center
      //- (countdown)
      template(v-if="!isReleased")
        button.focus_outline-none(@click="$router.push({name: 'work', params: {work: work.uid}})")
          btn.px-12.text-lg(theme="darken")
            countdown(:until="work.data.release_time", @ended="isReleased = true")

      //- (play btn)
      template(v-else)
        button.block.p-40.focus_outline-none.text-black-a15.hover_text-white(aria-label="Play", @click="$router.push({name: 'view', params: {work: work.uid}})")
          <svg class="text-60 md_text-72 xl_text-96" style="width:calc(59 / 38 * 1em); height: 1em" viewBox="0 0 59 38" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
            <path d="M1 1.49251L57.3157 19L0.999998 36.5075L1 1.49251Z" fill="currentColor" style="transition: all 200ms" />
          </svg>

    //- bottom info
    .absolute.bottom-0.z-10.w-full.pb-12.md_px-12.xl_pb-16.text-md.lg_text-base.xl_text-lg.flex.flex-wrap.items-end.justiy-center.md_justify-between
      //- title
      router-link(:to="'/works/' + work.uid").w-full.md_w-auto.flex.flex-wrap.justify-center.group-off
        btn.px-10 {{ $store.getters.workId(work.uid, true) }}
        .w-full.md_w-0
        btn.px-10 {{ work.data.artist.split(',').join(' + ') }}
        .w-full.md_w-0
        btn.px-10 {{ work.data.title }}
        btn.px-10 {{ work.data.year }}

      //- buy btn
      button.mx-auto.md_m-0.focus_outline-none(@click="$store.dispatch('buy', work.uid)", :disabled="!isReleased")
        btn.px-20(:disabled="!isReleased")
          | BUY

</template>

<script>
import Btn from '@/components/Btn'
import CountdownPlayBtnOverlay from '@/components/CountdownPlayBtnOverlay'
export default {
  name: 'LandingSlideWork',
  components: { Btn, CountdownPlayBtnOverlay },
  props: {
    work: { type: Object, default: undefined }
  },
  data () {
    return {
      isReleased: false // || process.env.VUE_APP_DEV_IGNORE_RELEASES === 'true'
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
        this.$store.dispatch('getMetadata', { work: this.work.uid })
      }
    }
  },

  // lifecycle
  created () {
    this.getMetadata()
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
