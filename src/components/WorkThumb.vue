<template lang="pug">
  .work-thumb.relative.bg-yellow.hover_shadow-inner-red.overflow-hidden
    //- image (.bg-white to prevent shadow poking through...)
    figure.pb-full.relative.z-10.cursor-pointer.bg-white.transition-transform.duration-400.bg-cover.bg-center(:data-dir="rand", :class="{'squish': squish}", @click="squish = !squish")
      img.absolute.overlay.z-10.object-cover.object-center(:src="doc.data.index_thumbnail.square.url", :alt="doc.data.index_thumbnail.alt")

    small.absolute.overlay.z-0.flex.overflow-hidden.text-md
      .w-full.flex.flex-col(:class="tableClasses")
        .flex-1.flex.px-2
          .w-1x2.flex.justify-center.items-center(v-for="artist in doc.data.artist.split(',')") {{ artist }}
          //- .w-full.flex.items-center.justify-evenly
            span
          //- .w-1x2.flex.items-center.justify-center
            span {{ doc.data.year }}
        .flex-1.flex.px-2
          .w-1x2.flex.items-center.justify-center {{ doc.data.year }}
          .w-1x2.flex.items-center.justify-center
            span
              template(v-if="work") {{ Number(work.printed) + 1 }}/{{ work.editions }}
              template(v-else) –
          //- .w-1x2.flex.items-center.justify-center
            span {{ work ? weiToETH(work.price) : doc.data.price_eth }} ETH
        .flex-1.flex(@click.stop)
          router-link.cursor-pointer(:to="{name: 'work', params: {work: doc.uid}}").w-1x2.flex.items-center.justify-center.btn-theme-darken View
          button.w-1x2.flex.items-center.justify-center.btn-theme-darken.cursor-pointer(@click="buy") Buy
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'PatchThumb',
  props: ['doc'],
  data () {
    return {
      squish: false, // Math.random() >= 0.25,
      rand: Math.floor(Math.random() * (3 - 0 + 1)),
      work: null
    }
  },
  computed: {
    ...mapGetters(['weiToETH']),
    tableClasses () {
      return {
        'pl-1x5': this.rand === 0,
        'pl-1x5 md_pl-0 md_pt-1x5': this.rand === 1,
        'pr-1x5': this.rand === 2,
        'pr-1x5 md_pr-0 md_pb-1x5': this.rand === 3
      }
    }
  },
  methods: {
    async buy () {
      await this.$store.dispatch('buy', this.doc.uid / 1000000)
      this.getWork(true)
    },
    async getWork (flush) {
      this.work = await this.$store.dispatch('getWork', { id: this.doc?.uid / 1000000, flush })
    }
  },
  async created () {
    this.getWork()
  }
}
</script>

<style scoped>
@import '../style/variables';

figure{
  /*transition:transform 500ms 100ms;
  transform-origin: top left;*/

  /* mobile, only left / right */
  &[data-dir="0"],
  &[data-dir="1"]{
    transform-origin:left center;
    &.squish{
      transform:scale(.22,1);
    }
  }

  &[data-dir="2"],
  &[data-dir="3"]{
    transform-origin:right center;
    &.squish{
      transform:scale(.22,1);
    }
  }

  @media (--breakpoint-md) {
    &[data-dir="1"]{
      transform-origin:top center;
      &.squish{
        transform:scale(1,.22);
      }
    }
    &[data-dir="3"]{
      transform-origin:bottom center;
      &.squish{
        transform:scale(1,.22);
      }
    }
  }
}
</style>
