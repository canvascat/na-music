<template>
  <div class="player" @click="toggleLyrics">
    <div
      class="progress-bar"
      @click.stop
    >
      <vue-slider
        v-model="player.progress"
        :min="0"
        :max="player.currentTrackDuration"
        :interval="1"
        :drag-on-click="true"
        :duration="0"
        :dot-size="12"
        :height="2"
        :tooltip-formatter="formatTrackTime"
        :lazy="true"
        :silent="true"
      />
    </div>
    <div class="controls">
      <div class="playing">
        <div class="container" @click.stop>
          <img
            :src="resizeImage(currentTrack.al && currentTrack.al.picUrl, 224)"
            alt="cover"
            @click="goToAlbum"
          >
          <div class="track-info">
            <div class="name" @click="goToList">{{ currentTrack.name }}</div>
            <div class="artist">
              <span
                v-for="(ar, index) in currentTrack.ar"
                :key="ar.id"
                @click="ar.id !== 0 && goToArtist(ar.id)"
              >
                <span :class="ar.id !== 0 ? 'ar' : ''">{{ ar.name }}</span>
                <span v-if="index !== currentTrack.ar.length - 1">,</span>
              </span>
            </div>
          </div>
          <div class="like-button">
            <button-icon :title="$t('player.like')" @click="likeATrack(player.currentTrack.id)">
              <IconHeartSolid v-if="player.isCurrentTrackLiked" />
              <IconHeart v-else />
            </button-icon>
          </div>
        </div>
        <div class="blank"></div>
      </div>
      <div class="middle-control-buttons">
        <div class="blank"></div>
        <div class="container" @click.stop>
          <button-icon
            v-show="!player.isPersonalFM"
            :title="$t('player.previous')"
            @click="player.playPrevTrack"
          >
            <IconPrev />
          </button-icon>
          <button-icon v-show="player.isPersonalFM" title="不喜欢" @click="player.moveToFMTrash">
            <IconThumbsDown />
          </button-icon>
          <button-icon
            class="play"
            :title="$t(player.playing ? 'player.pause' : 'player.play')"
            @click="() => player.playOrPause()"
          >
            <IconPause v-if="player.playing" />
            <IconPlay v-else />
          </button-icon>
          <button-icon :title="$t('player.next')" @click="() => player.playNextTrack()">
            <IconNext />
          </button-icon>
        </div>
        <div class="blank"></div>
      </div>
      <div class="right-control-buttons">
        <div class="blank"></div>
        <div class="container" @click.stop>
          <button-icon
            :title="$t('player.nextUp')"
            :class="{
              active: $route.name === 'next',
              disabled: player.isPersonalFM
            }"
            @click="goToNextTracksPage"
          >
            <IconList />
          </button-icon>
          <button-icon
            :class="{
              active: player.repeatMode !== 'off',
              disabled: player.isPersonalFM
            }"
            :title="
              player.repeatMode === 'one'
                ? $t('player.repeatTrack')
                : $t('player.repeat')
            "
            @click="player.switchRepeatMode"
          >
            <icon-repeat-1 v-if="player.repeatMode === 'one'" />
            <icon-repeat v-else />
          </button-icon>
          <button-icon
            :class="{ active: player.shuffle, disabled: player.isPersonalFM }"
            :title="$t('player.shuffle')"
            @click="player.switchShuffle"
          >
            <IconShuffle />
          </button-icon>
          <div class="volume-control">
            <button-icon :title="$t('player.mute')" @click="player.mute">
              <icon-volume v-if="volume > 0.5" />
              <icon-volume-mute v-else-if="volume === 0" />
              <!-- volume <= 0.5 && volume !== 0" -->
              <icon-volume-half v-else />
            </button-icon>
            <div class="volume-bar">
              <vue-slider
                v-model="volume"
                :min="0"
                :max="1"
                :interval="0.01"
                :drag-on-click="true"
                :duration="0"
                tooltip="none"
                :dot-size="12"
              />
            </div>
          </div>

          <button-icon
            class="lyrics-button"
            title="歌词"
            style="margin-left: 12px"
            @click="toggleLyrics"
          >
            <IconArrowUp />
          </button-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ButtonIcon from '@/components/ButtonIcon.vue'
import VueSlider from 'vue-slider-component'
import { resizeImage } from '@/utils/filters'
import {
  IconHeart,
  IconHeartSolid,
  IconPrev,
  IconPause,
  IconPlay,
  IconNext,
  IconList,
  IconRepeat,
  IconRepeat1,
  IconShuffle,
  IconVolume,
  IconVolumeMute,
  IconVolumeHalf,
  IconArrowUp,
  IconThumbsDown
} from '@/components/icons'
import { useStore } from '@/store'
import { computed, defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatTrackTime } from '@/utils/common'

