<template lang="pug">
  .px-10.lg_px-12.flex.justify-between.items-center.h-40(:class="{'bg-gray-950': $route.params.token === tokenId }")
    h6
      slot
    .flex.text-sm
      btn.px-8.pointer-events-none(size="small", theme="drkgray", v-if="auctionIsActive") {{ weiToETH(auction.amount) }} ETH
      //- auction ended
      template(v-if="auctionEnded")
        sold-out-dot
        //- btn.px-8(size="small", theme="drkgray")
          span.uppercase SOLD
      //- auction active
      template(v-else-if="auctionIsActive")
        btn.px-8.bg-red.pointer-events-none(size="small", theme="none")
          countdown.ml-2(:until="auctionEndTimeMs", separator=" ")
      //- auction to be released
      template(v-else-if="releaseTime")
        btn.px-8.pointer-events-none(size="small", theme="darken")
          countdown(:until="releaseTime")
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Countdown from '@/components/Countdown'
import Btn from '@/components/Btn'
import SoldOutDot from '@/components/SoldOutDot'
export default {
  name: 'AuctionListRow',
  props: ['tokenId', 'releaseTime'],
  data () {
    return {
      auction: undefined,
      listening: false,
      auctionEnded: false
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
      }
    },
    onAuctionEvent (event) {
      // refresh if current auction
      if (event.returnValues?.tokenId === this.tokenId) {
        this.getAuction(true)
      }
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
  components: { Btn, Countdown, SoldOutDot }
}
</script>

<style>
</style>
