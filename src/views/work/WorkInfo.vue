<template lang="pug">
  section.work-info(style="padding-bottom:25vh", v-if="doc")
    h3.sr-only Info
    //- (media)

    //- (teaser video - non-release + generatative)
    figure.mb-12(v-if="isVariableEdition && video")
      //- && (isReleased === false || (work && work.printed !== '0'))")
      video.w-full.md_w-2x3.block(:src="video", loop, muted, autoplay, playsinline)

    //- singular works
    figure.mb-12(v-else-if="!isVariableEdition")
      router-link.block(:to="{name: 'work-token', params: { token: Number(doc.uid) * 1000000 + 1 }}")
        //- (gif)
        .pb-ar-1x1.relative(v-if="doc.data.teaser_image.url && doc.data.teaser_image.url.includes('.gif')")
          .absolute.overlay.flex.items-center.justify-center.bg-white
            img-gif(:src="doc.data.teaser_image.url")
        //- (image)
        template(v-else)
          img.block.w-full(:src="doc.data.teaser_image.url", @contextmenu.prevent)

    //- info text
    rich-text.text-lg.px-10.lg_px-12.children-mt-em.lg_w-10x12(style="max-width:28em;", :field="doc.data.description")
</template>

<script>
import RichText from '@/components/RichText'
import ImgGif from '@/components/ImgGif'
export default {
  name: 'WorkInfo',
  props: ['doc', 'work', 'isVariableEdition', 'isReleased'],
  computed: {
    video () {
      const videoLink = this.doc?.data.teaser_video
      return videoLink?.kind === 'document' && videoLink?.link_type === 'Media' && videoLink?.url
    }
  },
  components: { RichText, ImgGif }
}
</script>

<style>
</style>
