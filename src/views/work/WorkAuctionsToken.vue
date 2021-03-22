<template lang="pug">
  article.work-auctions.token.transition-background.duration-500(:class="{'bg-red': auctionEnded !== true, 'bg-gray-800': auctionEnded === true}")
    .h-screen.overflow-y-scroll.scrollbars-hidden.flex.flex-col(v-if="doc", :key="$route.params.token")
      header.p-10.mx-1.flex.justify-between.items-start(role="banner")
        button.flex.items-center.focus_outline-none(@click="backBtn")
          .p-4.-m-4.mr-0
            .h-3.w-3.border-b.border-l.transform.rotate-45.border-current
          h2 {{ auctionEnded ? 'SOLD' : 'AUCTION' }}
        //- btn.-m-2(size="small")
          countdown
        div FLA-{{$route.params.token}}

      //- (loading)
      template(v-if="auction === null")
        p.p-10 LOADING...

      //- (not found)
      template(v-else-if="auction === undefined")
        p.p-10
          button.focus_outline-none(@click="getAuction") REFRESH

      //- (auction)
      template(v-else-if="auction")
        section
          .flex.px-10.flex-row-reverse(v-if="metadata")
            figure.w-1x2
              router-link(:to="{name: 'view-token', params: {token: $route.params.token}}")
                template(v-if="metadata.image")
                  .pb-full.relative.bg-white.rounded-4xl.overflow-hidden
                    .absolute.overlay.p-2.flex.items-center.bg-white(v-if="metadata.image.includes('.gif')")
                      img-gif(:src="metadata.image", :key="metadata.image")

            .w-1x2.p-8.bg-black-a15.rounded-4xl
              h2.font-bold {{ metadata.name }}
              div.text-xs.mt-2 {{ metadata.description }}
              //- div Reserve Price: {{ weiToETH(auction.reservePrice) }} ETH

          //- (help text)
          .flex.px-10.cursor-pointer(v-show="helpText", @click="helpText = false")
            p.w-full.rounded-4xl.bg-black-a30.p-8.min-h-56.text-sm Folia uses a reserve price auction contract. The first bid at the reserve price triggers a 24-hour countdown. Any bids made in the last 15 minutes of the auction will extend the clock by 15 minutes. When time runs out, the highest bidder wins. Bids are held in escrow and will be refunded if a higher bid is made. Minimum bid increase is set at .1ETH.

          //- (pre-auction)
          template(v-if="auction.amount === '0'")
            .flex.px-10
              .w-1x2.rounded-4xl.bg-black-a30.p-8.flex.flex-col.justify-between.min-h-56
                .flex.w-full.justify-between.items-center
                  div.text-sm Reserve Price
                  button.text-xs.opacity-75.focus_outline-none.hover_opacity-100.px-4.-mx-4(@click="helpText = true") ?
                div.text-xl.text-right.font-bold {{ weiToETH(auction.reservePrice) }} ETH
              .w-1x2.rounded-4xl.bg-black-a30.p-8.flex.flex-col.justify-between.min-h-56
                .flex.w-full.justify-between.items-center
                  div.text-sm Auction Duration
                  button.text-xs.opacity-75.focus_outline-none.hover_opacity-100.px-4.-mx-4(@click="helpText = true") ?
                .text-xl.text-right.font-bold {{ ddhhmmss(auction.duration * 1000, ' ', true) }}

          //- (auction active)
          template(v-else-if="Number(auction.amount) > 0")
            .flex.flex-wrap.px-10
              .w-1x2.rounded-4xl.bg-black-a30.p-8.flex.flex-col.justify-between.min-h-52
                .text-sm
                  div {{ auctionEnded ? 'Sold for' : 'Current Bid' }}
                  //- div.truncate {{ auction.bidder }}
                div.text-2xl.text-right.font-bold.leading-none {{ weiToETH(auction.amount) }} ETH
              //- remaining time
              .w-1x2.rounded-4xl.bg-black-a30.p-8.flex.flex-col.justify-between.min-h-52(v-if="!auctionEnded")
                .flex.w-full.justify-between.items-center
                  div.text-sm {{ auctionEnded ? 'Auction Ended' : 'Auction Ends' }}
                  button.text-xs.opacity-75.focus_outline-none.hover_opacity-100.px-4.-mx-4(@click="helpText = true") ?
                div.w-full.flex.items-end.text-2xl
                  countdown.font-bold.w-full.text-right.leading-none(:until="auctionEndTimeMs", :separator="' '", @ended="auctionEnded = true")
              .flex-1.rounded-4xl.bg-black-a15.p-8.flex.justify-between.min-h-52ff(:class="{'flex-col max-w-1x2': auctionEnded}")
                div.text-sm Bidder
                //- bidder link
                div.w-full.leading-none.flex.justify-end
                  a(:href="openSeaLink({ account: auction.bidder })", target="_blank", rel="noopener noreferrer")
                    btn.px-8.text-md.lg_text-lg(size="small", :class="{'-m-4': auctionEnded, 'lg_text-2xl': !auctionEnded}")
                      | {{ auction.bidder === address ? 'You' : addrShort(auction.bidder) }}
              //- .w-1x2.rounded-4xl.bg-black-a03.p-8.flex.flex-col.justify-between.min-h-52
                div.text-sm Errors/Help ?

        //- bid
        .order-last.sticky.bottom-0.left-0.w-full.p-10.text-xl.select-none(v-if="auctionEnded !== true")
          .bg-red.backdrop-blurff.rounded-4xl
            .bg-black-a30.rounded-4xl.p-6
              .flex.flex-wrap.sm_flex-no-wrap.w-full.group
                //- input
                btn.flex-1.px-10(size="large", theme="darken", @click="$refs.input.focus()")
                  input.w-full.text-center.focus_outline-none(ref="input", v-model="bidETH", type="number", :min="weiToETH(auction.reservePrice)", required, step="0.1", size="1", min="bidStepETH")
                //- ETH
                btn.w-40.lg_w-48.group-hover_hidden.px-10.pointer-events-none(size="large", theme="darken") ETH
                //- (+/-)
                .hidden.group-hover_flex
                  btn.w-20.lg_w-24.flex.justify-center.items-center.hover_bg-gray-a30(size="large", theme="darken", @click="decreaseBid")
                    .h-px.bg-current(style="width:0.55em")
                  btn.w-20.lg_w-24.flex.justify-center.items-center.hover_bg-gray-a30(size="large", theme="darken", @click="increaseBid") +
                //- bid btn
                button.w-full.sm_w-auto.sm_flex-1.block.focus_outline-none.text-xl.font-bold(@click="bid")
                  btn.tracking-wide.px-16(size="large", theme="darkener") BID

