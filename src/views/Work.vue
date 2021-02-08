<template lang="pug">
  article.work.w-full.text-white
    .relative.overflow-y-scroll.h-screen.scrollbars-hidden(v-if="doc")
      header.p-8.lg_p-12.lg_pb-16.flex.items-center
        .flex-1
          .flex.mb-10
            svg-fleuron.block.mr-2(style="width:0.96em;height:0.96em")
            div.leading-none {{ workId(doc.uid, true) }}
          //- div.leading-none {{ workId(doc.uid, true) }} — #[h1.inline {{ doc.data.artist }}] — {{ doc.data.title }} — {{ doc.data.year }}
          h1.font-bold {{ doc.data.artist }}
          div {{ doc.data.title }}, {{ doc.data.year }}
          div {{ work ? work.printed + '/' + work.editions : doc.data.edition }}

        button.block.group.relative.focus_outline-none(@click="buy")
          btn.bg-gray-900.px-12(theme="none")
            span.absolute.overlay.flex.items-center.justify-center.opacity-0.group-hover_opacity-100 BUY
            span.group-hover_opacity-0 {{ work ? weiToETH(work.price) : doc.data.price_eth }} ETH

            //- rich-text.mt-20(style="max-width:32em", :field="doc.data.description")
        //- .sticky.top-0.left-0.w-full
          .absolute.top-0.right-0.w-screen.h-screen.flex.p-48
          router-link.relative.w-full(v-if="doc.data.video.url", :to="{name: 'view', params: {work: doc.uid}}")
            //- .relative.w-full.origin-center(:style="{transform: 'scale(' + imgScale + ')'}")
            img.absolute.overlay.object-contain.object-center(:src="doc.data.icon.url")

      figure.relative.w-full.sm_w-10x12
        img.w-full.block(:src="doc.data.icon.url")
        //- play btn?
        router-link.absolute.overlay.flex.items-center.justify-center(v-if="doc.data.video.url", :to="{name: 'view', params: {work: doc.uid}}")
          <svg class="text-5xl lg_text-6xl xl_text-60 block" style="width:calc(59 / 38 * 1em); height: 1em" viewBox="0 0 59 38" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
            <path d="M1 1.49251L57.3157 19L0.999998 36.5075L1 1.49251Z" fill="rgba(255,255,255,0.9)" />
          </svg>

      section.text-lg.p-8.lg_p-12.lg_w-10x12(style="padding-bottom:25vh")
        //- .mb-12.flex.flex-wrap.whitespace-no-wrap.text-white.text-base(v-if="work")
          //- btn.bg-white.w-1x2.md_w-1x4.border-gray-500 No.
          btn.w-1x2.md_w-1x3.bg-gray-900(theme="none")
            | {{ work.printed }}/{{ work.editions }}
          btn.w-1x2.md_w-1x3.bg-gray-900(theme="none")
            | {{ weiToETH(work.price) }} ETH
          button.w-full.md_w-1x3
            btn.bg-gray-900(theme="none")
              span.transform.scale-95 BUY

        .children-mt-em(style="max-width:32em;")
          p(v-for="n in 3") Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        //- rich-text.mt-20(style="max-width:32em", :field="doc.data.description")

      //- footer.sticky.bottom-0.left-0.w-full.p-8.lg_pb-10.lg_px-12.flex.flex-wrap.whitespace-no-wrap(v-if="work")
        .flex.w-full.flex-wrap.whitespace-no-wrap.text-white.text-lg
          //- btn.bg-white.w-1x2.md_w-1x4.border-gray-500 No.
          btn.w-1x2.md_w-1x3.bg-gray-900(theme="none")
            | {{ work.printed }}/{{ work.editions }}
          btn.w-1x2.md_w-1x3.bg-gray-900(theme="none")
            | {{ weiToETH(work.price) }} ETH
          button.w-full.md_w-1x3
            btn.bg-gray-900(theme="none")
              span.transform.scale-95 BUY

    //- close btn
    //- button.md_hidden.absolute.top-0.right-0.p-10.focus_outline-none(@click="$router.push('/')", aria-lable="Close")
      svg-x.cursor-pointer(style="width:1.8rem;height:1.8rem;stroke-width:1px")
</template>

<script>
import { mapGetters } from 'vuex'
import RichText from '@/components/RichText'
import svgX from '@/components/SVG-X'
import Btn from '@/components/Btn'
import svgFleuron from '@/components/SVG-Fleuron'
export default {
  name: 'Work',
  data () {
    return {
      doc: undefined,
      work: undefined,
      imgScale: 1,
      imgOpacity: 1
    }
  },
  computed: {
    ...mapGetters(['weiToETH', 'workId'])
  },
  created () {
    this.fetchDoc()
    this.fetchWork()
  },
  methods: {
    async buy () {
      const id = this.workId(this.$route.params.work)
      await this.$store.dispatch('buy', id)
      this.fetchWork(true)
    },
    async fetchDoc () {
      this.doc = await this.$store.dispatch('prismic/getWork', this.$route.params.work)
    },
    async fetchWork (flush) {
      this.work = await this.$store.dispatch('getWork', { id: this.workId(this.$route.params.work), flush })
    }
  },
  components: { RichText, svgX, Btn, svgFleuron }
}
</script>

<style scoped>
</style>
