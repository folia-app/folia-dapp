<template lang="pug">
  .rounded-full.text-center.cursor-pointer(:class="clss")
    slot
</template>

<script>
export default {
  name: 'Btn',
  props: {
    theme: { type: String, default: 'darken' },
    size: { type: String, default: 'medium' },
    active: { type: Boolean, default: false }
  },
  computed: {
    clss () {
      return {
        'bg-black-a15 hover_bg-black-a30 focus_bg-black-a30 group-hover_bg-black-a30 transition-background duration-100': this.theme === 'darken',
        'bg-gray-100 hover_bg-gray-200': this.theme === 'ltgray',
        // theme: drkgray
        'bg-gray-900 hover_bg-gray-950 focus_bg-gray-950 group-hover_bg-gray-950 transition-background duration-100': this.theme === 'drkgray' && !this.active,
        'bg-white focus_bg-white text-black': this.theme === 'drkgray' && this.active,
        // sizing
        'p-5 md_py-6 xl_py-8': this.size === 'medium',
        'p-4 md_py-5 xl_py-6': this.size === 'small'
      }
    }
  }
}
</script>

<style>
</style>
