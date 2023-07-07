<template lang="pug">
  .index

    .fixed.overlay.z-50.transition.transform.duration-700.origin-right.py-5.md_p-10.lg_p-12.xl_p-24.flex.bg-black(:class="{'pointer-events-none scale-x-0ff opacity-0': !viewToken}")
      view-token(:token="$route.params.token", :visible="viewToken", @close="closeViewer")
    //- (token viewer)
    //- .fixed.overlay.z-50.transition.transform.duration-700.origin-right.py-5.md_p-10.lg_p-12.xl_p-24.flex.bg-black(:class="{'pointer-events-none scale-x-0ff opacity-0': !viewToken}")
      view-token(:token="viewToken", @close="closeViewer")

    //- BODY - squishes for video player
    .relative.transform.transition-transform.origin-left.duration-700(:class="{'scale-x-0ff': viewToken}")
      //- (WORK PANEL)
      .sticky.z-20.top-0.right-0.w-full.h-0
        .absolute.top-0.right-0.transition-all.duration-500.transform.origin-right.bg-black.min-h-screen(:class="[panelWidths[0], {'scale-x-0': !panelOpen}]")
          transition-group(name="pagesfade", @before-enter="setPanelWidths")
            set-view(v-if="$route.name === 'set'", key="set")
            work-view(v-else-if="activeWork", :id="activeWork", :key="activeWork")

      //- close workpanel
      transition(name="fade")
        button.focus_outline-none(v-show="panelOpen", @click="$router.push('/')").absolute.overlay.bg-black.z-10.cursor-pointer.opacity-25.md_opacity-50

      //- MAIN
      main.index.relative.min-h-screen.transition.duration-500.transform.origin-left(:class="panelOpen ? panelWidths[1] : ''")
        //- HEADER
        header.absolute.top-0.left-0.w-full.z-20.text-white.pointer-events-none(style="mix-blend-mode:difference")
          .absolute.top-0.left-0.w-full
            .flex.w-full.justify-between.items-center
              //- logo
              .p-10.md_px-12.pointer-events-auto
                button.focus_outline-none(@click="onLogoClick", aria-label="About Folia")
                  logo.block.text-white.h-12.cursor-poiner(aria-label="Folia")
                //- svg-fleuron.block.text-white(style="height:3rem")
              div.pointer-events-auto
                button.p-10.focus_outline-none(v-if="!address", @click="$store.dispatch('connect')") Connect
                button.p-10.focus_outline-none.relative.group(v-else, @click="$store.dispatch('disconnect')")
                  span.group-hover_opacity-0.truncate {{ address.slice(0, 6) + '...' + address.slice(-4) }}
                  span.hidden.group-hover_block.absolute.overlay.text-right.p-10 Disconnect

        //- landing
        observer.w-full.bg-black.text-white.relative.flex.items-center.justify-center.font-sans.text-sm.h-90vh.md_h-93vh-off.md_h-screen(:threshold="0.5", @visible="autoplayCarousel", @hidden="pauseCarousel")
          template(v-if="home")
            //- slides...
            transition-group(:name="carouselEnabled ? 'slide' : 'none'")
              figure.absolute.overlay(v-for="(slice, i) in home.landing", v-show="current === i", :key="i")
                landing-slide-work(:slice="slice", @next="carouselEnabled && nextSlide(false)", :isCarousel="carouselEnabled", :isActive="current === i")

          //- dots
          //- ul.absolute.bottom-0.left-0.w-full.flex.items-center.justify-center.pb-6(v-if="slides.length > 1")
            li.p-4.cursor-pointer(v-for="(slide, i) in slides", @click.stop="current = i")
              .w-4.h-2.border-b.border-white(:class="{'bg-white': current === i}")
          //- span.opacity-50 (videos/slideshow)

        section.flex.flex-wrap.overflow-hidden.bg-yellow(v-if="home")
          //- thumbs...
          //- work-thumb.w-full.md_w-1x2.lg_w-1x3(v-for="(doc, index) in works", :doc="doc", :key="doc.id + n")
          template(v-for="(slice, i) in home.body")
            //- auctions
            template(v-if="slice.slice_type === 'announcement'")
              slice-announcement.w-full(:slice="slice")

            //- auctions
            template(v-if="slice.slice_type === 'auctions'")
              slice-auctions.w-full(:slice="slice", :active="$route.name === 'index'")

            //- tiles
            template(v-if="slice.slice_type === 'tile'")
              //- items...
              slice-tile.w-full.sm_w-1x2.md_w-1x3.xl_w-1x4(:slice="slice", :class="{'md_z-10': i % 2 === 0}")
              //- prismic-link.w-full.sm_w-1x2.md_w-1x3.xl_w-1x4.bg-yellow.lg_hover_shadow-inner-red.-shadow-md.md_shadow-lg(:field="slice.primary.link", :linkResolver="linkResolver", :class="{'md_z-10': i % 2 === 0}")
                .pb-ar-2x1.sm_pb-full.relative
                  rich-text.absolute.overlay.p-8.lg_p-12.font-karrik.text-2xl.sm_text-lg.lg_text-2xl.leading-tight(:field="slice.primary.title")
                  //- counter...
                  .absolute.bottom-0.right-0.p-8.lg_p-12
                    template(v-if="slice.primary.counter === 'sold-out'")
                      sold-out-dot
            //- slice: works grid
            //- template(v-if="slice.slice_type === 'works_grid'")
              .slice-works-grid.w-full.flex.flex-wrap
                //- items...
                router-link.w-full.md_w-1x2.lg_w-1x3.bg-yellow.hover_shadow-inner-red(v-for="item in slice.items", :to="{name: 'work', params: {work: item.work.uid}}")
                  .pb-full.relative
                    .absolute.overlay.flex.items-center.justify-center {{ workId(item.work.uid, true) }}

                //- 002...
                .relative.block.w-full.md_w-1x2.lg_w-1x3
                  .pb-full
                    .absolute.overlay.flex.items-center.justify-center.bg-black.text-white.border-b.md_border-b-0.md_border-r.border-gray-800.font-sans.group
                      span.group-hover_hidden 003
                      span.hidden.group-hover_inline Coming Soon

              //- collectors link
              //- .hidden.lg_block.relative.w-full.md_w-1x2.lg_w-1x3
                .pb-full
                  .absolute.overlay.flex.items-center.justify-center.bg-black.text-white.font-sans.group
                    span.group-hover_hidden Collectors
                    span.hidden.group-hover_inline Coming Soon

        //- info
        info.w-full.min-h-100vw.sm_min-h-50vw.lg_min-h-33vw(v-show="infoVisible && workDocs.length > 0")

