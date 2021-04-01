<template lang="pug">
  //- src added from parent
  .img-gif.w-full
    img.block.w-auto.max-w-full.mx-auto.image-render-crisp(ref="img", v-bind="$attrs", @load="$emit('load')")
</template>

<script>
export default {
  name: 'ImgGif',
  data () {
    return {
      resizeObserver: null
    }
  },
  methods: {
    observe () {
      if (window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(entries => {
          if (this.$refs.img) {
            const outerW = entries[0].contentRect.width
            const naturalW = this.$refs.img.naturalWidth

            if (outerW < naturalW) {
              const factor = Math.ceil(naturalW / outerW)
              // better render at 2 factor scaling
              this.$refs.img.style.width = naturalW / factor + 'px'
            } else {
              this.$refs.img.style.width = 'auto'
            }
          }
        })
        this.resizeObserver.observe(this.$el)
      }
    }
  },
  mounted () {
    this.observe()
  }
}
</script>

<style>
</style>
