<template lang="pug">
  ul.bg-black.text-white.flex.flex-col.justify-end.font-mono
    li.col-12.p2(v-for="(notification, key) in filteredNotifications", :key="key", :class="itemClass(notification.type)")
      //- .notification-close(@click="removeNotification(notification.id)")
      h6(v-if="notification.title") {{notification.title}}
      p(v-if="notification.body" v-html="notification.body")
      footer.pt-1
        router-link.underline(:to="notification.link.to", v-if="notification.link") {{notification.link.text || "Link"}}
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Notifications',
  computed: {
    ...mapGetters(['notifications']),
    filteredNotifications () {
      return this.notifications // .filter(n => !n.seen || this.showAll)
    }
  },
  methods: {
    itemClass (type) {
      return {
        'bg-red white': type === 'error',
        'bg-yellow black': type === 'progress',
        'bg-green white': type === 'success'
      }
    }
  }
}
</script>

<style>
</style>
