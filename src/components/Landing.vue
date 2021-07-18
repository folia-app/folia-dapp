<template lang="pug">
  section.landing.w-full.bg-black.text-white.relative.flex.items-center.justify-center.font-sans.text-sm.h-90vh.md_h-93vh-off.md_h-screen(v-intersects, @visible="autoplayCarousel", @hidden="pauseCarousel")
    template(v-if="home")
      //- slides...
      transition-group(:name="carouselEnabled ? 'slide' : 'none'")
        figure.absolute.overlay(v-for="(slice, i) in home.landing", v-show="current === i", :key="i")
          landing-slide-work(:slice="slice", @next="carouselEnabled && nextSlide(false)", :isCarousel="carouselEnabled", :isActive="current === i")
</template>

<script>
import { mapState } from 'vuex'
import LandingSlideWork from '@/components/LandingSlideWork'
export default {
  name: 'Landing',
  data () {
    return {
      current: 0,
      carouselTimer: null
    }
  },
  computed: {
    ...mapState({
      home: state => state.prismic.docs.find(doc => doc.type === 'home')?.data
    }),
    carouselEnabled () {
      return this.home?.landing.length > 1
    }
  },
  methods: {
    nextSlide (autoplay = true) {
      this.current = this.current + 1 === this.home.landing.length ? 0 : this.current + 1
      // autoplay carousel ?
      return autoplay ? this.autoplayCarousel() : this.pauseCarousel()
    },
    autoplayCarousel () {
      const interval = this.home?.landing_carousel_autoplay_interval // seconds
      const canPlay = interval > 0 && this.carouselEnabled && this.$route.name === 'index'
      if (canPlay) {
        // first time? pause on window.blur
        if (!this.carouselTimer) {
          window.addEventListener('blur', this.pauseCarousel)
        }
        // reset
        clearTimeout(this.carouselTimer)
        // queue
        this.carouselTimer = setTimeout(() => this.nextSlide(), interval * 1000)
      }
    },
    pauseCarousel () {
      clearTimeout(this.carouselTimer)
    }
  },
  components: { LandingSlideWork }
}
</script>

<style>
.slide-enter-active,
.slide-leave-active{
  transition:transform 500ms;
}
.slide-leave-to,
.slide-enter{
  transform: scale(0,1);
}
.slide-leave-active{
  transform-origin: top left;
}
.slide-enter-active{
  transform-origin: top right;
}
</style>
