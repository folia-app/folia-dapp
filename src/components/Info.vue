<template lang="pug">
  article#info.bg-white.text-black.flex.flex-col.justify-between
    .px-16.py-20
      .text-red.text-4xl.leading-normal
        section.underline-off
          h2.md_w-10x12.text-red
            | Folia is a platform for exhibiting and collecting #[a.border-b-2.border-current.border-dotted.hover_border-solid(href="https://opensea.io/blog/guides/non-fungible-tokens/" target="_blank") NFTs]
            | #[button.ml-3.inline-block.text-black.py-px.rounded-full.px-3.bg-gray-100.text-xs.hover_bg-gray-200.focus_outline-none(@click="more = true", v-show="!more", style="font-size:0.4em") •••]

        transition(name="fadeinonly")
          section#faq.md_w-3x4(v-show="more")
            p.mt-lh-snugff.text-gray-800.text-sm.mt-6 proudly presented by #[a(href="https://bin.am", target="_blank") Bin Studio]
            //-
              h2.font-sans.font-bold What are these?
              p Each &ldquo;patch&rdquo; here is a &ldquo;Non-Fungible Token&rdquo; (NFT) on the Ethereum blockchain.
              h2.font-sans.font-bold.mt-lh-snug.pt-lh-snug NFT??
              p Any Ethereum app (such as this one) can define its own token to use as currency, in place of <span class="sans">ETH</span>. These tokens conventionally have decimal values, making them <i>fungible</i>. But <i>non-fungible</i> tokens cannot be divided&mdash;and like a coin, can only have a one&nbsp;owner. Making them collectible.
            //- p.mt-1em ...
    footer.flex.justify-between
      .flex.flex-wrap.w-3x4.text-xs.p-10
        a(href="mailto:info@folia.app", target="_blank", rel="noopener")
          btn.px-10(theme="ltgray") info@folia.app
        a(href="https://twitter.com/foliafoliafolia", target="_blank", rel="noopener")
          btn.px-10(theme="ltgray") twitter
        a(href="https://t.me/folia_app", target="_blank", rel="noopener")
          btn.px-10(theme="ltgray") telegram
        a(href="https://discord.gg/8RA49VdraZ", target="_blank", rel="noopener")
          btn.px-10(theme="ltgray") discord
        a(href="https://folia.substack.com", target="_blank", rel="noopener")
          btn.px-10(theme="ltgray") substack
    //- nav.info__nav.font-sans.text-right.md_m-8
      button.info__more-btn.cursor-pointer.focus_outline-none(@click="toggleMore", :class="{'info__more-btn--open': more}") {{more ? 'CLOSE' : 'INFO'}}
</template>

<script>
import Btn from '@/components/Btn'
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
  },
  components: { Btn }
}
</script>

<style scoped>
@import '../style/variables';

</style>
