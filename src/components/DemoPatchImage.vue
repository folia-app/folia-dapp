<template lang="pug">
  figure(:data-patch="patchNames[index % 7]")
</template>

<script>
export default {
  name: 'DemoPatchImage',
  props: ['index', 'imgSrc'],
  data () {
    return {
      patchNames: ['hirsch', 'drip', 'remote', 'hand', 'clippy', 'ggg', 'hal']
    }
  }
}
</script>

<style scoped>
[data-patch="hirsch"]{
  background-image:url('../assets/demo/patch--hirsch.png');
}
[data-patch="drip"]{
  background-image:url('../assets/demo/patch--drip.png');
}
[data-patch="remote"]{
  background-image:url('../assets/demo/patch--remote.png');
}
[data-patch="hand"]{
  background-image:url('../assets/demo/patch--hand.png');
}
[data-patch="clippy"]{
  background-image:url('../assets/demo/patch--clippy.png');
}
[data-patch="ggg"]{
  background-image:url('../assets/demo/patch--ggg.png');
}
[data-patch="hal"]{
  background-image:url('../assets/demo/patch--hal.png');
}
</style>
