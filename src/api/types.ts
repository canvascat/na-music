export interface RecommendPlayItem {
  id: number
  type: number
  name: string
  copywriter: string
  picUrl: string
  canDislike: boolean
  trackNumberUpdateTime: number
  playCount: number
  trackCount: number
  highQuality: boolean
  alg: string
}

export interface RecommendPlayListResponse {
  hasTaste: boolean
  code: number
  category: number
  result: RecommendPlayItem[]
}

export interface User {
  userId: number
  userType: number
  nickname: string
  avatarImgId: number
  avatarUrl: string
  backgroundImgId: number
  backgroundUrl: string
  signature: string
  createTime: number
  userName: string
  accountType: number
  shortUserName: string
  birthday: number
  authority: number
  gender: number
  accountStatus: number
  province: number
  city: number
  authStatus: number
  // description?: any;
  // detailDescription?: any;
  // expertTags?: any;
  // experts?: any;
  // avatarDetail?: any;
  // remarkName?: any;
  defaultAvatar: boolean
  djStatus: number
  locationStatus: number
  vipType: number
  followed: boolean
  mutual: boolean
  authenticated: boolean
  lastLoginTime: number
  lastLoginIP: string
  viptypeVersion: number
  authenticationTypes: number
  anchor: boolean
}
export interface StoreData {
  user: User
  likedSongPlaylistID: number
  lastRefreshCookieDate: number
  loginMode: string
}

export interface Shortcut {
  id: string
  name: string
  shortcut: string
  globalShortcut: string
}

export interface StoreSetting {
  lang: string
  musicLanguage: string
  appearance: string
  musicQuality: number
  lyricFontSize: number
  showPlaylistsByAppleMusic: boolean
  automaticallyCacheSongs: boolean
  cacheLimit: false | number
  showLyricsTranslation: boolean
  lyricsBackground: boolean
  enableGlobalShortcut: boolean
  shortcuts: Shortcut[]
}

export interface PlaylistCreator {
  defaultAvatar: boolean
  province: number
  authStatus: number
  followed: boolean
  avatarUrl: string
  accountStatus: number
  gender: number
  city: number
  birthday: any
  userId: number
  userType: number
  nickname: string
  signature: string
  description: string
  detailDescription: string
  avatarImgId: any
  backgroundImgId: any
  backgroundUrl: string
  authority: number
  mutual: boolean
  expertTags: string[]
  experts?: any
  djStatus: number
  vipType: number
  remarkName?: any
  authenticationTypes: number
  avatarDetail?: any
  avatarImgIdStr: string
  backgroundImgIdStr: string
  anchor: boolean
  avatarImgId_str: string
}
interface TrackId {
  id: number
  v: number
  t: number
  at: number
  alg: string
  uid: number
  rcmdReason: string
}
interface Subscriber {
  defaultAvatar: boolean
  province: number
  authStatus: number
  followed: boolean
  avatarUrl: string
  accountStatus: number
  gender: number
  city: number
  birthday: number
  userId: any
  userType: number
  nickname: string
  signature: string
  description: string
  detailDescription: string
  avatarImgId: any
  backgroundImgId: any
  backgroundUrl: string
  authority: number
  mutual: boolean
  expertTags?: any
  experts?: any
  djStatus: number
  vipType: number
  remarkName?: any
  authenticationTypes: number
  avatarDetail?: any
  anchor: boolean
  avatarImgIdStr: string
  backgroundImgIdStr: string
  avatarImgId_str: string
}
interface AvatarDetail {
  userType: number
  identityLevel: number
  identityIconUrl: string
}
interface Creator {
  defaultAvatar: boolean
  province: number
  authStatus: number
  followed: boolean
  avatarUrl: string
  accountStatus: number
  gender: number
  city: number
  birthday: number
  userId: number
  userType: number
  nickname: string
  signature: string
  description: string
  detailDescription: string
  avatarImgId: number
  backgroundImgId: number
  backgroundUrl: string
  authority: number
  mutual: boolean
  expertTags?: any
  experts?: any
  djStatus: number
  vipType: number
  remarkName?: any
  authenticationTypes: number
  avatarDetail: AvatarDetail
  anchor: boolean
  avatarImgIdStr: string
  backgroundImgIdStr: string
  avatarImgId_str: string
}

export interface Account {
  id: number
  userName: string
  type: number
  status: number
  whitelistAuthority: number
  createTime: number
  tokenVersion: number
  ban: number
  baoyueVersion: number
  donateVersion: number
  vipType: number
  anonimousUser: boolean
  paidFee: boolean
}

