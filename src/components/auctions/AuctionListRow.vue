<template lang="pug">
  .px-10.lg_px-12.flex.justify-between.items-center.h-40
    h6.flex.items-center
      slot
      svg-eye.ml-6(v-show="$route.params.token === tokenId")
      //- .h-4.w-4.rounded-full.bg-white.ml-5

    .flex.text-sm
      //- current bid
      btn.px-8.pointer-events-none.text-white(size="small", theme="drkgray", v-if="auctionIsActive") {{ weiToETH(auction.amount) }} ETH
      //- auction ended
      template(v-if="auctionEnded")
        sold-out-dot
      //- auction active
      template(v-else-if="auctionIsActive")
        btn.px-8.bg-red.pointer-events-none(size="small", theme="none")
          countdown.ml-2(:until="auctionEndTimeMs", separator=" ", @ended="auctionEnded = true")
      //- auction to be released
      template(v-else-if="releaseTime")
        btn.px-8.pointer-events-none(size="small", theme="darken")
          //- > icon
          .h-4.w-4.border-t.border-r.transform.rotate-45.border-white(v-if="releaseTimerEnded")
          //- timer
          countdown(v-else, :until="releaseTime", @ended="onReleaseTimerEnded")
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Countdown from '@/components/Countdown'
import Btn from '@/components/Btn'
import SoldOutDot from '@/components/SoldOutDot'
import svgEye from '@/components/SVG-Eye'
export default {
  name: 'AuctionListRow',
  props: ['tokenId', 'releaseTime'],
  data () {
    return {
      auction: undefined,
      listening: false,
      auctionEnded: false,
      releaseTimerEnded: false
    }
  },
  computed: {
    ...mapState(['reserveAuctionContract']),
    ...mapGetters({
      weiToETH: 'weiToETH',
      isAuctionEnded: 'auctions/auctionEnded'
    }),
    auctionEndTimeMs () {
      return this.$store.getters['auctions/auctionEndTimeMs']({ auction: this.auction })
    },
    auctionIsActive () {
      return this.auction && Number(this.auction.firstBidTime) && !this.auctionEnded
    }
  },
  methods: {
    async getAuction (flush = false) {
      this.auction = await this.$store.dispatch('auctions/get', { token: this.tokenId, flush })
      if (this.auction) {
        this.auctionEnded = this.isAuctionEnded({ auction: this.auction })
        this.listenToContract()
      }
    },
    listenToContract () {
      if (this.reserveAuctionContract && !this.listening && this.auctionIsActive) {
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
      }
    },
    onAuctionEvent (event) {
      // refresh if current auction
      if (event.returnValues?.tokenId === this.tokenId) {
        this.getAuction(true)
      }
    },
    onReleaseTimerEnded () {
      this.releaseTimerEnded = true
      this.getAuction()
    }
  },
  watch: {
    reserveAuctionContract () {
      this.getAuction()
    }
  },
  created () {
    this.getAuction()
  },
  components: { Btn, Countdown, SoldOutDot, svgEye }
}
</script>

<style>
</style>
