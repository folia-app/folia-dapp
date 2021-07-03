<template lang="pug">
  article.work.w-full.text-white.relative

    .flex.w-full
      //- main / left col
      .flex-1.relative.h-screen.overflow-y-scroll.scrollbars-hidden.transition.duration-500(:class="{'opacity-0 md_opacity-33 md_hover_opacity-100': $route.name.includes('work-auctions-token')}")
        .min-h-screen.flex.flex-col(v-if="doc")
          //- (series header)
          router-link.bg-gray-900.text-white.p-8.lg_px-12.lg_py-10.flex.justify-between.text-md.hover_bg-white.hover_text-black.focus_text-black.focus_bg-white(v-if="doc.data.set.uid", :to="{name: 'set', params: {set: doc.data.set.uid}}")
            .font-boldff {{ doc.data.set.data.title }}
            //- div Harm van den Dorpel

          header.p-8.lg_p-12

            .flex.justify-between.items-center.lg_items-start
              //- no.
              router-link.flex.items-center.text-2xl.lg_text-lg.-ml-1(to="/")
                //- .p-4.-m-4.-mr-2.sm_hidden
                  .h-4.w-4.border-b.border-l.transform.rotate-45.border-current
                svg-fleuron.block.mr-2(style="width:0.96em;height:0.96em")
                .hidden.md_inline.leading-none {{ workId(doc.uid, true) }}

              //- ... custom button
              template(v-if="doc.data.cta_link.link_type !== 'Any'")
                prismic-link(:field="doc.data.cta_link", :linkResolver="linkResolver")
                  btn.px-12(theme="drkgray") {{ doc.data.cta_text || 'LINK' }}

              //- ...sold-out
              template(v-else-if="isSold")
                sold-out-dot

              //- ...enquire btn
              template(v-else-if="doc.data.enquire_button || doc.data.status === 'enquire'")
                a.block.group.relative.focus_outline-none.-m-2(:href="`mailto:info@folia.app?subject=${doc.data.artist} - ${doc.data.title}`", target="_blank", rel="noopener noreferrer")
                  btn.px-10.text-md(theme="drkgray") ENQUIRE

              //- ...not released
              template(v-else-if="!isReleased")
                button.focus_outline-none(@click="onBidBtn", :disabled="!isAuction", :class="{'pointer-events-none': !isAuction}")
                  btn.px-8.text-sm.lg_-mt-2.lg_-mr-4(theme="drkgray", size="small")
                    countdown.text-white(:until="doc.data.release_link.data.release_time", @ended="isReleased = true", separator=" ")

              //- ...bid
              template(v-else-if="isAuction")
                template(v-if="doc.data.auction.length")
                  button.block.group.relative.focus_outline-none.-m-2(@click="onBidBtn")
                    btn.px-16(theme="drkgray") BID

              //- ...buy
              template(v-else)
                button.block.group.relative.focus_outline-none.-m-2(@click="buy", :disabled="!isReleased", :class="{'opacity-50': !isReleased}")
                  btn.px-12.md_px-16(theme="drkgray", :disabled="!isReleased") BUY

            header.text-xl.mt-12
              div {{ doc.data.title }}
              div.font-bold {{ doc.data.artist }}
              rich-text(:field="doc.data.medium")
              //- (minted + price)
              template(v-if="!isAuction")
                //- minted
                div(v-if="work && work.editions > 1") {{ work.printed }}/{{work.editions}} Minted
                //- price
                div(v-if="work") {{ weiToETH(work.price) }} ETH
                div(v-else-if="doc.data.price_eth") {{ doc.data.price_eth }} ETH

          nav.px-8.lg_px-12.flex.justify-start.mt-4.mb-12.-ml-2.text-md.sm_text-base
            button.focus_outline-none(@click="$router.replace({name: 'work'})", v-if="hasTabTokens")
              btn.px-7.md_px-12(theme="drkgray", :active="$route.name === 'work'") Tokens
            button.focus_outline-none(@click="$router.replace({name: 'work-info'})")
              btn.px-7.md_px-12(theme="drkgray", :active="$route.name === 'work-info'") Info
            button.focus_outline-none(@click="$router.replace({name: 'work-auctions'})", v-if="isAuction")
              btn.px-7.md_px-12(theme="drkgray", :active="$route.name.includes('work-auctions')") Auctions
            button.focus_outline-none(@click="$router.replace({name: 'work-owners'})", v-if="hasTabCollectors")
              btn.px-7.md_px-12(theme="drkgray", :active="$route.name === 'work-owners'") Collectors
            button.focus_outline-none(@click="$router.replace({name: 'work-details'})", v-if="hasDetails")
              btn.px-6.md_px-12(theme="drkgray", :active="$route.name === 'work-details'")
                span.hidden.sm_inline Details
                span.sm_hidden.text-sm •••

          //- child routes
          router-view(:doc="doc", :work="work", :isVariableEdition="isVariableEdition", :isReleased="isReleased", :canBuy="canBuy", @buy="buy", @newToken="fetchWork(true)")

      //- side column (auctions)
      transition(name="work-sidebar")
        router-view.flex-full.md_flex-1x2.md_max-w-1x2(name="sidebar", :doc="doc")

