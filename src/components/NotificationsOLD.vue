<template lang="pug">
  .notifications-holder
    .notification-counter(v-if="notifications.length" @click="markAllNotifications()") {{!filteredNotifications.length ? notifications.length : notifications.length - filteredNotifications.length}}
    .notification(v-for="(notification, key) in filteredNotifications" :key="key" :class="classNames(notification.type)")
      .notification-close(@click="removeNotification(notification.id)")
      .notification-title(v-if="notification.title") {{notification.title}}
      .notification-body(v-if="notification.body" v-html="notification.body")
      .notification-link: a(v-if="notification.link" :href="notification.link.to" target="_blank") {{notification.link.text || "Link"}}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
export default {

  name: 'Notifications',

  data () {
    return {
      showAll: false
    }
  },
  computed: {
    ...mapGetters(['notifications']),
    filteredNotifications () {
      return this.notifications.filter(n => !n.seen || this.showAll)
    }
  },
  methods: {
    ...mapMutations(['removeNotification', 'markAllNotifications']),
    classNames (type) {
      return {
        'notification-error': type === 'error',
        'notification-progress': type === 'progress',
        'notification-success': type === 'success'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.notification-counter {
  position: fixed;
  bottom:1em;
  left:1em;
  border: 1px solid black;
  padding: 5px;
  min-width:2em;
  min-height:1.5em;
  text-align:center;
  cursor: pointer;
  background-color: white;
  box-shadow: 0px 0px 50px rgba(0,0,0,0.2);
}
.notifications-holder {
  position: fixed;
  bottom:3.5em;
  left:4em;
  max-width:500px;
  z-index:9;
  text-align: justify;
  .notification {
    position: relative;
    background-color: white;
    padding:10px;
    line-height: 1.2em;
    margin-bottom:0.5em;
    box-shadow: 0px 0px 50px rgba(0,0,0,0.2);
    border: 10px solid black;
    .notification-close {
      position: absolute;
      top:5px;
      right:10px;
      cursor: pointer;
      &:after {
        content: "\D7";
        font-size:32px;
      }
    }
    .notification-title {
      font-weight: bold;
      margin-bottom:1em;
      padding-right:2em;
    }
    .notification-link {
      margin-top: 1em;
      text-align: center;
    }
    &.notification-success {
      border-color:#00ff00;
    }
    &.notification-error {
      border-color:#ff0000;
    }
    &.notification-progress {
      border-color:#0000ff;
    }
  }
}
</style>