</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Logo from '@/components/Logo'
import svgFleuron from '@/components/SVG-Fleuron'
import Info from '@/components/Info'
// import WorkThumb from '@/components/WorkThumb'
import Btn from '@/components/Btn'
import WorkView from '@/views/Work'
import SetView from '@/views/Set'
import ViewToken from '@/views/ViewToken'
import LandingSlideWork from '@/components/LandingSlideWork'
import RichText from '@/components/RichText'
import linkResolver from '@/plugins/prismic/link-resolver'
import SliceTile from '@/slices/SliceTile'
import SliceAuctions from '@/slices/SliceAuctions'
import SliceAnnouncement from '@/slices/SliceAnnouncement'
import Observer from '@/components/Observer'
let lastRt
export default {
  name: 'Index',
  components: { SliceTile, WorkView, Logo, Info, svgFleuron, Btn, LandingSlideWork, ViewToken, SetView, RichText, SliceAuctions, SliceAnnouncement, Observer },
  data () {
    return {
      squish: false,
      infoVisible: true,
      // workPanel: this.$route.name === 'work',
      panelOpen: this.$route.meta.layout === 'panel',
      activeWork: this.$route.params.work,
      current: 0,
      panelWidths: [],
      carouselTimer: null
    }
  },
  computed: {
    ...mapState({
      home: state => state.prismic.docs.find(doc => doc.type === 'home')?.data,
      address: state => state.address,
      // doc: state => state.prismic.
      // workDocs: state => state.prismic.works,
      metadatas: state => state.metadatas
    }),
    ...mapGetters({
      workDocs: 'prismic/works',
      workId: 'workId'
    }),
    viewToken () {
      // return this.$route.name === 'view-token' ? this.$route.params.token : null
      return this.$route.name?.endsWith('-tokenviewer')
    },
    carouselEnabled () {
      return this.home?.landing.length > 1
    }
  },
  methods: {
    linkResolver,
    next () {
      this.current = this.current + 1 === this.workDocs.length ? 0 : this.current + 1
    },
    onLogoClick () {
      document.getElementById('info').scrollIntoView({ behavior: 'smooth' })
    },
    closeViewer () {
      return lastRt?.name ? this.$router.go(-1) : this.$router.push('/')
    },
    setPanelWidths () {
      let isWide = this.$route.meta.panelWide
      if (!isWide) {
        const doc = this.workDocs.find(doc => doc.uid === this.$route.params.work)
        const isGenerative = ['generative', 'wide'].includes(doc?.data.page_layout)
        // const isReleased = this.$store.getters['prismic/isReleased']({ doc })
        isWide = isGenerative // && isReleased
      }

      // [workPanel, body]
      let widths = ['w-full sm_w-3x4 lg_w-1x2', 'scale-x-0 sm_scale-x-25 lg_scale-x-50']
      if (isWide) {
        widths = ['w-full lg_w-9x10', 'scale-x-0 lg_scale-x-10']
      }
      this.panelWidths = widths
    },
    openPanel () {
      this.setPanelWidths()
      this.panelOpen = true
      document.body.style.overflow = 'hidden'
    },
    closeWorkPanel () {
      document.body.style.overflow = ''
      this.panelOpen = false
      setTimeout(() => this.setPanelWidths(), 700) // after transition
    },
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
  beforeRouteEnter (to, from, next) {
    lastRt = from
    next()
  },
  beforeRouteUpdate (to, from, next) {
    lastRt = from
    next()
  },
  watch: {
    '$route' (to, from) {
      // open panel ?
      if (to.meta.layout === 'panel') {
        this.openPanel()
      }
      // index / no panel ?
      if (to.name === 'index') {
        this.closeWorkPanel()
        this.autoplayCarousel()
      } else {
        this.pauseCarousel()
      }
      // update active work ?
      if (to.params.work) {
        this.activeWork = to.params.work.toString()
      }
    },
    workDocs () {
      this.setPanelWidths()
    },
    home (doc) {
      if (doc) this.autoplayCarousel()
    }
  },
  created () {
    // prevent load on view (for now...)
    if (this.$route.name === 'view') {
      // this.$router.replace('/')
    }
  },
  metaInfo () {
    if (this.$route.name === 'index') {
      return {
        meta: this.$store.getters.meta({})
      }
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
</style>
