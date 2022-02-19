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
      const timestamp = new Date().getTime()
      try {
        if (!this.$store.state.address) {
          await this.$store.dispatch('connect')
        }
        // !! not owner
        if (this.owner && this.$store.state.address.toLowerCase() !== this.owner.toLowerCase()) {
          throw new Error(`Sorry, you must own this token to download its content.\n\nOwner: ${this.owner}`)
        }

        // show confirm overlay
        this.$root.$emit('newMsg', { timestamp, format: 'overlay', body: 'Sign message in your wallet.' })

        // sign...
        const message = 'Sign this message to verify you own this token and begin your download.'
        const { signature } = await this.$store.dispatch('signMessageEthers', message)
        console.log(signature)

        // swap messages
        this.$root.$emit('updateMsg', { timestamp, body: 'Requesting download...' })

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

            this.$root.$emit('updateMsg', { timestamp, body: 'Downloading...<br>Do not close window!' })

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
            // filename
            a.download = (this.download.prefix || '') + (this.tokenId || 'download')

            this.$root.$emit('updateMsg', { timestamp, body: `Download finished!<br><a class="boder-b border-dashed" href="${a.href}">File</a>` })

            // prompt save file
            a.click()
          })
          .catch(e => {
            console.error(e)
            this.$root.$emit('updateMsg', { timestamp, body: 'Error downloading!' })
          })

        // console.log(resp)
        // console.log(await resp.text())
      } catch (e) {
        console.error(e)
        this.$root.$emit('killMsg', { timestamp })
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
