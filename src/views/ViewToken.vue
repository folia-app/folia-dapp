<template lang="pug">
  .view-token.absolute.overlay.bg-black
    //- video format
    figure.absolute.overlay.py-5.md_p-10.lg_p-12.xl_p-24.bg-gray-100.flex(v-show="videoUrl")
      .relative.w-full
        video.absolute.overlay.object-contain.object-center(ref="video", :src="videoUrl", playsinline, @contextmenu.prevent, @click.stop="$event => $event.target.paused ? $event.target.play() : null", @ended="close", :poster="imageUrl")

    //- image format
    figure.absolute.overlay.py-5.md_p-10.lg_p-12.xl_p-24.flex(v-if="!videoUrl && imageUrl")
      .relative.w-full
        img.absolute.overlay.object-contain.object-center.opacity-0.transition.duration-200(:src="imageUrl", @load="$event => $event.target.style.opacity = '1'")

    //- back btn
    button.absolute.top-0.left-0.h-full.w-1x4.focus_outline-none(@click.stop="close", aria-label="Go back", style="cursor: w-resize")
</template>

<script>
export default {
  name: 'ViewToken',
  props: ['token'],
  data () {
    return {
      videoUrl: null,
      imageUrl: null
    }
  },
  methods: {
    async get () {
      if (this.token) {
        const meta = await this.$store.dispatch('getMetadata', { token: this.token })
        this.videoUrl = meta?.animation_url_optim
        this.imageUrl = meta?.image
        this.autoplayVideo()
      }
    },
    autoplayVideo () {
      if (this.videoUrl && this.$route.name === 'view-token') {
        return this.$refs.video?.play()
      }
    },
    close () {
      this.$emit('close')
    },
    async onWorkView (to, from) {
      // PRELOAD VIDEOS FOR SAFARI
      const newWork = to?.params.work && to.params.work !== from?.params.work
      if (newWork) {
        const token = to.params.work * 1000000 + 1 // first token has asset ?
        const meta = await this.$store.dispatch('getMetadata', { token })
        this.videoUrl = meta?.animation_url_optim
      }
    }
  },
  watch: {
    token () {
      this.get()
    },
    '$route' (to, from) {
      this.onWorkView(to, from)
      this.autoplayVideo()

      // on leaving...
      if (from.name === 'view-token') {
        // remove after transition
        setTimeout(() => {
          this.videoUrl = null
          this.imageUrl = null
        }, 1000)
        // (pause video)
        return this.$refs.video?.pause()
      }
    }
  },
  mounted () {
    this.get()
    this.onWorkView(this.$route)
    this.autoplayVideo()
  }
}
</script>

<style>
</style>
