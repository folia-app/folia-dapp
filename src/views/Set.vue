<template lang="pug">
  article.set.w-full.bg-white.text-black
    .relative.overflow-y-scroll.h-screen.scrollbars-hidden
      .min-h-screen(v-if="doc")
        //- header
        header.p-8.lg_p-12.text-xl.lg_pb-16
          .flex.w-full.justify-between.mb-20
            //- label
            .leading-none.whitespace-no-wrap.text-smm.uppercase {{ doc.data.set_type_label }}
            //- (link home mbl)
            router-link.lg_hidden(to="/")
              svg-fleuron.block.mr-2(style="width:0.96em;height:0.96em")

          //- title
          rich-text.set__heading(:field="doc.data.heading")

        //- tabs
        nav.px-8.lg_px-12.flex.justify-start.mb-12.-ml-2.text-md
          button.focus_outline-none(@click="view = 'set'")
            btn.px-8.md_px-10(theme="ltgray", :active="view === 'set'") Works
          button.focus_outline-none(@click="view = 'info'")
            btn.px-8.md_px-10(theme="ltgray", :active="view === 'info'") Info

        //- body
        section.mt-12.pb-64
          //- (works)
          div(v-show="view === 'set'")
            ol
              //- rows format
                li(v-for="n in [4,5,6]")
                  router-link.block.-mb-px.border-gray-600.flex.items-center.pl-8.lg_pl-12.hover_bg-gray-50.focus_bg-gray-50(to="/works/4", style="border-style:dotted", :class="{'bg-gray-100 hover_bg-white': n % 2 === 0}")
                    span.flex.items-end.text-lg
                      svg-fleuron.block.mr-2(style="width:0.96em;height:0.96em")
                      .leading-none.whitespace-no-wrap.text-base 00{{n}}
                    h6.ml-20.text-md Blob.gif
                    figure.w-48.h-48.bg-black.ml-auto.relative
                      img.absolute.o
              //- blocks
              li.mx-8.lg_mx-10.border.rounded-3xl.overflow-hidden.border-gray-400.-mb-px.transform.translate-z-0(v-for="(item, i) in items", :class="{'flex-row-reverse': i % 2 === 1}")
                prismic-link.w-full.px-6.sm_px-8.py-10.flex.flex-wrap.justify-between.items-center(:field="item.link", :linkResolver="linkResolver")
                  .flex.items-center
                    //- span.flex.items-center.text-base.mr-8
                      svg-fleuron.block.mr-2(style="width:0.96em;height:0.96em")
                      span.leading-none.whitespace-no-wrap.text-md.pt-1 {{ $store.getters.workId(item.link.uid, true) }}
                    h6.text-sm.sm_text-base {{ item.link.data.title }}
                  btn.text-xs.sm_text-sm.-mr-2.-my-2.sm_-my-5.px-6.sm_px-8.pointer-events-none.bg-gray-800.text-white.ml-auto(size="small", theme="none", v-if="item.label")
                    //- countdown(v-if="!isReleased(item)", :until="item.link.data.release_link.data.release_time", @ended="refresh", separator=" ")
                    //- TOD0 - revise this text after harm
                    //- template(v-else) AUCTION
                    //- | AUCTION
                    | {{ item.label }}

                prismic-link.w-full.block.-mb-px(:field="item.link", :linkResolver="linkResolver", :class="{'px-8 pb-8': item.thumbnail_format === 'padded'}")
                  //- (video)
                  template(v-if="item.thumbnail.link_type === 'Media' && item.thumbnail.kind === 'document'")
                    video.block.lazyload(:src="item.thumbnail.url", autoplay, muted, loop, playsinline, data-expand="0", :class="item.thumbnail_format === 'padded' ? 'w-auto max-w-full mx-auto' : 'w-full'")
                  //- (image)
                  template(v-else-if="item.thumbnail.kind === 'image'")
                    img.w-auto.max-w-full.mx-auto.block(:src="item.thumbnail.url")

          //- (info)
          .px-8.lg_px-12(v-show="view === 'info'")
            rich-text.children-mt-em.links-underline(:field="doc.data.info", style="max-width:30em")
</template>

<script>
import svgFleuron from '@/components/SVG-Fleuron'
import Btn from '@/components/Btn'
import Countdown from '@/components/Countdown'
import linkResolver from '@/plugins/prismic/link-resolver'
import RichText from '@/components/RichText'
export default {
  name: 'Set',
  components: { svgFleuron, Btn, RichText, Countdown },
  data () {
    return {
      view: 'set',
      loaded: new Date().getTime(),
      linkResolver
    }
  },
  computed: {
    doc () {
      return this.$store.state.prismic.docs.find(doc => doc.uid === this.$route.params.set)
    },
    items () {
      return this.doc?.data.items || []
    }
  },
  methods: {
    hasRelease (item) {
      return item?.link?.data?.release_link?.data?.release_time
    },
    isReleased (item) {
      const time = item?.link?.data?.release_link?.data?.release_time
      return !time || new Date(time).getTime >= new Date().getTime()
    },
    refresh () {
      this.loaded = new Date().getTime()
    }
  },
  metaInfo () {
    let info = {}
    if (this.doc) {
      const title = this.doc.data.meta_title || this.doc.data.title
      info = {
        title,
        meta: this.$store.getters.meta({ title, descrip: '', img: this.doc.data.meta_image?.url })
      }
    }
    return info
  }
}
</script>

<style>
.set__heading {
  & h1 {
    @apply font-bold;
  }
}
</style>
