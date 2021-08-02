import { isAccountLoggedIn, isLooseLoggedIn } from '@/utils/auth'
import { likeATrack, getTrackDetail } from '@/api/track'
import { getPlaylistDetail } from '@/api/playlist'
import {
  userPlaylist,
  userLikedSongsIDs,
  likedAlbums,
  likedArtists,
  likedMVs,
  cloudDisk,
  userAccount
} from '@/api/user'
import type { ActionTree } from 'vuex'
import type { State } from './type'

export const actions: ActionTree<State, State> = {
  showToast ({ state, commit }, text) {
    if (state.toast.timer !== null) {
      clearTimeout(state.toast.timer)
      commit('updateToast', { show: false, text: '', timer: null })
    }
    commit('updateToast', {
      show: true,
      text,
      timer: setTimeout(() => {
        commit('updateToast', {
          show: false,
          text: state.toast.text,
          timer: null
        })
      }, 3200)
    })
  },
  likeATrack ({ state, commit, dispatch }, id) {
    if (!isAccountLoggedIn()) {
      dispatch('showToast', '此操作需要登录网易云账号')
      return
    }
    const like = !state.liked.songs.includes(id)
    likeATrack({ id, like }).then(() => {
      if (like === false) {
        commit('updateLikedXXX', {
          name: 'songs',
          data: state.liked.songs.filter(d => d !== id)
        })
      } else {
        const newLikeSongs = state.liked.songs
        newLikeSongs.push(id)
        commit('updateLikedXXX', {
          name: 'songs',
          data: newLikeSongs
        })
      }
      dispatch('fetchLikedSongsWithDetails')
    })
  },
  async fetchLikedSongs ({ state, commit }) {
    if (!isLooseLoggedIn()) return
    if (isAccountLoggedIn()) {
      const result = await userLikedSongsIDs(state.data.user.userId)
      const data = result.ids
      data && commit('updateLikedXXX', { name: 'songs', data })
    } else {
      // TODO:搜索ID登录的用户
    }
  },
  async fetchLikedSongsWithDetails ({ state, commit }) {
    const result = await getPlaylistDetail(state.data.likedSongPlaylistID, true)
    if (result.playlist?.trackIds?.length === 0) return
    const ids = result.playlist.trackIds.slice(0, 12).map(t => t.id).join(',')
    const details = await getTrackDetail(ids)
    commit('updateLikedXXX', {
      name: 'songsWithDetails',
      data: details.songs
    })
  },
  async fetchLikedPlaylist ({ state, commit }) {
    if (!isLooseLoggedIn()) return
    if (isAccountLoggedIn()) {
      const result = await userPlaylist({
        uid: state.data.user.userId,
        limit: 2000, // 最多只加载2000个歌单（等有用户反馈问题再修）
        timestamp: new Date().getTime()
      })
      if (!result.playlist) return
      commit('updateLikedXXX', {
        name: 'playlists',
        data: result.playlist
      })
      // 更新用户”喜欢的歌曲“歌单ID
      commit('updateData', {
        key: 'likedSongPlaylistID',
        value: result.playlist[0].id
      })
    } else {
      // TODO:搜索ID登录的用户
    }
  },
  fetchLikedAlbums ({ commit }) {
    if (!isAccountLoggedIn()) return
    return likedAlbums({ limit: 2000 }).then(result => {
      if (result.data) {
        commit('updateLikedXXX', {
          name: 'albums',
          data: result.data
        })
      }
    })
  },
  fetchLikedArtists ({ commit }) {
    if (!isAccountLoggedIn()) return
    return likedArtists({ limit: 2000 }).then(result => {
      if (result.data) {
        commit('updateLikedXXX', {
          name: 'artists',
          data: result.data
        })
      }
    })
  },
  fetchLikedMVs: ({ commit }) => {
    if (!isAccountLoggedIn()) return
    return likedMVs({ limit: 2000 }).then(result => {
      if (result.data) {
        commit('updateLikedXXX', {
          name: 'mvs',
          data: result.data
        })
      }
    })
  },
  fetchCloudDisk ({ commit }) {
    if (!isAccountLoggedIn()) return
    return cloudDisk().then(result => {
      if (result.data) {
        commit('updateLikedXXX', {
          name: 'cloudDisk',
          data: result.data
        })
      }
    })
  },
  async fetchUserProfile ({ commit }) {
    if (!isAccountLoggedIn()) return
    const { code, profile } = await userAccount()
    if (code !== 200) return
    commit('updateData', { key: 'user', value: profile })
  }
}
