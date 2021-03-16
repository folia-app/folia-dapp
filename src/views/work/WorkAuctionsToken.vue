<template lang="pug">
  article.work-auctions.token.bg-red
    .h-screen.overflow-y-scroll.scrollbars-hidden.flex.flex-col(v-if="doc", :key="$route.params.token")
      header.p-10.flex.justify-between.items-start(role="banner")
        h2 AUCTION
        //- btn.-m-2(size="small")
          countdown
        div FLA-{{$route.params.token}}

      section.flex-1
        .flex.p-10
          figure.w-1x2
            router-link.block.pb-full.bg-white.relative(:to="{name: 'view-token', params: {token: $route.params.token}}")
              template(v-if="doc.data.teaser_image.url")
                .absolute.overlay.p-2.flex.items-center(v-if="doc.data.teaser_image.url.includes('.gif')")
                  img-gif(:src="doc.data.teaser_image.url")

          div.pl-8.flex.flex-col.justify-between
            div
              h2 Blob.gif
              div Harm van den Dorpel
            div Reserve Price: 6ETH

      //- bid
      .order-last.sticky.bottom-0.left-0.w-full.p-10
        button.block.w-full.focus_outline-none
          btn BID
</template>

<script>
import { mapState } from 'vuex'
import Btn from '@/components/Btn'
import Countdown from '@/components/Countdown'
import ImgGif from '@/components/ImgGif'
export default {
  name: 'WorkAuctionsToken',
  props: ['doc'],
  data () {
    return {
      metadata: null,
      auction: []
    }
  },
  computed: {
    ...mapState(['reserveAuctionContract']),
    tokenId () {
      return this.$route.params.token
    }
  },
  methods: {
    async getMetadata () {
      this.metadata = await this.$store.dispatch('getMetadata', { token: this.tokenId })
    },
    async getAuction () {
      this.auction = await this.$store.dispatch('auctions/get', this.tokenId)
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
