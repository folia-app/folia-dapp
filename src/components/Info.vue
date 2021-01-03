<template lang="pug">
  article.info.h2.p2.md-p0.bg-white.black.flex.flex-column.justify-between
    div
      .md-my4.info__text
        section.red.underline
          p.md-col-8 Collect limited-edition artworks by contemporary artists and&nbsp;support <a href="http://newmodels.io" class="underline">New Models</a>
        transition(name="fadeinonly")
          section#faq.md-col-9.smaller.mt-2em.pt-1em(v-show="more")
            h2.sans.bold What are these?
            p Each &ldquo;patch&rdquo; here is a &ldquo;Non-Fungible Token&rdquo; (NFT) on the Ethereum blockchain.
            h2.sans.bold.mt-1em.pt-1em NFT??
            p Any Ethereum app (such as this one) can define its own token to use as currency, in place of <span class="sans">ETH</span>. These tokens conventionally have decimal values, making them <i>fungible</i>. But <i>non-fungible</i> tokens cannot be divided&mdash;and like a coin, can only have a one&nbsp;owner. Making them collectible.
            p.mt-1em ...
    nav.info__nav.sans.right-align.md-m2
      button.info__more-btn.cursor-pointer(@click="toggleMore", :class="{'info__more-btn--open': more}") {{more ? 'CLOSE' : 'FAQ'}}
</template>

<script>
export default {
  name: 'Info',
  data () {
    return {
      more: false
    }
  },
  methods: {
    toggleMore () {
      this.more = !this.more
      if (this.more) this.$router.push({ hash: 'faq' })
      // this.$nextTick(() => window.scroll(0, 0))
    }
  }
}
</script>

<style scoped>
@import '../style/variables';

.smaller{font-size:0.95em;}

.info{
  min-height:100vmin;
}

@media (--breakpoint-md) {
  .info{
    min-height:0;
  }
  .info__text{
    font-size:calc(34/1280 * 100vw);
    padding:1.35em;
  }
}

</style>
