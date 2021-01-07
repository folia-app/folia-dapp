<template lang="pug">
  article.work.w-full
    section.relative.overflow-y-scroll.h-screen(v-if="doc")

      figure.relative.md_w-2x3.md-w-66vmin
        .relative.pb-full
          img.absolute.overlay.object-contain.object-left(:src="doc.data.icon.url")

      .p-10.md-p-16.left-align(style="padding-bottom:10rem")
        header
          h1.font-bold {{ doc.data.artist }}
          div {{ doc.data.title }}
          div {{ doc.data.year }}
          hr.mt-16
          .flex.justify-between.items-center.center.py-3
            .p-0.md_px-3.left-align
              .font-sans No.
            .p-0.md_px-3
              .font-sans(v-if="work") {{ Number(work.printed) + 1 }}/{{ work.editions }}
            .p-0.md_px-3
              .font-sans {{ work ? toETH(work.price) : doc.data.price_eth }} ETH
            .w-1x4.p-0.md_px-3
              button.cursor-pointer.w-full.block.border.p-3.bg-gray-100(@click="buy") Buy
          hr

        //- section.mt3
          table.mt-1em.w-full.font-sans.h6.md-h4(border="1", style="table-layout:fixed;white-space:nowrap")
            thead
              td.center No.
              td.center Created
              td Owner
              td ETH
            tr(v-for="(n, index) in 20")
              td.center {{index + 1}}
              td.center 2018.06.10
              td.overflow-hidden(title="0xa9b4e8c355e1122ed2d4222252c2e47e48162e40", style="text-overflow:ellipsis") 0xa9b4e8c355e1122ed2d4222252c2e47e48162e40
              td.right-align 0.<span v-if="index < 9">0</span>{{index + 1}}

        //- close btn
        button.absolute.top-0.right-0.p-10.focus_outline-none(@click="$router.push('/')", aria-lable="Close")
          svg-x.cursor-pointer(style="width:1.5rem;height:1.5rem;stroke-width:1px")
</template>

<script>
import { mapGetters } from 'vuex'
import svgX from '@/components/SVG-X'
export default {
  name: 'Work',
  components: { svgX },
  data () {
    return {
      doc: undefined,
      work: {}
    }
  },
  computed: {
    ...mapGetters(['toETH']),
    workId () {
      return this.$route.params.id / 1000000
    }
  },
  created () {
    this.getDoc()
    this.getWork()
  },
  methods: {
    async buy () {
      await this.$store.dispatch('buy', this.workId)
      this.getWork(true)
    },
    async getDoc () {
      this.doc = await this.$store.dispatch('prismic/getWork', this.$route.params.id)
    },
    async getWork (flush) {
      this.work = await this.$store.dispatch('getWork', { id: this.workId, flush })
    }
  }
}
</script>

<style scoped>
@import '../style/variables';

figure{
  max-width:calc(100% - 5.5rem);
}

td{
  padding:0 0.25em;
  &:first-child{
    width:2.5em;
  }
  &:nth-child(2){
    width:7em;
  }
  &:nth-child(3){
    width:auto;
  }
  &:last-child{
    width:6em;
  }
}

@media (--breakpoint-md) {
  td:last-child{
    width:4em;
  }
}
</style>
