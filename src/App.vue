<template>
  <div id="app">
    <Navbar v-if="showNavbar" />
    <main>
      <router-view v-if="keepAlive" v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
      <router-view v-else></router-view>
    </main>
    <transition name="slide-up">
      <Player v-if="enablePlayer" v-show="showPlayer" ref="player" />
    </transition>
    <template v-if="userState">
      <ModalAddTrackToPlaylist />
      <ModalNewPlaylist />
    </template>
    <transition v-if="enablePlayer" name="slide-up">
      <Lyrics v-show="showLyrics" />
    </transition>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted } from 'vue'
import ModalAddTrackToPlaylist from './components/ModalAddTrackToPlaylist.vue'
import ModalNewPlaylist from './components/ModalNewPlaylist.vue'
import Navbar from './components/Navbar.vue'
import Player from './components/Player.vue'
import { isAccountLoggedIn, isLooseLoggedIn } from '@/utils/auth'
import Lyrics from './views/lyrics.vue'
import { useStore } from './store'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'App',
  components: {
    Navbar,
    Player,
    ModalAddTrackToPlaylist,
    ModalNewPlaylist,
    Lyrics
  },
  setup () {
    const route = useRoute()
    const store = useStore()
    const player = store.state.player
    function handleKeydown (e: KeyboardEvent) {
      if (e.code !== 'Space') return
      if ((e.target as HTMLElement).tagName === 'INPUT') return false
      if (route.name === 'mv') return false
      e.preventDefault()
      player.playOrPause()
    }
    onMounted(() => {
      document.addEventListener('keydown', handleKeydown)
    })
    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
    })
    const userState = computed(isAccountLoggedIn)
    const showLyrics = computed(() => store.state.showLyrics)
    const settings = computed(() => store.state.settings)
    const enablePlayer = computed(() => player.enabled && route.name !== 'lastfmCallback')
    const showNavbar = computed(() => route.name !== 'lastfmCallback')
    const keepAlive = computed(() => route.meta.keepAlive as boolean)
    const showPlayer = computed(() => ![
      'mv',
      'loginUsername',
      'login',
      'loginAccount',
      'lastfmCallback'
    ].includes(route.name as string))

    if (isLooseLoggedIn()) {
      store.dispatch('fetchLikedSongs')
      store.dispatch('fetchLikedSongsWithDetails')
      store.dispatch('fetchLikedPlaylist')
      if (userState.value) {
        store.dispatch('fetchLikedAlbums')
        store.dispatch('fetchLikedArtists')
        store.dispatch('fetchLikedMVs')
        store.dispatch('fetchCloudDisk')
      }
    }

    return {
      userState,
      showPlayer,
      showLyrics,
      settings,
      enablePlayer,
      showNavbar,
      keepAlive
    }
  }
})
</script>

<style lang="scss">
#app {
  width: 100%;
  transition: all 0.4s;
  user-select: none;
}

main {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  overflow: auto;
  padding: 64px 10vw 96px 10vw;
  box-sizing: border-box;
}

@media (max-width: 1336px) {
  main {
    padding: 64px 5vw 96px 5vw;
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s;
}
.slide-up-enter,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
