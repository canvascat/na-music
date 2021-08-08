import { getTrackDetail, scrobble, getMP3 } from '@/api/track'
import shuffle from 'lodash/shuffle'
import { Howler, Howl } from 'howler'
import { cacheTrackSource, getTrackSource } from '@/utils/db'
import { getAlbum } from '@/api/album'
import { getPlaylistDetail } from '@/api/playlist'
import { getArtist } from '@/api/artist'
import { personalFM, fmTrash } from '@/api/others'
import store from '@/store'
import { isAccountLoggedIn } from '@/utils/auth'
import { trackUpdateNowPlaying, trackScrobble } from '@/api/lastfm'
import type { PrivateFM, Song } from '@/api/types'
import { useToast } from '@/hook'

const [toast] = useToast()

type TrackID = number | 'first'
// 关|开|单曲循环
type RepeatMode = 'off' | 'on' | 'one'
export class Player {
  // 播放器状态
  private _playing = false; // 是否正在播放中
  private _progress = 0; // 当前播放歌曲的进度
  private _enabled = false; // 是否启用Player
  private _repeatMode: RepeatMode = 'off'; // off | on | one
  private _shuffle = false; // true | false
  private _volume = 1; // 0 to 1
  private _volumeBeforeMuted = 1; // 用于保存静音前的音量

  // 播放信息
  private _list: number[] = []; // 播放列表
  private _current = 0; // 当前播放歌曲在播放列表里的index
  private _shuffledList: number[] = []; // 被随机打乱的播放列表，随机播放模式下会使用此播放列表
  private _shuffledCurrent = 0; // 当前播放歌曲在随机列表里面的index
  private _playlistSource = { type: 'album', id: 123 }; // 当前播放列表的信息
  private _currentTrack: Song = {} as Song; // 当前播放歌曲的详细信息
  private _playNextList = []; // 当这个list不为空时，会优先播放这个list的歌
  private _isPersonalFM = false; // 是否是私人FM模式
  private _personalFMTrack?: PrivateFM; // 私人FM当前歌曲
  private _personalFMNextTrack?: PrivateFM; // 私人FM下一首歌曲信息（为了快速加载下一首）

  // howler (https://github.com/goldfire/howler.js)
  private _howler: Howl = null;
  constructor () {
    Object.defineProperty(this, '_howler', { enumerable: false })
    // init
    // this._init()
    // Object.defineProperty(window, 'yesplaymusic', { value: { player: this } })
  }

  async init () {
    this._loadSelfFromLocalStorage()
    Howler.autoUnlock = false
    Howler.usingWebAudio = true
    Howler.volume(this.volume)

    if (this._enabled) {
      // 恢复当前播放歌曲
      this._replaceCurrentTrack(this._currentTrack.id, false).then(() => {
        this._howler?.seek(+localStorage.getItem('playerCurrentTrackTime') || 0)
      }) // update audio source and init howler
      this._initMediaSession()
    }

    this._setIntervals()

    // 初始化私人FM
    if (!this._personalFMTrack || !this._personalFMNextTrack) {
      const { data: fms } = await personalFM()
      ;[this._personalFMTrack, this._personalFMNextTrack] = fms
    }
  }

  get repeatMode () {
    return this._repeatMode
  }

  set repeatMode (mode: RepeatMode) {
    if (this._isPersonalFM) return
    if (!['off', 'on', 'one'].includes(mode)) {
      console.warn("repeatMode: invalid args, must be 'on' | 'off' | 'one'")
      return
    }
    this._repeatMode = mode
  }

  get shuffle () {
    return this._shuffle
  }

  set shuffle (shuffle) {
    if (this._isPersonalFM) return
    if (shuffle !== true && shuffle !== false) {
      console.warn('shuffle: invalid args, must be Boolean')
      return
    }
    this._shuffle = shuffle
    if (shuffle) {
      this._shuffleTheList()
    }
  }

  get volume () {
    return this._volume
  }

  set volume (volume) {
    this._volume = volume
    Howler.volume(volume)
  }

  get list () {
    return this.shuffle ? this._shuffledList : this._list
  }

  set list (list) {
    this._list = list
  }

  get current () {
    return this.shuffle ? this._shuffledCurrent : this._current
  }

  set current (current) {
    if (this.shuffle) {
      this._shuffledCurrent = current
    } else {
      this._current = current
    }
  }

  get enabled () {
    return this._enabled
  }

  get playing () {
    return this._playing
  }

  get currentTrack () {
    return this._currentTrack
  }

