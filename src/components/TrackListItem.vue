<template>
  <div
    class="track"
    tabindex="-1"
    :class="trackClass"
    :style="trackStyle"
    :title="track.reason"
  >
    <img
      v-if="!isAlbum"
      :src="imgUrl"
      alt="album"
      @click="goToAlbum"
    >
    <div v-if="showOrderNumber" class="no">
      <button v-show="focus && track.playable && !isPlaying" @click="playTrack">
        <IconPlay style="height: 14px; width: 14px" />
      </button>
      <span v-show="(!focus || !track.playable) && !isPlaying">{{
        track.no
      }}</span>
      <button v-show="isPlaying">
        <IconVolume style="height: 16px; width: 16px" />
      </button>
    </div>
    <div class="title-and-artist">
      <div class="container">
        <div class="title">
          {{ track.name }}
          <span v-if="isAlbum" class="featured">
            <ArtistsInLine
              :artists="track.ar"
              :exclude="$parent.albumObject.artist.name"
              prefix="-"
            /></span>
          <span v-if="isAlbum && track.mark === 1318912" class="explicit-symbol"><IconExplicit /></span>
          <span v-if="isTranslate" :title="translate" class="translate">
            ({{ translate }})
          </span>
        </div>
        <div v-if="!isAlbum" class="artist">
          <span
            v-if="track.mark === 1318912"
            class="explicit-symbol before-artist"
          ><IconExplicit /></span>
          <ArtistsInLine :artists="artists" />
        </div>
      </div>
    </div>

    <div v-if="showAlbumName" class="album">
      <router-link :to="`/album/${album.id}`">{{ album.name }}</router-link>
    </div>

    <div v-if="showLikeButton" class="actions">
      <button @click="likeThisSong">
        <IconHeartSolid v-if="isLiked" key="1" />
        <IconHeart v-else key="2" />
      </button>
    </div>
    <div v-if="showTrackTime" class="time">
      {{ formatTime(track.dt) }}
    </div>
  </div>
</template>

<script>
import ArtistsInLine from '@/components/ArtistsInLine.vue'
import { mapState } from 'vuex'
import { formatTime } from '@/utils/filters'
import { IconPlay, IconVolume, IconHeartSolid, IconHeart, IconExplicit } from '@/components/icons'
import store from '@/store'

export default {
  name: 'TrackListItem',
  components: { ArtistsInLine, IconExplicit, IconPlay, IconVolume, IconHeartSolid, IconHeart },

  props: {
    trackProp: Object,
    highlightPlayingTrack: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return { trackStyle: {} }
  },

  computed: {
    ...mapState(['settings']),
    track () {
      return this.type === 'cloudDisk'
        ? this.trackProp.simpleSong
        : this.trackProp
    },
    imgUrl () {
      const image =
        this.track?.al?.picUrl ??
        this.track?.album?.picUrl ??
        'https://p2.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg'
      return image + '?param=224y224'
    },
    artists () {
      if (this.track.ar !== undefined) return this.track.ar
      if (this.track.artists !== undefined) return this.track.artists
      return []
    },
    album () {
      return this.track.album || this.track.al || this.track?.simpleSong?.al
    },
    translate () {
      let t
      if (this.track?.tns?.length > 0) t = this.track.tns[0]
      else t = this.track.alia[0]
      return t
    },
    type () {
      return this.$parent.type
    },
    isAlbum () {
      return this.type === 'album'
    },
    isTranslate () {
      return this.track?.tns?.length > 0 || this.track.alia?.length > 0
    },
    isPlaylist () {
      return this.type === 'playlist'
    },
    isLiked () {
      return this.$parent.liked.songs.includes(this.track?.id)
    },
    isPlaying () {
      return store.state.player.currentTrack.id === this.track?.id
    },
    trackClass () {
      const trackClass = [this.type]
      if (!this.track.playable && this.showUnavailableSongInGreyStyle) { trackClass.push('disable') }
      if (this.isPlaying && this.highlightPlayingTrack) { trackClass.push('playing') }
      if (this.focus) trackClass.push('focus')
      return trackClass
    },
    isMenuOpened () {
      return this.$parent.rightClickedTrack.id === this.track.id
    },
    focus () {
      return true
    },
    showLikeButton () {
      return this.type !== 'tracklist' && this.type !== 'cloudDisk'
    },
    showOrderNumber () {
      return this.type === 'album'
    },
    showAlbumName () {
      return this.type !== 'album' && this.type !== 'tracklist'
    },
    showTrackTime () {
      return this.type !== 'tracklist'
    }
  },

  methods: {
    formatTime,
    goToAlbum () {
      this.$router.push({ path: '/album/' + this.track.al.id })
    },
    playTrack () {
      this.$parent.playThisList(this.track.id)
    },
    likeThisSong () {
      this.$parent.likeATrack(this.track.id)
    }
  }
}
</script>

