<template lang="pug">
  ul.work-owners
    li(v-for="token in tokensSorted")
      //- a(:href="`https://testnets.opensea.io/assets/0xdce09254dd3592381b6a5b7a848b29890b656e01/${token[0]}`", target="_blank")
      a.flex(:href="`https://testnets.opensea.io/accounts/${token[1]}`", target="_blank", rel="noopener noreferrer")
        btn.px-8.bg-gray-900(style="min-width:4em") {{ token[0].toString().slice(-3) }}
        btn.px-8.bg-gray-900.truncate(theme="none") {{ token[1] }}
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
      return this.tokens.slice().sort((a, b) => a[0] - b[1])
    }
  },
  methods: {
    getOwners () {
      const printed = Number(this.work.printed)
      for (let i = printed - 1; i >= 0; i--) {
        const tokenId = this.work.id * 1000000 + i + 1
        this.$store.dispatch('getNFTOwnerByTokenId', tokenId).then(owner => {
          this.tokens.push([tokenId, owner])
        })
      }
    }
  },
  created () {
    this.getOwners()
  },
  components: { Btn }
}
</script>

<style>
</style>
