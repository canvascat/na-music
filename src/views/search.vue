<template>
  <div v-show="show" class="search-page">
    <div v-show="artists.length > 0 || albums.length > 0" class="row">
      <div v-show="artists.length > 0" class="artists">
        <div v-show="artists.length > 0" class="section-title">
          {{
            $t('search.artist')
          }}
          <router-link :to="`/search/${keywords}/artists`">
            {{
              $t('home.seeMore')
            }}
          </router-link>
        </div>
        <CoverRow
          type="artist"
          :column-number="3"
          :items="artists.slice(0, 3)"
          gap="34px 24px"
        />
      </div>

      <div class="albums">
        <div v-show="albums.length > 0" class="section-title">
          {{
            $t('search.album')
          }}
          <router-link :to="`/search/${keywords}/albums`">
            {{
              $t('home.seeMore')
            }}
          </router-link>
        </div>
        <CoverRow
          type="album"
          :items="albums.slice(0, 3)"
          sub-text="artist"
          :column-number="3"
          sub-text-font-size="14px"
          gap="34px 24px"
        />
      </div>
    </div>

    <div v-show="tracks.length > 0" class="tracks">
      <div class="section-title">
        {{
          $t('search.song')
        }}
        <router-link :to="`/search/${keywords}/tracks`">
          {{
            $t('home.seeMore')
          }}
        </router-link>
      </div>
      <TrackList :tracks="tracks" type="tracklist" />
    </div>

    <div v-show="musicVideos.length > 0" class="music-videos">
      <div class="section-title">
        {{
          $t('search.mv')
        }}
        <router-link :to="`/search/${keywords}/music-videos`">
          {{
            $t('home.seeMore')
          }}
        </router-link>
      </div>
      <MvRow :mvs="musicVideos.slice(0, 5)" />
    </div>

    <div v-show="playlists.length > 0" class="playlists">
      <div class="section-title">
        {{
          $t('search.playlist')
        }}
        <router-link :to="`/search/${keywords}/playlists`">
          {{
            $t('home.seeMore')
          }}
        </router-link>
      </div>
      <CoverRow
        type="playlist"
        :items="playlists.slice(0, 12)"
        sub-text="title"
        :column-number="6"
        sub-text-font-size="14px"
        gap="34px 24px"
      />
    </div>

    <div v-show="!haveResult" class="no-results">
      <div>
        <IconSearch />
        {{ keywords.length === 0 ? '输入关键字搜索' : $t('search.noResult') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { getTrackDetail } from '@/api/track'
import { search, SEARCH_TYPES } from '@/api/others'
import NProgress from 'nprogress'

import TrackList from '@/components/TrackList.vue'
import MvRow from '@/components/MvRow.vue'
import CoverRow from '@/components/CoverRow.vue'
import { IconSearch } from '@/components/icons'
import { useToast } from '@/hook'
import { computed, defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { sleep } from '@/utils/common'
import { debouncedWatch } from '@vueuse/shared'

const [toast] = useToast()

export default defineComponent({
  name: 'Search',
  components: {
    TrackList,
    MvRow,
    CoverRow,
    IconSearch
  },
  setup () {
    const show = ref(false)
    const tracks = ref([])
    const artists = ref([])
    const albums = ref([])
    const playlists = ref([])
    const musicVideos = ref([])
    const route = useRoute()
    const keywords = computed(() => route.params.keywords as string ?? '')
    const haveResult = computed(() => tracks.value.length +
    artists.value.length +
        albums.value.length +
        playlists.value.length +
    musicVideos.value.length > 0)
    debouncedWatch(keywords, val => {
      if (!val) return
      getData()
    }, { debounce: 600, immediate: true })

    async function searchResult (type: SEARCH_TYPES = SEARCH_TYPES.ALL) {
      try {
        const { result } = await search({ keywords: keywords.value, type, limit: 16 })
        return { result, type }
      } catch (error) {
        toast(error.response.data.msg || error.response.data.message)
      }
    }
    // TODO: 添加防抖
    async function getData () {
      sleep(1000).then(() => !show.value && NProgress.start())
      show.value = false
      const results = await Promise.all([
        searchResult(SEARCH_TYPES.ARTISTS),
        searchResult(SEARCH_TYPES.ALBUMS),
        searchResult(SEARCH_TYPES.TRACKS),
        searchResult(SEARCH_TYPES.MUSIC_VIDEOS),
        searchResult(SEARCH_TYPES.PLAYLISTS),
      ])
      results.forEach(item => {
        const type = item.type
        const result = item.result
        switch (type) {
          // case SEARCH_TYPES.ALL:
          //   this.result = result
          //   break
          case SEARCH_TYPES.MUSIC_VIDEOS:
            musicVideos.value = result.mvs ?? []
            break
          case SEARCH_TYPES.ARTISTS:
            artists.value = result.artists ?? []
            break
          case SEARCH_TYPES.ALBUMS:
            albums.value = result.albums ?? []
            break
          case SEARCH_TYPES.TRACKS:
            getTracksDetail((result.songs ?? []).map(t => t.id).join(','))
            break
          case SEARCH_TYPES.PLAYLISTS:
            playlists.value = result.playlists ?? []
            break
        }
      })
      NProgress.done()
      show.value = true
    }
    async function getTracksDetail (ids: string) {
      const { songs } = await getTrackDetail(ids)
      tracks.value = songs
    }
    return {
      show,
      tracks,
      artists,
      albums,
      playlists,
      musicVideos,
      keywords,
      haveResult
    }
  }
})
</script>

<style lang="scss" scoped>
.section-title {
  font-weight: 600;
  font-size: 22px;
  opacity: 0.88;
  color: var(--color-text);
  margin-bottom: 16px;

  display: flex;
  justify-content: space-between;
  align-items: center;
  a {
    font-size: 13px;
    font-weight: 600;
    opacity: 0.68;
  }
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin-top: 32px;

  .artists {
    flex: 1;
    margin-right: 8rem;
  }
  .albums {
    flex: 1;
  }
}

.tracks,
.music-videos,
.playlists {
  margin-top: 46px;
}

.no-results {
  position: absolute;
  top: 64px;
  right: 0;
  left: 0;
  bottom: 64px;
  font-size: 24px;
  color: var(--color-text);
  opacity: 0.38;
  display: flex;
  justify-content: center;
  align-items: center;
  div {
    display: flex;
    align-items: center;
  }
  .svg-icon {
    height: 24px;
    width: 24px;
    margin-right: 16px;
  }
}
</style>
