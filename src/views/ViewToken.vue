<template lang="pug">
  .view-token.absolute.overlay
    //- video format
    .absolute.overlay.py-5.md_p-10.lg_p-12.xl_p-24.bg-gray-200.flex(v-show="videoUrl")
      .relative.w-full
        video.absolute.overlay.object-contain.object-center(ref="video", :src="videoUrl", playsinline, @contextmenu.prevent, @click.stop="$event => $event.target.paused ? $event.target.play() : null", @ended="close", :poster="metadata && metadata.image")

    //- back btn
    button.absolute.top-0.left-0.h-full.w-1x4.focus_outline-none(@click.stop="close", aria-label="Go back", style="cursor: w-resize")
</template>

<script>
export default {
  name: 'ViewToken',
  props: ['token'],
  data () {
    return {
      videoUrl: null
    }
  },
  computed: {
    metadata () {
      return this.$store.state.metadatas.find(meta => meta._token === this.token)
    }
  },
  methods: {
    get () {
      return this.token && this.$store.dispatch('getMetadata', { token: this.token }).then(() => this.autoplayVideo())
    },
    autoplayVideo () {
      if (this.videoUrl && this.$route.name === 'view-token') {
        this.$refs.video.play()
      }
    },
    close () {
      this.$emit('close')
    },
    async onWorkView (to, from) {
      // on work view, preload video so safari will autoplay...
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
    },
    metadata (metadata) {
      if (metadata) {
        // load in video ?
        this.videoUrl = this.metadata?.animation_url_optim
      } else {
        // pause video and remove after transition
        this.$refs.video.pause()
        setTimeout(() => { this.videoUrl = null }, 1000)
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
