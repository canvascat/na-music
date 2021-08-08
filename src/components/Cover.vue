<template>
  <div
    :class="['cover', 'flex-center', `cover-${type}`]"
    @click="clickCoverToPlay ? play() : goTo()"
  >
    <button
      class="play-button flex-center"
      @click.stop="play()"
    >
      <IconPlay />
    </button>
    <img :src="imageUrl" class="cover__inner" alt="cover">
    <img :src="imageUrl" :class="['cover-shadow', alwaysShowShadow && 'always-show']" alt="shadow">
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IconPlay } from '@/components/icons'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'

export default defineComponent({
  components: { IconPlay },
  props: {
    id: { type: Number, required: true },
    type: { type: String, required: true },
    imageUrl: { type: String, required: true },
    alwaysShowPlayButton: { type: Boolean, default: true },
    alwaysShowShadow: { type: Boolean, default: false },
    clickCoverToPlay: { type: Boolean, default: false },
    shadowMargin: { type: Number, default: 12 },
    radius: { type: Number, default: 12 }
  },
  setup (prop) {
    const store = useStore()
    function play () {
      const player = store.state.player
      const playActions = {
        album: player.playAlbumByID,
        playlist: player.playPlaylistByID,
        artist: player.playArtistByID
      }
      playActions[prop.type].bind(player)(prop.id)
    }
    const router = useRouter()
    function goTo () {
      const { type: name, id } = prop
      router.push({ name, params: { id } })
    }
    return {
      play,
      goTo
    }
  }
})
</script>

<style lang="scss" scoped>
.cover {
  position: relative;
  transition: transform 0.3s;
  &:hover .play-button {
    opacity: 1;
  }
  &:hover &-shadow {
    opacity: 1;
  }
  &__inner {
    border-radius: var(--cover-radius);
    width: 100%;
    display: block;
    user-select: none;
    cursor: pointer;
  }
  &-shadow {
    position: absolute;
    top: 12px;
    height: 100%;
    width: 100%;
    filter: blur(16px) opacity(0.6);
    transform: scale(0.92, 0.96);
    z-index: -1;
    background-size: cover;
    border-radius: var(--cover-radius);
    &:not(.always-show) {
      opacity: 0;
    }
  }
  &-artist {
    .cover__inner, .cover-shadow {
      border-radius: 50%;
    }
  }
}

.play-button {
  opacity: 0;
  color: white;
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.08);
  height: 30px;
  width: 30px;
  border-radius: 50%;
  transition: all .2s;
  position: absolute;
  .svg-icon {
    height: 12px;
    width: 12px;
    margin-left: 2px;
  }
  &:hover {
    // background-color: var(--color-primary);
    background-color: rgba(255, 255, 255, 0.28);
  }
  &:active {
    transform: scale(0.94);
  }
}
</style>
