<template>
  <div class="explore-page">
    <h1>{{ $t('explore.explore') }}</h1>
    <div class="buttons">
      <router-link v-for="item in staticItems" custom v-slot="{ navigate }"
        :key="item" :to="`/explore?category=${item}`">
        <button :title="item" :class="['button', item === activeItem  && 'active']" @click="navigate">{{item}}</button>
      </router-link>
      <button class="button more" title="更多"
        :class="{ active: showCatOptions }"
        @click="showCatOptions = !showCatOptions"><IconMore />
      </button>
    </div>

    <div v-show="showCatOptions" class="panel">
      <div v-for="{ items, title } in otherItems" :key="title" class="big-cat">
        <div class="name">{{ title }}</div>
        <div class="cats">
          <router-link v-for="item in items" :key="item" :to="`/explore?category=${item}`" :class="['cat', item === activeItem && 'active']">
            <span>{{ item }}</span>
          </router-link>
        </div>
      </div>
    </div>

    <div class="playlists">
      <CoverRow
        type="playlist"
        :items="playlists"
        :sub-text="subText"
        :show-play-button="true"
        :show-play-count="activeItem !== '排行榜'"
        :image-size="activeItem !== '排行榜' ? 512 : 1024"
      />
    </div>
    <div v-show="['推荐歌单', '排行榜'].includes(activeItem) === false" class="load-more">
      <ButtonTwoTone
        v-show="showLoadMoreButton && hasMore"
        color="grey"
        :loading="loadingMore"
        @click="getPlaylist"
      >{{ $t('explore.loadMore') }}</ButtonTwoTone>
    </div>
  </div>
</template>

<script lang="ts">
import NProgress from 'nprogress'
import {
  topPlaylist,
  highQualityPlaylist,
  recommendPlaylist,
  toplists
} from '@/api/playlist'
import ButtonTwoTone from '@/components/ButtonTwoTone.vue'
import CoverRow from '@/components/CoverRow.vue'
import { IconMore } from '@/components/icons'
import { EXPLORE_ITEMS } from '@/const'
import { randomSlice, sleep } from '@/utils/common'
import { computed, defineComponent, onActivated, ref } from 'vue'
import { useRoute, RouterLink, onBeforeRouteUpdate } from 'vue-router'

export default defineComponent({
  name: 'Explore',
  components: {
    CoverRow,
    ButtonTwoTone,
    IconMore,
    RouterLink
  },
  setup () {
    const otherItems = EXPLORE_ITEMS.slice(1)
    const staticItems = EXPLORE_ITEMS[0].items.concat(otherItems.map(({ items }) => randomSlice(items, 1)[0]))
    const activeItem = ref(staticItems[0])
    const show = ref(false)
    const loadingMore = ref(false)
    const showLoadMoreButton = ref(false)
    const hasMore = ref(true)
    const showCatOptions = ref(false)
    const subText = computed(() => {
      switch (activeItem.value) {
        case '排行榜': return 'updateFrequency'
        case '推荐歌单': return 'copywriter'
        default: return 'none'
      }
    })
    const route = useRoute()
    function loadData () {
      sleep(1000).then(() => show.value || NProgress.start())
      activeItem.value = route.query.category as string ?? '全部'
      getPlaylist()
    }
    onActivated(loadData)

    onBeforeRouteUpdate((to, from, next) => {
      showLoadMoreButton.value = false
      hasMore.value = true
      playlists.value.length = 0
      activeItem.value = to.query.category as string
      getPlaylist()
      showCatOptions.value = false
      next()
    })

    // TODO: ADD TYPE
    const playlists = ref([])
    function getPlaylist () {
      loadingMore.value = true
      switch (activeItem.value) {
        case '推荐歌单': return getRecommendPlayList()
        case '精品歌单': return getHighQualityPlaylist()
        case '排行榜': return getTopLists()
        default: return getTopPlayList()
      }
    }
    async function getRecommendPlayList () {
      const data = await recommendPlaylist({ limit: 100 })
      playlists.value.length = 0
      updatePlaylist(data.result)
    }
    async function getHighQualityPlaylist () {
      const before = playlists.value.slice(-1)[0]?.updateTime ?? 0
      const data = await highQualityPlaylist({ limit: 50, before })
      updatePlaylist(data.playlists)
      hasMore.value = data.more
    }
    async function getTopLists () {
      const data = await toplists()
      playlists.value.length = 0
      updatePlaylist(data.list)
    }
    async function getTopPlayList () {
      const cat = activeItem.value
      const offset = playlists.value.length
      const data = await topPlaylist({ cat, offset })
      updatePlaylist(data.playlists)
      hasMore.value = data.more
    }
    function updatePlaylist (items: any[]) {
      playlists.value.push(...items)
      loadingMore.value = false
      showLoadMoreButton.value = true
      NProgress.done()
      show.value = true
    }

    return {
      otherItems,
      staticItems,
      activeItem,
      show,
      loadingMore,
      showLoadMoreButton,
      hasMore,
      showCatOptions,
      subText,
      playlists,
      getPlaylist
    }
  }
})
</script>

<style lang="scss" scoped>
h1 {
  color: var(--color-text);
  font-size: 56px;
}
.buttons {
  display: flex;
  flex-wrap: wrap;
}
.button {
  user-select: none;
  cursor: pointer;
  padding: 8px 16px;
  margin: 10px 16px 6px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
  border-radius: 10px;
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  transition: 0.2s;

  &:hover {
    background-color: var(--color-primary-bg);
    color: var(--color-primary);
  }
}

.button.active {
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}
.panel {
  margin-top: 10px;
  background: var(--color-secondary-bg);
  border-radius: 10px;
  padding: 8px;
  color: var(--color-text);

  .big-cat {
    display: flex;
    margin-bottom: 32px;
  }

  .name {
    font-size: 24px;
    font-weight: 700;
    opacity: 0.68;
    margin-left: 24px;
    min-width: 54px;
    height: 26px;
    margin-top: 8px;
  }
  .cats {
    margin-left: 24px;
    display: flex;
    flex-wrap: wrap;
  }
  .cat {
    user-select: none;
    margin: 4px 0 0 0;
    display: flex;
    // justify-content: center;
    align-items: center;
    font-weight: 500;
    font-size: 16px;
    transition: 0.2s;
    min-width: 98px;

    span {
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      padding: 6px 12px;
      height: 26px;
      border-radius: 10px;
      opacity: 0.88;
      &:hover {
        opacity: 1;
        background-color: var(--color-primary-bg);
        color: var(--color-primary);
      }
    }
  }
  .cat.active {
    color: var(--color-primary);
  }
}

.playlists {
  margin-top: 24px;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.button.more {
  .svg-icon {
    height: 24px;
    width: 24px;
  }
}
</style>
