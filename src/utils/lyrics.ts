// copy from https://github.com/sl1673495/vue-netease-music/blob/master/src/utils/lrcparse.js

import { Lrc } from '@/api/types'
import { noop } from 'lodash'

/**
 * @description klyric.lyric
 * [ti:蓝月]
 * [ar:伍佰]
 * [by:43375@网易云音乐_2]
 * [#:http://music.163.com/#/song?id=27867363]
 * [671,2634](0,553)伍(0,254)佰(0,204)-(0,254)蓝(0,1365)月
 * [3005,5633]
 * [8338,17558]
 * [25596,11576](0,502)脱(0,203)去(0,407)外(0,2743)衣(0,203)甩(0,253)开(0,1372)又(0,762)飞(0,661)回(0,712)到(0,660)手(0,3092)里
 * [36872,11985](0,759)转(0,203)来(0,712)转(0,2640)去(0,202)我(0,408)的(0,1067)脸(0,812)该(0,662)面(0,760)向(0,764)哪(0,2992)里
 * @description tlyric.lyric
 * [00:01.28]伍佰 & China Blue - 蓝月
 * [00:06.28]
 * [00:11.28]
 * [00:23.28]
 * [00:25.28]脱去外衣 甩开又飞回到手里
 * [00:35.45]转来转去 我的脸该面向哪里
 * [00:48.29]停止呼吸 厚重的黑压在胸口
 * [00:58.66]失去重力 我像没了水的蒸气
 * [01:10.42]漂浮在半空中 漂浮在梦里
 * [01:17.82]我的世界像巨大宣言没有知觉的
 * [01:23.42]往前滚动 我却腾空
 * [01:27.83]在离地三万多英尺
 * [01:34.11]看不到我心中 最深处心里
 * [01:40.78]到底什麽是真真切切无法拒绝的
 * [01:46.73]我的在乎 我很无助
 * [01:51.72]那星星的位置都变了
 * [01:58.25]
 * [02:48.61]漂浮在半空中 漂浮在梦里
 * [02:54.39]我的世界像巨大宣言没有知觉的
 * [02:59.77]往前滚动 我却腾空
 * [03:05.17]在离地三万多英尺
 * [03:10.78]看不到我心中 最深处心里
 * [03:17.81]到底什麽是真真切切无法拒绝的
 * [03:23.11]我的在乎 我很无助
 * [03:28.41]那星星的位置都变了
 * [03:34.68]
 * [03:37.55]汹涌的你 像是排山倒海而来
 * [03:50.05]没有预警 突然满溢我的脑海
 * [04:00.82]不能呼吸 看到了什麽在眼前
 * [04:11.02]那些蓝月 蓝的像是你的眼泪
 * [04:24.15]
 * [04:28.48]我真爱你 我属於你
 * [04:39.96]不要离去 我需要你
 * [04:50.41]
 * [04:53.41]
 */
export function lyricParser (lrc: { lrc: Lrc, tlyric: Lrc }) {
  return {
    lyric: parseLyric(lrc?.lrc?.lyric || ''),
    tlyric: parseLyric(lrc?.tlyric?.lyric || '')
    // lyricuser: lrc.lyricUser,
    // transuser: lrc.transUser
  }
}

export function parseLyric (lrc: string) {
  const TIME_EXP = /\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g
  return lrc.split('\n').reduce((result, line) => {
    const content = line.replace(TIME_EXP, '')
    if (!content) return result
    const timeMatchArray = TIME_EXP.exec(line)
    if (!timeMatchArray) return result
    const [rawTime = '', min = 0, sec = 0, ms = 0] = [...timeMatchArray]
    const time = +min * 60 + +sec + +ms / 100
    result.push({ time, content, rawTime })
    return result
  }, []) as { time: number, rawTime: string, content: string }[]
  // const lines = lrc.split('\n')
  // const lrcObj: { time: number, rawTime: string, content: string }[] = []
  // for (let i = 0; i < lines.length; i++) {
  //   const line = lines[i]
  //   const content = line.replace(TIME_EXP, '')
  //   if (!content) continue
  //   const timeMatchArray = TIME_EXP.exec(line)
  //   if (!timeMatchArray) continue
  //   const [rawTime = '', min = 0, sec = 0, ms = 0] = [...timeMatchArray]
  //   const time = +min * 60 + +sec + +ms / 100
  //   lrcObj.push({ time, content, rawTime })
  // }
  // return lrcObj
}

