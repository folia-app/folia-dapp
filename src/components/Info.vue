<template lang="pug">
  article.info.text-4xl.p-10.md_p-0.bg-white.text-black.flex.flex-col.justify-between
    div
      .md_my-20.info__text
        section.text-red.underline
          p.md_w-2x3 Collect limited-edition artworks by contemporary artists</a>
        transition(name="fadeinonly")
          section#faq.md_w-3x4.smaller.mt-lh-snug.pt-lh-snug(v-show="more")
            h2.font-sans.font-bold What are these?
            p Each &ldquo;patch&rdquo; here is a &ldquo;Non-Fungible Token&rdquo; (NFT) on the Ethereum blockchain.
            h2.font-sans.font-bold.mt-lh-snug.pt-lh-snug NFT??
            p Any Ethereum app (such as this one) can define its own token to use as currency, in place of <span class="sans">ETH</span>. These tokens conventionally have decimal values, making them <i>fungible</i>. But <i>non-fungible</i> tokens cannot be divided&mdash;and like a coin, can only have a one&nbsp;owner. Making them collectible.
            p.mt-1em ...
    nav.info__nav.font-sans.text-right.md_m-10
      button.info__more-btn.cursor-pointer.focus_outline-none(@click="toggleMore", :class="{'info__more-btn--open': more}") {{more ? 'CLOSE' : 'FAQ'}}
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
