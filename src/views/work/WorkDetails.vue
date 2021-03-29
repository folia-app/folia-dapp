<template lang="pug">
  section.work-details.text-lg.px-10.lg_px-12(v-if="doc", style="padding-bottom:25vh")
    h3.sr-only Details
    rich-text.children-mt-em.links-underline(:field="doc.data.details")
    //- IPFS file ?
    //- a.mt-6.inline-block.-ml-2(v-if="workAssetURL", :href="workAssetURL", target="_blank", rel="noopener noreferrer")
      btn.px-12(theme="drkgray", size="small") File
</template>

<script>
import RichText from '@/components/RichText'
export default {
  name: 'WorkDetails',
  props: ['doc'],
  // computed: {
  //   workAssetURL () {
  //     let url
  //     if (this.isReleased && this.metadata) {
  //       url = this.metadata.animation_url?.length ? this.metadata.animation_url : this.metadata.image
  //     }
  //     return url
  //   },
  // },
  components: { RichText }
}
</script>

<style>
</style>
