<template lang="pug">
  section.work-auctions.pb-64
    ul(v-if="doc.data.auction.length")
      li.border-t.border-b.border-gray-900.-mt-px(v-for="(slice, i) in doc.data.auction")
        //- router-link.block.hover_bg-gray-950(:to="{name: 'work-auctions-token', params: {token: slice.primary.token_id}}", :class="{'pointer-events-none': slice.primary.lock_label}")
          //- TODO handle no release !!
        auction-list-row(:tokenId="slice.primary.token_id", :releaseTime="release(slice)", :locked="slice.primary.lock_label")
          | {{ slice.primary.token_id.slice(-3) }}
        //- router-link.px-10.lg_px-12.flex.justify-between.items-center.h-40.border-b.border-dotted.border-gray-500.hover_bg-gray-950(:to="{name: 'work-auctions-token', params: {token: slice.primary.token_id}}")
          h6 FLA-{{ slice.primary.token_id }}
          btn.px-8.text-sm.pointer-events-none(size="small", theme="drkgray")
            countdown(:until="slice.primary.release_link1.data.release_time")
</template>

<script>
import AuctionListRow from '@/components/auctions/AuctionListRow'
export default {
  name: 'WorkAuctions',
  props: ['doc'],
  methods: {
    release (slice) {
      return slice.primary.release_link1?.data?.release_time
    },
    redirectToSingleAuction (rt) {
      // const isSingleAuction = this.doc?.data.auction?.length === 1
      // const isAuctionIndex = rt?.name === 'work-auctions'
      // if (isAuctionIndex && isSingleAuction) {
      //   const token = this.doc.data.auction[0].primary?.token_id
      //   if (token) {
      //     this.$router.replace({ name: 'work-auctions-token', params: { token } })
      //   }
      // }
    }
  },
  created () {
    this.redirectToSingleAuction(this.$route)
  },
  watch: {
    '$route' (to, from) {
      this.redirectToSingleAuction(to)
    }
  },
  components: { AuctionListRow }
}
</script>

<style>
</style>
