<template lang="pug">
  //- HEADER
  header.absolute.top-0.left-0.w-full.z-20.text-white.pointer-events-none
    .absolute.top-0.left-0.w-full
      .flex.w-full.justify-between.items-center
        //- logo
        .p-10.md_px-12.pointer-events-auto
          button.focus_outline-none.-m-2.lg_m-0.lg_mt-1(@click="onLogoClick", aria-label="About Folia")
            //- logo.block.text-white.h-12.cursor-poiner(aria-label="Folia")
            svg-fleuron.text-white.block.h-16.lg_h-20.cursor-pointer
          //- svg-fleuron.block.text-white(style="height:3rem")
        div.pointer-events-auto
          button.p-10.focus_outline-none(v-if="!address", @click="$store.dispatch('connect')") Connect
          button.p-10.focus_outline-none.relative.group(v-else, @click="$store.dispatch('disconnect')")
            span.group-hover_opacity-0.truncate {{ address.slice(0, 6) + '...' + address.slice(-4) }}
            span.hidden.group-hover_block.absolute.overlay.text-right.p-10 Disconnect
</template>

<script>
import { mapState } from 'vuex'
import Logo from '@/components/Logo'
import svgFleuron from '@/components/SVG-Fleuron'
export default {
  name: 'LandingHeader',
  computed: {
    ...mapState(['address'])
  },
  methods: {
    onLogoClick () {
      document.getElementById('info').scrollIntoView({ behavior: 'smooth' })
    }
  },
  components: { Logo, svgFleuron }
}
</script>

<style>
</style>
