<template lang="pug">
  span.addr {{ name }}
</template>

<script>
export default {
  name: 'Addr',
  props: {
    address: { type: String, default: '-' },
    short: { type: Boolean, default: true }
  },
  computed: {
    ens () {
      return this.address && this.$store.state.addresses[this.address.toLowerCase()]?.ens
    },
    name () {
      if (this.ens) return this.ens
      if (this.short) return this.$store.getters.addrShort(this.address)
      return this.address
    }
  },
  mounted () {
    this.$store.dispatch('resolveAddress', { address: this.address })
  }
}
</script>

<style>
</style>
