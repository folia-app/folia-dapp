<template lang="pug">
  #app.text-base.font-sans.leading-snug
    //- main
    .app__main.relative.z-20
      router-view
      //- scrim
      //- transition(name="fade")
        .absolute.w-full.h-full.top-0.left-0.opacity-50.bg-black.z-10.cursor-pointer(v-show="viewNotifs", @click="viewNotifs = false")
    //- notifications
    //- notifications.app__notifications.fixed.z3.top-0.left-0.h-100.col-11.md-col-6.lg-col-5(:class="{'app__notifications--squished': !viewNotifs}")
    //- notifications toggle / counter
    //- transition(name="fadeinonly")
      nav.fixed.bottom-0.left-0.p2.z3(v-show="!viewNotifs")
        button.bg-white.black.border.cursor-pointer.flex.items-center.justify-center(@click="viewNotifs = !viewNotifs", style="width:2em; height:2em;", title="View Notifications")
          span {{notifications.length}}

    template(v-if="isWrongNetwork")
      .p-8 Oops
      .fixed.z-50.bottom-0.left-0.w-full.p-6.md_p-8.bg-yellow.text-black.text-center.-shadow-md.font-sans.text-sm.md_text-base.lg_text-lg(v-html="'Wrong&nbsp;Network&nbsp;🤖 Please&nbsp;switch&nbsp;to&nbsp;Mainnet'")
</template>

<script>
// import Notifications from './components/Notifications.vue'
// import Status from './components/Status.vue'
import '@/style/_main.css'
export default {
  name: 'App',
  metaInfo: {
    titleTemplate: (ttl) => {
      return ttl ? `${ttl} – Folia` : 'Folia'
    }
  },
  computed: {
    isWrongNetwork () {
      const id = this.$store.state.networkId
      return id && id !== 1 && process.env.NODE_ENV !== 'development'
    }
  },
  created () {
    this.$store.dispatch('init')
    this.$store.dispatch('prismic/getDocs')
  },
  mounted () {
    return document.getElementById('loading')?.remove()
    // this.$store.dispatch('wallet/init')
    // this.begin()
  }
}
</script>

<style>
/*@import './style/global';*/
/*@import './style/imports';*/
/*@import './style/variables';*/
@import './style/transitions';

#app {
  /*font-family: var(--serif);*/
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*font-size:var(--basefont);*/
}

.app__main{
  transition:transform 500ms;
  transform-origin:top right;
}
.app__main--squished{
  transform:scale(0.0833,1);
}
.app__notifications{
  transition:transform 500ms;
  transform-origin:top left;
}
.app__notifications--squished{
  transform:scale(0,1);
}

@media (--breakpoint-md){
  .app__main.app__main--squished{
    transform:scale(0.5,1);
  }
}
@media (--breakpoint-lg){
  .app__main.app__main--squished{
    transform:scale(0.5833,1);
  }
}

/* web3 modal styling */
#WEB3_CONNECT_MODAL_ID .web3modal-modal-lightbox{
  font-family: var(--ff-sans);
  z-index: 1000;
}

button{
  font-weight: inherit;
  color:inherit;
  letter-spacing: inherit;
}

input{
  appearance:none;
  letter-spacing: inherit;
  line-height: inherit;
  color: inherit;
  background: transparent;
  &::placeholder{
    color:inherit;
  }
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  &[type=number] {
    -moz-appearance: textfield;
  }
}
</style>
