<template lang="pug">
  .view-token.absolute.overlay.bg-black(@click="onBodyClick", :class="{'pointer-events-auto': visible}")

    //- video format
    template(v-if="videoUrl")
      figure.absolute.overlay.py-5.md_p-10.lg_p-12.xl_p-24.bg-gray-100off.bg-white.flex.transition-opacity.duration-500.delay-500(:class="{'opacity-0': !visible}")
        .relative.w-full
          img.absolute.overlay.object-contain.object-center(:src="imageUrl")
          video.absolute.overlay.object-contain.object-center(ref="video", :src="videoUrl", playsinline, @contextmenu.prevent, @click="$event => $event.target.paused ? $event.target.play() : null", @ended="close", :loop="metadata.animation_loop", @playing="onVideoPlaying")

    template(v-else-if="visible && metadata")
      //- iframe
      template(v-if="metadata.iframe")
        iframe.absolute.overlay(:src="`${metadata.iframe}?model=${encodeURIComponent(metadata.drc)}`", :key="token")

      //- gif format
      template(v-else-if="metadata.image && metadata.image.toLowerCase().includes('.gif')")
        figure.absolute.overlay.bg-white.py-5.md_p-10.lg_p-12.xl_p-24.flex.items-center.justify-center
          img-gif(:src="metadata.image", :key="token", @load="onImageLoaded")

      //- image
      template(v-else-if="metadata.image")
        figure.absolute.overlay.py-5.md_p-10.lg_p-12.xl_p-24.flex
          .relative.w-full
            img.absolute.overlay.object-contain.object-center.opacity-0.transition.duration-200(:src="metadata.image", @load="onImageLoaded")

    //- back btn
    //- button.absolute.top-0.left-0.h-full.w-1x4.focus_outline-none(@click.stop="close", aria-label="Go back", style="cursor: w-resize")
    button.absolute.top-0.right-0.p-12.focus_outline-none.transition.duration-300(@click.stop="$emit('close')", style="mix-blend-mode:difference", aria-label="Close", :class="{'opacity-0 pointer-events-none': !btnsVisible}")
      svg-x.w-8.h-8.text-white(strokeWidth="2")
</template>

<script>
import { mapState } from 'vuex'
import ImgGif from '@/components/ImgGif'
import SvgX from '@/components/SVG-X'
export default {
  name: 'ViewToken',
  props: ['token', 'visible'],
  data () {
    return {
      metadata: null,
      videoUrl: null,
      imageUrl: null,
      btnsVisible: true,
      hideBtnsDelay: null
    }
  },
  computed: {
    ...mapState(['networkId'])
  },
  methods: {
    async get () {
      if (this.token) {
        this.metadata = null
        const meta = await this.$store.dispatch('getMetadata', { token: this.token })
        this.videoUrl = meta?.animation_url_optim || meta?.animation_url
        this.imageUrl = meta?.image
        this.metadata = meta
        this.autoplayVideo()
      }
    },
    autoplayVideo () {
      if (this.videoUrl && this.visible) {
        return setTimeout(() => this.$refs.video?.play(), 500)
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
    },
    onVideoPlaying () {
      this.autoHideBtns(false)
    },
    autoHideBtns (reveal = true) {
      // reveals buttons, then hide again if not iframe enabled
      clearTimeout(this.hideBtnsDelay)
      if (reveal) {
        this.btnsVisible = true
      }
      if (!this.metadata?.iframe) {
        this.hideBtnsDelay = setTimeout(() => {
          this.btnsVisible = false
        }, 2000)
      }
    },
    onImageLoaded (e) {
      this.autoHideBtns()
      if (e.target) e.target.style.opacity = 1
    },
    onBodyClick () {
      this.autoHideBtns()
    }
  },
  watch: {
    token () {
      this.get()
    },
    networkId () {
      this.get()
    },
    '$route' (to, from) {
      this.onWorkView(to, from)
      this.autoplayVideo()
    },
    visible (visible) {
      if (visible) {
        this.btnsVisible = true
      } else {
        // after hide transition...
        setTimeout(() => {
          this.videoUrl = null
          this.imageUrl = null
          this.btnsVisible = true
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
  },
  metaInfo () {
    if (this.metadata) {
      return {
        title: this.metadata.name,
        meta: this.$store.getters.meta({ title: this.metadata.name, descrip: '', img: this.metadata.image })
      }
    }
  },
  components: { ImgGif, SvgX }
}
</script>

<style>
</style>
