<template>
  <div v-show="show" class="home">
    <div v-if="settings.showPlaylistsByAppleMusic !== false" class="index-row first-row">
      <div class="title">by Apple Music</div>
      <CoverRow type="playlist" :items="byAppleMusic" sub-text="appleMusic" :image-size="1024" />
    </div>
    <div class="index-row">
      <div class="title">
        {{ $t('home.recommendPlaylist') }}
        <router-link to="/explore?category=推荐歌单">
          {{
            $t('home.seeMore')
          }}
        </router-link>
      </div>
      <CoverRow type="playlist" :items="recommendPlaylist" sub-text="copywriter" />
    </div>
    <div class="index-row">
      <div class="title">For You</div>
      <div class="for-you-row">
        <DailyTracksCard ref="DailyTracksCardRef" />
        <FMCard />
      </div>
    </div>
    <div class="index-row">
      <div class="title">{{ $t('home.recommendArtist') }}</div>
      <CoverRow type="artist" :column-number="6" :items="recommendArtists" />
    </div>
    <div class="index-row">
      <div class="title">
        {{ $t('home.newAlbum') }}
        <router-link to="/new-album">{{ $t('home.seeMore') }}</router-link>
      </div>
      <CoverRow type="album" :items="newReleasesAlbum" sub-text="artist" />
    </div>
    <div class="index-row">
      <div class="title">
        {{ $t('home.charts') }}
        <router-link to="/explore?category=排行榜">{{ $t('home.seeMore') }}</router-link>
      </div>
      <CoverRow type="playlist" :items="topList" sub-text="updateFrequency" :image-size="1024" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onActivated, ref } from 'vue'
import { toplists, recommendPlaylist as fetchRecommendPlaylist } from '@/api/playlist'
import { toplistOfArtists } from '@/api/artist'
import { byAppleMusic } from '@/utils/staticData'
import { countDBSize } from '@/utils/db'
import { newAlbums } from '@/api/album'
import NProgress from 'nprogress'
import CoverRow from '@/components/CoverRow.vue'
import FMCard from '@/components/FMCard.vue'
import DailyTracksCard from '@/components/DailyTracksCard.vue'
import store from '@/store'
import { randomSlice } from '@/utils/common'

export default defineComponent({
  name: 'Home',
  components: { CoverRow, DailyTracksCard, FMCard },
  setup () {
    const settings = store.state.settings
    const DailyTracksCardRef = ref()
    const show = ref(false)
    const recommendPlaylist = ref([])
    const newReleasesAlbum = ref([])
    const topList = ref([])
    const recommendArtists = ref([])
    NProgress.start()
    function loadData () {
      const lang = settings.musicLanguage
      fetchRecommendPlaylist({ limit: 10 }).then(data => {
        recommendPlaylist.value = data.result
        NProgress.done()
        show.value = true
      })
      newAlbums({ area: lang ?? 'ALL', limit: 10 }).then(data => {
        newReleasesAlbum.value = data.albums
      })
      toplistOfArtists({ zh: 1, ea: 2, jp: 4, kr: 3 }[lang]).then(data => {
        recommendArtists.value = randomSlice(data.list.artists, 6)
      })
      toplists().then(data => {
        topList.value = randomSlice(data.list, 5)
      })
      countDBSize()
      DailyTracksCardRef.value.loadDailyTracks()
    }
    onActivated(loadData)
    return {
      settings,
      show,
      byAppleMusic,
      DailyTracksCardRef,
      recommendArtists,
      topList,
      recommendPlaylist,
      newReleasesAlbum
    }
  }
})
</script>

<style lang="scss" scoped>
.index-row {
  margin-top: 54px;
}
.index-row.first-row {
  margin-top: 32px;
}
.playlists {
  display: flex;
  flex-wrap: wrap;
  margin: {
    right: -12px;
    left: -12px;
  }
  .index-playlist {
    margin: 12px 12px 24px 12px;
  }
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  a {
    font-size: 13px;
    font-weight: 600;
    opacity: 0.68;
  }
}

footer {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

.for-you-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 78px;
}
</style>
