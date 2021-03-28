<template lang="pug">
  squishy-thumb.squishy-thumb-token.transition.duration-200(@open="open", :style="{background: userIsOwner && '#ffeb00'}")

    //- media
    div(slot="media", @mouseenter="onMouseenter", @mouseleave="onMouseleave")
      //- image
      resp-img.transition-opacity.duration-500(:bg="true", :image="{src: token.image}", :class="{'opacity-0': hover && token.drc}")
      //- iframe ?
      template(v-if="token.drc && hover")
        .absolute.overlay(:class="{'cursor-wait': !iframeLoaded}")
          iframe.absolute.overlay.pointer-events-none.transition-opacity.duration-500(:src="`https://programmatic-puppet.netlify.app?drc=${encodeURIComponent(token.drc)}`", @load="iframeLoaded = true", :class="{'opacity-0': !iframeLoaded}")

    //- img.absolute.overlay.object-contain.object-center.transition.duration-300.opacity-0.lazyload(slot="media", :srcset="`${resizeCloudinary(token.image, [414], false)} 414w,${resizeCloudinary(token.image, [640], false)} 1920w, ${resizeCloudinary(token.image, [960], false)}`", @load="$event => $event.target.style.opacity = 1")

    //- inner content
    .absolute.overlay.flex.items-center.justify-center.group(v-if="opened")
      //- No.
      //- a.absolute.bottom-0.right-0.px-4.py-3.opacity-0.group-hover_opacity-100(:href="openSeaLink({token: token.tokenId})", target="_blank", rel="noopener noreferrer")
        btn.px-8.hover_bg-black-a15(theme="none", size="small") {{ token.tokenId.slice(-3) }}
      router-link.absolute.overlay.flex.justify-center.items-center(:to="{name: 'view-token', params: {token: token.tokenId}}")
        //- btn.px-8.hover_bg-black-a15(theme="none", size="small") {{ token.tokenId.slice(-3) }}
        | {{ token.tokenId.slice(-3) }}

        //- eyeball icon
        .absolute.bottom-0.right-0.py-3.px-3.opacity-0.group-hover_opacity-100()
          btn.px-4.hover_bg-black-a15(size="small", theme="none")
            svg-eye
            //- <svg style="display:block;width:3rem" viewBox="0 0 512 512" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio>
            //-   <g fill="currentColor">
            //-     <path d="m34,256l26.2,26.2c108,108 283.7,108 391.7,0l26.1-26.2-26.2-26.2c-108-108-283.7-108-391.7,0l-26.1,26.2zm222,126.2c-75.8,0-151.6-28.9-209.3-86.6l-32.9-32.9c-3.7-3.7-3.7-9.7 0-13.5l32.9-32.9c115.4-115.4 303.2-115.4 418.6,0l32.9,32.9c3.7,3.7 3.7,9.7 0,13.5l-32.9,32.9c-57.7,57.7-133.5,86.6-209.3,86.6z"/>
            //-     <path d="m256,183.5c-40,0-72.5,32.5-72.5,72.5s32.5,72.5 72.5,72.5c40,0 72.5-32.5 72.5-72.5s-32.5-72.5-72.5-72.5zm0,164c-50.5,0-91.5-41.1-91.5-91.5 0-50.5 41.1-91.5 91.5-91.5s91.5,41.1 91.5,91.5c0,50.5-41,91.5-91.5,91.5z"/>
            //-   </g>
            //- </svg>

      //- (owner)
      a.absolute.top-0.left-0.py-3.px-4(v-if="owner", :href="openSeaLink({account: owner})", target="_blank", rel="noopener noreferrer", :class="{'opacity-0 group-hover_opacity-100': true || !userIsOwner}")
        btn.px-5.hover_bg-black-a15(theme="none", size="small") {{ userIsOwner ? 'You' : addrShort(owner) }}

      //- ...
      a.absolute.top-0.right-0.py-3.px-4.opacity-0.group-hover_opacity-100(:href="openSeaLink({token: token.tokenId})", target="_blank", rel="noopener noreferrer")
        //- button.ml-3.inline-block.text-black.py-px.rounded-full.px-3.text-sm.focus_outline-none.hover_bg-black-a15(theme="none", size="small") ...
        btn.px-4.hover_bg-black-a15(theme="none", size="small") ...
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import SquishyThumb from '@/components/SquishyThumb'
import Btn from '@/components/Btn'
import RespImg, { resizeCloudinary } from '@/components/RespImg'

import svgEye from '@/components/SVG-Eye'
export default {
  name: 'SquishyThumbToken',
  props: ['token'],
  data () {
    return {
      owner: '',
      opened: false,
      hover: false,
      iframeLoaded: false,
      hoverTmout: null
    }
  },
  computed: {
    ...mapState({
      userAddress: state => state.address
    }),
    ...mapGetters(['addrShort', 'openSeaLink']),
    userIsOwner () {
      return this.userAddress === this.owner
    }
  },
  methods: {
    resizeCloudinary,
    async fetchOwner () {
      this.owner = await this.$store.dispatch('getNFTOwnerByTokenId', this.token.tokenId)
    },
    open () {
      this.opened = true
      this.fetchOwner()
      this.onMouseleave() // cancel hover
    },
    onMouseenter () {
      // cancel if opened
      if (this.opened) return this.onMouseleave()
      // load iframe
      this.hoverTmout = setTimeout(() => {
        this.hover = true
      }, 300)
    },
    onMouseleave () {
      this.hover = this.iframeLoaded = false
      clearTimeout(this.hoverTmout)
    }
  },
  components: { Btn, SquishyThumb, svgEye, RespImg }
}
</script>

<style>
</style>
