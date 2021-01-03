<template lang="pug">
  div
    //- index
    section.index.relative.min-h-100vh.bg-yellow(:class="{'index--squished': $route.meta.isSingle}")
      transition(name="fade")
        router-link(to="/", v-show="$route.meta.isSingle").absolute.overlay.bg-black.z2.cursor-pointer.opacity-33.md-opacity-50
      .flex.flex-wrap.content-start.trans-opacity
        //- intro card
        //- title-card(:tileMode="workPatches.length > 0")
        template(v-for="n in 3")
          //- thumbs...
          patch-thumb.col-12.md-col-6.lg-col-4(v-for="(doc, index) in works", :doc="doc", :key="doc.id + n")
        //- (repeat for demo)
        //- patch-thumb.col-12.md-col-6.lg-col-4(v-for="(patch, index) in works", :imgSrc="patch.image", :key="'second' + index", :index="index + 1")
        //- collectors link
        router-link.block.col-12.md-col-6.lg-col-4.h-100vw.md-h-50vw.lg-h-33vw.flex.items-center.justify-center.bg-black.white(to="/users")
          span.sans Collectors
      //- info
      info(v-show="infoVisible && works.length > 0")
    //- viewer
    section.viewer.bg-white.fixed.top-0.right-0.h-100vh(:class="{'viewer--hidden': !$route.meta.isSingle}")
      transition(name="fade")
        router-view
</template>

<script>
import { mapState } from 'vuex'
// import TitleCard from '@/components/Index__TitleCard'
import Info from '@/components/Info'
import PatchThumb from '@/components/PatchThumb'
export default {
  name: 'Index',
  components: { Info, PatchThumb },
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
      works: state => state.prismic.works
    })
  },
  methods: {
    setTitle () {
      const titles = ['fire sale', 'bargain<br>basement', 'cash grab', 'editions', 'pog<br>liquidation', 'get rich<br>schemes', 'wares']
      const index = Math.floor(Math.random() * (3 - 0 + 1))
      this.title = titles[index]
    },
    closePatchView () {

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
