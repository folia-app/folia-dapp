<template lang="pug">
  p.slice-annoucement.px-10.lg_px-12.flex.flex-wrap.justify-between.items-center.min-h-32.md_min-h-40.py-10.bg-black.text-white
    | {{ slice.primary.text }}
</template>

<script>
export default {
  name: 'SliceAnnouncement',
  props: ['slice']
}
</script>

<style>
</style>
