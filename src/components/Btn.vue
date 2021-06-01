<template lang="pug">
  .rounded-full.text-center.leading-none(:class="clss", @click="$emit('click')")
    slot
</template>

<script>
export default {
  name: 'Btn',
  props: {
    theme: { type: String, default: 'darken' },
    size: { type: String, default: 'medium' },
    active: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  computed: {
    clss () {
      return {
        'bg-black-a15 lg_hover_bg-black-a30 focus_bg-black-a30 transition-background duration-100': this.theme === 'darken',

        'bg-black-a30 lg_hover_bg-black-a45 focus_bg-black-a45 transition-background duration-100': this.theme === 'darkener',

        // theme: ltgray
        'bg-gray-100 lg_hover_bg-gray-200 focus_bg-gray-200': this.theme === 'ltgray' && !this.active,
        'bg-black text-white': this.theme === 'ltgray' && this.active,
        // theme: drkgray
        'bg-gray-900 lg_hover_bg-gray-950 focus_bg-gray-950 lg_group-hoverff_bg-gray-950 transition-background duration-100': this.theme === 'drkgray' && !this.active,
        'bg-white focus_bg-white text-black': this.theme === 'drkgray' && this.active,
        // sizing
        'p-6 lg_py-0 lg_h-24': this.size === 'large',
        'p-5 md_py-6': this.size === 'medium',
        'p-4 md_pt-5': this.size === 'small',
        // cursor
        'cursor-not-allowed': this.disabled,
        'cursor-pointer': !this.disabled
      }
    }
  }
}
</script>

<style>
</style>
