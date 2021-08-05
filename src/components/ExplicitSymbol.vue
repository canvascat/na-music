<template>
  <IconExplicit :style="svgStyle" />
</template>

<script>
import { IconExplicit } from '@/components/icons'

export default {
  name: 'ExplicitSymbol',
  components: {
    IconExplicit
  },
  props: {
    size: {
      type: Number,
      default: 16
    }
  },
  data () {
    return {
      svgStyle: {}
    }
  },
  created () {
    this.svgStyle = {
      height: this.size + 'px',
      width: this.size + 'px'
    }
  }
}
</script>

<style lang="scss" scoped></style>
