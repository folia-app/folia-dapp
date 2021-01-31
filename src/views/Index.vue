<template lang="pug">
  .index.bg-gray-900
    //- main body
    section.index.relative.min-h-screen.bg-yellow.transition.duration-500.transform.origin-left(:class="{'scale-x-0 duration-700': videoPlayer >= 0, 'scale-x-10 md_scale-x-25 lg_scale-x-50': $route.meta.isSingle}")
      //- child work (squishes in)
      transition(name="fade")
        router-link(to="/", v-show="$route.meta.isSingle").absolute.overlay.bg-black.z-20.cursor-pointer.opacity-25.md_opacity-50

      //- main
      .flex.flex-wrap.content-start.transition-opacity.duration-500
        header.absolute.top-0.left-0.w-full.z-20.text-white
          .absolute.top-0.left-0.w-full
            .flex.w-full.justify-between.items-center
              .p-10.px-12
                logo.block.text-white.h-12(aria-label="Folia")
                //- svg-fleuron.block.text-white(style="height:3rem")
              div
                button.p-10.focus_outline-none(v-if="!address", @click="$store.dispatch('connect')") Connect
                button.p-10.focus_outline-none.relative.group(v-else, @click="$store.dispatch('disconnect')")
                  span.group-hover_opacity-0.truncate {{ address.slice(0, 6) + '...' + address.slice(-4) }}
                  span.hidden.group-hover_block.absolute.overlay.text-right.p-10 Disconnect
        //- landing
        .w-full.bg-black.text-white.relative.flex.items-center.justify-center.font-sans.text-sm.h-90vh.md_h-93vh-off.md_h-screen(:style="{cursor: slides.length > 1 ? 'e-resize' : 'auto'}", @click="next")
          //- slides...
          transition-group(name="slide")
            figure.absolute.overlay.overflow-hidden.flex.flex-col.justify-between(v-for="(slide, i) in slides", v-show="current === i", :key="i")
              //- [video]
              template(v-if="slide.type === 'video'")
                video.absolute.overlay.object-cover.object-center.transform.scale-150.origin-center(:src="slide.src", muted, ref="video", playsinline, @timeupdate="$event => loopVideoClip($event, slide.clip)", :autoplay="current === i")
                //- (blur?)
                .absolute.overlay(:style="{backdropFilter: `blur(${slide.blur}px)`}", v-if="slide.blur")
                //- play btn
                .relative.z-10.flex-1.w-full.flex.justify-center.items-center.pt-16.xl_pt-20
                  button.p-8.focus_outline-none(aria-label="Play", @click="videoPlayer = i")
                    <svg class="text-60 md_text-72 xl_text-96" style="width:calc(59 / 38 * 1em); height: 1em" viewBox="0 0 59 38" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
                      <path d="M1 1.49251L57.3157 19L0.999998 36.5075L1 1.49251Z" stroke="currentColor" stroke-width="0.66px"/>
                    </svg>

              //- bottom info
              .relative.z-10.w-full.pb-12.md_px-12.xl_pb-16.text-md.lg_text-base.xl_text-lg.flex.flex-wrap.items-end.justiy-center.md_justify-between
                //- title
                .w-full.md_w-auto.flex.flex-wrap.justify-center
                  router-link.border.rounded-full.border-white.p-6.md_p-8.px-12.-mb-px.text-center(v-for="txt in slide.title", v-html="txt", to="/works/1000000")
                //- buy btn
                button.mx-auto.md_m-0.border.rounded-full.border-white.p-6.md_py-8.px-20.font-bold.hover_bg-white.hover_text-gray-800.focus_outline-none(style="font-size:0.95em") BUY
          //- dots
          ul.absolute.bottom-0.left-0.w-full.flex.items-center.justify-center.pb-6(v-if="slides.length > 1")
            li.p-4.cursor-pointer(v-for="(slide, i) in slides", @click.stop="current = i")
              .w-4.h-2.border-b.border-white(:class="{'bg-white': current === i}")
          //- span.opacity-50 (videos/slideshow)
        //- list
        template(v-for="n in 1")
          //- thumbs...
          work-thumb.w-full.md_w-1x2.lg_w-1x3.xl_w-1x4(v-for="(doc, index) in works", :doc="doc", :key="doc.id + n")

        //- 002...
        .relative.block.w-full.md_w-1x2.lg_w-1x3.xl_w-1x4
          .pb-full
            .absolute.overlay.flex.items-center.justify-center.bg-black.text-white.border-r.border-gray-800.font-sans.group
              span.group-hover_hidden 002
              span.hidden.group-hover_inline Coming Soon

        //- collectors link
        .relative.block.w-full.md_w-1x2.lg_w-1x3.xl_w-1x4
          .pb-full
            .absolute.overlay.flex.items-center.justify-center.bg-black.text-white.font-sans.group
              span.group-hover_hidden Collectors
              span.hidden.group-hover_inline Coming Soon
      //- info
      info(v-show="infoVisible && works.length > 0")

    //- viewer
    section.fixed.top-0.right-0.h-screen.viewer.w-11x12.md_w-3x4.lg_w-1x2.transition.duration-500.transform.origin-right.bg-white(:class="{'scale-x-0': !$route.meta.isSingle}")
      transition(name="fade")
        router-view

    //- video player
    .fixed.overlay.transition.transform.origin-right.flex.p-4.md_p-16.lg_p-24.xl_p-40(:class="{'pointer-events-none scale-x-0 duration-500': videoPlayer < 0, 'duration-500': videoPlayer >= 0}", style="cursor:w-resize", @click="videoPlayer = -1")
      //- .relative.w-full
      video.absolute.overlay.object-contain.lg_object-cover.object-center.transition.duration-500(ref="videoPlayer", v-for="(slide, i) in slides", :src="slide.src", playsinline, :class="{'opacity-0': videoPlayer !== i}")
