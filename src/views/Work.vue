<template lang="pug">
  article.work.w-full.text-white
    .relative.overflow-y-scroll.h-screen.scrollbars-hidden(v-if="doc")
      header.p-8.lg_p-12.lg_pb-16.flex.items-center
        .flex-1.text-lg
          .flex.mb-10
            svg-fleuron.block.mr-2(style="width:0.96em;height:0.96em")
            div.leading-none {{ workId(doc.uid, true) }}
          //- div.leading-none {{ workId(doc.uid, true) }} — #[h1.inline {{ doc.data.artist }}] — {{ doc.data.title }} — {{ doc.data.year }}
          div {{ doc.data.title }}
          .font-bold {{ doc.data.artist }}
          rich-text(:field="doc.data.medium")
          div
            template(v-if="work") {{ work.printed }}/{{work.editions}} Minted
            template(v-else) Edition of {{ doc.data.edition }}
          //- div {{ work ? work.editions : doc.data.edition }}
          //- div(v-if="work") Available {{ work.editions - work.printed }}
          //- div {{ work ? work.printed + '/' + work.editions : 'ed. of ' + doc.data.edition }}
          div {{ work ? weiToETH(work.price) : doc.data.price_eth }} ETH

        button.block.group.relative.focus_outline-none(v-if="canBuy", @click="buy", :disabled="!isReleased")
          btn.px-16(theme="drkgray", :disabled="!isReleased") BUY
            //- span.absolute.overlay.flex.items-center.justify-center.opacity-0.group-hover_opacity-100 BUY
            //- span.group-hover_opacity-0 {{ work ? weiToETH(work.price) : doc.data.price_eth }} ETH

            //- rich-text.mt-20(style="max-width:32em", :field="doc.data.description")
        //- .sticky.top-0.left-0.w-full
          .absolute.top-0.right-0.w-screen.h-screen.flex.p-48
          router-link.relative.w-full(v-if="doc.data.video.url", :to="{name: 'view', params: {work: doc.uid}}")
            //- .relative.w-full.origin-center(:style="{transform: 'scale(' + imgScale + ')'}")
            img.absolute.overlay.object-contain.object-center(:src="doc.data.icon.url")

      figure.relative.w-full.sm_w-10x12.lg_pr-16
        //- img.w-full.block(:src="doc.data.icon.url")
        template(v-if="!isReleased")
          video.w-full.block(:src="doc.data.teaser_video.url", loop, playsinline, muted, preload="metadata")
        template(v-else)
          img.w-full(:src="metadata.image")
        //- play btn?
        countdown-play-btn-overlay.text-sm.text-black-a30ff(:doc="doc", :counter="false", size="small", @released="isReleased = true")
        //- router-link.absolute.overlay.flex.items-center.justify-center(:to="{name: 'view', params: {work: doc.uid}}")
          <svg class="text-5xl lg_text-6xl xl_text-60 block" style="width:calc(59 / 38 * 1em); height: 1em" viewBox="0 0 59 38" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
            <path d="M1 1.49251L57.3157 19L0.999998 36.5075L1 1.49251Z" fill="rgba(255,255,255,0.9)" />
          </svg>

      section.text-lg.p-8.lg_p-12(style="padding-bottom:25vh")
        nav.flex.justify-start.mb-8.lg_mb-12.-ml-2
          button.focus_outline-none(@click="view = 'info'")
            btn.px-12(theme="drkgray", :active="view === 'info'") Info
          button.focus_outline-none(@click="view = 'owners'")
            btn.px-12(theme="drkgray", :active="view === 'owners'") Collectors
          button.focus_outline-none(@click="view = 'details'")
            btn.px-12(theme="drkgray", :active="view === 'details'") Details

        work-owners(v-if="work", v-show="view === 'owners'", :work="work")

        rich-text.children-mt-em.lg_w-10x12(style="max-width:32em;", v-show="view === 'info'", :field="doc.data.description")

        div(v-show="view === 'details'")
          rich-text.children-mt-em(:field="doc.data.details")
          a.mt-6.inline-block.-ml-2(v-if="workAssetURL", :href="workAssetURL", target="_blank", rel="noopener noreferrer")
            btn.px-12(theme="drkgray", size="small") File

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
import WorkOwners from '@/components/WorkOwners'
import CountdownPlayBtnOverlay from '@/components/CountdownPlayBtnOverlay'
export default {
  name: 'Work',
  data () {
    return {
      doc: undefined,
      work: undefined,
      view: 'info',
      isReleased: false
    }
  },
  computed: {
    ...mapGetters(['weiToETH', 'workId']),
    id () {
      return this.$route.params.work
    },
    metadata () {
      return this.$store.state.metadatas.find(metadata => metadata._work === this.id)
    },
    canBuy () {
      return this.work && (Number(this.work.printed) < Number(this.work.editions))
    },
    workAssetURL () {
      let url
      if (this.isReleased && this.metadata) {
        url = this.metadata.animation_url?.length ? this.metadata.animation_url : this.metadata.image
      }
      return url
    }
  },
  created () {
    this.fetchDoc()
    this.fetchWork()
  },
  methods: {
    async buy () {
      await this.$store.dispatch('buy', this.id)
      this.fetchWork(true)
    },
    async fetchDoc () {
      this.doc = await this.$store.dispatch('prismic/getWork', this.id)
    },
    async fetchWork (flush) {
      this.work = await this.$store.dispatch('getWork', { id: this.id, flush })
    }
  },
  components: { RichText, svgX, Btn, svgFleuron, WorkOwners, CountdownPlayBtnOverlay }
}
</script>

<style scoped>
</style>
