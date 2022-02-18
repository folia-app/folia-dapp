<template lang="pug">
  prismic-link.slice-tile.bg-yellow.lg_hover_shadow-inner-red.-shadow-md.md_shadow-lg(:field="slice.primary.link", :linkResolver="linkResolver")
    .pb-ar-2x1.sm_pb-full.relative
      rich-text.absolute.overlay.p-8.lg_p-12.font-karrik.text-2xl.sm_text-lg.lg_text-2xl.leading-tight(:field="slice.primary.title")
      //- counter...
      .absolute.bottom-0.right-0.p-8.lg_p-12
        template(v-if="slice.primary.counter_custom && slice.primary.counter_custom.length")
          | {{ slice.primary.counter_custom }}
        template(v-else-if="isSoldOut")
          sold-out-dot
        template(v-else-if="slice.primary.counter === 'query'")
          div
            observer(v-if="!work", @visible="getWork")
            template(v-else) {{ work.printed }}/{{ work.editions }}
</template>

<script>
import linkResolver from '@/plugins/prismic/link-resolver'
import RichText from '@/components/RichText'
import SoldOutDot from '@/components/SoldOutDot'
import Observer from '@/components/Observer'
export default {
  name: 'SliceTile',
  props: {
    slice: { type: Object, default: () => ({ primary: {} }) }
    // index: { type: Number, default: 0 }
  },
  components: { RichText, SoldOutDot, Observer },
  data () {
    return {
      work: null
    }
  },
  computed: {
    isSoldOut () {
      return this.slice.primary.counter === 'sold-out' || (this.work && Number(this.work.printed) >= Number(this.work.editions))
    }
  },
  methods: {
    linkResolver,
    async getWork () {
      const id = this.slice.primary.link?.uid
      if (id) {
        this.work = await this.$store.dispatch('getWork', { id: id, flush: true })
      }
    }
  }
}
</script>

<style>
</style>
