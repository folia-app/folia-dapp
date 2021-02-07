<template lang="pug">
  div(v-html="$prismic.asHtml(field, linkResolver)")
</template>

<script>
import linkResolver from '@/plugins/prismic/link-resolver'
export default {
  name: 'RichText',
  props: {
    field: [Array, String]
  },
  methods: {
    linkResolver,
    bindLinks () {
      const links = this.$el.querySelectorAll('a')
      const isAbsoluteUrl = new RegExp('^(?:[a-z]+:)?//', 'i')
      const router = this.$router
      for (var i = links.length - 1; i >= 0; i--) {
        links[i].addEventListener('click', function (e) {
          const url = this.getAttribute('href')
          // relative links, handle with vue-router
          if (url && !isAbsoluteUrl.test(url)) {
            e.preventDefault()
            router.push(url)
          }
        })
      }
    }
  },
  mounted () {
    this.bindLinks()
  }
}
</script>
