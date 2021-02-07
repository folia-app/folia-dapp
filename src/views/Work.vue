<template lang="pug">
  article.work.w-full
    section.relative.overflow-y-scroll.h-screen.flex.flex-col.scrollbars-hidden(v-if="doc")

      figure.relative.w-full
        img.w-full.block(:src="doc.data.icon.url")
        //- play btn?
        router-link.absolute.overlay.flex.items-center.justify-center(v-if="doc.data.video.url", :to="{name: 'view', params: {work: doc.uid}}")
          <svg class="text-5xl lg_text-6xl xl_text-60 block" style="width:calc(59 / 38 * 1em); height: 1em" viewBox="0 0 59 38" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
            <path d="M1 1.49251L57.3157 19L0.999998 36.5075L1 1.49251Z" stroke="white" stroke-width="1px" fill="none" />
          </svg>

      .p-10.lg_p-16.left-align.flex-1.md_w-10x12(style="padding-bottom:10rem")
        header.text-lg
          .div {{ workId }}
          h1.font-bold {{ doc.data.artist }}
          div {{ doc.data.title }}
          div {{ doc.data.year }}
          rich-text.mt-20(style="max-width:32em", :field="doc.data.description")

      footer.sticky.bottom-0.left-0.p-8.flex.flex-wrap.whitespace-no-wrap
        //- btn.bg-white.w-1x2.md_w-1x4.border-gray-500 No.
        btn.bg-white.w-1x3.border-gray-500(style="background:rgba(255,255,255,0.5);backdrop-filter:blur(16px)") {{ Number(work.printed) + 1 }}/{{ work.editions }}
        btn.bg-white.w-1x3.border-gray-500(style="background:rgba(255,255,255,0.5);backdrop-filter:blur(16px)") {{ work ? toETH(work.price) : doc.data.price_eth }} ETH
        button.w-1x3
          btn.bg-white.border-gray-500.hover_bg-black.hover_text-white.focus_bg-black.focus_text-white(style="background:rgba(255,255,255,0.5);backdrop-filter:blur(16px)")
            span.transform.scale-95 BUY

    //- close btn
    //- button.absolute.top-0.right-0.p-10.focus_outline-none(@click="$router.push('/')", aria-lable="Close")
      svg-x.cursor-pointer(style="width:1.8rem;height:1.8rem;stroke-width:1px")
</template>

<script>
import { mapGetters } from 'vuex'
import RichText from '@/components/RichText'
import svgX from '@/components/SVG-X'
import Btn from '@/components/Btn'
export default {
  name: 'Work',
  data () {
    return {
      doc: undefined,
      work: {}
    }
  },
  computed: {
    ...mapGetters(['toETH']),
    workId () {
      return ('00' + Number(this.$route.params.work) / 1000000).slice(-3)
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
      this.doc = await this.$store.dispatch('prismic/getWork', this.$route.params.work)
    },
    async getWork (flush) {
      this.work = await this.$store.dispatch('getWork', { id: this.workId, flush })
    }
  },
  components: { RichText, svgX, Btn }
}
</script>

<style scoped>
</style>
