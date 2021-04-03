<template lang="pug">
  .preview.fixed.overlay.bg-black.text-white.flex.items-center.justify-center Loading Preview...
</template>

<script>
export default {
  name: 'Preview',
  beforeCreate () {
    const previewToken = this.$route.query.token
    // todo update to getPreviewResolver
    this.$prismic.client.previewSession(previewToken, this.$prismic.linkResolver, '/')
      .then((url) => {
        console.log(url)
        // window.location.replace(url)
        this.$router.replace(url)
      })
  }
}
</script>
