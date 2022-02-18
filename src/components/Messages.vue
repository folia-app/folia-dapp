<template lang="pug">
  ul.messages
    //- messages...
    li(v-for="(msg, index) in messages")
      //- (overlay msg)
      template(v-if="msg.format === 'overlay'")
        //- TODO accessibility
        div.fixed.overlay.z-50.bg-black-a90.flex.items-center.justify-center.cursor-pointer(@click.stop="deleteMsg({ index })")
          div.text-white.text-lg.px-8.mx-auto.text-center(v-html="msg.body")
          button.absolute.top-0.right-0.p-8.focus_outline-none(@click.stop="deleteMsg({ index })")
            svg-x.w-8.h-8.text-white(strokeWidth="1")

  //- ul.bg-black.text-white.flex.flex-col.justify-end.font-mono
    li.col-12.p2(v-for="(notification, key) in filteredNotifications", :key="key", :class="itemClass(notification.type)")
      //- .notification-close(@click="removeNotification(notification.id)")
      h6(v-if="notification.title") {{notification.title}}
      p(v-if="notification.body" v-html="notification.body")
      footer.pt-1
        router-link.underline(:to="notification.link.to", v-if="notification.link") {{notification.link.text || "Link"}}
</template>

<script>
// import { mapGetters } from 'vuex'
import SvgX from '@/components/SVG-X'
export default {
  name: 'Notifications',
  components: { SvgX },
  data () {
    return {
      messages: []
    }
  },
  computed: {
    // ...mapGetters(['messages']),
    filteredNotifications () {
      return this.messages // .filter(n => !n.seen || this.showAll)
    }
  },
  methods: {
    itemClass (type) {
      return {
        'bg-red white': type === 'error',
        'bg-yellow black': type === 'progress',
        'bg-green white': type === 'success'
      }
    },
    updateMsg ({ timestamp, body }) {
      const msgs = JSON.parse(JSON.stringify(this.messages))
      const msg = msgs.find(msg => msg.timestamp === timestamp)
      if (msg) {
        msg.body = body
        this.messages = msgs // update
      }
    },
    deleteMsg ({ index, timestamp }) {
      index = index ?? this.messages.findIndex(msg => msg.timestamp === timestamp)
      return index > -1 && this.messages.splice(index, 1)
    }
  },
  created () {
    this.$root.$on('newMsg', msg => this.messages.push(msg))
    this.$root.$on('updateMsg', this.updateMsg)
    this.$root.$on('killMsg', ({ timestamp }) => this.deleteMsg({ timestamp }))
  }
}
</script>

<style>
</style>