</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Btn from '@/components/Btn'
import Countdown, { ddhhmmss } from '@/components/Countdown'
import ImgGif from '@/components/ImgGif'
let lastRt
export default {
  name: 'WorkAuctionsToken',
  props: ['doc'],
  data () {
    return {
      metadata: null,
      auction: null,
      bidETH: 0,
      listening: false,
      bidStepETH: 0.1,
      auctionEnded: undefined,
      helpText: false
    }
  },
  computed: {
    ...mapState(['address', 'reserveAuctionContract']),
    ...mapGetters(['weiToETH', 'ethToWei', 'addrShort', 'openSeaLink']),
    tokenId () {
      return this.$route.params.token
    },
    auctionEndTimeMs () {
      // return this.auction && ((Number(this.auction.firstBidTime) + Number(this.auction.duration)) * 1000)
      return this.$store.getters['auctions/auctionEndTimeMs']({ auction: this.auction })
    },
    minBidETH () {
      let minBid = '0'
      if (this.auction) {
        const reserve = Number(this.weiToETH(this.auction.reservePrice))
        const currentBid = Number(this.weiToETH(this.auction.amount))
        minBid = currentBid ? Number(currentBid + this.bidStepETH).toFixed(1) : reserve
      }
      return minBid.toString()
    }
  },
  methods: {
    ddhhmmss,
    async getMetadata () {
      this.metadata = await this.$store.dispatch('getMetadata', { token: this.tokenId })
    },

    async getAuction () {
      this.auction = await this.$store.dispatch('auctions/get', { token: this.tokenId })
      if (this.auction) {
        this.bidETH = this.minBidETH
        this.auctionEnded = this.$store.getters['auctions/auctionEnded']({ auction: this.auction })
        this.listenToContract()
      }
    },

    async bid () {
      await this.$store.dispatch('auctions/bid', { token: this.tokenId, wei: this.ethToWei(this.bidETH) })
    },

    listenToContract () {
      if (this.reserveAuctionContract && !this.listening && !this.auctionEnded) {
        // new bid !
        this.reserveAuctionContract.events
          .AuctionBid()
          .on('data', this.onAuctionEvent)
          .on('error', (error) => console.error(error))

        // auction ended !
        this.reserveAuctionContract.events
          .AuctionEnded()
          .on('data', this.onAuctionEvent)
          .on('error', (error) => console.error(error))

        this.listening = true
        console.log('listening!')
      }
    },

    onAuctionEvent (event) {
      console.log('@auctionEvent', event)
      // refresh if current auction
      if (event.returnValues?.tokenId === this.tokenId) {
        this.getAuction()
      }
    },

    increaseBid () {
      this.bidETH = Number(Number(this.bidETH) + this.bidStepETH).toFixed(1)
    },
    decreaseBid () {
      const val = Number(this.bidETH - this.bidStepETH).toFixed(1)
      if (val < this.minBidETH) {
        alert(`Minimum bid is ${this.minBidETH} ETH`)
        this.bidETH = this.minBidETH
        return
      }
      this.bidETH = val
    },
    backBtn () {
      return lastRt?.name ? this.$router.go(-1) : this.$router.push({ name: 'work-auctions' })
    }
  },
  beforeRouteEnter (to, from, next) {
    lastRt = from
    next()
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
