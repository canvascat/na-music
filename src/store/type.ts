import type { Album, Artist, PlaylistItem, Song, StoreData, StoreSetting } from '@/api/types'
import { Player } from '@/utils/Player'

export interface State {
  settings: StoreSetting,
  data: StoreData,
  player: Player,
  liked: {
    songs: number[],
    songsWithDetails: Song[], // 只有前12首 TODO:
    playlists: PlaylistItem[],
    albums: Album[],
    artists: Artist[],
    mvs: any[],
    cloudDisk: any[],
  },
  [key: string]: any
}

export const enum MUTATIONS {
  UPDATE_LIKED_XXX,
  CHANGE_LANG,
  CHANGE_MUSIC_QUALITY,
  CHANGE_LYRIC_FONT_SIZE,
  CHANGE_OUTPUT_DEVICE,
  UPDATE_SETTINGS,
  UPDATE_DATA,
  TOGGLE_PLAYLIST_CATEGORY,
  UPDATE_MODAL,
  TOGGLE_LYRICS,
  UPDATE_DAILY_TRACKS,
  UPDATE_LASTFM,
  UPDATE_SHORTCUT,
  RESTORE_DEFAULT_SHORTCUTS
}
