<template>
  <div class="settings-page" @click="clickOutside">
    <div class="container">
      <div v-if="showUserInfo" class="user">
        <div class="left">
          <img class="avatar" :src="data.user.avatarUrl">
          <div class="info">
            <div class="nickname">{{ data.user.nickname }}</div>
            <div class="extra-info">
              <span v-if="data.user.vipType !== 0" class="vip">
                <span class="text">黑胶VIP</span>
              </span>
              <span v-else class="text">{{ data.user.signature }}</span>
            </div>
          </div>
        </div>
        <div class="right">
          <button @click="logout">
            <IconLogout />
            {{ $t('settings.logout') }}
          </button>
        </div>
      </div>

      <div class="item">
        <div class="left">
          <div class="title">{{ $t('settings.language') }}</div>
        </div>
        <div class="right">
          <select v-model="lang">
            <option value="en">🇬🇧 English</option>
            <option value="tr">🇹🇷 Türkçe</option>
            <option value="zh-CN">🇨🇳 简体中文</option>
            <option value="zh-TW">ᴛᴡ 繁體中文</option>
          </select>
        </div>
      </div>
      <div class="item">
        <div class="left">
          <div class="title">{{ $t('settings.appearance.text') }}</div>
        </div>
        <div class="right">
          <select v-model="appearance">
            <option value="auto">{{ $t('settings.appearance.auto') }}</option>
            <option value="light">🌞 {{ $t('settings.appearance.light') }}</option>
            <option value="dark">🌚 {{ $t('settings.appearance.dark') }}</option>
          </select>
        </div>
      </div>
      <div class="item">
        <div class="left">
          <div class="title">音乐语种偏好</div>
        </div>
        <div class="right">
          <select v-model="musicLanguage">
            <option value="all">无偏好</option>
            <option value="zh">华语</option>
            <option value="ea">欧美</option>
            <option value="jp">日语</option>
            <option value="kr">韩语</option>
          </select>
        </div>
      </div>

      <h3>音质</h3>
      <div class="item">
        <div class="left">
          <div class="title">{{ $t('settings.musicQuality.text') }}</div>
        </div>
        <div class="right">
          <select v-model="musicQuality">
            <option value="128000">{{ $t('settings.musicQuality.low') }} - 128Kbps</option>
            <option value="192000">{{ $t('settings.musicQuality.medium') }} - 192Kbps</option>
            <option value="320000">{{ $t('settings.musicQuality.high') }} - 320Kbps</option>
            <option value="999000">{{ $t('settings.musicQuality.lossless') }} - FLAC</option>
          </select>
        </div>
      </div>

      <template v-if="isElectron">
        <h3>缓存</h3>
        <div class="item">
          <div class="left">
            <div class="title">{{ $t('settings.automaticallyCacheSongs') }}</div>
          </div>
          <div class="right">
            <div class="toggle">
              <input
                id="automatically-cache-songs"
                v-model="automaticallyCacheSongs"
                type="checkbox"
                name="automatically-cache-songs"
              >
              <label for="automatically-cache-songs"></label>
            </div>
          </div>
        </div>
        <div class="item">
          <div class="left">
            <div class="title">{{ $t('settings.cacheLimit.text') }}</div>
          </div>
          <div class="right">
            <select v-model="cacheLimit">
              <option :value="false">{{ $t('settings.cacheLimit.none') }}</option>
              <option :value="512">500MB</option>
              <option :value="1024">1GB</option>
              <option :value="2048">2GB</option>
              <option :value="4096">4GB</option>
              <option :value="8192">8GB</option>
            </select>
          </div>
        </div>
      </template>

      <h3>歌词</h3>
      <div class="item">
        <div class="left">
          <div class="title">{{ $t('settings.showLyricsTranslation') }}</div>
        </div>
        <div class="right">
          <div class="toggle">
            <input
              id="show-lyrics-translation"
              v-model="showLyricsTranslation"
              type="checkbox"
              name="show-lyrics-translation"
            >
            <label for="show-lyrics-translation"></label>
          </div>
        </div>
      </div>
      <div class="item">
        <div class="left">
          <div class="title">{{ $t('settings.lyricsBackground.text') }}</div>
        </div>
        <div class="right">
          <select v-model="lyricsBackground">
            <option :value="false">{{ $t('settings.lyricsBackground.off') }}</option>
            <option :value="true">{{ $t('settings.lyricsBackground.on') }}</option>
            <option value="blur">模糊封面</option>
            <option value="dynamic">{{ $t('settings.lyricsBackground.dynamic') }}</option>
          </select>
        </div>
      </div>
      <div class="item">
        <div class="left">
          <div class="title">{{ $t('settings.lyricFontSize.text') }}</div>
        </div>
        <div class="right">
          <select v-model="lyricFontSize">
            <option value="16">{{ $t('settings.lyricFontSize.small') }} - 16px</option>
            <option value="22">{{ $t('settings.lyricFontSize.medium') }} - 22px</option>
            <option value="28">{{ $t('settings.lyricFontSize.large') }} - 28px</option>
            <option value="36">{{ $t('settings.lyricFontSize.xlarge') }} - 36px</option>
          </select>
        </div>
      </div>

      <h3>第三方</h3>
      <div class="item">
        <div class="left">
          <div class="title">
            {{
              isLastfmConnected
                ? `已连接到 Last.fm (${lastfm.name})`
                : '连接 Last.fm '
            }}
          </div>
        </div>
        <div class="right">
          <button v-if="isLastfmConnected" @click="lastfmDisconnect()">断开连接</button>
          <button v-else @click="lastfmConnect()">授权连接</button>
        </div>
      </div>

      <h3>其他</h3>
      <div class="item">
        <div class="left">
          <div class="title">{{ $t('settings.showPlaylistsByAppleMusic') }}</div>
        </div>
        <div class="right">
          <div class="toggle">
            <input
              id="show-playlists-by-apple-music"
              v-model="showPlaylistsByAppleMusic"
              type="checkbox"
              name="show-playlists-by-apple-music"
            >
            <label for="show-playlists-by-apple-music"></label>
          </div>
        </div>
      </div>

      <div v-if="isElectron">
        <h3>快捷键</h3>
        <div class="item">
          <div class="left">
            <div class="title">{{ $t('settings.enableGlobalShortcut') }}</div>
          </div>
          <div class="right">
            <div class="toggle">
              <input
                id="enable-enable-global-shortcut"
                v-model="enableGlobalShortcut"
                type="checkbox"
                name="enable-enable-global-shortcut"
              >
              <label for="enable-enable-global-shortcut"></label>
            </div>
          </div>
        </div>
        <div
          id="shortcut-table"
          :class="{ 'global-disabled': !enableGlobalShortcut }"
          tabindex="0"
          @keydown="handleShortcutKeydown"
        >
          <div class="row row-head">
            <div class="col">功能</div>
            <div class="col">快捷键</div>
            <div class="col">全局快捷键</div>
          </div>
          <div v-for="shortcut in settings.shortcuts" :key="shortcut.id" class="row">
            <div class="col">{{ shortcut.name }}</div>
            <div class="col">
              <div
                class="keyboard-input"
                :class="{
                  active:
                    shortcutInput.id === shortcut.id &&
                    shortcutInput.type === 'shortcut',
                }"
                @click.stop="readyToRecordShortcut(shortcut.id, 'shortcut')"
              >
                {{
                  shortcutInput.id === shortcut.id &&
                    shortcutInput.type === 'shortcut' &&
                    recordedShortcutComputed !== ''
                    ? formatShortcut(recordedShortcutComputed)
                    : formatShortcut(shortcut.shortcut)
                }}
              </div>
            </div>
            <div class="col">
              <div
                class="keyboard-input"
                :class="{
                  active:
                    shortcutInput.id === shortcut.id &&
                    shortcutInput.type === 'globalShortcut' &&
                    enableGlobalShortcut,
                }"
                @click.stop="
                  readyToRecordShortcut(shortcut.id, 'globalShortcut')
                "
              >
                {{
                  shortcutInput.id === shortcut.id &&
                    shortcutInput.type === 'globalShortcut' &&
                    recordedShortcutComputed !== ''
                    ? formatShortcut(recordedShortcutComputed)
                    : formatShortcut(shortcut.globalShortcut)
                }}
              </div>
            </div>
          </div>
          <button class="restore-default-shortcut" @click="restoreDefaultShortcuts">恢复默认快捷键</button>
        </div>
      </div>

      <div class="footer">
        <p class="author">
          MADE BY
          <a href="https://github.com/qier222" target="_blank">QIER222</a>
        </p>
        <p class="version">v{{ version }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { isLooseLoggedIn, doLogout } from '@/utils/auth'
import { auth as lastfmAuth } from '@/api/lastfm'
import { changeAppearance, bytesToSize } from '@/utils/common'
import { countDBSize, clearDB } from '@/utils/db'
import { IconLogout } from '@/components/icons'
import pkg from '../../package.json'
import { useToast } from '@/hook'

const [toast] = useToast()

const validShortcutCodes = ['=', '-', '~', '[', ']', ';', "'", ',', '.', '/']
// navigator.mediaDevices()
export default {
  name: 'Settings',
  components: { IconLogout },
  data () {
    return {
      tracksCache: {
        size: '0KB',
        length: 0
      },
      shortcutInput: {
        id: '',
        type: '',
        recording: false
      },
      recordedShortcut: []
    }
  },
  computed: {
    ...mapState(['player', 'settings', 'data', 'lastfm']),
    isElectron () {
      // TODO: DELETE
      return false
    },
    isMac () {
      return /macintosh|mac os x/i.test(navigator.userAgent)
    },
    version () {
      return pkg.version
    },
    showUserInfo () {
      return isLooseLoggedIn() && this.data.user.nickname
    },
    recordedShortcutComputed () {
      let shortcut = []
      this.recordedShortcut.map(e => {
        if (e.keyCode >= 65 && e.keyCode <= 90) {
          // A-Z
          shortcut.push(e.code.replace('Key', ''))
        } else if (e.key === 'Meta') {
          // ⌘ Command on macOS
          shortcut.push('Command')
        } else if (['Alt', 'Control', 'Shift'].includes(e.key)) {
          shortcut.push(e.key)
        } else if (e.keyCode >= 48 && e.keyCode <= 57) {
          // 0-9
          shortcut.push(e.code.replace('Digit', ''))
        } else if (e.keyCode >= 112 && e.keyCode <= 123) {
          // F1-F12
          shortcut.push(e.code)
        } else if (
          ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)
        ) {
          // Arrows
          shortcut.push(e.code.replace('Arrow', ''))
        } else if (validShortcutCodes.includes(e.key)) {
          shortcut.push(e.key)
        }
      })
      const sortTable = {
        Control: 1,
        Shift: 2,
        Alt: 3,
        Command: 4
      }
      shortcut = shortcut.sort((a, b) => {
        if (!sortTable[a] || !sortTable[b]) return 0
        if (sortTable[a] - sortTable[b] <= -1) {
          return -1
        } else if (sortTable[a] - sortTable[b] >= 1) {
          return 1
        } else {
          return 0
        }
      })
      shortcut = shortcut.join('+')
      return shortcut
    },

    lang: {
      get () {
        return this.settings.lang
      },
      set (lang) {
        this.$i18n.locale = lang
        this.$store.commit('changeLang', lang)
      }
    },
    musicLanguage: {
      get () {
        return this.settings.musicLanguage ?? 'all'
      },
      set (value) {
        this.$store.commit('updateSettings', {
          key: 'musicLanguage',
          value
        })
      }
    },
    appearance: {
      get () {
        if (this.settings.appearance === undefined) return 'auto'
        return this.settings.appearance
      },
      set (value) {
        this.$store.commit('updateSettings', {
          key: 'appearance',
          value
        })
        changeAppearance(value)
      }
    },
    musicQuality: {
      get () {
        if (this.settings.musicQuality === undefined) return 320000
        return this.settings.musicQuality
      },
      set (value) {
        if (value === this.settings.musicQuality) return
        this.$store.commit('changeMusicQuality', value)
        this.clearCache()
      }
    },
    lyricFontSize: {
      get () {
        if (this.settings.lyricFontSize === undefined) return 28
        return this.settings.lyricFontSize
      },
      set (value) {
        this.$store.commit('changeLyricFontSize', value)
      }
    },

    showPlaylistsByAppleMusic: {
      get () {
        if (this.settings.showPlaylistsByAppleMusic === undefined) return true
        return this.settings.showPlaylistsByAppleMusic
      },
      set (value) {
        this.$store.commit('updateSettings', {
          key: 'showPlaylistsByAppleMusic',
          value
        })
      }
    },
    automaticallyCacheSongs: {
      get () {
        if (this.settings.automaticallyCacheSongs === undefined) return false
        return this.settings.automaticallyCacheSongs
      },
      set (value) {
        this.$store.commit('updateSettings', {
          key: 'automaticallyCacheSongs',
          value
        })
        if (value === false) {
          this.clearCache()
        }
      }
    },
    showLyricsTranslation: {
      get () {
        return this.settings.showLyricsTranslation
      },
      set (value) {
        this.$store.commit('updateSettings', {
          key: 'showLyricsTranslation',
          value
        })
      }
    },
    lyricsBackground: {
      get () {
        return this.settings.lyricsBackground || false
      },
      set (value) {
        this.$store.commit('updateSettings', {
          key: 'lyricsBackground',
          value
        })
      }
    },
    enableGlobalShortcut: {
      get () {
        return this.settings.enableGlobalShortcut
      },
      set (value) {
        this.$store.commit('updateSettings', {
          key: 'enableGlobalShortcut',
          value
        })
      }
    },
    cacheLimit: {
      get () {
        return this.settings.cacheLimit || false
      },
      set (value) {
        this.$store.commit('updateSettings', {
          key: 'cacheLimit',
          value
        })
      }
    },
    isLastfmConnected () {
      return this.lastfm.key !== undefined
    }
  },
  created () {
    this.countDBSize('tracks')
  },
  activated () {
    this.countDBSize('tracks')
  },
  methods: {
    logout () {
      doLogout()
      this.$router.push({ name: 'home' })
    },
    countDBSize () {
      countDBSize().then(data => {
        if (data === undefined) {
          this.tracksCache = {
            size: '0KB',
            length: 0
          }
          return
        }
        this.tracksCache.size = bytesToSize(data.bytes)
        this.tracksCache.length = data.length
      })
    },
    clearCache () {
      clearDB().then(() => {
        this.countDBSize()
      })
    },
    lastfmConnect () {
      lastfmAuth()
      const lastfmChecker = setInterval(() => {
        const session = localStorage.getItem('lastfm')
        if (session) {
          this.$store.commit('updateLastfm', JSON.parse(session))
          clearInterval(lastfmChecker)
        }
      }, 1000)
    },
    lastfmDisconnect () {
      localStorage.removeItem('lastfm')
      this.$store.commit('updateLastfm', {})
    },

    clickOutside () {
      this.exitRecordShortcut()
    },
    formatShortcut (shortcut) {
      shortcut = shortcut
        .replaceAll('+', ' + ')
        .replace('Up', '↑')
        .replace('Down', '↓')
        .replace('Right', '→')
        .replace('Left', '←')
      if (this.settings.lang === 'zh-CN') {
        shortcut = shortcut.replace('Space', '空格')
      } else if (this.settings.lang === 'zh-TW') {
        shortcut = shortcut.replace('Space', '空白鍵')
      }
      // if (process.platform === 'darwin') {
      //   return shortcut
      //     .replace('CommandOrControl', '⌘')
      //     .replace('Command', '⌘')
      //     .replace('Alt', '⌥')
      //     .replace('Control', '⌃')
      //     .replace('Shift', '⇧')
      // }
      return shortcut.replace('CommandOrControl', 'Ctrl')
    },
    readyToRecordShortcut (id, type) {
      if (type === 'globalShortcut' && this.enableGlobalShortcut === false) {
        return
      }
      this.shortcutInput = { id, type, recording: true }
      this.recordedShortcut = []
    },
    handleShortcutKeydown (e) {
      if (this.shortcutInput.recording === false) return
      e.preventDefault()
      if (this.recordedShortcut.find(s => s.keyCode === e.keyCode)) return
      this.recordedShortcut.push(e)
      if (
        (e.keyCode >= 65 && e.keyCode <= 90) || // A-Z
        (e.keyCode >= 48 && e.keyCode <= 57) || // 0-9
        (e.keyCode >= 112 && e.keyCode <= 123) || // F1-F12
        ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key) || // Arrows
        validShortcutCodes.includes(e.key)
      ) {
        this.saveShortcut()
      }
    },
    handleShortcutKeyup (e) {
      if (this.recordedShortcut.find(s => s.keyCode === e.keyCode)) {
        this.recordedShortcut = this.recordedShortcut.filter(
          s => s.keyCode !== e.keyCode
        )
      }
    },
    saveShortcut () {
      const { id, type } = this.shortcutInput
      const payload = {
        id,
        type,
        shortcut: this.recordedShortcutComputed
      }
      this.$store.commit('updateShortcut', payload)
      toast('快捷键已保存')
      this.recordedShortcut = []
    },
    exitRecordShortcut () {
      this.shortcutInput = { id: '', type: '', recording: false }
      this.recordedShortcut = []
    },
    restoreDefaultShortcuts () {
      this.$store.commit('restoreDefaultShortcuts')
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-page {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
.container {
  margin-top: 24px;
  width: 720px;
}
h2 {
  margin-top: 48px;
  font-size: 36px;
  color: var(--color-text);
}

h3 {
  margin-top: 48px;
  padding-bottom: 12px;
  font-size: 26px;
  color: var(--color-text);
  border-bottom: 1px solid rgba(128, 128, 128, 0.18);
}

.user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-secondary-bg);
  color: var(--color-text);
  padding: 16px 20px;
  border-radius: 16px;
  margin-bottom: 48px;
  img.avatar {
    border-radius: 50%;
    height: 64px;
    width: 64px;
  }
  .left {
    display: flex;
    align-items: center;
    .info {
      margin-left: 24px;
    }
    .nickname {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .extra-info {
      font-size: 13px;
      .text {
        opacity: 0.68;
      }
      .vip {
        display: flex;
        align-items: center;
      }
    }
  }
  .right {
    .svg-icon {
      height: 18px;
      width: 18px;
      margin-right: 4px;
    }
    button {
      display: flex;
      align-items: center;
      font-size: 18px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 10px;
      padding: 8px 12px;
      opacity: 0.68;
      color: var(--color-text);
      transition: 0.2s;
      margin: {
        right: 12px;
        left: 12px;
      }
      &:hover {
        opacity: 1;
        background: #eaeffd;
        color: #335eea;
      }
      &:active {
        opacity: 1;
        transform: scale(0.92);
        transition: 0.2s;
      }
    }
  }
}

.item {
  margin: 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text);

  .title {
    font-size: 16px;
    font-weight: 500;
    opacity: 0.78;
  }
}

select {
  min-width: 192px;
  font-weight: 600;
  border: none;
  padding: 8px 12px 8px 12px;
  border-radius: 8px;
  color: var(--color-text);
  background: var(--color-secondary-bg);
  appearance: none;
  &:focus {
    outline: none;
    color: var(--color-primary);
    background: var(--color-primary-bg);
  }
}

button {
  color: var(--color-text);
  background: var(--color-secondary-bg);
  padding: 8px 12px 8px 12px;
  font-weight: 600;
  border-radius: 8px;
  transition: 0.2s;
  &:hover {
    transform: scale(1.06);
  }
  &:active {
    transform: scale(0.94);
  }
}

input.text-input {
  background: var(--color-secondary-bg);
  border: none;
  margin-right: 22px;
  padding: 8px 12px 8px 12px;
  border-radius: 8px;
  color: var(--color-text);
  font-weight: 600;
  font-size: 16px;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
input[type="number"] {
  -moz-appearance: textfield;
}

#proxy-form {
  display: flex;
  align-items: center;
}
#proxy-form.disabled {
  opacity: 0.47;
  button:hover {
    transform: unset;
  }
}

