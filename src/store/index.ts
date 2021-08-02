import { createStore } from 'vuex'
import { state } from './state'
import { mutations } from './mutations'
import { actions } from './actions'
import { changeAppearance } from '@/utils/common'
import Player from '@/utils/Player'
// vuex 自定义插件
import saveToLocalStorage from './plugins/localStorage'
import type { State } from './type'

const plugins = [saveToLocalStorage]

const store = createStore<State>({
  state,
  mutations,
  actions,
  // modules: { },
  plugins
})

if ([undefined, null].includes(store.state.settings.lang)) {
  const defaultLang = 'en'
  const langMapper = new Map([
    ['zh', 'zh-CN'],
    ['zh-TW', 'zh-TW'],
    ['en', 'en'],
    ['tr', 'tr']
  ])
  store.state.settings.lang =
    langMapper.get(
      langMapper.has(navigator.language)
        ? navigator.language
        : navigator.language.slice(0, 2)
    ) || defaultLang
  localStorage.setItem('settings', JSON.stringify(store.state.settings))
}

changeAppearance(store.state.settings.appearance)

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    if (store.state.settings.appearance !== 'auto') return
    changeAppearance(store.state.settings.appearance)
  })

store.state.player = new Proxy(new Player(), {
  set (target, prop, val) {
    target[prop] = val
    if (prop === '_howler') return true
    target.saveSelfToLocalStorage()
    target.sendSelfToIpcMain()
    return true
  }
})

export default store
