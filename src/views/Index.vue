<template lang="pug">
  .index

    //- BODY - squishes for video player
    .relative.transform.transition-transform.origin-left.duration-700(:class="{'scale-x-0': viewToken}")
      //- (WORK PANEL)
      .sticky.z-20.top-0.right-0.w-full.h-0
        .absolute.top-0.right-0.transition.duration-500.transform.origin-right.bg-black.min-h-screen(:class="[panelWidths[0], {'scale-x-0': !panelOpen}]")
          transition-group(name="pagesfade")
            set-view(v-if="$route.name === 'set'", key="set")
            work-view(v-else-if="activeWork", :id="activeWork", :key="activeWork")

      //- close workpanel
      transition(name="fade")
        button.focus_outline-none(v-show="panelOpen", @click="$router.push('/')").absolute.overlay.bg-black.z-10.cursor-pointer.opacity-25.md_opacity-50

      //- MAIN
      main.index.relative.min-h-screen.transition.duration-500.transform.origin-left(:class="panelOpen ? panelWidths[1] : ''")
        //- HEADER
        header.absolute.top-0.left-0.w-full.z-20.text-white
          .absolute.top-0.left-0.w-full
            .flex.w-full.justify-between.items-center
              //- logo
              .p-10.px-12
                button.focus_outline-none(@click="onLogoClick", aria-label="About Folia")
                  logo.block.text-white.h-12.cursor-poiner(aria-label="Folia")
                //- svg-fleuron.block.text-white(style="height:3rem")
              div
                button.p-10.focus_outline-none(v-if="!address", @click="$store.dispatch('connect')") Connect
                button.p-10.focus_outline-none.relative.group(v-else, @click="$store.dispatch('disconnect')")
                  span.group-hover_opacity-0.truncate {{ address.slice(0, 6) + '...' + address.slice(-4) }}
                  span.hidden.group-hover_block.absolute.overlay.text-right.p-10 Disconnect
        //- landing
        section.w-full.bg-black.text-white.relative.flex.items-center.justify-center.font-sans.text-sm.h-90vh.md_h-93vh-off.md_h-screen(:style="{cursor: carouselEnabled > 1 ? 'e-resize' : 'auto'}", @click="carouselEnabled && next()")
          template(v-if="home")
            //- slides...
            transition-group(:name="home.landing.length > 1 ? 'slide' : 'none'")
              figure.absolute.overlay(v-for="(slice, i) in home.landing", v-show="current === i", :key="i")
                landing-slide-work(:slice="slice")

          //- dots
          //- ul.absolute.bottom-0.left-0.w-full.flex.items-center.justify-center.pb-6(v-if="slides.length > 1")
            li.p-4.cursor-pointer(v-for="(slide, i) in slides", @click.stop="current = i")
              .w-4.h-2.border-b.border-white(:class="{'bg-white': current === i}")
          //- span.opacity-50 (videos/slideshow)

        section.flex.flex-col-reverse.sm_flex-row.flex-wrap.overflow-hidden(v-if="home")
          //- thumbs...
          //- work-thumb.w-full.md_w-1x2.lg_w-1x3(v-for="(doc, index) in works", :doc="doc", :key="doc.id + n")
          template(v-for="(slice, i) in home.body")
            //- tiles
            template(v-if="slice.slice_type === 'tile'")
              //- items...
              prismic-link.w-full.sm_w-1x3.bg-yellow.hover_shadow-inner-red.shadow-lg(:field="slice.primary.link", :linkResolver="linkResolver")
                .pb-full.relative
                  rich-text.absolute.overlay.p-8.lg_p-12.font-karrik.text-2xl.sm_text-lg.lg_text-2xl(:field="slice.primary.title")
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

    //- video player
    .fixed.overlay.transition.transform.duration-700.origin-right.py-5.md_p-10.lg_p-12.xl_p-24.flex.bg-gray-200(:class="{'pointer-events-none scale-x-0': !viewToken}")
      view-token(:token="viewToken", @close="closeViewer")
      //- figure.relative.w-full.transition-opacity.duration-700(v-for="(metadata, i) in metadatas", :class="{'opacity-0': viewToken !== metadata._work}")
        //- video element should be present so you can play from other views... (no child route)
        video.absolute.overlay.object-contain.object-center(v-if="metadata.animation_url_optim", :src="metadata.animation_url_optim", playsinline, :data-work="metadata._work", @contextmenu.prevent, preload="auto", @click.stop="$event => $event.target.paused ? $event.target.play() : null", @ended="$router.go(-1)", :poster="metadata.image")
      //- back btn
        button.absolute.top-0.left-0.h-full.w-1x4.focus_outline-none(@click.stop="$router.go(-1)", aria-label="Go back", style="cursor: w-resize")
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
let lastRt
export default {
  name: 'Index',
  components: { WorkView, Logo, Info, svgFleuron, Btn, LandingSlideWork, ViewToken, SetView, RichText },
  data () {
    return {
      squish: false,
      infoVisible: true,
      // workPanel: this.$route.name === 'work',
      panelOpen: this.$route.meta.layout === 'panel',
      activeWork: this.$route.params.work,
      current: 0,
      panelWidths: []
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
      return this.$route.name === 'view-token' ? this.$route.params.token : null
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
      const work = this.workDocs.find(doc => doc.uid === this.$route.params.work)
      const isWide = work?.data.page_layout === 'generative'
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
      // close panel ?
      if (to.name === 'index') {
        this.closeWorkPanel()
      }
      // update active work ?
      if (to.params.work) {
        this.activeWork = to.params.work
      }
    },
    workDocs () {
      this.setPanelWidths()
    }
  },
  created () {
    // prevent load on view (for now...)
    if (this.$route.name === 'view') {
      this.$router.replace('/')
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
