<template lang="pug">
  #app.text-base.font-serif.leading-snug
    div(style="position:fixed;top:0;right:0;z-index:1000")
      button(v-if="!address", @click="$store.dispatch('connect')") Connect
      button(v-else, @click="$store.dispatch('disconnect')") {{ address }}
    //- main
    .app__main.relative.z-20(:class="{'app__main--squished': viewNotifs}")
      router-view
      //- scrim
      transition(name="fade")
        .absolute.w-full.h-full.top-0.left-0.opacity-50.bg-black.z-10.cursor-pointer(v-show="viewNotifs", @click="viewNotifs = false")
    //- notifications
    //- notifications.app__notifications.fixed.z3.top-0.left-0.h-100.col-11.md-col-6.lg-col-5(:class="{'app__notifications--squished': !viewNotifs}")
    //- notifications toggle / counter
    //- transition(name="fadeinonly")
      nav.fixed.bottom-0.left-0.p2.z3(v-show="!viewNotifs")
        button.bg-white.black.border.cursor-pointer.flex.items-center.justify-center(@click="viewNotifs = !viewNotifs", style="width:2em; height:2em;", title="View Notifications")
          span {{notifications.length}}
</template>

<script>
// import Notifications from './components/Notifications.vue'
// import Status from './components/Status.vue'
import '@/style/_main.css'
import { mapState } from 'vuex'
export default {
  name: 'App',
  // components: { Status, Notifications },
  data () {
    return {
      viewNotifs: false
    }
  },
  methods: {
    // ...mapActions(['begin', 'reset'])
  },
  computed: {
    ...mapState(['address'])
    // ...mapState(['account', 'locked', 'error']),
    // ...mapGetters(['notifications'])
  },
  watch: {
    account () {
      console.log('account changed')
      // this.reset()
    },
    locked () {
      console.log('locked changed')
      // this.reset()
    }
  },
  created () {
    this.$store.dispatch('init')
    this.$store.dispatch('prismic/getWorks')
  },
  mounted () {
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
</style>
