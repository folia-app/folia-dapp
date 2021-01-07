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
            .flex.w-full.justify-between
              h1.p-10 [logo]
              div
                button.p-10.focus_outline-none(v-if="!address", @click="$store.dispatch('connect')") Connect
                button.p-10.focus_outline-none.relative.group(v-else, @click="$store.dispatch('disconnect')")
                  span.group-hover_opacity-0 {{ address }}
                  span.hidden.group-hover_block.absolute.overlay.text-right.p-10 Disconnect
        //- landing
        .w-full.bg-black.text-white.relative.flex.items-center.justify-center.font-sans.text-sm(style="height:85vh")
          span.opacity-50 (videos/slideshow)
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
import Info from '@/components/Info'
import WorkThumb from '@/components/WorkThumb'
export default {
  name: 'Index',
  components: { Info, WorkThumb },
  data () {
    return {
      squish: false,
      infoVisible: true,
      title: ''
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
</style>
