<template>
  <div class="fm" :style="{ background }" data-theme="dark" v-if="track">
    <img :src="nextTrackCover" v-show="false" alt="cover"/>
    <img alt="cover"
      class="cover"
      :src="resizeImage(track?.album.picUrl, 512)"
      @click="goToAlbum"
    />
    <div class="right-part">
      <div class="info">
        <div class="title">{{ track?.name }}</div>
        <div class="artist"><ArtistsInLine :artists="artists" /></div>
      </div>
      <div class="controls">
        <div class="buttons">
          <button-icon title="不喜欢" @click="moveToFMTrash"
            ><svg-icon id="thumbs-down" icon-class="thumbs-down"
          /></button-icon>
          <button-icon
            :title="$t(isPlaying ? 'player.pause' : 'player.play')"
            class="play"
            @click="play"
          >
            <svg-icon :icon-class="isPlaying ? 'pause' : 'play'"
          /></button-icon>
          <button-icon :title="$t('player.next')" @click="next"
            ><svg-icon icon-class="next" /></button-icon
        ></div>
        <div class="card-name"><svg-icon icon-class="fm" />私人FM</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ButtonIcon from '@/components/ButtonIcon.vue'
import ArtistsInLine from '@/components/ArtistsInLine.vue'
import Vibrant from 'node-vibrant'
import Color from 'color'
import { resizeImage } from '@/utils/filters'
import { computed, ref } from 'vue'
import store from '@/store'
import { useRouter } from 'vue-router'

async function createCoverColor (cover: string) {
  const palette = await new Vibrant(cover, { colorCount: 1 }).getPalette()
  const rgb = palette.Vibrant.rgb
  const color = Color.rgb(rgb).darken(0.1).rgb().string()
  const color2 = Color.rgb(rgb).lighten(0.28).rotate(-30).rgb().string()
  return `linear-gradient(to top left, ${color}, ${color2})`
}
function normlizeURL (url?: string) {
  if (!url) return ''
  return url.replace('http://', 'https://') + '?param=512y512'
}

export default {
  name: 'FMCard',
  components: { ButtonIcon, ArtistsInLine },
  setup () {
    const background = ref('')
    updateBackground()
    const player = store.state.player
    async function updateBackground () {
      console.log(player.personalFMTrack, '----')
      background.value = await createCoverColor(normlizeURL(player.personalFMTrack?.album?.picUrl))
    }
    const track = computed(() => player.personalFMTrack)
    const isPlaying = computed(() => player.playing && player.isPersonalFM)
    const artists = computed(() => track.value?.artists || [])
    const nextTrackCover = computed(() => normlizeURL(player.personalFMNextTrack?.album?.picUrl))
    function play () {
      player.playPersonalFM()
    }
    function next () {
      player.playNextTrack(true)
      updateBackground()
    }
    const router = useRouter()
    function goToAlbum () {
      if (!this.track?.album.id) return
      router.push({ path: '/album/' + this.track.album.id })
    }
    function moveToFMTrash () {
      player.moveToFMTrash()
      updateBackground()
    }
    return {
      background,
      nextTrackCover,
      track,
      isPlaying,
      artists,
      goToAlbum,
      play,
      next,
      moveToFMTrash,
      resizeImage
    }
  }
}
</script>

<style lang="scss" scoped>
.fm {
  padding: 1rem;
  background: var(--color-secondary-bg);
  border-radius: 1rem;
  display: flex;
  height: 198px;
  box-sizing: border-box;
}
.cover {
  height: 100%;
  clip-path: border-box;
  border-radius: 0.75rem;
  margin-right: 1.2rem;
  cursor: pointer;
  user-select: none;
}
.right-part {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--color-text);
  width: 100%;
  .title {
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 0.6rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    word-break: break-all;
  }
  .artist {
    opacity: 0.68;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    word-break: break-all;
  }
  .controls {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-left: -0.4rem;
    .buttons {
      display: flex;
    }
    .button-icon {
      margin: 0 8px 0 0;
    }
    .svg-icon {
      width: 24px;
      height: 24px;
    }
    .svg-icon#thumbs-down {
      width: 22px;
      height: 22px;
    }
    .card-name {
      font-size: 1rem;
      opacity: 0.18;
      display: flex;
      align-items: center;
      font-weight: 600;
      user-select: none;
      .svg-icon {
        width: 18px;
        height: 18px;
        margin-right: 6px;
      }
    }
  }
}
</style>
