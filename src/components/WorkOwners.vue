<template lang="pug">
  ul.work-owners
    li.flex(v-for="token in tokensSorted")
      a(:href="`${openSea}/assets/${contractAddr}/${token[0]}`", target="_blank", rel="noopener noreferrer")
        btn.px-8(theme="drkgray", style="min-width:4em") {{ token[0].toString().slice(-3) }}
      a.truncate(:href="`${openSea}/accounts/${token[1]}`", target="_blank", rel="noopener noreferrer")
        btn.px-8.truncate(theme="drkgray")
          template(v-if="token[1] === $store.state.address") You
          template(v-else) {{ token[1] }}
</template>

<script>
import Btn from '@/components/Btn'
export default {
  name: 'WorkOwners',
  props: {
    work: Object
  },
  data () {
    return {
      tokens: []
    }
  },
  computed: {
    tokensSorted () {
      return this.tokens.slice().sort((a, b) => a[0] - b[0])
    },
    openSea () {
      const isTestnet = [4].includes(this.$store.state.networkId)
      return `https://${isTestnet ? 'testnets.' : ''}opensea.io`
    },
    contractAddr () {
      return this.$store.state.foliaContract?._address.toLowerCase()
    }
  },
  methods: {
    getOwners () {
      const printed = Number(this.work.printed)
      for (let i = printed - 1; i >= 0; i--) {
        if (!this.tokensSorted[i]) {
          const tokenId = this.work.id * 1000000 + i + 1
          this.$store.dispatch('getNFTOwnerByTokenId', tokenId).then(owner => {
            this.tokens.push([tokenId, owner])
          })
        }
      }
    }
  },

  // lifecycle
  created () {
    this.getOwners()
  },
  watch: {
    work () {
      // works is updated on new purchases...
      this.getOwners()
    }
  },
  components: { Btn }
}
</script>

<style>
</style>
