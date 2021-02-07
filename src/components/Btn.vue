<template lang="pug">
  .rounded-full.p-5.md_py-6.xl_py-8.text-center(:class="clss")
    slot
</template>

<script>
export default {
  name: 'Btn',
  props: {
    theme: { type: String, default: 'darken' }
  },
  computed: {
    clss () {
      return {
        'bg-black-a15 hover_bg-black-a30 focus_bg-black-a30 group-hover_bg-black-a30 transition-background duration-100': this.theme === 'darken'
      }
    }
  }
}
</script>

<style>
</style>