#shortcut-table {
  font-size: 14px;
  /* border: 1px solid black; */
  user-select: none;
  color: var(--color-text);
  .row {
    display: flex;
  }
  .row.row-head {
    opacity: 0.58;
    font-size: 13px;
    font-weight: 500;
  }
  .col {
    min-width: 192px;
    padding: 8px;
    display: flex;
    align-items: center;
    /* border: 1px solid red; */
    &:first-of-type {
      padding-left: 0;
      min-width: 128px;
    }
  }
  .keyboard-input {
    font-weight: 600;
    background-color: var(--color-secondary-bg);
    padding: 8px 12px 8px 12px;
    border-radius: 0.5rem;
    min-width: 146px;
    min-height: 34px;
    box-sizing: border-box;
    &.active {
      color: var(--color-primary);
      background-color: var(--color-primary-bg);
    }
  }
  .restore-default-shortcut {
    margin-top: 12px;
  }
  &.global-disabled {
    .row .col:last-child {
      opacity: 0.48;
    }
    .row.row-head .col:last-child {
      opacity: 1;
    }
  }
  &:focus {
    outline: none;
  }
}

.footer {
  text-align: center;
  margin-top: 6rem;
  color: var(--color-text);
  font-weight: 600;
  .author {
    font-size: 0.9rem;
  }
  .version {
    font-size: 0.88rem;
    opacity: 0.58;
    margin-top: -10px;
  }
}

