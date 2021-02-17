<template lang="pug">
  .view-work.absolute.overlay
    //- (videos)
    template(v-if="metadata && metadata.animation_url")
      video.absolute.overlay.object-contain.object-center.pointer-events-none(:src="metadata.animation_url", playsinline, @contextmenu.prevent)
</template>

<script>
import store from '@/store'
export default {
  name: 'ViewWork',
  computed: {
    metadata () {
      return this.$store.state.metadatas.find(meta => meta._workUID === this.$route.params.work)
    }
  },
  async beforeRouteEnter (to, from, next) {
    try {
      const doc = await store.dispatch('getMetadata', { work: to.params.work })
      if (doc && !doc.release) {
        next()
      } else {
        alert('not released!', doc.release)
        next('/')
      }
    } catch (e) {
      console.error('Error on ViewWork@beforeRouteEnter', e)
      next('/')
    }
  }
}
</script>

<style>
</style>
