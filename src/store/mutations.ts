import shortcuts from '@/utils/shortcuts'
import cloneDeep from 'lodash/cloneDeep'
import type { MutationTree } from 'vuex'
import type { State } from './type'

export const mutations: MutationTree<State> = {
  updateLikedXXX (state, { name, data }) {
    state.liked[name] = data
  },
  changeLang (state, lang) {
    state.settings.lang = lang
  },
  changeMusicQuality (state, value) {
    state.settings.musicQuality = value
  },
  changeLyricFontSize (state, value) {
    state.settings.lyricFontSize = value
  },

  updateSettings (state, { key, value }) {
    state.settings[key] = value
  },
  updateData (state, { key, value }) {
    state.data[key] = value
  },
  toggleLyrics (state) {
    state.showLyrics = !state.showLyrics
  },
  updateDailyTracks (state, dailyTracks) {
    state.dailyTracks = dailyTracks
  },
  updateLastfm (state, session) {
    state.lastfm = session
  },
  updateShortcut (state, { id, type, shortcut }) {
    const newShortcut = state.settings.shortcuts.find(s => s.id === id)
    newShortcut[type] = shortcut
    state.settings.shortcuts = state.settings.shortcuts.map(s => {
      if (s.id !== id) return s
      return newShortcut
    })
  },
  restoreDefaultShortcuts (state) {
    state.settings.shortcuts = cloneDeep(shortcuts)
  }
}
