import initLocalStorage from './initLocalStorage'
import pkg from '../../package.json'
import { updateApp } from '@/utils/updateApp'
import type { State } from './type'
import { Player } from '@/utils/Player'

if (localStorage.getItem('appVersion') === null) {
  localStorage.setItem('settings', JSON.stringify(initLocalStorage.settings))
  localStorage.setItem('data', JSON.stringify(initLocalStorage.data))
  localStorage.setItem('appVersion', pkg.version)
}

updateApp()

const player = new Proxy(new Player(), {
  set (target, prop, val) {
    target[prop] = val
    if (prop === '_howler') return true
    target.saveSelfToLocalStorage()
    return true
  }
})

;(window as any).player = player

export const state: State = {
  showLyrics: false,
  liked: {
    songs: [],
    songsWithDetails: [], // 只有前12首
    playlists: [],
    albums: [],
    artists: [],
    mvs: [],
    cloudDisk: []
  },
  contextMenu: {
    clickObjectID: 0,
    showMenu: false
  },
  dailyTracks: [],
  lastfm: JSON.parse(localStorage.getItem('lastfm')) || {},
  player,
  settings: JSON.parse(localStorage.getItem('settings')),
  data: JSON.parse(localStorage.getItem('data'))
}