  get playlistSource () {
    return this._playlistSource
  }

  get playNextList () {
    return this._playNextList
  }

  get isPersonalFM () {
    return this._isPersonalFM
  }

  get personalFMTrack () {
    return this._personalFMTrack
  }

  get personalFMNextTrack () {
    return this._personalFMNextTrack
  }

  get currentTrackDuration () {
    const trackDuration = this._currentTrack.dt || 1000
    const duration = ~~(trackDuration / 1000)
    return duration > 1 ? duration - 1 : duration
  }

  get progress () {
    return this._progress
  }

  set progress (value) {
    if (this._howler) {
      this._howler.seek(value)
    }
  }

  get isCurrentTrackLiked () {
    return store.state.liked.songs.includes(this.currentTrack.id)
  }

  private _setIntervals () {
    // 同步播放进度
    // TODO: 如果 _progress 在别的地方被改变了，这个定时器会覆盖之前改变的值，是bug
    setInterval(() => {
      if (!this._howler) return
      this._progress = this._howler.seek() as number
      localStorage.setItem('playerCurrentTrackTime', (this._progress).toString())
    }, 1000)
  }

  private _getNextTrack () {
    if (this._playNextList.length > 0) {
      const trackID = this._playNextList.shift()
      return [trackID, this.current]
    }

    // 当歌曲是列表最后一首 && 循环模式开启
    if (this.list.length === this.current + 1 && this.repeatMode === 'on') {
      return [this.list[0], 0]
    }

    // 返回 [trackID, index]
    return [this.list[this.current + 1], this.current + 1]
  }

  private _getPrevTrack () {
    // 当歌曲是列表第一首 && 循环模式开启
    if (this.current === 0 && this.repeatMode === 'on') {
      return [this.list[this.list.length - 1], this.list.length - 1]
    }

    // 返回 [trackID, index]
    return [this.list[this.current - 1], this.current - 1]
  }

  private async _shuffleTheList (firstTrackID: TrackID = this._currentTrack.id) {
    let list = this._list.filter(tid => tid !== firstTrackID)
    if (firstTrackID === 'first') list = this._list
    this._shuffledList = shuffle(list)
    if (firstTrackID !== 'first') this._shuffledList.unshift(firstTrackID)
  }

  private async _scrobble (track, time, completed = false) {
    console.debug(
      `[debug][Player.js] scrobble track 👉 ${track.name} by ${track.ar[0].name} 👉 time:${time} completed: ${completed}`
    )
    const trackDuration = ~~(track.dt / 1000)
    time = completed ? trackDuration : ~~time
    scrobble({
      id: track.id,
      sourceid: this.playlistSource.id,
      time
    })
    if (
      store.state.lastfm.key !== undefined &&
      (time >= trackDuration / 2 || time >= 240)
    ) {
      const timestamp = ~~(new Date().getTime() / 1000) - time
      trackScrobble({
        artist: track.ar[0].name,
        track: track.name,
        timestamp,
        album: track.al.name,
        trackNumber: track.no,
        duration: trackDuration
      })
    }
  }

  private _playAudioSource (source, autoplay = true) {
    Howler.unload()
    this._howler = new Howl({
      src: [source],
      html5: true,
      format: ['mp3', 'flac']
    })
    if (autoplay) {
      this.play()
      document.title = `${this._currentTrack.name} · ${this._currentTrack.ar[0].name} - YesPlayMusic`
    }
    this.setOutputDevice()
    this._howler.once('end', () => {
      this._nextTrackCallback()
    })
  }

  private async _getAudioSourceFromCache (id) {
    const t = await getTrackSource(id)
    return t ? URL.createObjectURL(new Blob([t.source])) : null
  }

  private async _getAudioSourceFromNetease (track) {
    if (!isAccountLoggedIn()) return `https://music.163.com/song/media/outer/url?id=${track.id}`
    const result = await getMP3(track.id)
    if (!result.data[0]?.url) return null
    if (result.data[0].freeTrialInfo !== null) return null // 跳过只能试听的歌曲
    const source = result.data[0].url.replace(/^http:/, 'https:')
    if (store.state.settings.automaticallyCacheSongs) {
      cacheTrackSource(track, source, result.data[0].br)
    }
    return source
  }

  private async _getAudioSource (track: Song) {
    let source = await this._getAudioSourceFromCache(String(track.id))
    if (!source) source = await this._getAudioSourceFromNetease(track)
    return source
  }

