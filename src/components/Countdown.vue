<template lang="pug">
  span.whitespace-no-wrap(:class="[font]")
    template(v-if="msUntil") {{ timeFormatted }}
    template(v-else) - - - -
</template>

<script>
export default {
  name: 'CountDown',
  props: {
    until: [String, Number],
    separator: String,
    font: { type: String, default: 'font-mono' }
  },
  data () {
    return {
      timer: null,
      msUntil: 0
    }
  },
  computed: {
    timeFormatted () {
      return this.msUntil && ddhhmmss(this.msUntil, this.separator)
    },
    thenMs () {
      // testing
      const testMs = process.env.VUE_APP_DEV_COUNTDOWN
      if (testMs) {
        return new Date().getTime() + Number(testMs)
      }
      if (this.until) {
        return isNaN(this.until) ? new Date(this.until).getTime() : this.until
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
      this.timer = setTimeout(() => this.play(), 300)
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

export function ddhhmmss (milliseconds, separator = ' - ', omittSeconds, omittDays) {
  let hour, minute, seconds, day
  seconds = Math.floor(milliseconds / 1000)
  minute = Math.floor(seconds / 60)
  seconds = seconds % 60
  hour = Math.floor(minute / 60)
  minute = minute % 60
  day = 0
  if (!omittDays) {
    day = Math.floor(hour / 24)
    hour = hour % 24
  }
  // const tm = str => str // ('0' + str).slice(-2)
  // return `${day}d - ${hour}h - ${minute}m - ${seconds}s`
  const time = [
    [day, 'd'],
    [hour, 'h'],
    [minute, 'm'],
    [seconds, 's']
  ]
  return time
    .filter(val => val[0] > 0 || (val[1] === 's' && !omittSeconds))
    .map(val => val.join(''))
    .join(separator)
}
</script>

<style>
</style>
