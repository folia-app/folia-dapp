<template lang="pug">
  ul.slice-auctions.bg-black.text-white.flex.flex-wrap
    li.w-full.border-t.border-b.border-gray-900.-mt-px(v-for="(item, i) in slice.items", v-if="item.token_id", :class="{'bg-gray-100ff': i % 2 === 1}")
      //- router-link.block.hover_bg-gray-950(:to="{name: 'work-auctions-token', params: { work: item.token_id[0], token: item.token_id }}")
      auction-list-row(:tokenId="item.token_id", :releaseTime="releaseTime(item)", :hideTimers="!active", :locked="item.lock_label")
        div
          | {{ item.label }}
          br.sm_hidden
          <span class='text-sm opacity-50 sm_ml-6'>FLA-{{ item.token_id }}</span>
</template>

<script>
import AuctionListRow from '@/components/auctions/AuctionListRow'
export default {
  name: 'SliceAuctions',
  props: {
    slice: { type: Object, default: undefined },
    active: { type: Boolean, default: true }
  },
  methods: {
    releaseTime (item) {
      return item?.release_link?.data?.release_time
    }
  },
  components: { AuctionListRow }
}
</script>

<style>
</style>
