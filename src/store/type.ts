import type { Album, Artist, PlaylistItem, Song, StoreData, StoreSetting } from '@/api/types'
import Player from '@/utils/Player'

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

export enum TYPES {
}
