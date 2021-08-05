import { createVNode, render, VNode } from 'vue'
import ToastConstructor from '@/components/Toast.vue'

import type { ComponentPublicInstance } from 'vue'

export interface ToastHandle {
  close: () => void
}
export type ToastOptions = {
  customClass?: string
  duration?: number // default 3000
  id?: string
  message: string
  offset?: number // defaults 20
  onClose?: () => void
  zIndex?: number
}
export type ToastParams = ToastOptions | string

type ToastQueueItem = {
  vm: VNode
}

const instances: ToastQueueItem[] = []
let seed = 1
let zIndex = 2000

// TODO: Since Notify.ts is basically the same like this file. So we could do some encapsulation against them to
// reduce code duplication.
export function Toast(
  opts: ToastParams = {} as ToastParams,
): ToastHandle {

  if (typeof opts === 'string') {
    opts = { message: opts }
  }

  let options: ToastOptions = <ToastOptions>opts

  let verticalOffset = opts.offset || 20
  instances.forEach(({ vm }) => {
    verticalOffset += (vm.el.offsetHeight || 0) + 16
  })
  verticalOffset += 16

  const id = 'toast_' + seed++
  const userOnClose = options.onClose

  options = {
    ...options,
    onClose: () => {
      close(id, userOnClose)
    },
    offset: verticalOffset,
    id,
    zIndex: zIndex++,
  }

  const container = document.createElement('div')

  container.className = `container_${id}`

  const vm = createVNode(
    ToastConstructor,
    options,
    null,
  )

  // clean message element preventing mem leak
  vm.props.onDestroy = () => {
    render(null, container)
    // since the element is destroy, then the VNode should be collected by GC as well
    // we do not want cause any mem leak because we have returned vm as a reference to users
    // so that we manually set it to false.
  }

  render(vm, container)
  // instances will remove this item when close function gets called. So we do not need to worry about it.
  instances.push({ vm })
  document.body.appendChild(container.firstElementChild)

  return {
    // instead of calling the onClose function directly, setting this value so that we can have the full lifecycle
    // for out component, so that all closing steps will not be skipped.
    close: () => (vm.component.proxy as ComponentPublicInstance<{visible: boolean;}>).visible = false,
  }
}

export function close(id: string, userOnClose?: (vm: VNode) => void): void {
  const idx = instances.findIndex(({ vm }) => {
    const { id: _id } = vm.component.props
    return id === _id
  })
  if (idx === -1) {
    return
  }

  const { vm } = instances[idx]
  if (!vm) return
  userOnClose?.(vm)

  const removedHeight = vm.el.offsetHeight
  instances.splice(idx, 1)

  // adjust other instances vertical offset
  const len = instances.length
  if (len < 1) return
  for (let i = idx; i < len; i++) {
    const pos =
      parseInt(instances[i].vm.el.style['top'], 10) - removedHeight - 16

    instances[i].vm.component.props.offset = pos
  }
}

export function closeAll(): void {
  for (let i = instances.length - 1; i >= 0; i--) {
    const instance = instances[i].vm.component as any
    instance.ctx.close()
  }
}

export default function () {
  return [Toast, close, closeAll]
}