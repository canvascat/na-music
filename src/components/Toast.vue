<template>
  <transition name="toast-fade" @before-leave="onClose" @after-leave="$emit('destroy')">
    <div
      v-show="visible"
      :id="id"
      :class="['toast', customClass]"
      :style="customStyle"
      role="alert"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
    >
      <slot>
        <p class="toast__content">{{ message }}</p>
      </slot>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, computed, ref, PropType, onMounted, onBeforeUnmount } from 'vue'

export default defineComponent({
  name: 'Toast',
  props: {
    customClass: { type: String, default: '' },
    duration: { type: Number, default: 20000 },
    id: { type: String, default: '' },
    message: {
      type: String,
      default: ''
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true
    },
    offset: { type: Number, default: 20 },
    zIndex: { type: Number, default: 0 }
  },
  emits: ['destroy'],
  setup (props) {
    const customStyle = computed(() => {
      return {
        // top: `${props.offset}px`,
        zIndex: props.zIndex
      }
    })
    const visible = ref(false)
    let timer = null
    function startTimer () {
      if (props.duration > 0) {
        timer = setTimeout(() => {
          if (visible.value) {
            close()
          }
        }, props.duration)
      }
    }
    function clearTimer () {
      clearTimeout(timer)
      timer = null
    }
    function close () {
      visible.value = false
    }

    onMounted(() => {
      startTimer()
      visible.value = true
    })
    onBeforeUnmount(() => {
      clearTimer()
    })
    return {
      customStyle,
      visible,
      close,
      clearTimer,
      startTimer
    }
  }
})
</script>

<style lang="scss" scoped>
.toast {
  position: fixed;
  bottom: 64px;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(12px);
  border-radius: 8px;
  box-sizing: border-box;
  padding: 6px 12px;
  z-index: 100;
}

[data-theme="dark"] {
  .toast {
    background: rgba(46, 46, 46, 0.68);
    backdrop-filter: blur(16px) contrast(120%);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s;
}
.toast-fade-enter, .toast-fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
