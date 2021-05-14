<template lang="pug">
  section.work-info(style="padding-bottom:25vh", v-if="doc")
    h3.sr-only Info
    //- (media)

    //- (teaser video - non-release + generatative)
    figure.mb-12(v-if="isVariableEdition && videoUrl")
      //- && (isReleased === false || (work && work.printed !== '0'))")
      video.w-full.md_w-2x3.block(ref="video", :src="videoUrl", loop, muted, autoplay, playsinline)

    //- singular works
    figure.mb-12(v-else-if="!isVariableEdition && hasMedia")
      router-link.block.relative.group(:to="{name: 'work-info-tokenviewer', params: { token: Number(doc.uid) * 1000000 + 1 }}")
        //- (video)
        video.w-full(v-if="videoUrl", ref="video", :src="videoUrl", loop, muted, autoplay, playsinline, :poster="doc.data.teaser_image.url")

        //- (gif)
        .pb-ar-1x1.relative(v-else-if="doc.data.teaser_image.url && doc.data.teaser_image.url.includes('.gif')")
          .absolute.overlay.flex.items-center.justify-center.bg-white
            img-gif(:src="doc.data.teaser_image.url")

        //- (image)
        template(v-else)
          img.block.w-full(:src="doc.data.teaser_image.url", @contextmenu.prevent)

        //- eyeball icon
        .absolute.bottom-0.right-0.text-black.py-3.px-5.lg_opacity-0ff.lg_group-hover_opacity-100.transition.duration-150(style="mix-blend-mode:difference")
          svg-eye.text-white

    //- info text
    rich-text.text-lg.px-10.lg_px-12.children-mt-em.lg_w-10x12.links-underline(style="max-width:28em;", :field="doc.data.description")
</template>

<script>
import RichText from '@/components/RichText'
import ImgGif from '@/components/ImgGif'
import SvgEye from '@/components/SVG-Eye'
export default {
  name: 'WorkInfo',
  props: ['doc', 'work', 'isVariableEdition', 'isReleased'],
  computed: {
    videoUrl () {
      const videoLink = this.doc?.data.teaser_video
      return videoLink?.kind === 'document' && videoLink?.link_type === 'Media' && videoLink?.url
    },
    visible () {
      return this.$route.name === 'work-info'
    },
    hasMedia () {
      return this.videoUrl || this.doc.data.teaser_image?.url
    }
  },
  watch: {
    visible (vis) {
      if (this.$refs.video) {
        return vis ? this.$refs.video.play() : this.$refs.video.pause()
      }
    }
  },
  components: { RichText, ImgGif, SvgEye }
}
</script>

<style>
</style>
