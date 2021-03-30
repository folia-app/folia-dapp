<template lang="pug">
svg.block(@click="$emit('click')")
  line(x1="0", y1="0", x2="100%", y2="100%", stroke="currentColor", :stroke-width="strokeWidth")
  line(x1="0", y1="100%", x2="100%", y2="0%", stroke="currentColor", :stroke-width="strokeWidth")
</template>

<script>
export default {
  name: 'SVG-X',
  props: {
    strokeWidth: { type: String, default: '1' }
  }
}
</script>
