<template lang="pug">
  article.work.w-full.text-white
    .flex.w-full
      //- main / left col
      .flex-1.relative.h-screen.overflow-y-scroll.scrollbars-hidden.transition.duration-500(:class="{'opacity-0 md_opacity-33 md_hover_opacity-100': $route.name === 'work-auctions-token'}")
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

              //- ...enquire btn
              template(v-if="doc.data.enquire_button")
                a.block.group.relative.focus_outline-none.-m-2(:href="`mailto:info@folia.app?subject=${doc.data.artist} - ${doc.data.title}`", target="_blank", rel="noopener noreferrer")
                  btn.px-10.text-md(theme="drkgray") ENQUIRE

              //- ...not released
              template(v-else-if="!isReleased")
                button.focus_outline-none(@click="$router.replace({name: 'work-auctions'})", :disabled="!isUnitSale", :class="{'pointer-events-none': !isUnitSale}")
                  btn.px-8.text-sm.-mt-2.-mr-4(theme="drkgray", size="small")
                    countdown.text-white(:until="doc.data.release_link.data.release_time", @ended="isReleased = true", separator=" ")

              //- ...bid
              template(v-else-if="isUnitSale")
                template(v-if="doc.data.auction.length")
                  button.block.group.relative.focus_outline-none.-m-2(@click="$router.replace({name: 'work-auctions'})")
                    btn.px-16(theme="drkgray") BID

              //- ...sold-out
              template(v-else-if="isSoldOut(work)")
                sold-out-dot

              //- ...buy
              template(v-else)
                button.block.group.relative.focus_outline-none.-m-2(@click="buy", :disabled="!isReleased", :class="{'opacity-50': !isReleased}")
                  btn.px-12.md_px-16(theme="drkgray", :disabled="!isReleased") BUY

            header.text-xl
              div {{ doc.data.title }}
              .font-bold {{ doc.data.artist }}
              rich-text(:field="doc.data.medium")
              //- (minted + price)
              template(v-if="!isUnitSale")
                //- printed/edition
                div(v-if="isReleased")
                  template(v-if="work") {{ work.printed }}/{{work.editions}} Minted
                  template(v-else) Edition of {{ doc.data.edition }}
                //- price
                div {{ work ? weiToETH(work.price) : doc.data.price_eth }} ETH

          nav.px-8.lg_px-12.flex.justify-start.mt-4.mb-12.-ml-2
            button.focus_outline-none(@click="$router.replace({name: 'work'})", v-if="isReleased && isVariableEdition")
              btn.px-8.md_px-12(theme="drkgray", :active="$route.name === 'work'") Tokens
            button.focus_outline-none(@click="$router.replace({name: 'work-info'})")
              btn.px-8.md_px-12(theme="drkgray", :active="$route.name === 'work-info'") Info
            button.focus_outline-none(@click="$router.replace({name: 'work-auctions'})", v-if="isAuction")
              btn.px-8.md_px-12(theme="drkgray", :active="$route.name.includes('work-auctions')") Auction
            button.focus_outline-none(@click="$router.replace({name: 'work-owners'})", v-if="(isReleased && work && work.editions < 20) && !isUnitSale && !isVariableEdition")
              btn.px-8.md_px-12(theme="drkgray", :active="$route.name === 'work-owners'") Collectors
            button.focus_outline-none(@click="$router.replace({name: 'work-details'})")
              btn.px-8.md_px-12(theme="drkgray", :active="$route.name === 'work-details'") Details

          //- (media for singular editions )
          //- figure.bg-white.mb-12(v-if="!isVariableEdition")
            .pb-ar-1x1.relative
              .absolute.overlay.px-4.flex.items-center.justify-center
                //- (metadata image)
                template(v-if="!isVariableEdition")
                  img.w-auto.max-w-full.mx-auto.block(:src="doc.data.teaser_image.url", style="image-rendering: crisp-edges;image-rendering: pixelated;")
            //- (teaser)
            //- template(v-if="!imgLoaded")
              //- video.w-full.block(:src="doc.data.teaser_video.url", loop, playsinline, muted, autoplay)
            //- countdown play
            //- countdown-play-btn-overlay.text-sm.text-black-a30ff(v-if="hasCountdown", :doc="doc", :counter="false", size="small", @released="isReleased = true", :btnOverlay="true")
            //- play icon
            //- router-link.absolute.overlay.flex.items-center.justify-center(:to="{name: 'view', params: {work: Number(doc.uid) * 1000000}}")
              <svg class="text-5xl lg_text-6xl xl_text-60 block" style="width:calc(59 / 38 * 1em); height: 1em" viewBox="0 0 59 38" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
                <path d="M1 1.49251L57.3157 19L0.999998 36.5075L1 1.49251Z" fill="rgba(255,255,255,0.9)" />
              </svg>

          //- nav.px-8.lg_px-12.flex.justify-start.mb-12
            button.focus_outline-none(@click="view = 'tokens'", v-if="isReleased && isVariableEdition")
              btn.px-8.md_px-12(theme="drkgray", :active="view === 'tokens'") Tokens
            button.focus_outline-none(@click="view = 'info'")
              btn.px-8.md_px-12(theme="drkgray", :active="view === 'info'") Info
            button.focus_outline-none(@click="view = 'owners'", v-if="isReleased && work && work.editions < 20")
              btn.px-8.md_px-12(theme="drkgray", :active="view === 'owners'") Collectors
            button.focus_outline-none(@click="view = 'details'")
              btn.px-8.md_px-12(theme="drkgray", :active="view === 'details'") Details

                //- rich-text.mt-20(style="max-width:32em", :field="doc.data.description")
            //- .sticky.top-0.left-0.w-full
              .absolute.top-0.right-0.w-screen.h-screen.flex.p-48
              router-link.relative.w-full(v-if="doc.data.video.url", :to="{name: 'view', params: {work: doc.uid}}")
                //- .relative.w-full.origin-center(:style="{transform: 'scale(' + imgScale + ')'}")
                img.absolute.overlay.object-contain.object-center(:src="doc.data.icon.url")

          //- figure.relative.w-full.sm_w-10x12.lg_pr-16
            //- (metadata image)
            template(v-if="isReleased && metadata && metadata.image")
              img.w-full(:src="metadata.image", @load="imgLoaded = true")
            //- (teaser)
            template(v-if="!imgLoaded")
              video.w-full.block(:src="doc.data.teaser_video.url", loop, playsinline, muted, autoplay)

            //- play btn?
            countdown-play-btn-overlay.text-sm.text-black-a30ff(:doc="doc", :counter="false", size="small", @released="isReleased = true", :btnOverlay="true")
            //- router-link.absolute.overlay.flex.items-center.justify-center(:to="{name: 'view', params: {work: doc.uid}}")
              <svg class="text-5xl lg_text-6xl xl_text-60 block" style="width:calc(59 / 38 * 1em); height: 1em" viewBox="0 0 59 38" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
                <path d="M1 1.49251L57.3157 19L0.999998 36.5075L1 1.49251Z" fill="rgba(255,255,255,0.9)" />
              </svg>

          router-view(:doc="doc", :isVariableEdition="isVariableEdition", :work="work", :isReleased="isReleased", :canBuy="canBuy", @buy="buy")

          //- (info)
          //- section(v-show="view === 'info'", style="padding-bottom:25vh")
            h3.sr-only Info
            //- (media)
            figure.mb-12(v-if="!isVariableEdition")
              router-link.block.pb-ar-1x1.relative(:to="{name: 'view-token', params: { token: Number(doc.uid) * 1000000 + 1 }}")
                //- (gif)
                template(v-if="doc.data.teaser_image.url.includes('.gif')")
                  .absolute.overlay.flex.items-center.justify-center.bg-white
                    img-gif(:src="doc.data.teaser_image.url")
                //- (image)
                template(v-else)
                  img.block.w-full(:src="doc.data.teaser_image.url", @contextmenu.prevent)
            //- info text
            rich-text.text-lg.px-10.lg_px-12.children-mt-em.lg_w-10x12(style="max-width:28em;", :field="doc.data.description")

          //- (details)
          //- section.text-lg.px-10.lg_px-12(v-show="view === 'details'", style="padding-bottom:25vh")
            h3.sr-only Details
            rich-text.children-mt-em(:field="doc.data.details")
            a.mt-6.inline-block.-ml-2(v-if="workAssetURL", :href="workAssetURL", target="_blank", rel="noopener noreferrer")
              btn.px-12(theme="drkgray", size="small") File

          //- (tokens)
          //- section(v-if="isReleased && isVariableEdition", v-show="view === 'tokens'")
            h3.sr-only Tokens
            work-tokens(ref="tokens", :doc="doc", v-if="doc", @buy="buy", :canBuy="!isSoldOut(work)")

          //- (collectors)
          //- section.px-10.lg_px-12(v-if="work && view === 'owners'")
            work-owners(:work="work")

          //- (auctions)
          //- section(v-show="view === 'auctions'")
            ul
              li(v-for="token in [4000001,4000002,4000003]")
                router-link(:to="{name: 'work-auction', params: { work: $route.params.work, token: token }}") {{ token }}

      //- close btn
      //- button.md_hidden.absolute.top-0.right-0.p-10.focus_outline-none(@click="$router.push('/')", aria-lable="Close")
        svg-x.cursor-pointer(style="width:1.8rem;height:1.8rem;stroke-width:1px")

      //- side column (auctions)
      transition(name="work-sidebar")
        router-view.flex-full.md_flex-1x2.md_max-w-1x2(name="sidebar", :doc="doc")
      //- .flex-1.h-screen.overflow-y-scroll.scrollbars-hidden(v-if="$route.name === 'work-auction'")
        .h-screen.bg-white
        .h-screen.bg-gray-400

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
      view: this.$route.meta.workView || 'info',
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
      const work = this.$store.state.works.find(work => work.id === this.id)
      return work?.exists ? work : null
    },
    metadata () {
      return this.$store.state.metadatas.find(metadata => metadata._work === this.id)
    },
    isVariableEdition () {
      return this.doc.data.page_layout === 'generative'
    },
    canBuy () {
      return this.work && (Number(this.work.printed) < Number(this.work.editions))
    },
    // isSoldOut () {
    //   return this.work && (Number(this.work.printed) >=)
    // },
    // workAssetURL () {
    //   let url
    //   if (this.isReleased && this.metadata) {
    //     url = this.metadata.animation_url?.length ? this.metadata.animation_url : this.metadata.image
    //   }
    //   return url
    // },
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
  mounted () {
  },
  methods: {
    async buy () {
      await this.$store.dispatch('buy', this.id)
      // return this.$refs.view?.getTokens() // refresh token list
    },
    async fetchDoc () {
      this.doc = await this.$store.dispatch('prismic/getWork', this.id)
      this.isReleased = this.$store.getters['prismic/isReleased']({ doc: this.doc })
      this.goToDefaultTab()
    },
    fetchWork (flush) {
      this.$store.dispatch('getWork', { id: this.id, flush })
    },
    goToDefaultTab () {
      if (this.$route.name === 'work') {
        // auction ?
        // if (this.isAuction) {
        //   return this.$router.replace({ name: 'work-auctions' })
        // }

        // fwd to /info
        if (!this.isVariableEdition || (this.isVariableEdition && this.isReleased === false)) {
          this.$router.replace({ name: 'work-info' })
        }
      }
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
    },
    '$route' (to, from) {
      this.goToDefaultTab()
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
.work-sidebar-enter-active,
.work-sidebar-leave-active{
  transition: all 500ms;
  /*transition: flex-basis 500ms;*/
  /*transition: all 500ms;*/
  transform-origin: right top;
}
.work-sidebar-enter,
.work-sidebar-leave-to{
  max-width: 0;
  /*opacity:0;*/
  /*flex-basis:0%;*/
  /*transform: scale(0,1);*/
}
</style>
