<template lang="pug">
  article.work-auctions.token.bg-red
    .h-screen.overflow-y-scroll.scrollbars-hidden.flex.flex-col(v-if="doc", :key="$route.params.token")
      header.p-10.mx-1.flex.justify-between.items-start(role="banner")
        h2 AUCTION
        //- btn.-m-2(size="small")
          countdown
        div FLA-{{$route.params.token}}

      //- (loading)
      template(v-if="!auction")
        p.p-10 Loading...
      //- (not found)
      template(v-else-if="auction && !auction.exists")
        p.p-10 Not found!

      //- (auction)
      template(v-else-if="auction")
        section
          .flex.p-10.flex-row-reverse.-mb-10
            figure.w-1x2.rounded-4xl.overflow-hidden
              router-link.block.pb-full.relative(:to="{name: 'view-token', params: {token: $route.params.token}}")
                template(v-if="doc.data.teaser_image.url")
                  .absolute.overlay.p-2.flex.items-center.bg-white(v-if="doc.data.teaser_image.url.includes('.gif')")
                    img-gif(:src="doc.data.teaser_image.url")

            .w-1x2.p-8.bg-black-a15.rounded-4xl
              h2.font-bold {{ metadata.name }}
              div.text-xs.mt-2 {{ metadata.description }}
              //- div Reserve Price: {{ weiToETH(auction.reservePrice) }} ETH

          //- (pre-auction)
          template(v-if="auction.amount === '0'")
            .flex.px-10.-mt-10
              .w-1x2.rounded-4xl.bg-black-a30.p-8.flex.flex-col.justify-between.min-h-56
                div.text-sm Minimum Bid
                div.text-xl.text-right.font-bold {{ weiToETH(auction.reservePrice) }} ETH
              .w-1x2.rounded-4xl.bg-black-a30.p-8.flex.flex-col.justify-between.min-h-56
                div.text-sm Auction Duration
                .text-xl.text-right.font-bold {{ ddhhmmss(auction.duration * 1000, ' ', true) }}

          //- (auction active)
          template(v-else-if="Number(auction.amount) > 0")
            .flex.flex-wrap.px-10
              .w-1x2.rounded-4xl.bg-black-a30.p-8.flex.flex-col.justify-between.min-h-52
                .text-sm
                  div Current Bid
                  //- div.truncate {{ auction.bidder }}
                div.text-2xl.text-right.font-bold.leading-none {{ weiToETH(auction.amount) }} ETH
              .w-1x2.rounded-4xl.bg-black-a30.p-8.flex.flex-col.justify-between.min-h-52
                div.text-sm Auction Ends
                div.w-full.flex.items-end.text-2xl
                  countdown.font-bold.w-full.text-right.leading-none(:until="auctionEndTimeMs", :separator="' '")
              .w-full.rounded-4xl.bg-black-a15.p-8.flex.flex-col.justify-between.min-h-52
                div.text-sm Bidder
                div.text-2xl.w-full.text-right.leading-none.font-bold
                  | {{ auction.bidder === account ? 'You' : addrShort(auction.bidder) }}

        //- bid
        .order-last.sticky.bottom-0.left-0.w-full.p-10
          div.flex
            input.w-full.text-black(v-model="bidETH", type="number", :min="weiToETH(auction.reservePrice)", required)
            div ETH
          button.block.w-full.focus_outline-none(@click="bid")
            btn(size="large") BID
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Btn from '@/components/Btn'
import Countdown, { ddhhmmss } from '@/components/Countdown'

import ImgGif from '@/components/ImgGif'
export default {
  name: 'WorkAuctionsToken',
  props: ['doc'],
  data () {
    return {
      metadata: null,
      auction: null,
      bidETH: 0 //
    }
  },
  computed: {
    ...mapState(['account', 'reserveAuctionContract']),
    ...mapGetters(['weiToETH', 'ethToWei', 'addrShort']),
    tokenId () {
      return this.$route.params.token
    },
    auctionEndTimeMs () {
      return this.auction && ((Number(this.auction.firstBidTime) + Number(this.auction.duration)) * 1000)
    }
  },
  methods: {
    ddhhmmss,
    async getMetadata () {
      this.metadata = await this.$store.dispatch('getMetadata', { token: this.tokenId })
    },
    async getAuction (flush = false) {
      this.auction = null
      this.auction = await this.$store.dispatch('auctions/get', { token: this.tokenId, flush })
      if (this.auction) {
        this.bidETH = this.weiToETH(this.auction.reservePrice)
      }
    },
    async bid () {
      await this.$store.dispatch('auctions/bid', { token: this.tokenId, wei: this.ethToWei(this.bidETH) })
      this.getAuction(true)
    }
  },
  created () {
    this.getMetadata()
    this.getAuction()
  },
  watch: {
    tokenId () {
      this.getMetadata()
      this.getAuction()
    },
    reserveAuctionContract () {
      this.getAuction()
    }
  },
  components: { Btn, ImgGif, Countdown }
}
</script>

<style>
</style>
