import shortcuts from '@/utils/shortcuts'

console.debug('[debug][initLocalStorage.js]')

const localStorage = {
  player: {},
  settings: {
    lang: null,
    musicLanguage: 'all',
    appearance: 'auto',
    musicQuality: 320000,
    lyricFontSize: 28,
    showPlaylistsByAppleMusic: true,
    automaticallyCacheSongs: false,
    cacheLimit: false,
    showLyricsTranslation: true,
    lyricsBackground: true,
    enableGlobalShortcut: true,
    shortcuts: shortcuts
  },
  data: {
    user: {},
    likedSongPlaylistID: 0,
    lastRefreshCookieDate: 0,
    loginMode: null
  }
}

export default localStorage
