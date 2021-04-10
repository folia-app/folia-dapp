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

            .flex.justify-between.items-start
              //- no.
              router-link.flex.mb-16.text-lg.-ml-1(to="/")
                svg-fleuron.block.mr-2(style="width:0.96em;height:0.96em")
                .hidden.md_inline.leading-none {{ workId(doc.uid, true) }}

              //- ...sold-out
              template(v-if="isSold")
                sold-out-dot

              //- ...enquire btn
              template(v-else-if="doc.data.enquire_button || doc.data.status === 'enquire'")
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
                  button.block.group.relative.focus_outline-none.-m-2(@click="onBidBtn")
                    btn.px-16(theme="drkgray") BID

              //- ...buy
              template(v-else)
                button.block.group.relative.focus_outline-none.-m-2(@click="buy", :disabled="!isReleased", :class="{'opacity-50': !isReleased}")
                  btn.px-12.md_px-16(theme="drkgray", :disabled="!isReleased") BUY

            header.text-xl
              div {{ doc.data.title }}
              div.font-bold {{ doc.data.artist }}
              rich-text(:field="doc.data.medium")
              //- (minted + price)
              template(v-if="!isUnitSale")
                //- printed/edition
                div(v-if="isReleased && work") {{ work.printed }}/{{work.editions}} Minted
                  //- template(v-if="work")
                  //- template(v-else) Edition of {{ doc.data.edition }}
                //- price
                div {{ work ? weiToETH(work.price) : doc.data.price_eth }} ETH

          nav.px-8.lg_px-12.flex.justify-start.mt-4.mb-12.-ml-2
            button.focus_outline-none(@click="$router.replace({name: 'work'})", v-if="isReleased && isVariableEdition")
              btn.px-8.md_px-12(theme="drkgray", :active="$route.name === 'work'") Tokens
            button.focus_outline-none(@click="$router.replace({name: 'work-info'})")
              btn.px-8.md_px-12(theme="drkgray", :active="$route.name === 'work-info'") Info
            button.focus_outline-none(@click="$router.replace({name: 'work-auctions'})", v-if="isAuction")
              btn.px-8.md_px-12(theme="drkgray", :active="$route.name.includes('work-auctions')") Auctions
            button.focus_outline-none(@click="$router.replace({name: 'work-owners'})", v-if="collectorsTabEnabled")
              btn.px-8.md_px-12(theme="drkgray", :active="$route.name === 'work-owners'") Collectors
            button.focus_outline-none(@click="$router.replace({name: 'work-details'})")
              btn.px-8.md_px-12(theme="drkgray", :active="$route.name === 'work-details'") Details

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
    },
    collectorsTabEnabled () {
      const isSmallEdition = this.work?.editions && Number(this.work.editions) < 10
      return !this.isVariableEdition && !this.isAuction && this.isReleased !== false && (isSmallEdition || this.isSold)
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
      return !this.work && this.$store.dispatch('getWork', { id: this.id, flush })
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
    },
    onBidBtn () {
      // single auction go direct
      if (this.doc.data.auction.length === 1) {
        const token = this.doc.data.auction[0].primary.token_id
        return this.$router.push({ name: 'work-auctions-token', params: { token } })
      }
      // multiple auctions go to list
      return this.$router.replace({ name: 'work-auctions' })
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
    },
    foliaControllerContract (contract) {
      if (contract) {
        this.fetchWork()
      }
    }
  },
  metaInfo () {
    if (this.$route.name === 'work' && this.doc) {
      const doc = this.doc.data
      const title = `${doc.artist} – ${doc.title}`
      return {
        title: title,
        meta: this.$store.getters.meta({ title: title, descrip: '', img: doc.meta_image?.url })
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
