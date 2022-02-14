<template lang="pug">
  button.sign-and-download-btn.focus_bg-black-a15.focus_outline-none.rounded-full(@click="signAndDownload")
    slot
</template>

<script>
export default {
  name: 'SignAndDownloadButton',
  props: {
    download: { type: Object, default: undefined },
    owner: { type: String, default: undefined }
  },
  methods: {
    async signAndDownload () {
      try {
        if (!this.$store.state.address) {
          await this.$store.dispatch('connect')
        }
        // !! not owner
        if (this.owner && this.$store.state.address.toLowerCase() !== this.owner.toLowerCase()) {
          throw new Error(`Sorry, you must own this token to download its content.\n\nOwner: ${this.owner}`)
        }

        // sign...
        const signature = await this.$store.dispatch('signMessage')
        console.log(signature)
      } catch (e) {
        console.error(e)
        alert(e.message)
      }
    }
  }
}
</script>

<style>
</style>