</template>

<script>
import { mapState } from 'vuex'
// import TitleCard from '@/components/Index__TitleCard'
import Logo from '@/components/Logo'
import svgFleuron from '@/components/SVG-Fleuron'
import Info from '@/components/Info'
import WorkThumb from '@/components/WorkThumb'
export default {
  name: 'Index',
  components: { Logo, Info, WorkThumb, svgFleuron },
  data () {
    return {
      squish: false,
      infoVisible: true,
      title: '',
      // slides: [['saturation', 'rgba(0,255,0,1)'], ['luminosity', 'rgba(0,255,0,1)'], ['color-burn', 'red']],
      // slides: [['color-burn', 'cyan'], ['color-burn', 'red'], ['color-burn', 'violet']],
      slides: [
        {
          type: 'video',
          src: 'https://res.cloudinary.com/folia/video/upload/v1612123842/flowers-5-wvr--fast1080plossless1_yghbnb.mp4',
          // src: 'https://res.cloudinary.com/folia/video/upload/v1612125005/flowers-5-wvr_daxqlf.mp4', // full res
          clip: [0, 5],
          blur: 12,
          title: ['001', 'Petra Cortright + Jamie Whipple', 'flowers', '2021']
        }
        // {
        //   type: 'video',
        //   src: 'https://res.cloudinary.com/folia/video/upload/v1612123842/flowers-5-wvr--fast1080plossless1_yghbnb.mp4',
        //   // src: 'https://res.cloudinary.com/folia/video/upload/v1612125005/flowers-5-wvr_daxqlf.mp4', // full res
        //   clip: [0, 5]
        // },
      ],
      current: 0,
      videoPlayer: -1
    }
  },
  computed: {
    // ...mapGetters(['workPatches'])
    ...mapState({
      address: state => state.address,
      works: state => state.prismic.works
    })
  },
  methods: {
    setTitle () {
      const titles = ['fire sale', 'bargain<br>basement', 'cash grab', 'editions', 'pog<br>liquidation', 'get rich<br>schemes', 'wares']
      const index = Math.floor(Math.random() * (3 - 0 + 1))
      this.title = titles[index]
    },
    next () {
      this.current = this.current + 1 === this.slides.length ? 0 : this.current + 1
    },
    loopVideoClip (e, clip = '') {
      if (clip[1] && e.target.currentTime >= clip[1]) {
        e.target.currentTime = clip[0]
      }
    }
  },
  watch: {
    current (to, from) {
      this.$refs.video[to].play()
      this.$refs.video[from].pause()
    },
    videoPlayer (i, was) {
      const video = this.$refs.videoPlayer[i] || this.$refs.videoPlayer[was]
      console.log(video)
      if (video) {
        if (i > -1) {
          video.currentTime = 0
          video.play()
        } else {
          video.pause()
        }
      }
    }
  },
  created () {
    this.setTitle()
  }
}
</script>

<style scoped>
@import '../style/variables';

/* info transition */
.y-squish-enter-active,
.y-squish-leave-active{
  transition: transform 1000ms 600ms, max-height 1000ms 600ms;
  transform-origin:top center;
}
.y-squish-enter,
.y-squish-leave-to{
  transform:scale(1,0);
  max-height:0;
}
.y-squish-enter-to,
.y-squish-leave{
  max-height:calc(100vw / 3);
}

/*.index{
  transition:transform 500ms;
  transform-origin:top left;
  &.index--squished{
    transform:scale(0.1, 1);
  }
}*/
/*.viewer{
  width:90%;
  transition:transform 500ms;
  transform-origin:right top;
  &.viewer--hidden{
    transform:scale(0,1);
  }
}*/

@media (--breakpoint-md) {
  /*.index.index--squished{transform:scale(0.25, 1);}*/
  /*.viewer{width:75%;}*/
}

@media (--breakpoint-lg) {
  /*.index.index--squished{transform:scale(0.5, 1);}*/
  /*.viewer{width:50%;}*/
}

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

.index svg{
  & *{ transition: all 100ms }
  &:hover *{
    fill: currentColor;
  }
}
</style>
