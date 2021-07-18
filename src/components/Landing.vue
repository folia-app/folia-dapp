<template lang="pug">
  section.landing.w-full.bg-black.text-white.relative.font-sans.text-sm.h-90vh.md_h-93vhff.md_h-screen(v-intersects, @visible="autoplayCarousel", @hidden="pauseCarousel")
    //-
    header.absolute.top-0.left-0.w-full.z-20.blend-difference.text-white
      //- logo/connect
      landing-header

      //- ig progress
      ul.flex.absolute.top-0.left-0.w-full.z-20
        li.flex-1.h-2(v-for="(slice, i) in home.landing", :class="{'border-l border-white': i}")
        //- animating bar
        .absolute.top-0.left-0.w-full(:style="{width: `calc(100% * 1 / ${home.landing.length})`, transform: `translateX( calc(100% * ${current}) )` }")
          .bg-white.h-2.w-full.origin-left(:style="{transform: `scale(${progress}, 1)`}")

    template(v-if="home")
      //- slides...
      transition-group(:name="carouselEnabled ? 'slide' : 'none'", @before-leave="isSliding = true", @after-enter="isSliding = false")
        .absolute.overlay(v-for="(slice, i) in home.landing", v-show="current === i", :key="i")
          landing-slide-work(:slice="slice", @next="carouselEnabled && nextSlide(false)", :isCarousel="carouselEnabled", :isActive="current === i", :isActiveSibling="slideIsActiveSibling(i)", @progress="$event => { progress = $event }", @ended="nextSlide(false)")

      //- progress bar
      //- ul.absolute.top-0.left-0.w-full.h-2.bg-black.flex
        li.flex-1(v-for="(slice, i) in home.landing", :class="{'bg-gray-600': i % 2 === 0}")

</template>

<script>
import { mapState } from 'vuex'
import LandingHeader from '@/components/LandingHeader'
import LandingSlideWork from '@/components/LandingSlideWork'
export default {
  name: 'Landing',
  data () {
    return {
      current: 0,
      carouselTimer: null,
      isSliding: false,
      progress: 0
    }
  },
  computed: {
    ...mapState({
      home: state => state.prismic.docs.find(doc => doc.type === 'home')?.data
    }),
    carouselEnabled () {
      return this.home?.landing.length > 1
    },
    interval () {
      return this.home?.landing_carousel_autoplay_interval ?? 0 // seconds
    },
    autoplayEnabled () {
      return false
      // return this.interval > 0 && this.carouselEnabled && this.$route.name === 'index'
    }
  },
  methods: {
    nextSlide (autoplay = true) {
      this.current = this.current + 1 === this.home.landing.length ? 0 : this.current + 1
      // autoplay carousel ?
      return autoplay ? this.autoplayCarousel() : this.pauseCarousel()
    },
    autoplayCarousel () {
      if (this.autoplayEnabled) {
        // first time? pause on window.blur
        if (!this.carouselTimer) {
          window.addEventListener('blur', this.pauseCarousel)
        }
        // reset
        clearTimeout(this.carouselTimer)
        // queue
        this.carouselTimer = setTimeout(() => this.nextSlide(), this.interval * 1000)
      }
    },
    pauseCarousel () {
      clearTimeout(this.carouselTimer)
    },
    slideIsActiveSibling (i) {
      return this.current + 1 === i || // is next
        (i === 0 && this.current + 1 === this.home.landing.length) || // is looped next
          (this.isSliding && this.current - 1 === i) // is leaving (previous)
    }
  },
  watch: {
    current () {
      // reset progress with a little delay for videos
      this.progress = 0
    }
  },
  components: { LandingHeader, LandingSlideWork }
}
</script>

<style lang="postcss">
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

/* style video progress bar */
progress{
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance:none;
  /* height:1px; */

  /*background:red;*/
  /* track color (use css bg for Firefox...) */
  /*background:currentColor;*/
  background: transparent;
  &[value]::-webkit-progress-bar{
    background: transparent;
  }

  /* value color (safari/chrome) */
  &[value]::-webkit-progress-value{
    background:currentColor;
  }
  /* value color (firefox) */
  &[value]::-moz-progress-bar{
    background-color: currentColor;
  }
}
</style>
