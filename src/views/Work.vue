<template lang="pug">
  article.work.w-full.text-white
    .relative.overflow-y-scroll.h-screen.scrollbars-hidden(v-if="doc")

      .absolute.top-0.left-0.w-full(:style="{opacity: imgOpacity}")
        header.absolute.top-0.left-0.p-8.left-align.flex.items-center.text-md
          svg-fleuron.block.mr-2(style="width:0.98em;height:0.98em;margin-bottom:2px")
          div.leading-none {{ workId(doc.uid, true) }} — #[h1.inline {{ doc.data.artist }}] — {{ doc.data.title }} — {{ doc.data.year }}
          //- h1.font-bold {{ doc.data.artist }}
          //- div {{ doc.data.title }}, {{ doc.data.year }}
          //- div Ed. of 3

        .absolute.z-30.top-0.right-0.text-gray-700.hover_text-white
          button.p-8.focus_outline-none(v-if="!address", @click="$store.dispatch('connect')") Connect
          button.p-8.focus_outline-none.relative.group(v-else, @click="$store.dispatch('disconnect')")
            span.group-hover_opacity-0.truncate {{ address.slice(0, 6) + '...' + address.slice(-4) }}
            span.hidden.group-hover_block.absolute.overlay.text-right.p-10 Disconnect

            //- rich-text.mt-20(style="max-width:32em", :field="doc.data.description")
        //- .sticky.top-0.left-0.w-full
        .absolute.top-0.right-0.w-screen.h-screen.flex.p-48
          router-link.relative.w-full(v-if="doc.data.video.url", :to="{name: 'view', params: {work: doc.uid}}")
            //- .relative.w-full.origin-center(:style="{transform: 'scale(' + imgScale + ')'}")
            img.absolute.overlay.object-contain.object-center(:src="doc.data.icon.url")

          //- figure.relative.w-10x12
            img.w-full.block(:src="doc.data.icon.url")
            //- play btn?
            //- router-link.absolute.overlay.flex.items-center.justify-center(v-if="doc.data.video.url", :to="{name: 'view', params: {work: doc.uid}}")
              <svg class="text-5xl lg_text-6xl xl_text-60 block" style="width:calc(59 / 38 * 1em); height: 1em" viewBox="0 0 59 38" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
                <path d="M1 1.49251L57.3157 19L0.999998 36.5075L1 1.49251Z" stroke="white" stroke-width="1px" fill="none" />
              </svg>

      //- section.text-lg.px-12.children-mt-em.pb-64(style="max-width:32em; padding-top:100vh")
        p(v-for="n in 3") Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        //- rich-text.mt-20(style="max-width:32em", :field="doc.data.description")

      //- footer.sticky.bottom-0.left-0.p-8.lg_pb-10.lg_px-12.flex.flex-wrap.whitespace-no-wrap(v-if="work")
        //- btn.bg-white.w-1x2.md_w-1x4.border-gray-500 No.
        btn.bg-white.w-1x2.md_w-1x3.border.border-gray-500(style="background:rgba(255,255,255,0.5);backdrop-filter:blur(16px)")
          | {{ work.printed }}/{{ work.editions }}
        btn.bg-white.w-1x2.md_w-1x3.border.border-gray-500(style="background:rgba(255,255,255,0.5);backdrop-filter:blur(16px)")
          | {{ weiToETH(work.price) }} ETH
        button.w-full.md_w-1x3.-mt-px
          btn.bg-white.border.border-gray-500.hover_bg-black.hover_text-white.focus_bg-black.focus_text-white(style="background:rgba(255,255,255,0.5);backdrop-filter:blur(16px)")
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
      const id = this.workId(this.workId(this.$route.params.work))
      await this.$store.dispatch('buy', id)
      this.fetchWork(true)
    },
    async fetchDoc () {
      this.doc = await this.$store.dispatch('prismic/getWork', this.$route.params.work)
    },
    async fetchWork (flush) {
      this.work = await this.$store.dispatch('getWork', { id: this.workId(this.$route.params.work), flush })
    },
    onScroll (e) {
      requestAnimationFrame(() => {
        // const y = e.target.scrollTop
        // this.imgScale = Math.min(1, Math.max(1 - y * 0.0001, 0.95))
        // this.imgOpacity = Math.min(1, Math.max(1 - y * 0.003, 0.05))
      })
    }
  },
  components: { RichText, svgX, Btn, svgFleuron }
}
</script>

<style scoped>
</style>