  private async _replaceCurrentTrack (
    id: number,
    autoplay = true,
    ifUnplayableThen = 'playNextTrack'
  ) {
    if (autoplay && this._currentTrack.name) {
      await this._scrobble(this.currentTrack, this._howler?.seek())
    }
    const data = await getTrackDetail(id)
    const track = data.songs[0]
    this._currentTrack = track
    this._updateMediaSessionMetaData(track)
    const source = await this._getAudioSource(track)
    if (source) {
      this._playAudioSource(source, autoplay)
      this._cacheNextTrack()
      return source
    } else {
      toast(`无法播放 ${track.name}`)
      ifUnplayableThen === 'playNextTrack'
        ? this.playNextTrack()
        : this.playPrevTrack()
    }
  }

  private _cacheNextTrack () {
    const nextTrackID = this._isPersonalFM
      ? this._personalFMNextTrack.id
      : this._getNextTrack()[0]
    if (!nextTrackID) return
    if (this._personalFMTrack.id === nextTrackID) return
    getTrackDetail(nextTrackID).then(data => {
      const track = data.songs[0]
      this._getAudioSource(track)
    })
  }

  private _loadSelfFromLocalStorage () {
    const player = JSON.parse(localStorage.getItem('player'))
    if (!player) return
    for (const [key, value] of Object.entries(player)) {
      this[key] = value
    }
  }

