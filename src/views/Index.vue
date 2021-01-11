<template lang="pug">
  .index
    section.index.relative.min-h-screen.bg-yellow(:class="{'index--squished': $route.meta.isSingle}")
      //- child work (squishes in)
      transition(name="fade")
        router-link(to="/", v-show="$route.meta.isSingle").absolute.overlay.bg-black.z-20.cursor-pointer.opacity-25.md_opacity-50

      //- main
      .flex.flex-wrap.content-start.transition-opacity.duration-500
        header.absolute.top-0.left-0.w-full.z-20.text-white
          .absolute.top-0.left-0.w-full
            .flex.w-full.justify-between.items-center
              .p-10.px-12
                logo.block.text-white(style="height:3rem", alt="Folia")
              div
                button.p-10.focus_outline-none(v-if="!address", @click="$store.dispatch('connect')") Connect
                button.p-10.focus_outline-none.relative.group(v-else, @click="$store.dispatch('disconnect')")
                  span.group-hover_opacity-0.truncate {{ address.slice(0, 6) + '...' + address.slice(-4) }}
                  span.hidden.group-hover_block.absolute.overlay.text-right.p-10 Disconnect
        //- landing
        .w-full.bg-black.text-white.relative.flex.items-center.justify-center.font-sans.text-sm(style="height:90vh; cursor:e-resize", @click="next")
          transition-group(name="slide")
            .absolute.overlay(v-for="(slide, i) in slides", v-show="current === i", :key="i")
              video.absolute.overlay.object-cover.object-center(src="https://prismic-io.s3.amazonaws.com/folia-dev/0b70ee18-1a6b-4715-9e3a-7079141cf608_mov_bbb.mp4", autoplay, muted, @ended="next", ref="video", playsinline)
              .absolute.overlay(:style="{'mix-blend-mode':slide[0], 'background': slide[1]}")
          ul.absolute.bottom-0.left-0.w-full.flex.items-center.justify-center.pb-6
            li.p-4.cursor-pointer(v-for="(slide, i) in slides", @click.stop="current = i")
              .w-4.h-2.border-b.border-white(:class="{'bg-white': current === i}")
          //- span.opacity-50 (videos/slideshow)
        //- list
        template(v-for="n in 5")
          //- thumbs...
          work-thumb.w-full.md_w-1x2.lg_w-1x3(v-for="(doc, index) in works", :doc="doc", :key="doc.id + n")
        //- (repeat for demo)
        //- patch-thumb.w-full.md_w-1x2.lg_w-1x3(v-for="(patch, index) in works", :imgSrc="patch.image", :key="'second' + index", :index="index + 1")
        //- collectors link
        .block.w-full.md_w-1x2.lg_w-1x3.relative
          .pb-full
            .absolute.overlay.flex.items-center.justify-center.bg-black.text-white.font-sans.group
              span.group-hover_hidden Collectors
              span.hidden.group-hover_inline Coming Soon
      //- info
      info(v-show="infoVisible && works.length > 0")
    //- viewer
    section.viewer.bg-white.fixed.top-0.right-0.h-screen(:class="{'viewer--hidden': !$route.meta.isSingle}")
      transition(name="fade")
        router-view
</template>

<script>
import { mapState } from 'vuex'
// import TitleCard from '@/components/Index__TitleCard'
import Logo from '@/components/Logo'
import Info from '@/components/Info'
import WorkThumb from '@/components/WorkThumb'
export default {
  name: 'Index',
  components: { Logo, Info, WorkThumb },
  data () {
    return {
      squish: false,
      infoVisible: true,
      title: '',
      // slides: [['saturation', 'rgba(0,255,0,1)'], ['luminosity', 'rgba(0,255,0,1)'], ['color-burn', 'red']],
      slides: [['color-burn', 'cyan'], ['color-burn', 'red'], ['color-burn', 'violet']],
      current: 0
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
    }
  },
  watch: {
    current (to, from) {
      this.$refs.video[to].play()
      this.$refs.video[from].pause()
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

.index{
  transition:transform 500ms;
  transform-origin:top left;
  &.index--squished{
    transform:scale(0.1, 1);
  }
}
.viewer{
  width:90%;
  transition:transform 500ms;
  transform-origin:right top;
  &.viewer--hidden{
    transform:scale(0,1);
  }
}

@media (--breakpoint-md) {
  .index.index--squished{transform:scale(0.25, 1);}
  .viewer{width:75%;}
}

@media (--breakpoint-lg) {
  .index.index--squished{transform:scale(0.5, 1);}
  .viewer{width:50%;}
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
