<template lang="pug">
  .group.p-2.-m-2
    span.group-hover_hidden.block.h-8.w-8.rounded-full.bg-red-duller
    span.hidden.group-hover_flex.bg-red-duller.h-8.px-6.items-center.rounded-full.text-xs.pb-px SOLD
</template>

<script>
import Btn from '@/components/Btn'
export default {
  name: 'SoldOutDot',
  components: { Btn }
}
</script>

<style>
</style>
