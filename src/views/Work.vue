<template lang="pug">
  article.work.col-12
    section.relative.overflow-y-scroll.h-100vh(v-if="doc")
      .absolute.top-0.right-0.p2
        close-btn.cursor-pointer(@click="$router.push('/')", style="width:1.5rem;height:1.5rem;stroke-width:1px")
      figure.relative.md-w-66vmin
        .bg-top.bg-left.pb-100.bg-contain.bg-no-repeat(:style="'background-image:url(' + doc.data.icon.url + ')'")
      .p2.md-p3.left-align(style="padding-bottom:10rem")
        header
          h1.bold {{ doc.data.artist }}
          div {{ doc.data.title }}
          div {{ doc.data.year }}
          hr.mt3
          .flex.justify-between.items-center.center.py1
            .p0.md-px1.left-align
              .sans.h4 No.
            .p0.md-px1
              .sans.h4 {{ Number(work.printed) + 1 }}/{{ work.editions }}
            .p0.md-px1
              .sans.h4 {{ work ? toETH(work.price) : doc.data.price_eth }} ETH
            .col-3.p0.md-px1
              button.cursor-pointer.col-12.block.btn-style-1.uppercase.h4(@click="buy") Buy
          hr
        section.mt3
          table.mt-1em.col-12.sans.h6.md-h4(border="1", style="table-layout:fixed;white-space:nowrap")
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
</template>

<script>
import { mapGetters } from 'vuex'
import CloseBtn from '@/components/SVG-X'
export default {
  name: 'Work',
  components: { CloseBtn },
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