const tagRegMap = {
  title: 'ti',
  artist: 'ar',
  album: 'al',
  offset: 'offset',
  by: 'by'
}

enum LYRIC_STATE {
  PAUSE,
  PLAYING
}
export class LyricParse {
  // /\[\d*:\d*((\.|:)\d*)*\]/
  static TIME_EXP = /\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g
  lrc: string
  handler : (data: { txt: string, lineNum: number }) => void
  tags: Partial<Record<keyof typeof tagRegMap, string>> = Object.create(null)
  lines: { time: number, txt: string }[] = []
  state = LYRIC_STATE.PAUSE
  curLine = 0
  private _timer?: number
  private _curNum?: number
  private _startStamp?: number
  private _pauseStamp?: number
  constructor (lrc: string, hanlder = noop) {
    this.lrc = lrc
    this.handler = hanlder

    this._init()
  }

  private _init () {
    this._initTag()

    this._initLines()
  }

  private _initTag () {
    for (const tag in tagRegMap) {
      const matches = this.lrc.match(new RegExp(`\\[${tagRegMap[tag]}:([^\\]]*)]`, 'i'))
      this.tags[tag] = (matches && matches[1]) || ''
    }
  }

  private _initLines () {
    const lines = this.lrc.split('\n')
    const offset = parseInt(this.tags.offset) || 0
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const result = LyricParse.TIME_EXP.exec(line)
      if (!result) continue
      const txt = line.replace(LyricParse.TIME_EXP, '').trim()
      if (!txt) continue
      this.lines.push({
        time: +result[1] * 60 * 1000 + +result[2] * 1000 + (+result[3] || 0) * 10 + offset,
        txt
      })
    }

    this.lines.sort((a, b) => {
      return a.time - b.time
    })
  }

  private _findCurNum (time: number) {
    for (let i = 0; i < this.lines.length; i++) {
      if (time <= this.lines[i].time) {
        return i
      }
    }
    return this.lines.length - 1
  }

  private _callHandler (lineNum: number) {
    if (lineNum < 0) return
    const txt = this.lines[lineNum].txt
    this.handler({ txt, lineNum })
  }

  private _playRest () {
    const line = this.lines[this._curNum]
    const delay = line.time - (+new Date() - this._startStamp)

    this._timer = setTimeout(() => {
      this._callHandler(this._curNum++)
      if (this._curNum < this.lines.length && this.state === LYRIC_STATE.PLAYING) {
        this._playRest()
      }
    }, delay)
  }

  play (startTime = 0, skipLast = false) {
    if (!this.lines.length) {
      return
    }
    this.state = LYRIC_STATE.PLAYING

    this._curNum = this._findCurNum(startTime)
    this._startStamp = +new Date() - startTime

    if (!skipLast) {
      this._callHandler(this._curNum - 1)
    }

    if (this._curNum < this.lines.length) {
      clearTimeout(this._timer)
      this._timer = undefined
      this._playRest()
    }
  }

  /** toggle play state */
  togglePlay () {
    const now = +new Date()
    if (this.state === LYRIC_STATE.PLAYING) {
      this.stop()
      this._pauseStamp = now
    } else {
      this.state = LYRIC_STATE.PLAYING
      this.play((this._pauseStamp || now) - (this._startStamp || now), true)
      this._pauseStamp = 0
    }
  }

  stop () {
    this.state = LYRIC_STATE.PAUSE
    clearTimeout(this._timer)
    this._timer = undefined
  }

  /** seek to correspond starTime */
  seek (offset: number) {
    this.play(offset)
  }
}
