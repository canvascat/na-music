import { isAccountLoggedIn } from './auth'
import { refreshCookie } from '@/api/auth'
import { dailySignin } from '@/api/user'
import dayjs from 'dayjs'
import store from '@/store'
import type { Privilege, Song } from '@/api/types'
import { KEYWORD_ALBUM_TITLE, KEYWORD_SOUNDTRACK_ALBUM_TITLE } from '@/const'
import { random } from 'lodash'

export function isTrackPlayable (track: Song) {
  const result = {
    playable: true,
    reason: ''
  }
  // cloud storage judgement logic
  if (isAccountLoggedIn() && track?.privilege?.cs) {
    return result
  }
  if (track.fee === 1 || track.privilege?.fee === 1) {
    if (isAccountLoggedIn() && store.state.data.user.vipType === 11) {
      result.playable = true
    } else {
      result.playable = false
      result.reason = 'VIP Only'
    }
  } else if (track.fee === 4 || track.privilege?.fee === 4) {
    result.playable = false
    result.reason = '付费专辑'
  } else if (
    track.noCopyrightRcmd !== null &&
    track.noCopyrightRcmd !== undefined
  ) {
    result.playable = false
    result.reason = '无版权'
  } else if (track.privilege?.st < 0 && isAccountLoggedIn()) {
    result.playable = false
    result.reason = '已下架'
  }
  return result
}

export function mapTrackPlayableStatus (tracks: Song[], privileges: Privilege[] = []) {
  if (tracks?.length === undefined) return tracks
  return tracks.map(t => {
    const privilege = privileges.find(item => item.id === t.id) || {} as Privilege
    if (t.privilege) {
      Object.assign(t.privilege, privilege)
    } else {
      t.privilege = privilege
    }
    const result = isTrackPlayable(t)
    t.playable = result.playable
    t.reason = result.reason
    return t
  })
}

export function updateHttps (url?: string) {
  if (!url) return ''
  return url.replace(/^http:/, 'https:')
}
// TODO: 每日任务, 先删除
export function dailyTask () {
  const lastDate = store.state.data.lastRefreshCookieDate
  if (!isAccountLoggedIn()) return
  // TODO: 这里获取的是每月的号数,应该需要保存年月日
  const today = dayjs().date()
  if (lastDate === today) return
  console.debug('[debug][common.js] execute dailyTask')
  refreshCookie().then(() => {
    console.debug('[debug][common.js] 刷新cookie')
    store.commit('updateData', {
      key: 'lastRefreshCookieDate',
      value: today
    })
  })
  dailySignin(0).catch(() => {
    console.debug('[debug][common.js] 手机端重复签到')
  })
  dailySignin(1).catch(() => {
    console.debug('[debug][common.js] PC端重复签到')
  })
}

export function changeAppearance (appearance?: string) {
  if (appearance === 'auto' || appearance === undefined) {
    appearance = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  document.body.setAttribute('data-theme', appearance)
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content',
    appearance === 'dark' ? '#222' : '#fff'
  )
}

function splitTitle (val: string, keys: string[] | readonly string[]) {
  for (const subtitle of keys) {
    if (val.includes(subtitle) === false) continue
    const title = [`(${subtitle})`, `: ${subtitle}`, `[${subtitle}]`, `- ${subtitle}`, `${subtitle}`]
      .reduce((txt, searchText) => txt.replace(searchText, ''), val)
    return { title, subtitle }
  }
  return { title: val, subtitle: '' }
}

export function splitSoundtrackAlbumTitle (title: string) {
  return splitTitle(title, KEYWORD_SOUNDTRACK_ALBUM_TITLE)
}

export function splitAlbumTitle (title: string) {
  return splitTitle(title, KEYWORD_ALBUM_TITLE)
}

function fixNum (n: number, limit = 2) {
  limit = 10 ** limit
  return Math.round(n * limit) / limit
}

export function bytesToSize (b: number) {
  const K = 1 << 10 // 1024
  const units = ['B', 'K', 'M', 'G']
  for (let i = 0; i < units.length; i++) {
    if (b < K) return fixNum(b) + units[i]
    b /= K
  }
  return `${fixNum(b)}T`
}

export function formatTrackTime (value: number) {
  const sec = (value >>= 0) % 60
  const min = (value - sec) / 60
  return `${min}:${String(sec).padStart(2, '0')}`
}

export function randomSlice<T> (list: T[], limit = 1) {
  const tmp = Array.from(list)
  return Array.from(Array(limit), () => tmp.splice(random(tmp.length - 1), 1)[0])
}

export const sleep = <T = void>(t = 0, result?: T): Promise<T> => new Promise(resolve => setTimeout(resolve, t, result))
