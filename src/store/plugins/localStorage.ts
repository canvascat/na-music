import type { Store } from 'vuex'

export default function <T>(store: Store<T>) {
  store.subscribe((mutation, state) => {
    // TODO: ADD TYPE
    const { settings, data } = state as any
    localStorage.setItem('settings', JSON.stringify(settings))
    localStorage.setItem('data', JSON.stringify(data))
  })
}
