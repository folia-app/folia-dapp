<template lang="pug">
  .absolute.overlay.flex.items-center.justify-center.text-black-a15(v-if="doc")
    //- (countdown)
    template(v-if="!isReleased")
      button.focus_outline-none(@click="$router.push({name: 'work', params: {work: doc.uid}})")
        btn.px-12.text-white(theme="darken", v-bind="$attrs")
          countdown(:until="doc.data.release_time", @ended="onReleased")

    //- (play btn)
    //- template(v-else)
      button.block.p-40.focus_outline-none.hover_text-white(aria-label="Play", @click="$router.push({name: 'view', params: {work: doc.uid}})", :class="{'absolute overlay flex items-center justify-center': btnOverlay}")
        <svg class="text-60 md_text-72 xl_text-96" style="width:calc(59 / 38 * 1em); height: 1em" viewBox="0 0 59 38" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
          <path d="M1 1.49251L57.3157 19L0.999998 36.5075L1 1.49251Z" fill="currentColor" style="transition: all 200ms" />
        </svg>
</template>

<script>
import Btn from '@/components/Btn'
import Countdown from '@/components/Countdown'
export default {
  name: 'CountdownPlayBtnOverlay',
  components: { Btn, Countdown },
  props: {
    doc: { type: Object, default: undefined },
    btnOverlay: { type: Boolean, default: false }
  },
  data () {
    return {
      isReleased: false
    }
  },
  methods: {
    onReleased () {
      this.isReleased = true
      this.$emit('released')
    }
  }
}
</script>

<style>
</style>
