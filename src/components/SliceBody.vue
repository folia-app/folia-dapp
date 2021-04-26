<template lang="pug">
  section.slice-body
    component(v-for="(slice, i) in slices", v-if="has(slice)", :is="templates[slice.type]", :slice="slice", :index="i", v-bind="$attrs", v-on="$listeners", :key="`slice${i}`")
</template>

<script>
export default {
  name: 'SliceBody',
  props: {
    slices: { type: Array, default: () => ([]) },
    templates: { type: Object, default: () => ({}) }
  },
  methods: {
    has (slice) {
      return this.templates[slice.type]
      // return this.$options.components['slice--' + slice.slice_type]
    }
  }
}
</script>

<style>
</style>