.beforeAnimation {
  -webkit-transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
  transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
}
.afterAnimation {
  box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.1), 0 4px 0 0 hsla(0, 0%, 0%, 0.04),
    0 4px 9px hsla(0, 0%, 0%, 0.13), 0 3px 3px hsla(0, 0%, 0%, 0.05);
  -webkit-transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
  transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
}
.toggle {
  margin: auto;
}
.toggle input {
  opacity: 0;
  position: absolute;
}
.toggle input + label {
  position: relative;
  display: inline-block;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-transition: 0.4s ease;
  transition: 0.4s ease;
  height: 32px;
  width: 52px;
  background: var(--color-secondary-bg);
  border-radius: 8px;
}
.toggle input + label:before {
  content: "";
  position: absolute;
  display: block;
  -webkit-transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
  transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
  height: 32px;
  width: 52px;
  top: 0;
  left: 0;
  border-radius: 8px;
}
.toggle input + label:after {
  content: "";
  position: absolute;
  display: block;
  box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.02), 0 4px 0 0 hsla(0, 0%, 0%, 0.01),
    0 4px 9px hsla(0, 0%, 0%, 0.08), 0 3px 3px hsla(0, 0%, 0%, 0.03);
  -webkit-transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
  transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
  background: #fff;
  height: 20px;
  width: 20px;
  top: 6px;
  left: 6px;
  border-radius: 6px;
}
.toggle input:checked + label:before {
  background: var(--color-primary);
  -webkit-transition: width 0.2s cubic-bezier(0, 0, 0, 0.1);
  transition: width 0.2s cubic-bezier(0, 0, 0, 0.1);
}
.toggle input:checked + label:after {
  left: 26px;
}
</style>