</template>

<script>
import { mapState, mapGetters } from 'vuex'
import RichText from '@/components/RichText'
import svgX from '@/components/SVG-X'
import Btn from '@/components/Btn'
import svgFleuron from '@/components/SVG-Fleuron'
import Countdown from '@/components/Countdown'
import ImgGif from '@/components/ImgGif'
// import CountdownPlayBtnOverlay from '@/components/CountdownPlayBtnOverlay'
import SoldOutDot from '@/components/SoldOutDot'
import linkResolver from '@/plugins/prismic/link-resolver'
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
    ...mapState(['foliaControllerContract']),
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
    isSold () {
      return this.isSoldOut(this.work) || this.doc?.data.status === 'sold'
    },
    isVariableEdition () {
      return this.doc.data.page_layout === 'generative' || this.doc.data.variable_edition
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
    // isAuction () {
    //   return this.doc.data.page_layout === 'token-unit-sale' || this.doc.data.sale_type === 'auction'
    // },
    isAuction () {
      return this.doc.data.auction?.length
    },
    hasTabTokens () {
      return (this.isReleased && this.isVariableEdition) || this.doc?.data.tokens_body?.length
    },
    hasTabCollectors () {
      const isTokenGrid = this.isVariableEdition || this.doc.data.page_layout === 'wide'
      // const isSmallEdition = this.work?.editions && Number(this.work.editions) < 10
      return this.work?.printed > 0 && !isTokenGrid // && !this.isAuction && this.isReleased !== false && (isSmallEdition || this.isSold)
    },
    hasDetails () {
      return this.doc && this.$prismic.asText(this.doc.data.details).length > 0
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
      // TODO maybe set this globally in router.afterEach
      // TODO ensure Info tab is always rendered for SEO
      window.prerenderReady = true
    },
    fetchWork (flush) {
      return (!this.work || flush) && this.$store.dispatch('getWork', { id: this.id, flush })
    },
    goToDefaultTab () {
      if (this.doc && this.$route.name === 'work') {
        // auction ?
        // if (this.isAuction) {
        //   return this.$router.replace({ name: 'work-auctions' })
        // }

        // fwd to /info ?
        if (
          !this.doc?.data.tokens_body.length &&
          (
            !this.isVariableEdition ||
            (this.isVariableEdition && this.isReleased === false)
          )
        ) {
          this.$router.replace({ name: 'work-info' })
        }
      }
    },
    onBidBtn () {
      // single auction go direct
      if (this.doc.data.auction.length === 1) {
        const token = this.doc.data.auction[0].primary.token_id
        return this.$router.push({ name: 'work-auctions-token', params: { token } })
      }
      // multiple auctions go to list
      return this.$router.replace({ name: 'work-auctions' })
    },
    linkResolver
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
    },
    foliaControllerContract (contract) {
      if (contract) {
        this.fetchWork()
      }
    }
  },
  metaInfo () {
    if (this.doc) {
      const doc = this.doc.data
      const title = doc.artist ? `${doc.artist} – ${doc.title}` : doc.title
      return {
        title: title,
        meta: this.$store.getters.meta({ title: title, descrip: this.doc.data.meta_description, img: doc.meta_image?.url })
      }
    }
  },
  components: { RichText, svgX, Btn, svgFleuron, SoldOutDot, Countdown, ImgGif }
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
