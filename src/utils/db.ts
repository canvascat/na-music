import axios from 'axios';
import Dexie from 'dexie';
import store from '@/store';
import { sum } from 'lodash';

const db = new Dexie('yesplaymusic');

db.version(4).stores({
  trackDetail: '&id, updateTime',
  lyric: '&id, updateTime',
  album: '&id, updateTime',
});

db.version(3)
  .stores({
    trackSources: '&id, createTime',
  })
  .upgrade(tx =>
    tx
      .table('trackSources')
      .toCollection()
      .modify(
        track => !track.createTime && (track.createTime = new Date().getTime())
      )
  );

db.version(1).stores({
  trackSources: '&id',
});

let tracksCacheBytes = 0;

async function deleteExcessCache() {
  const cacheLimit = store.state.settings.cacheLimit;
  if (cacheLimit === false || cacheLimit * (1 << 20)) return;
  try {
    const delCache = await db.table('trackSources').orderBy('createTime').first();
    await db.table('trackSources').delete(delCache.id);
    tracksCacheBytes -= delCache.source.byteLength;
    console.debug(
      `[debug][db.js] deleteExcessCacheSucces, track: ${delCache.name}, size: ${delCache.source.byteLength}, cacheSize:${tracksCacheBytes}`
    );
    deleteExcessCache();
  } catch (error) {
    console.debug('[debug][db.js] deleteExcessCacheFailed', error);
  }
}

export function cacheTrackSource(trackInfo, url, bitRate, from = 'netease') {
  const name = trackInfo.name;
  const artist =
    (trackInfo.ar && trackInfo.ar[0]?.name) ||
    (trackInfo.artists && trackInfo.artists[0]?.name) ||
    'Unknown';
  let cover = trackInfo.al.picUrl;
  if (cover.slice(0, 5) !== 'https') {
    cover = 'https' + cover.slice(4);
  }
  axios.get(`${cover}?param=512y512`);
  axios.get(`${cover}?param=224y224`);
  axios.get(`${cover}?param=1024y1024`);
  return axios
    .get(url, {
      responseType: 'arraybuffer',
    })
    .then(response => {
      db.table('trackSources').put({
        id: trackInfo.id,
        source: response.data,
        bitRate,
        from,
        name,
        artist,
        createTime: new Date().getTime(),
      });
      console.debug(`[debug][db.js] cached track 👉 ${name} by ${artist}`);
      tracksCacheBytes += response.data.byteLength;
      deleteExcessCache();
      return { trackID: trackInfo.id, source: response.data, bitRate };
    });
}

export async function getTrackSource(id: number | string) {
  const track = await db.table('trackSources').get(+id);
  if (!track) return null;
  console.debug(
    `[debug][db.js] get track from cache 👉 ${track.name} by ${track.artist}`
  );
  return track;
}

export function cacheTrackDetail(track, privileges) {
  db.table('trackDetail').put({
    id: track.id,
    detail: track,
    privileges: privileges,
    updateTime: new Date().getTime(),
  });
}

export async function getTrackDetailFromCache(ids: (number | string)[]) {
  const tracks = await db.table('trackDetail')
    .filter(track => ids.includes(String(track.id)))
    .toArray()
  const result = { songs: [], privileges: [] };
  ids.forEach(id => {
    const one = tracks.find(t => String(t.id) === id);
    result.songs.push(one?.detail);
    result.privileges.push(one?.privileges);
  });
  if (result.songs.includes(undefined)) {
    return undefined;
  }
  return result;
}

export async function cacheLyric(id: number | string, lyrics: string) {
  const updateTime = Date.now();
  id = +id;
  await db.table('lyric').put({ id, lyrics, updateTime });
}

export async function getLyricFromCache(id: number | string) {
  const result = await db.table('lyric').get(+id);
  if (!result) return undefined;
  return result.lyrics;
}

export async function cacheAlbum(id: string | number, album) {
  const updateTime = Date.now();
  id = +id;
  await db.table('album').put({ id, album, updateTime });
}

export async function getAlbumFromCache(id: number | string) {
  const result = await db.table('album').get(+id)
  if (!result) return undefined;
  return result.album;
}

export async function countDBSize() {
  const trackSizes: number[] = [];
  await db.table('trackSources').each(track => trackSizes.push(track.source.byteLength));
  const bytes = tracksCacheBytes = sum(trackSizes);
  const res = { bytes, length: trackSizes.length };
  console.debug(`[debug][db.js] load tracksCacheBytes: ${bytes}`);
  return res;
}

export async function clearDB() {
  await Promise.all(db.tables.map(table => table.clear()));
}
