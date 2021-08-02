import request from '@/utils/request'
import { Account, PlaylistItem, Profile } from './types'

/**
 * 获取用户详情
 * 说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户详情
 * - uid : 用户 id
 * @param {number} uid
 */
export function userDetail (uid) {
  return request({
    url: '/user/detail',
    method: 'get',
    params: {
      uid,
      timestamp: new Date().getTime()
    }
  })
}

/**
 * 获取账号详情
 * 说明 : 登录后调用此接口 ,可获取用户账号信息
 */
export function userAccount () {
  return request.get<any, {
    code: number;
    account: Account;
    profile: Profile;
  }>('/user/account', { params: { timestamp: Date.now() } })
}

/**
 * 获取用户歌单
 * 说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户歌单
 * - uid : 用户 id
 * - limit : 返回数量 , 默认为 30
 * - offset : 偏移数量，用于分页 , 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0
 * @param {Object} params
 * @param {number} params.uid
 * @param {number} params.limit
 * @param {number=} params.offset
 */
export function userPlaylist (params) {
  return request.get<any, {
    version: string;
    more: boolean;
    playlist: PlaylistItem[];
    code: number;
  }>('/user/playlist', { params })
}

/**
 * 喜欢音乐列表（需要登录）
 * 说明 : 调用此接口 , 传入用户 id, 可获取已喜欢音乐id列表(id数组)
 * - uid: 用户 id
 * @param {number} uid
 */
export function userLikedSongsIDs (uid: number) {
  const timestamp = Date.now()
  return request.get<any, {ids: number[]}>('/likelist', { params: { uid, timestamp } })
}

/**
 * 每日签到
 * 说明 : 调用此接口可签到获取积分
 * -  type: 签到类型 , 默认 0, 其中 0 为安卓端签到 ,1 为 web/PC 签到
 * @param {number} type
 */
export function dailySignin (type = 0) {
  return request({
    url: '/daily_signin',
    method: 'post',
    params: {
      type,
      timestamp: new Date().getTime()
    }
  })
}

/**
 * 获取收藏的专辑（需要登录）
 * 说明 : 调用此接口可获取到用户收藏的专辑
 * - limit : 返回数量 , 默认为 25
 * - offset : 偏移数量，用于分页 , 如 :( 页数 -1)*25, 其中 25 为 limit 的值 , 默认为 0
 * @param {Object} params
 * @param {number} params.limit
 * @param {number=} params.offset
 */
export function likedAlbums (params) {
  const timestamp = Date.now()
  const { limit } = params
  return request('/album/sublist', { params: { limit, timestamp } })
}

/**
 * 获取收藏的歌手（需要登录）
 * 说明 : 调用此接口可获取到用户收藏的歌手
 */
export function likedArtists (params) {
  return request({
    url: '/artist/sublist',
    method: 'get',
    params: {
      limit: params.limit,
      timestamp: new Date().getTime()
    }
  })
}

/**
 * 获取收藏的MV（需要登录）
 * 说明 : 调用此接口可获取到用户收藏的MV
 */
export function likedMVs (params) {
  return request({
    url: '/mv/sublist',
    method: 'get',
    params: {
      limit: params.limit,
      timestamp: new Date().getTime()
    }
  })
}

/**
 * 上传歌曲到云盘（需要登录）
 */
export function uploadSong (file) {
  const formData = new FormData()
  formData.append('songFile', file)
  return request({
    url: '/cloud',
    method: 'post',
    params: {
      timestamp: new Date().getTime()
    },
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取云盘歌曲（需要登录）
 * 说明 : 登录后调用此接口 , 可获取云盘数据 , 获取的数据没有对应 url, 需要再调用一 次 /song/url 获取 url
 * - limit : 返回数量 , 默认为 200
 * - offset : 偏移数量，用于分页 , 如 :( 页数 -1)*200, 其中 200 为 limit 的值 , 默认为 0
 * @param {Object} params
 * @param {number} params.limit
 * @param {number=} params.offset
 */
export function cloudDisk (params = {}) {
  const timestamp = Date.now()
  return request.get('/user/cloud', { params: { ...params, timestamp } })
}

/**
 * 获取云盘歌曲详情（需要登录）
 */
export function cloudDiskTrackDetail (id) {
  return request({
    url: '/user/cloud/detail',
    method: 'get',
    params: {
      timestamp: new Date().getTime(),
      id
    }
  })
}

/**
 * 删除云盘歌曲（需要登录）
 * @param {Array} id
 */
export function cloudDiskTrackDelete (id) {
  return request({
    url: '/user/cloud/del',
    method: 'get',
    params: {
      timestamp: new Date().getTime(),
      id
    }
  })
}
