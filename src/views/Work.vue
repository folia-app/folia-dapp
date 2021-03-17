<template lang="pug">
  article.work.w-full.text-white
    .relative.overflow-y-scroll.h-screen.scrollbars-hidden
      .min-h-screen.flex.flex-col(v-if="doc")
        //- (series header)
        router-link.bg-gray-900.text-white.p-8.lg_px-12.lg_py-10.flex.justify-between.text-md.hover_bg-white.hover_text-black.focus_text-black.focus_bg-white(v-if="doc.data.set.uid", :to="{name: 'set', params: {set: doc.data.set.uid}}")
          .font-boldff {{ doc.data.set.data.title }}
          //- div Harm van den Dorpel

        header.p-8.lg_p-12

          .flex.justify-between.items-start
            //- no.
            router-link.flex.mb-16.text-lg.-ml-1(to="/")
              svg-fleuron.block.mr-2(style="width:0.96em;height:0.96em")
              .leading-none {{ workId(doc.uid, true) }}

            //- ...(countdown / bid)
            template(v-if="isUnitSale")
              template(v-if="!isReleased")
                button.focus_outline-none(@click="view = 'auctions'")
                  btn.px-8.text-sm.-mt-2.-mr-4(theme="drkgray", size="small")
                    countdown.text-white(:until="doc.data.release_link.data.release_time")
              template(v-else-if="doc.data.auction.length")
                button.block.group.relative.focus_outline-none.-m-2(@click="view = 'auctions'")
                  btn.px-16(theme="drkgray") BID

            //- ... (sold-out / buy)
            template(v-if="!isUnitSale")
              template(v-if="isSoldOut(work)")
                sold-out-dot
              template(v-else)
                button.block.group.relative.focus_outline-none.-m-2(@click="buy", :disabled="!isReleased", :class="{'opacity-50': !isReleased}")
                  btn.px-12.md_px-16(theme="drkgray", :disabled="!isReleased") BUY
                //- span.absolute.overlay.flex.items-center.justify-center.opacity-0.group-hover_opacity-100 BUY
                  //- span.group-hover_opacity-0 {{ work ? weiToETH(work.price) : doc.data.price_eth }} ETH

          header.text-xl
            div {{ doc.data.title }}
            .font-bold {{ doc.data.artist }}
            rich-text(:field="doc.data.medium")
            //- (minted + price)
            template(v-if="!isUnitSale")
              //- printed/edition
              div
                template(v-if="work") {{ work.printed }}/{{work.editions}} Minted
                template(v-else) Edition of {{ doc.data.edition }}
              //- price
              div {{ work ? weiToETH(work.price) : doc.data.price_eth }} ETH

        nav.px-8.lg_px-12.flex.justify-start.mt-4.mb-12.-ml-2
          button.focus_outline-none(@click="view = 'tokens'", v-if="isReleased && isVariableEdition")
            btn.px-8.md_px-12(theme="drkgray", :active="view === 'tokens'") Tokens
          button.focus_outline-none(@click="view = 'info'")
            btn.px-8.md_px-12(theme="drkgray", :active="view === 'info'") Info
          button.focus_outline-none(@click="view = 'auctions'", v-if="isAuction")
            btn.px-8.md_px-12(theme="drkgray", :active="view === 'auctions'") Auction
          button.focus_outline-none(@click="view = 'owners'", v-if="(isReleased && work && work.editions < 20) && !isUnitSale && !isVariableEdition")
            btn.px-8.md_px-12(theme="drkgray", :active="view === 'owners'") Collectors
          button.focus_outline-none(@click="view = 'details'")
            btn.px-8.md_px-12(theme="drkgray", :active="view === 'details'") Details

        //- (info)
        section(v-show="view === 'info'", style="padding-bottom:25vh")
          h3.sr-only Info
          //- (media)
          figure.mb-12(v-if="!isVariableEdition")
            router-link.block(:to="{name: 'view-token', params: { token: Number(doc.uid) * 1000000 + 1 }}")
              //- (gif)
              template(v-if="doc.data.teaser_image.url.includes('.gif')")
                .pb-ar-1x1.relative
                  .absolute.overlay.flex.items-center.justify-center.bg-white
                    img-gif(:src="doc.data.teaser_image.url")
              //- (image)
              template(v-else)
                img.block.w-full(:src="doc.data.teaser_image.url", @contextmenu.prevent)
          //- info text
          rich-text.text-lg.px-10.lg_px-12.children-mt-em.lg_w-10x12(style="max-width:28em;", :field="doc.data.description")

        //- (details)
        section.text-lg.px-10.lg_px-12(v-show="view === 'details'", style="padding-bottom:25vh")
          h3.sr-only Details
          rich-text.children-mt-em(:field="doc.data.details")
          a.mt-6.inline-block.-ml-2(v-if="workAssetURL", :href="workAssetURL", target="_blank", rel="noopener noreferrer")
            btn.px-12(theme="drkgray", size="small") File

        //- (tokens)
        section(v-if="isReleased && isVariableEdition", v-show="view === 'tokens'")
          h3.sr-only Tokens
          work-tokens(ref="tokens", :doc="doc", v-if="doc", @buy="buy", :canBuy="!isSoldOut(work)")

        //- (collectors)
        section.px-10.lg_px-12(v-if="work && view === 'owners'")
          work-owners(:work="work")

        //- auctions
        section.pb-64(v-if="doc && view === 'auctions'")
          ul.border-t.border-dotted.border-gray-500(v-if="doc.data.auction.length")
            li.px-10.lg_px-12.flex.justify-between.items-center.h-40.border-b.border-dotted.border-gray-500.hover_bg-gray-950(v-for="slice in doc.data.auction")
              h6 FLA-{{ slice.primary.token_id }}
              btn.px-8.text-sm.pointer-events-none(size="small", theme="drkgray")
                countdown(:until="slice.primary.release_link1.data.release_time")

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
import WorkTokens from '@/views/WorkTokens'
import Countdown from '@/components/Countdown'
import ImgGif from '@/components/ImgGif'
// import CountdownPlayBtnOverlay from '@/components/CountdownPlayBtnOverlay'
import SoldOutDot from '@/components/SoldOutDot'
export default {
  name: 'Work',
  props: ['id'],
  data () {
    return {
      // id: this.$route.params.work,
      doc: null,
      view: 'info',
      isReleased: false,
      imgLoaded: false
    }
  },
  computed: {
    ...mapGetters(['weiToETH', 'workId', 'isSoldOut']),
    // id () {
    //   return this.$route.params.work
    // },
    // doc () {
    //   return this.$store.getters['prismic/works'].find(doc => doc.uid === this.id)
    // },
    work () {
      return this.$store.state.works.find(work => work.id === this.id)
    },
    metadata () {
      return this.$store.state.metadatas.find(metadata => metadata._work === this.id)
    },
    isVariableEdition () {
      return this.doc.data.page_layout === 'generative'
    },
    // canBuy () {
    //   return this.work && (Number(this.work.printed) < Number(this.work.editions))
    // },
    // isSoldOut () {
    //   return this.work && (Number(this.work.printed) >=)
    // },
    workAssetURL () {
      let url
      if (this.isReleased && this.metadata) {
        url = this.metadata.animation_url?.length ? this.metadata.animation_url : this.metadata.image
      }
      return url
    },
    isUnitSale () {
      return this.doc.data.page_layout === 'token-unit-sale'
    },
    isAuction () {
      return this.doc.data.auction?.length
    }
  },
  created () {
    this.fetchDoc()
    this.fetchWork()
  },
  methods: {
    async buy () {
      await this.$store.dispatch('buy', this.id)
      return this.$refs.tokens?.getTokens() // refresh token list
    },
    async fetchDoc () {
      this.doc = await this.$store.dispatch('prismic/getWork', this.id)
      // is released ?
      const time = this.doc?.data.release_link?.data?.release_time
      this.isReleased = !time ? true // no release set
        : new Date().getTime() >= new Date(time).getTime() // now >= release
    },
    fetchWork (flush) {
      this.$store.dispatch('getWork', { id: this.id, flush })
    }
  },
  watch: {
    isReleased (released) {
      if (released) {
        if (this.isVariableEdition) {
          this.view = 'tokens'
        }
        this.fetchWork(true)
      }
    }
  },
  metaInfo () {
    if (this.$route.name === 'work' && this.doc) {
      const doc = this.doc.data
      const title = `${doc.artist}, "${doc.title}" (${doc.year})`
      return {
        title: title,
        meta: this.$store.getters.meta({ title: title, descrip: '', img: doc.meta_image?.url })
      }
    }
  },
  components: { RichText, svgX, Btn, svgFleuron, WorkOwners, SoldOutDot, WorkTokens, Countdown, ImgGif }
}
</script>

<style scoped>
</style>
