<template lang="pug">
  .patch.relative.bg-yellow.hover-1
    figure.pb-100.relative.z1.cursor-pointer.bg-cover.bg-white.bg-center(:style="'background-image:url(' + doc.data.icon.url + ')'", :data-dir="rand", :class="{'squish': squish}", @click="squish = !squish")
    small.absolute.overlay.z0.flex.overflow-hidden
      .col-12.flex.flex-column(:class="tableClasses")
        .flex-auto.flex
          .col-6.flex.items-center.justify-center
            span {{ doc.data.artist }}
          .col-6.flex.items-center.justify-center
            span {{ doc.data.year }}
        .flex-auto.flex
          .col-6.flex.items-center.justify-center
            span.sans.h5 XX/100
          .col-6.flex.items-center.justify-center
            span.sans.h5 {{ doc.data.price_eth }} ETH
        .flex-auto.flex(@click.stop="doNothing")
          router-link.cursor-pointer(:to="{name: 'Patch', params: {id: doc.uid}}").col-6.flex.items-center.justify-center.hover-3
            span View
          .col-6.flex.items-center.justify-center.hover-3.cursor-pointer
            span Buy
</template>

<script>
export default {
  name: 'PatchThumb',
  props: ['doc'],
  data () {
    return {
      squish: Math.random() >= 0.25,
      rand: Math.floor(Math.random() * (3 - 0 + 1))
    }
  },
  computed: {
    tableClasses () {
      return {
        'pl-25': this.rand === 0,
        'pl-25 md-pl0 md-pt-25': this.rand === 1,
        'pr-25': this.rand === 2,
        'pr-25 md-pr0 md-pb-25': this.rand === 3
      }
    }
  },
  methods: {
    doNothing () {}
  }
}
</script>

<style scoped>
@import '../style/variables';

figure{
  transition:transform 500ms 100ms;
  transform-origin: top left;

  /* mobile, only left / right */
  &[data-dir="0"],
  &[data-dir="1"]{
    transform-origin:left center;
    &.squish{
      transform:scale(.25,1);
    }
  }

  &[data-dir="2"],
  &[data-dir="3"]{
    transform-origin:right center;
    &.squish{
      transform:scale(.25,1);
    }
  }

  @media (--breakpoint-md) {
    &[data-dir="1"]{
      transform-origin:top center;
      &.squish{
        transform:scale(1,.25);
      }
    }
    &[data-dir="3"]{
      transform-origin:bottom center;
      &.squish{
        transform:scale(1,.25);
      }
    }
  }
}
</style>
