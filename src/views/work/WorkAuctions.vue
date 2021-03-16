<template lang="pug">
  section.work-auctions
    ul
      li(v-for="token in [4000001,4000002,4000003]")
        router-link(:to="{name: 'work-auctions-token', params: { work: $route.params.work, token: token }}") {{ token }}
</template>

<script>
export default {
  name: 'WorkAuctions'
}
</script>

<style>
</style>
