<template lang="pug">
  article.set.w-full.bg-white.text-black
    .relative.overflow-y-scroll.h-screen.scrollbars-hidden
      .min-h-screen
        header.p-8.lg_p-12.text-xl.lg_pb-16
          .flex.w-full.justify-start.mb-20
            //- router-link(to="/")
              svg-fleuron.block.mr-2(style="width:0.96em;height:0.96em")
            .leading-none.whitespace-no-wrap.text-smm SERIES
          //- heading
          .font-bold Pixel Sorters
          div Harm van den Dorpel
          //- div 2017
            //- rich-text(:field="doc.data.medium")
            //- div
            //-   template(v-if="work") {{ work.printed }}/{{work.editions}} Minted
            //-   template(v-else) Edition of {{ doc.data.edition }}

            //- div {{ work ? weiToETH(work.price) : doc.data.price_eth }} ETH
        nav.px-8.lg_px-12.flex.justify-start.mb-12.-ml-2.text-md
          button.focus_outline-none(@click="view = 'set'")
            btn.px-8.md_px-10(theme="ltgray", :active="view === 'set'") Works
          button.focus_outline-none(@click="view = 'info'")
            btn.px-8.md_px-10(theme="ltgray", :active="view === 'info'") Info

        section.mt-12
          div(v-if="view === 'set'")
            ol
              li
                router-link.block.border-t.border-b.-mb-px.border-gray-600.flex.items-center.pl-8.lg_pl-12.hover_bg-gray-50.focus_bg-gray-50(v-for="n in [4,5,6]", to="/works/4", style="border-style:dotted")
                  span.flex.items-end.text-lg
                    svg-fleuron.block.mr-2(style="width:0.96em;height:0.96em")
                    .leading-none.whitespace-no-wrap.text-base 00{{n}}
                  h6.ml-20.text-md Blob.gif
                  figure.w-48.h-48.bg-black.ml-auto.relative
                    img.absolute.o
</template>

<script>
import svgFleuron from '@/components/SVG-Fleuron'
import Btn from '@/components/Btn'
export default {
  name: 'Set',
  components: { svgFleuron, Btn },
  data () {
    return {
      view: 'set'
    }
  }
}
</script>

<style>
</style>
