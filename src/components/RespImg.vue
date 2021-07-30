<template lang="pug">
  .resp-img(:class="{'relative': !bg}", :style="{paddingBottom: !bg && dims && `${dims.height / dims.width * 100}%`}", v-if="src")
    //- modern browsers load srcset instead of src
    //- lazysizes will load data-srcset when visible
    img.absolute.h-full.w-full.top-0.left-0(ref="img", :class="[fit, {'lazyload': lazy, 'no-lazyload-anim': !anim}]", :srcset="lazy ? '/loading.gif' : thumb", :data-srcset="thumb", data-sizes="auto", :alt="image.alt || alt", :data-expand="lazyBuffer")
</template>

<script>
export default {
  name: 'RespImg',
  props: {
    image: { type: Object, default: undefined },
    alt: { type: String, default: '' },
    bg: { type: Boolean, default: false },
    fit: { type: String, default: 'object-cover object-center' },
    lazy: { type: Boolean, default: true },
    anim: { type: Boolean, default: true }, // animate lazyload
    lazyBuffer: { type: String, default: '500' },
    rawSrc: { type: Boolean, default: false }
  },
  data () {
    return {
      thumb: '',
      dims: null
    }
  },
  computed: {
    src () {
      return this.image?.originalSrc || this.image?.src || this.image?.url
    },
    resize () {
      return resizeCloudinary
      // return this.url?.includes('shopify.com') ? resizeShopifyImg : resizeImgix
    }
    // dims () {
    //   return this.image?.dimensions || { height: this.image?.height, width: this.image?.width }
    // }
  },
  methods: {
    setThumb () {
      // optimized image size, based on el width (must be rendered)
      this.thumb = this.rawSrc ? this.src : this.resize(this.src, [this.$el.offsetWidth])
    }
  },
  mounted () {
    this.dims = { height: this.$el.offsetHeight, width: this.$el.offsetWidth }
    this.setThumb()
  }
}

// find image size
export function optimImgSize (length) {
  const sizes = [360, 480, 640, 1024, 1280, 1600, 2048, 3072, 4096]
  const dpx = window.devicePixelRatio || 1
  length = length * dpx * 0.9 // less density optically ok ? (target 80%)
  // find optimal
  return sizes.find(sz => length <= sz) || sizes[sizes.length - 1]
}

// Cloudinary resizer
export function resizeCloudinary (url, size = [], optim = true) {
  // svg ?
  if (url.includes('.svg')) {
    return url
  }

  let params = ['q_auto', 'f_auto']
  const optimize = (size) => optim ? optimImgSize(size) : size
  // expect it's /upload
  if (size[0]) params.push('w_' + optimize(size[0]))
  if (size[1]) params.push('h_' + optimize(size[1]))
  params = params.join(',')
  return url.includes('cloudinary.com') ? url.replace('upload/', `upload/${params}/`)
    : `https://res.cloudinary.com/folia/image/fetch/${params}/${url}`
}

// Shopify resizer
// export function resizeShopifyImg (url, size = []) {
//   const w = size[0] ? optimImgSize(size[0]) : ''
//   const h = size[1] ? optimImgSize(size[1]) : ''
//   const dot = url.lastIndexOf('.') // hopefully .jpg or .png etc
//   return `${url.slice(0, dot)}_${w}x${h}${url.slice(dot)}`
// }

// Imgix resizer (Prismic)
// export function resizeImgix (src, size = []) {
//   if (!src || !size) return src // { return console.warn('No src provided:', src) }
//   try {
//     src = new URL(src)
//   } catch (e) {
//     console.error(e)
//   }
//   // original specs
//   const w0 = src.searchParams.get('w')
//   const h0 = src.searchParams.get('h')
//   // new specs
//   const w = size[0] && optimImgSize(size[0])
//   const h = size[1] && optimImgSize(size[1])
//   // edit/set params
//   if (w) {
//     src.searchParams.set('w', w)
//     // preserve aspect ratio ?
//     if (h0 && w0) {
//       src.searchParams.set('h', parseInt(w * h0 / w0))
//     }
//   }
//   if (h) {
//     src.searchParams.set('h', h)
//     // preserve aspect ratio ?
//     if (w0 && h0) {
//       src.searchParams.set('h', parseInt(h * w0 / h0))
//     }
//   }
//   // blur ?
//   // if (blur) src.searchParams.set('blur', blur)
//   //
//   return src.href
// }
</script>

<style>
/* lazysizes - fade in on loaded*/
:not(.no-lazyload-anim) {
  &.lazyload,
  &.lazyloading {
    opacity: 0;
  }
  &.lazyloaded {
    opacity: 1;
    transition: opacity 300ms;
  }
}
</style>

<!--
lazysizes loaded image, using "modern srcset" approach
* https://github.com/aFarkas/lazysizes#modern-transparent-srcset-pattern
-->
