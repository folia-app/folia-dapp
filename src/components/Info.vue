<template lang="pug">
  article#info.bg-white.text-black.flex.flex-col.justify-between
    section.px-8.py-12.lg_px-16.lg_py-20
      .text-red.text-2xl.md_text-3xl.lg_text-5xl.leading-normal
        h2.text-red
          | Folia publishes #[a.border-b-2.border-current.border-dotted.hover_border-solid(href="https://opensea.io/blog/guides/non-fungible-tokens/" target="_blank") NFT] editions.
          | #[button.ml-3.inline-block.text-black.py-px.rounded-full.px-3.bg-gray-100.text-xs.hover_bg-gray-200.focus_outline-none(@click="more = true", v-show="!more", style="font-size:0.4em") •••]

        transition(name="fadeinonly")
          ul.md_w-3x4.mt-6.text-gray-800.text-sm(v-show="more")
            li.truncate(v-if="contractAddr")
              | Contract – #[a(:href="`https://etherscan.io/address/${contractAddr}`", target="_blank") {{ contractAddr }}]
            li proudly presented by #[a(href="https://bin.am", target="_blank", rel="noopener") Bin Studio]
            //-
              h2.font-sans.font-bold What are these?
              p Each &ldquo;patch&rdquo; here is a &ldquo;Non-Fungible Token&rdquo; (NFT) on the Ethereum blockchain.
              h2.font-sans.font-bold.mt-lh-snug.pt-lh-snug NFT??
              p Any Ethereum app (such as this one) can define its own token to use as currency, in place of <span class="sans">ETH</span>. These tokens conventionally have decimal values, making them <i>fungible</i>. But <i>non-fungible</i> tokens cannot be divided&mdash;and like a coin, can only have a one&nbsp;owner. Making them collectible.
            //- p.mt-1em ...

    footer.flex.items-end.justify-between.mt-4
      ul.flex.flex-wrap.w-3x4.text-xs.p-6.pb-10.lg_p-10
        li.w-full.sm_w-auto.flex
          a(href="mailto:info@folia.app", target="_blank", rel="noopener")
            btn.px-10(theme="ltgray") info@folia.app
        li
          a(href="https://twitter.com/foliafoliafolia", target="_blank", rel="noopener")
            btn.px-10(theme="ltgray") twitter
        li
          a(href="https://discord.gg/8RA49VdraZ", target="_blank", rel="noopener")
            btn.px-10(theme="ltgray") discord
        li
          a(href="https://opensea.io/collection/folia", target="_blank", rel="noopener")
            btn.px-10(theme="ltgray") opensea
        li
          a(href="https://t.me/folia_app", target="_blank", rel="noopener")
            btn.px-10(theme="ltgray") telegram
        li
          a(href="https://folia.substack.com", target="_blank", rel="noopener")
            btn.px-10(theme="ltgray") substack
        li
          a(href="https://github.com/folia-app", target="_blank", rel="noopener noreferrer")
            btn.px-10(theme="ltgray") github

      svg-fleuron.text-black.h-12.m-12

    //- nav.info__nav.font-sans.text-right.md_m-8
      button.info__more-btn.cursor-pointer.focus_outline-none(@click="toggleMore", :class="{'info__more-btn--open': more}") {{more ? 'CLOSE' : 'INFO'}}
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@/components/Btn'
import svgFleuron from '@/components/SVG-Fleuron'
export default {
  name: 'Info',
  data () {
    return {
      more: false
    }
  },
  computed: {
    ...mapGetters(['contractAddr'])
  },
  methods: {
    toggleMore () {
      this.more = !this.more
      if (this.more) this.$router.push({ hash: 'faq' })
      // this.$nextTick(() => window.scroll(0, 0))
    }
  },
  components: { Btn, svgFleuron }
}
</script>

<style scoped>
@import '../style/variables';

</style>