export interface Profile {
  userId: number
  userType: number
  nickname: string
  avatarImgId: number
  avatarUrl: string
  backgroundImgId: number
  backgroundUrl: string
  signature: string
  createTime: number
  userName: string
  accountType: number
  shortUserName: string
  birthday: number
  authority: number
  gender: number
  accountStatus: number
  province: number
  city: number
  authStatus: number
  description?: any
  detailDescription?: any
  defaultAvatar: boolean
  expertTags?: any
  experts?: any
  djStatus: number
  locationStatus: number
  vipType: number
  followed: boolean
  mutual: boolean
  authenticated: boolean
  lastLoginTime: number
  lastLoginIP: string
  remarkName?: any
  viptypeVersion: number
  authenticationTypes: number
  avatarDetail?: any
  anchor: boolean
}
export interface Ar {
  id: number
  name: string
  alia: string[]
}

export interface Al {
  id: number
  name: string
  picUrl: string
  pic_str: string
  pic: any
}

interface MHL {
  br: number
  fid: number
  size: number
  vd: number
}

export interface FreeTrialPrivilege {
  resConsumable: boolean
  userConsumable: boolean
}

export interface ChargeInfoList {
  rate: number
  chargeUrl?: any
  chargeMessage?: any
  chargeType: number
}

export interface Privilege {
  id: number
  fee: number
  payed: number
  st: number
  pl: number
  dl: number
  sp: number
  cp: number
  subp: number
  cs: boolean
  maxbr: number
  fl: number
  toast: boolean
  flag: number
  preSell: boolean
  playMaxbr: number
  downloadMaxbr: number
  rscl?: any
  freeTrialPrivilege: FreeTrialPrivilege
  chargeInfoList: ChargeInfoList[]
}

export interface Song {
  rtUrls: any[]
  ar: Ar[]
  al: Al
  st: number
  noCopyrightRcmd?: any
  a?: any
  m: MHL
  no: number
  fee: number
  djId: number
  mv: number
  alia: any[]
  t: number
  v: number
  dt: number
  h: MHL
  l: MHL
  rtUrl?: any
  ftype: number
  rtype: number
  rurl?: any
  pst: number
  pop: number
  rt: string
  mst: number
  cp: number
  crbt?: any
  cf: string
  cd: string
  name: string
  id: number
  privilege: Privilege
  playable: boolean
  reason: string
}

export interface Artist {
  img1v1Id: number
  topicPerson: number
  alias: any[]
  picId: number
  briefDesc: string
  musicSize: number
  albumSize: number
  picUrl: string
  img1v1Url: string
  followed: boolean
  trans: string
  name: string
  id: number
  img1v1Id_str: string
}

export interface ResourceInfo {
  id: number
  userId: number
  name: string
  imgUrl: string
  creator?: any
  encodedId?: any
  subTitle?: any
  webUrl?: any
}

export interface CommentThread {
  id: string
  resourceInfo: ResourceInfo
  resourceType: number
  commentCount: number
  likedCount: number
  shareCount: number
  hotCount: number
  latestLikedUsers?: any
  resourceOwnerId: number
  resourceTitle: string
  resourceId: number
}

export interface AlbumInfo {
  commentThread: CommentThread
  latestLikedUsers?: any
  liked: boolean
  comments?: any
  resourceType: number
  resourceId: number
  commentCount: number
  likedCount: number
  shareCount: number
  threadId: string
}

export interface Album {
  songs: Song[]
  paid: boolean
  onSale: boolean
  mark: number
  tags: string
  artists: Artist[]
  alias: any[]
  copyrightId: number
  picId: number
  artist: Artist
  publishTime: number
  company: string
  briefDesc: string
  picUrl: string
  commentThreadId: string
  blurPicUrl: string
  companyId: number
  status: number
  subType: string
  description: string
  pic: number
  name: string
  id: number
  type: string
  size: number
  picId_str: string
  info: AlbumInfo
}

export interface Lrc {
  version: number
  lyric: string
}

export interface PlaylistItem {
  id: number
  name: string
  coverImgId: number
  coverImgUrl: string
  coverImgId_str: string
  adType: number
  userId: number
  createTime: number
  status: number
  opRecommend: boolean
  highQuality: boolean
  newImported: boolean
  updateTime: number
  trackCount: number
  specialType: number
  privacy: number
  trackUpdateTime: number
  commentThreadId: string
  playCount: number
  trackNumberUpdateTime: number
  subscribedCount: number
  cloudTrackCount: number
  ordered: boolean
  description: string
  tags: string[]
  updateFrequency: string
  backgroundCoverId: number
  backgroundCoverUrl: string
  titleImage: number
  titleImageUrl: string
  englishTitle: string
  officialPlaylistType: string
  subscribers: Subscriber[]
  subscribed?: any
  creator: Creator
  tracks: Song[]
  videoIds?: any
  videos?: any
  trackIds: TrackId[]
  shareCount: number
  commentCount: number
  remixVideo?: any
  sharedUsers?: any
  historySharedUsers?: any
}

export interface PrivateFM {
  name: string
  id: number
  artists: Artist[]
  album: Album
  privilege: Privilege
}
