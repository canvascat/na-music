<template>
  <button
    :class="[
      'm-button',
      type ? 'm-button--' + type : '',
      buttonSize ? 'm-button--' + buttonSize : '',
      {
        'is-disabled': buttonDisabled,
        'is-plain': plain,
        'is-round': round,
        'is-circle': circle
      }
    ]"
    :disabled="buttonDisabled"
    :autofocus="autofocus"
    :type="nativeType"
    @click="handleClick"
  >
    <slot name="icon"></slot>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>

<script lang='ts'>
import { computed, defineComponent } from 'vue'
import type { PropType } from 'vue'

type IButtonType = PropType<'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default'>
type IButtonNativeType = PropType<'button' | 'submit' | 'reset'>
type ComponentSize = 'large' | 'medium' | 'small' | 'mini'


const isValidComponentSize = (val: string) =>
  ['', 'large', 'medium', 'small', 'mini'].includes(val)

export default defineComponent({
  name: 'MButton',

  props: {
    type: {
      type: String as IButtonType,
      default: 'default',
      validator: (val: string) => {
        return [
          'default',
          'primary',
          'success',
          'warning',
          'info',
          'danger',
          'text',
        ].includes(val)
      },
    },
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    nativeType: {
      type: String as IButtonNativeType,
      default: 'button',
      validator: (val: string) => {
        return ['button', 'submit', 'reset'].includes(val)
      },
    },
    disabled: Boolean,
    plain: Boolean,
    autofocus: Boolean,
    round: Boolean,
    circle: Boolean,
  },

  emits: ['click'],

  setup (props, { emit }) {

    const buttonSize = computed(() => {
      return props.size
    })
    const buttonDisabled = computed(() => {
      return props.disabled
    })

    //methods
    const handleClick = (evt: MouseEvent) => {
      emit('click', evt)
    }

    return {
      buttonSize,
      buttonDisabled,
      handleClick,
    }
  },
})
</script>

<style lang="scss" scoped>
.m-button {}
</style>
