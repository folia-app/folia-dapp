<template lang="pug">
  .rounded-full.text-center.leading-none(:class="clss")
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
        'bg-black-a15 hover_bg-black-a30 focus_bg-black-a30 group-hover_bg-black-a30 transition-background duration-100': this.theme === 'darken',
        // theme: ltgray
        'bg-gray-100 hover_bg-gray-200 focus_bg-gray-200': this.theme === 'ltgray' && !this.active,
        'bg-black text-white': this.theme === 'ltgray' && this.active,
        // theme: drkgray
        'bg-gray-900 hover_bg-gray-950 focus_bg-gray-950 group-hover_bg-gray-950 transition-background duration-100': this.theme === 'drkgray' && !this.active,
        'bg-white focus_bg-white text-black': this.theme === 'drkgray' && this.active,
        // sizing
        'p-6 md_py-8 xl_py-10': this.size === 'large',
        'p-5 md_py-6 xl_py-8': this.size === 'medium',
        'p-4 md_pt-5 xl_pb-5 xl_pt-6': this.size === 'small',
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