  private _initMediaSession () {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        this.play()
      })
      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause()
      })
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.playPrevTrack()
      })
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.playNextTrack()
      })
      navigator.mediaSession.setActionHandler('stop', () => {
        this.pause()
      })
      navigator.mediaSession.setActionHandler('seekto', event => {
        this.seek(event.seekTime)
        this._updateMediaSessionPositionState()
      })
      navigator.mediaSession.setActionHandler('seekbackward', event => {
        this.seek(this.seek() - (event.seekOffset || 10))
        this._updateMediaSessionPositionState()
      })
      navigator.mediaSession.setActionHandler('seekforward', event => {
        this.seek(this.seek() + (event.seekOffset || 10))
        this._updateMediaSessionPositionState()
      })
    }
  }

  private _updateMediaSessionMetaData (track: Song) {
    if (!('mediaSession' in navigator)) {
      return
    }
    const artists = track.ar.map(a => a.name)
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: track.name,
      artist: artists.join(','),
      album: track.al.name,
      artwork: [
        {
          src: track.al.picUrl + '?param=512y512',
          type: 'image/jpg',
          sizes: '512x512'
        }
      ]
    })
  }

  private _updateMediaSessionPositionState () {
    if (!('mediaSession' in navigator)) {
      return
    }
    if ('setPositionState' in navigator.mediaSession) {
      navigator.mediaSession.setPositionState({
        duration: ~~(this.currentTrack.dt / 1000),
        playbackRate: 1.0,
        position: this.seek()
      })
    }
  }

  private _nextTrackCallback () {
    this._scrobble(this._currentTrack, 0, true)
    if (!this.isPersonalFM && this.repeatMode === 'one') {
      this._replaceCurrentTrack(this._currentTrack.id)
    } else {
      this.playNextTrack()
    }
  }

  private _loadPersonalFMNextTrack () {
    return personalFM().then(result => {
      this._personalFMNextTrack = result.data[0]
      this._cacheNextTrack() // cache next track
      return this._personalFMNextTrack
    })
  }

  // currentTrackID() {
  //   const { list, current } = this._getListAndCurrent();
  //   return list[current];
  // }
  // appendTrack(trackID: number) {
  //   this.list.push(trackID);
  // }
  playNextTrack (isFM = false) {
    if (this._isPersonalFM || isFM === true) {
      this._isPersonalFM = true
      this._personalFMTrack = this._personalFMNextTrack
      this._replaceCurrentTrack(this._personalFMTrack.id)
      this._loadPersonalFMNextTrack()
      return true
    }
    // TODO: 切换歌曲时增加加载中的状态
    const [trackID, index] = this._getNextTrack()
    if (trackID === undefined) {
      this._howler?.stop()
      this._playing = false
      return false
    }
    this.current = index
    this._replaceCurrentTrack(trackID)
    return true
  }

  playPrevTrack () {
    const [trackID, index] = this._getPrevTrack()
    if (trackID === undefined) return false
    this.current = index
    this._replaceCurrentTrack(trackID, true, 'playPrevTrack')
    return true
  }

  saveSelfToLocalStorage () {
    const player = {}
    for (const [key, value] of Object.entries(this)) {
      if (key === '_playing') continue
      player[key] = value
    }

    localStorage.setItem('player', JSON.stringify(player))
  }

  pause () {
    this._howler?.pause()
    this._playing = false
    document.title = 'YesPlayMusic'
  }

  play () {
    if (this._howler?.playing()) return
    this._howler?.play()
    this._playing = true
    document.title = `${this._currentTrack.name} · ${this._currentTrack.ar[0].name} - YesPlayMusic`
    if (store.state.lastfm.key !== undefined) {
      trackUpdateNowPlaying({
        artist: this.currentTrack.ar[0].name,
        track: this.currentTrack.name,
        album: this.currentTrack.al.name,
        trackNumber: this.currentTrack.no,
        duration: ~~(this.currentTrack.dt / 1000)
      })
    }
  }

  playOrPause () {
    if (this._howler?.playing()) {
      this.pause()
    } else {
      this.play()
    }
  }

  seek (time = null) {
    if (time !== null) {
      this._howler?.seek(time)
    }
    return this._howler === null ? 0 : this._howler.seek() as number
  }

  mute () {
    if (this.volume === 0) {
      this.volume = this._volumeBeforeMuted
    } else {
      this._volumeBeforeMuted = this.volume
      this.volume = 0
    }
  }

  setOutputDevice () {
    // TODO: FIX TYPE
    // @ts-ignore
    const sounds: any[] = this._howler?._sounds
    if (!sounds || sounds.length <= 0) return
    if (sounds[0]._node) return
    sounds[0]._node.setSinkId(store.state.settings.outputDevice)
  }

  /** 替换歌单播放 */
  replacePlaylist (
    trackIDs: number[],
    playlistSourceID: number,
    playlistSourceType: string,
    autoPlayTrackID: TrackID = 'first'
  ) {
    this._isPersonalFM = false
    if (!this._enabled) this._enabled = true
    this.list = trackIDs
    this.current = 0
    this._playlistSource = {
      type: playlistSourceType,
      id: playlistSourceID
    }
    if (this.shuffle) this._shuffleTheList(autoPlayTrackID)
    if (autoPlayTrackID === 'first') {
      this._replaceCurrentTrack(this.list[0])
    } else {
      this.current = trackIDs.indexOf(autoPlayTrackID)
      this._replaceCurrentTrack(autoPlayTrackID)
    }
  }

  async playAlbumByID (id: number, trackID: TrackID = 'first') {
    const data = await getAlbum(id)
    const trackIDs = data.songs.map(t => t.id)
    this.replacePlaylist(trackIDs, id, 'album', trackID)
  }

  playPlaylistByID (id: number, trackID: TrackID, noCache = false) {
    console.debug(
      `[debug][Player.js] playPlaylistByID 👉 id:${id} trackID:${trackID} noCache:${noCache}`
    )
    getPlaylistDetail(id, noCache).then(data => {
      const trackIDs = data.playlist.trackIds.map(t => t.id)
      this.replacePlaylist(trackIDs, id, 'playlist', trackID)
    })
  }

  async playArtistByID (id: number, trackID: TrackID = 'first') {
    const data = await getArtist(id)
    const trackIDs = data.hotSongs.map(t => t.id)
    this.replacePlaylist(trackIDs, id, 'artist', trackID)
  }

  playTrackOnListByID (id: number, listName = 'default') {
    if (listName === 'default') {
      this._current = this._list.findIndex(t => t === id)
    }
    this._replaceCurrentTrack(id)
  }

  addTrackToPlayNext (trackID: number, playNow = false) {
    this._playNextList.push(trackID)
    if (playNow) this.playNextTrack()
  }

  /** 播放私人电台 */
  async playPersonalFM () {
    this._isPersonalFM = true
    if (!this._enabled) this._enabled = true
    if (this._currentTrack.id !== this._personalFMTrack.id) {
      await this._replaceCurrentTrack(this._personalFMTrack.id)
    }
    this.playOrPause()
  }

  moveToFMTrash () {
    this._isPersonalFM = true
    this.playNextTrack()
    fmTrash(this._personalFMTrack.id)
  }

  switchRepeatMode () {
    if (this._repeatMode === 'on') {
      this.repeatMode = 'one'
    } else if (this._repeatMode === 'one') {
      this.repeatMode = 'off'
    } else {
      this.repeatMode = 'on'
    }
  }

  switchShuffle () {
    this.shuffle = !this.shuffle
  }

  clearPlayNextList () {
    this._playNextList.length = 0
  }

  removeTrackFromQueue (index: number) {
    this._playNextList.splice(index, 1)
  }
}
