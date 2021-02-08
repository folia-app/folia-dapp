<template lang="pug">
  .index

    //- BODY - squishes for video player
    .relative.transform.transition-transform.origin-left.duration-700(:class="{'scale-x-0': viewWork}")
      //- (WORK PANEL)
      .sticky.z-20.top-0.right-0.w-full.h-0
        .absolute.top-0.right-0.w-full.sm_w-3x4.lg_w-1x2.transition.duration-500.transform.origin-right.bg-black.min-h-screen(:class="{'scale-x-0': !workPanel}")
          transition(name="fade")
            work-view(v-if="workPanel", :key='$route.params.work')
      //- close workpanel
      transition(name="fade")
        button(v-show="workPanel", @click="$router.push('/')").absolute.overlay.bg-black.z-10.cursor-pointer.opacity-25.md_opacity-50

      //- MAIN
      main.index.relative.min-h-screen.transition.duration-500.transform.origin-left.flex.flex-wrap(:class="{'scale-x-0 sm_scale-x-25 lg_scale-x-50': workPanel}")
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
        .w-full.bg-black.text-white.relative.flex.items-center.justify-center.font-sans.text-sm.h-90vh.md_h-93vh-off.md_h-screen(:style="{cursor: works.length > 1 ? 'e-resize' : 'auto'}", @click="next")
          //- slides...
          transition-group(:name="works.length > 1 ? 'slide' : 'none'")
            figure.absolute.overlay.overflow-hidden.flex.flex-col.justify-between(v-for="(work, i) in works", v-show="current === i", :key="i")
              //- [video]
              template(v-if="work.data.video_teaser.url")
                img.absolute.overlay.object-cover.object-center(v-if="work.data.icon.url", :src="work.data.icon.url", :alt="work.data.icon.alt")
                video.absolute.overlay.object-cover.object-center.transform.scale-150.origin-center(:src="work.data.video_teaser.url", muted, ref="slidevideo", playsinline, :autoplay="current === i", loop)
                //- (blur?)
                .absolute.overlay(:style="{backdropFilter: `blur(12px)`}")
                //- play btn
                .absolute.z-10.overlay.flex.items-center.justify-center
                  //- .relative.z-10.flex-1.w-full.flex.justify-center.items-center.pt-16.xl_pt-20
                  button.block.p-40.focus_outline-none(aria-label="Play", @click="$router.push({name: 'view', params: {work: work.uid}})")
                    <svg class="text-60 md_text-72 xl_text-96" style="width:calc(59 / 38 * 1em); height: 1em" viewBox="0 0 59 38" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
                      <path d="M1 1.49251L57.3157 19L0.999998 36.5075L1 1.49251Z" stroke-off="currentColor" stroke-width-off="0.66px" fill="rgba(0,0,0,0.15)" />
                    </svg>

              //- bottom info
              .absolute.bottom-0.z-10.w-full.pb-12.md_px-12.xl_pb-16.text-md.lg_text-base.xl_text-lg.flex.flex-wrap.items-end.justiy-center.md_justify-between
                //- title
                router-link(:to="'/works/' + work.uid").w-full.md_w-auto.flex.flex-wrap.justify-center.group-off
                  btn.px-10 {{ workId(work.uid, true) }}
                  .w-full.md_w-0
                  btn.px-10 {{ work.data.artist.split(',').join(' + ') }}
                  .w-full.md_w-0
                  btn.px-10 {{ work.data.title }}
                  btn.px-10 {{ work.data.year }}
                //- buy btn
                button.mx-auto.md_m-0
                  btn.px-20
                    | BUY
                  //- | {{ work.data.price_eth }} ETH

          //- dots
          //- ul.absolute.bottom-0.left-0.w-full.flex.items-center.justify-center.pb-6(v-if="slides.length > 1")
            li.p-4.cursor-pointer(v-for="(slide, i) in slides", @click.stop="current = i")
              .w-4.h-2.border-b.border-white(:class="{'bg-white': current === i}")
          //- span.opacity-50 (videos/slideshow)

        //- list
        template(v-for="n in 1")
          //- thumbs...
          //- work-thumb.w-full.md_w-1x2.lg_w-1x3(v-for="(doc, index) in works", :doc="doc", :key="doc.id + n")
          router-link.w-full.md_w-1x2.lg_w-1x3.bg-yellow.hover_shadow-inner-red(v-for="work in works", :to="{name: 'work', params: {work: work.uid}}")
            .pb-full.relative
              .absolute.overlay.flex.items-center.justify-center {{ ('00' + (Number(work.uid) / 1000000)).slice(-3) }}

        //- 002...
        .relative.block.w-full.md_w-1x2.lg_w-1x3
          .pb-full
            .absolute.overlay.flex.items-center.justify-center.bg-black.text-white.border-b.md_border-b-0.md_border-r.border-gray-800.font-sans.group
              span.group-hover_hidden 002
              span.hidden.group-hover_inline Coming Soon

        //- collectors link
        .hidden.lg_block.relative.w-full.md_w-1x2.lg_w-1x3
          .pb-full
            .absolute.overlay.flex.items-center.justify-center.bg-black.text-white.font-sans.group
              span.group-hover_hidden Collectors
              span.hidden.group-hover_inline Coming Soon

        //- info
        info.w-full.min-h-100vw.md_min-h-50vw.lg_min-h-33vw(v-show="infoVisible && works.length > 0")

    //- video player
    .fixed.overlay.transition.transform.duration-700.origin-right.py-16.md_p-20.xl_p-24.flex.bg-gray-200(ref="player", :class="{'pointer-events-none scale-x-0': !viewWork}", style="cursor:w-resize", @click="$router.go(-1)")
      .relative.w-full
        video.absolute.overlay.object-contain.object-center.transition-opacity.duration-700.pointer-events-none(v-for="(work, i) in works", :src="work.data.video.url", playsinline, :data-work="work.uid", @contextmenu.prevent, :class="{'opacity-0': viewWork !== work.uid}")
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Logo from '@/components/Logo'
import svgFleuron from '@/components/SVG-Fleuron'
import Info from '@/components/Info'
// import WorkThumb from '@/components/WorkThumb'
import Btn from '@/components/Btn'
import WorkView from '@/views/Work'
export default {
  name: 'Index',
  components: { WorkView, Logo, Info, svgFleuron, Btn },
  data () {
    return {
      squish: false,
      infoVisible: true,
      workPanel: this.$route.name === 'work',
      current: 0
    }
  },
  computed: {
    ...mapGetters(['workId']),
    ...mapState({
      address: state => state.address,
      works: state => state.prismic.works
    }),
    viewWork () {
      return this.$route.name === 'view' ? this.$route.params.work : null
    }
  },
  methods: {
    next () {
      this.current = this.current + 1 === this.slides.length ? 0 : this.current + 1
    }
  },
  watch: {
    current (to, from) {
      this.$refs.slidevideo[to].play()
      this.$refs.slidevideo[from].pause()
    },
    viewWork (next, prev) {
      next = next && this.$el.querySelector('video[data-work="' + next + '"]')
      prev = prev && this.$el.querySelector('video[data-work="' + prev + '"]')
      if (next) {
        next.currentTime = 0
        // this.$refs.player.requestFullscreen()
        setTimeout(() => {
          // next.style.opacity = '1'
          next.play()
        }, 500)
      }
      if (prev) {
        prev.pause()
        // prev.style.opacity = ''
        // document.exitFullscreen()
      }
    },
    '$route' (to, from) {
      if (to.name === 'work') {
        this.workPanel = true
      }
      if (to.name === 'index') {
        this.workPanel = false
      }
    }
  },
  created () {
    // prevent load on view (for now...)
    if (this.$route.name === 'view') {
      this.$router.replace('/')
    }
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

.index button{
  & svg *{ transition: all 100ms }
  &:hover svg *{
    fill: currentColor;
  }
}
</style>
