<template lang="pug">
  section.work-auctions.pb-64
    ul.border-t.border-dotted.border-gray-500(v-if="doc.data.auction.length")
      li(v-for="slice in doc.data.auction")
        router-link.block.border-b.border-dotted.border-gray-500.hover_bg-gray-950(:to="{name: 'work-auctions-token', params: {token: slice.primary.token_id}}")
          auction-list-row(:tokenId="slice.primary.token_id", :releaseTime="slice.primary.release_link1.data.release_time")
            | FLA-{{ slice.primary.token_id }}
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
  components: { AuctionListRow }
}
</script>

<style>
</style>