export default defineComponent({
  name: 'Player',
  components: {
    ButtonIcon,
    VueSlider,
    IconHeart,
    IconHeartSolid,
    IconPrev,
    IconPause,
    IconPlay,
    IconNext,
    IconList,
    IconRepeat,
    IconRepeat1,
    IconShuffle,
    IconVolume,
    IconVolumeMute,
    IconVolumeHalf,
    IconArrowUp,
    IconThumbsDown
  },
  setup () {
    const { state, commit, dispatch } = useStore()
    const player = computed(() => state.player)
    const currentTrack = computed(() => player.value.currentTrack)
    const playing = computed(() => player.value.playing)
    const volume = computed({
      get () {
        return player.value.volume
      },
      set (val: number) {
        player.value.volume = val
      }
    })

    const router = useRouter()
    const route = useRoute()
    function goToNextTracksPage () {
      if (player.value.isPersonalFM) return
      route.name === 'next'
        ? router.go(-1)
        : router.push({ name: 'next' })
    }
    function goToList () {
      const source = player.value.playlistSource
      if (source.id === state.data.likedSongPlaylistID) {
        router.push('/library/liked-songs')
      } else if (source.type === 'url') {
        router.push(String(source.id))
      } else if (source.type === 'cloudDisk') {
        router.push('/library')
      } else {
        const path = `/${source.type}/${source.id}`
        router.push(path)
      }
    }
    function goToAlbum () {
      const { id } = player.value.currentTrack.al
      if (id === 0) return
      router.push(`/album/${id}`)
    }
    function goToArtist (id: number) {
      router.push(`/artist/${id}`)
    }

    const toggleLyrics = () => commit('toggleLyrics')
    const likeATrack = (id: number) => dispatch('likeATrack', id)

    return {
      player,
      currentTrack,
      playing,
      volume,

      resizeImage,
      goToNextTracksPage,
      formatTrackTime,
      goToList,
      goToAlbum,
      goToArtist,

      toggleLyrics,
      likeATrack
    }
  }
})
</script>

<style lang="scss" scoped>
.player {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 64px;
  backdrop-filter: saturate(180%) blur(30px);
  // background-color: rgba(255, 255, 255, 0.86);
  background-color: var(--color-navbar-bg);
  z-index: 100;
}

@supports (-moz-appearance: none) {
  .player {
    background-color: var(--color-body-bg);
  }
}

.progress-bar {
  margin-top: -6px;
  margin-bottom: -6px;
  width: 100%;
}

.controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 100%;
  padding: {
    right: 10vw;
    left: 10vw;
  }
}

@media (max-width: 1336px) {
  .controls {
    padding: 0 5vw;
  }
}

.blank {
  flex-grow: 1;
}

.playing {
  display: flex;
}

.playing .container {
  display: flex;
  align-items: center;
  img {
    height: 46px;
    border-radius: 5px;
    box-shadow: 0 6px 8px -2px rgba(0, 0, 0, 0.16);
    cursor: pointer;
    user-select: none;
  }
  .track-info {
    height: 46px;
    margin-left: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .name {
      font-weight: 600;
      font-size: 16px;
      opacity: 0.88;
      color: var(--color-text);
      margin-bottom: 4px;
      cursor: pointer;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      word-break: break-all;
      &:hover {
        text-decoration: underline;
      }
    }
    .artist {
      font-size: 12px;
      opacity: 0.58;
      color: var(--color-text);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      word-break: break-all;
      span.ar {
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

.middle-control-buttons {
  display: flex;
}

.middle-control-buttons .container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
  .svg-icon {
    width: 24px;
    height: 24px;
  }
}

.right-control-buttons {
  display: flex;
}

.right-control-buttons .container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  .expand {
    margin-left: 24px;
    .svg-icon {
      height: 24px;
      width: 24px;
    }
  }
  .active .svg-icon {
    color: var(--color-primary);
  }
  .volume-control {
    margin-left: 4px;
    display: flex;
    align-items: center;
    .volume-bar {
      width: 84px;
    }
  }
}

.like-button {
  margin-left: 16px;
}

.button-icon.disabled {
  cursor: default;
  opacity: 0.38;
  &:hover {
    background: none;
  }
  &:active {
    transform: unset;
  }
}
</style>