<style lang="scss" scoped>
button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  background: transparent;
  border-radius: 25%;
  transition: transform 0.2s;
  .svg-icon {
    height: 16px;
    width: 16px;
    color: var(--color-primary);
  }
  &:hover {
    transform: scale(1.12);
  }
  &:active {
    transform: scale(0.96);
  }
}

.track {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  user-select: none;
  &:nth-child(2n) {
    background-color: var(--tracklistAltRowColor);
  }

  .no {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    margin: 0 20px 0 10px;
    width: 12px;
    color: var(--color-text);
    cursor: default;
    span {
      opacity: 0.58;
    }
  }

  .explicit-symbol {
    opacity: 0.28;
    color: var(--color-text);
    .svg-icon {
      margin-bottom: -3px;
      width: 16px;
      height: 1px;
    }
  }

  .explicit-symbol.before-artist {
    margin-right: 2px;
    .svg-icon {
      margin-bottom: -3px;
      width: 15px;
      height: 15px;
    }
  }

  img {
    border-radius: 8px;
    height: 46px;
    width: 46px;
    margin-right: 20px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    cursor: pointer;
  }

  .title-and-artist {
    flex: 1;
    display: flex;
    .container {
      display: flex;
      flex-direction: column;
    }
    .title {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text);
      cursor: default;
      padding-right: 16px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      word-break: break-all;
      .featured {
        margin-right: 2px;
        font-weight: 500;
        font-size: 14px;
        opacity: 0.72;
      }
      .translate {
        color: #aeaeae;
        margin-left: 4px;
      }
    }
    .artist {
      margin-top: 2px;
      font-size: 13px;
      opacity: 0.68;
      color: var(--color-text);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      a {
        span {
          margin-right: 3px;
          opacity: 0.8;
        }
        &:hover {
          text-decoration: underline;
          cursor: pointer;
        }
      }
    }
  }
  .album {
    flex: 1;
    display: flex;
    font-size: 16px;
    opacity: 0.88;
    color: var(--color-text);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  .time {
    font-size: 16px;
    width: 50px;
    cursor: default;
    display: flex;
    justify-content: flex-end;
    margin-right: 10px;
    font-variant-numeric: tabular-nums;
    opacity: 0.88;
    color: var(--color-text);
  }
}

.track:hover,
.track:focus {
  transition: all 0.3s;
  background: var(--color-secondary-bg);
}

.track.disable {
  img {
    filter: grayscale(1) opacity(0.6);
  }
  .title,
  .artist,
  .album,
  .time,
  .no,
  .featured {
    opacity: 0.28 !important;
  }
  &:hover {
    background: none;
  }
}

.track.tracklist {
  img {
    height: 36px;
    width: 36px;
    border-radius: 6px;
    margin-right: 14px;
    cursor: pointer;
  }
  .title {
    font-size: 16px;
  }
  .artist {
    font-size: 12px;
  }
}

.track.album {
  height: 32px;
}

.actions {
  width: 80px;
  display: flex;
  justify-content: flex-end;
}

.track.playing {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  .title,
  .album,
  .time,
  .title-and-artist .translate {
    color: var(--color-primary);
  }
  .title .featured,
  .artist,
  .explicit-symbol {
    color: var(--color-primary);
    opacity: 0.88;
  }
  .no span {
    color: var(--color-primary);
    opacity: 0.78;
  }
}
</style>
