<template lang="pug">
  button.sign-and-download-btn.focus_bg-black-a15.focus_outline-none.rounded-full(@click="signAndDownload")
    slot
</template>

<script>
export default {
  name: 'SignAndDownloadButton',
  props: {
    download: { type: Object, default: undefined },
    owner: { type: String, default: undefined },
    tokenId: { type: String, default: '0' }
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
        const message = 'Sign this message to verify you own this token and begin your download.'
        // const message = 'hello world'
        const { signature } = await this.$store.dispatch('signMessageEthers', message)
        console.log(signature)

        // send...
        return fetch(this.download.url, {
          method: this.download.method,
          body: JSON.stringify({
            message,
            signature, // : '0x11523b6e5d9370489c20f61ce424ae9cebb0c6122e58cb9899fd7f2139efda1f323db9bf56effac9967400528e40295032a5c23c3c87cac2bcd7641b010518061b',
            tokenId: this.tokenId,
            networkId: this.$store.state.networkId
            // msgParams
          })
        })
          .then(async resp => {
            console.log(resp)
            // const reader = resp.body.getReader();

            // // infinite loop while the body is downloading
            // while(true) {
            //   // done is true for the last chunk
            //   // value is Uint8Array of the chunk bytes
            //   const {done, value} = await reader.read();

            //   if (done) {
            //     break;
            //   }

            //   console.log(`Received ${value.length} of ${resp.headers.get('content-length')} bytes`)
            // }

            return resp.blob()
          })
          .then(blob => {
          // var file = window.URL.createObjectURL(blob)
          // window.location.assign(file)
            var a = document.createElement('a')
            a.href = window.URL.createObjectURL(blob)
            a.download = 'example1'
            a.click()
          })

        // console.log(resp)
        // console.log(await resp.text())
      } catch (e) {
        console.error(e)
        if (!e.message.includes('User denied message signature.')) {
          alert(e.message)
        }
      }
    }
  }
}
</script>

<style>
</style>
