<template lang="pug">
  span.inline-block(style="min-width:10em; font-family:monospace;font-size: 0.95em")
    template(v-if="msUntil") {{ timeFormatted }}
    template(v-else) - - - -
</template>

<script>
export default {
  name: 'CountDown',
  props: {
    until: { type: String, default: undefined }
  },
  data () {
    return {
      timer: null,
      msUntil: 0
    }
  },
  computed: {
    timeFormatted () {
      return this.msUntil && ddhhmmss(this.msUntil)
    },
    thenMs () {
      // testing
      const testMs = process.env.VUE_APP_DEV_COUNTDOWN
      if (testMs) {
        return new Date().getTime() + Number(testMs)
      }
      if (this.until) {
        return new Date(this.until).getTime()
      }
      return undefined
    }
  },
  methods: {
    play () {
      if (this.thenMs !== undefined) {
        const nowMs = new Date().getTime()
        const msUntil = this.thenMs - nowMs
        if (msUntil <= 0) {
          this.$emit('ended')
          return
        }
        this.msUntil = msUntil
      }
      this.timer = setTimeout(() => this.play(), 999)
    },
    pause () {
      clearTimeout(this.timer)
    }
    // observe () {
    //   const observer = new IntersectionObserver((entries) => {
    //     return entries[0].isIntersecting ? this.play() : this.pause()
    //   })
    //   observer.observe(this.$el)
    // }
  },
  created () {
    this.play()
  }
}

const ddhhmmss = (milliseconds) => {
  let hour, minute, seconds
  seconds = Math.floor(milliseconds / 1000)
  minute = Math.floor(seconds / 60)
  seconds = seconds % 60
  hour = Math.floor(minute / 60)
  minute = minute % 60
  const day = Math.floor(hour / 24)
  hour = hour % 24
  // const tm = str => str // ('0' + str).slice(-2)
  return `${day}d - ${hour}h - ${minute}m - ${seconds}s`
  // return {
  //     day: day,
  //     hour: hour,
  //     minute: minute,
  //     seconds: seconds
  // };
}
</script>

<style>
</style>
