<template>
  <div v-show="show" class="playlist">
    <div v-if="specialPlaylistInfo === undefined && !isLikeSongsPage" class="playlist-info">
      <Cover
        :id="playlist.id"
        :image-url="resizeImage(playlist.coverImgUrl, 1024)"
        :show-play-button="true"
        :always-show-shadow="true"
        :click-cover-to-play="true"
        type="playlist"
        @click.right="openMenu"
      />
      <div class="info">
        <div class="title" @click.right="openMenu">
          <span v-if="playlist.privacy === 10" class="lock-icon">
            <IconLock />
          </span>
          {{ playlist.name }}
        </div>
        <div class="artist">
          Playlist by
          <span
            v-if="
              [
                5277771961,
                5277965913,
                5277969451,
                5277778542,
                5278068783,
              ].includes(playlist.id)
            "
            style="font-weight: 600"
          >Apple Music</span>
          <a
            v-else
            :href="`https://music.163.com/#/user/home?id=${playlist.creator.userId}`"
            target="blank"
          >{{ playlist.creator.nickname }}</a>
        </div>
        <div class="date-and-count">
          {{ $t('playlist.updatedAt') }}
          {{ formatDate(playlist.updateTime) }} · {{ playlist.trackCount }}
          {{ $t('common.songs') }}
        </div>
        <div class="description" @click="toggleFullDescription">{{ playlist.description }}</div>
        <div class="buttons">
          <ButtonTwoTone @click="playPlaylistByID()">
            <template #icon>
              <IconPlay />
            </template>
            {{ $t('common.play') }}
          </ButtonTwoTone>
          <ButtonTwoTone
            v-if="playlist.creator.userId !== data.user.userId"
            :horizontal-padding="0"
            :color="playlist.subscribed ? 'blue' : 'grey'"
            :text-color="playlist.subscribed ? '#335eea' : ''"
            :background-color="
              playlist.subscribed ? 'var(--color-secondary-bg)' : ''
            "
            @click="likePlaylist"
          >
            <template #icon>
              <IconHeartSolid v-if="playlist.subscribed" />
              <IconHeart v-else />
            </template>
          </ButtonTwoTone>
          <ButtonTwoTone :horizontal-padding="0" color="grey" @click="openMenu">
            <template #icon>
              <IconMore />
            </template>
          </ButtonTwoTone>
        </div>
      </div>
      <div v-if="displaySearchInPlaylist" class="search-box">
        <div class="container" :class="{ active: inputFocus }">
          <IconSearch />
          <div class="input">
            <input
              v-model.trim="inputSearchKeyWords"
              v-focus
              :placeholder="inputFocus ? '' : $t('playlist.search')"
              @input="inputDebounce()"
              @focus="inputFocus = true"
              @blur="inputFocus = false"
            >
          </div>
        </div>
      </div>
    </div>
    <div v-if="specialPlaylistInfo !== undefined" class="special-playlist">
      <div class="title" :class="specialPlaylistInfo.gradient" @click.right="openMenu">
        <!-- <img :src="resizeImage(playlist.coverImgUrl)" /> -->
        {{ specialPlaylistInfo.name }}
      </div>
      <div class="subtitle">{{ playlist.englishTitle }} · {{ playlist.updateFrequency }}</div>

      <div class="buttons">
        <ButtonTwoTone class="play-button" color="grey" @click="playPlaylistByID()">
          <template #icon>
            <IconPlay />
          </template>
          {{ $t('common.play') }}
        </ButtonTwoTone>
        <ButtonTwoTone
          v-if="playlist.creator.userId !== data.user.userId"
          :horizontal-padding="0"
          :color="playlist.subscribed ? 'blue' : 'grey'"
          :text-color="playlist.subscribed ? '#335eea' : ''"
          :background-color="
            playlist.subscribed ? 'var(--color-secondary-bg)' : ''
          "
          @click="likePlaylist"
        >
          <template #icon>
            <IconHeartSolid v-if="playlist.subscribed" />
            <IconHeart v-else />
          </template>
        </ButtonTwoTone>
        <ButtonTwoTone :horizontal-padding="0" color="grey" @click="openMenu">
          <template #icon>
            <IconMore />
          </template>
        </ButtonTwoTone>
      </div>
    </div>

    <div v-if="isLikeSongsPage" class="user-info">
      <h1>
        <img class="avatar" :src="resizeImage(data.user.avatarUrl)" alt="avatar">
        {{
          data.user.nickname
        }}{{ $t('library.sLikedSongs') }}
      </h1>
      <div class="search-box-likepage" @click="searchInPlaylist()">
        <div class="container" :class="{ active: inputFocus }">
          <IconSearch />
          <div class="input" :style="{ width: searchInputWidth }">
            <input
              v-if="displaySearchInPlaylist"
              v-model.trim="inputSearchKeyWords"
              v-focus
              :placeholder="inputFocus ? '' : $t('playlist.search')"
              @input="inputDebounce()"
              @focus="inputFocus = true"
              @blur="inputFocus = false"
            >
          </div>
        </div>
      </div>
    </div>

    <TrackList
      :id="playlist.id"
      :tracks="filteredTracks"
      type="playlist"
      :extra-context-menu-item="
        isUserOwnPlaylist ? ['removeTrackFromPlaylist'] : []
      "
    />

    <div class="load-more">
      <ButtonTwoTone
        v-show="hasMore"
        color="grey"
        :loading="loadingMore"
        @click="loadMore(100)"
      >
        {{ $t('explore.loadMore') }}
      </ButtonTwoTone>
    </div>

    <Modal
      :show="showFullDescription"
      :close="toggleFullDescription"
      :click-outside-hide="true"
      title="歌单介绍"
    >
      {{ playlist.description }}
    </Modal>

    <ContextMenu ref="playlistMenu">
      <!-- <div class="item">{{ $t('contextMenu.addToQueue') }}</div> -->
      <div class="item" @click="likePlaylist(true)">
        {{
          playlist.subscribed
            ? $t('contextMenu.removeFromLibrary')
            : $t('contextMenu.saveToLibrary')
        }}
      </div>
      <div class="item" @click="searchInPlaylist()">
        {{
          $t('contextMenu.searchInPlaylist')
        }}
      </div>
      <div
        v-if="playlist.creator.userId === data.user.userId"
        class="item"
        @click="editPlaylist"
      >
        编辑歌单信息
      </div>
      <div
        v-if="playlist.creator.userId === data.user.userId"
        class="item"
        @click="deletePlaylist"
      >
        删除歌单
      </div>
    </ContextMenu>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapMutations, mapState } from 'vuex'
import NProgress from 'nprogress'
import {
  getPlaylistDetail,
  subscribePlaylist,
  deletePlaylist
} from '@/api/playlist'
import { getTrackDetail } from '@/api/track'
import { isAccountLoggedIn } from '@/utils/auth'

import ButtonTwoTone from '@/components/ButtonTwoTone.vue'
import ContextMenu from '@/components/ContextMenu.vue'
import TrackList from '@/components/TrackList.vue'
import Cover from '@/components/Cover.vue'
import Modal from '@/components/Modal.vue'
import { IconLock, IconSearch, IconHeart, IconHeartSolid, IconMore, IconPlay } from '@/components/icons'
import { resizeImage, formatDate } from '@/utils/filters'
import { useToast } from '@/hook'
import { specialPlaylist } from '@/const'

const [toast] = useToast()

export default defineComponent({
  name: 'Playlist',
  components: {
    Cover,
    ButtonTwoTone,
    TrackList,
    Modal,
    ContextMenu,
    IconLock,
    IconSearch,
    IconHeart,
    IconHeartSolid,
    IconMore,
    IconPlay
  },
  directives: {
    focus: {
      mounted (el) {
        el.focus()
      }
    }
  },
  data () {
    return {
      show: false,
      playlist: {
        id: 0,
        coverImgUrl: '',
        creator: {
          userId: ''
        },
        trackIds: []
      },
      showFullDescription: false,
      tracks: [],
      loadingMore: false,
      hasMore: false,
      lastLoadedTrackIndex: 9,
      displaySearchInPlaylist: false, // 是否显示搜索框
      searchKeyWords: '', // 搜索使用的关键字
      inputSearchKeyWords: '', // 搜索框中正在输入的关键字
      inputFocus: false,
      debounceTimeout: null,
      searchInputWidth: '0px' // 搜索框宽度
    }
  },
  computed: {
    ...mapState(['player', 'data']),
    isLikeSongsPage () {
      return this.$route.name === 'likedSongs'
    },
    specialPlaylistInfo () {
      return specialPlaylist[this.playlist.id]
    },
    isUserOwnPlaylist () {
      return (
        this.playlist.creator.userId === this.data.user.userId &&
        this.playlist.id !== this.data.likedSongPlaylistID
      )
    },
    filteredTracks () {
      return this.tracks.filter(
        track =>
          (track.name &&
            track.name
              .toLowerCase()
              .includes(this.searchKeyWords.toLowerCase())) ||
          (track.al.name &&
            track.al.name
              .toLowerCase()
              .includes(this.searchKeyWords.toLowerCase())) ||
          track.ar.find(
            artist =>
              artist.name &&
              artist.name
                .toLowerCase()
                .includes(this.searchKeyWords.toLowerCase())
          )
      )
    }
  },
  created () {
    if (this.$route.name === 'likedSongs') {
      this.loadData(this.data.likedSongPlaylistID)
    } else {
      this.loadData(this.$route.params.id)
    }
    setTimeout(() => {
      if (!this.show) NProgress.start()
    }, 1000)
  },
  methods: {
    resizeImage,
    formatDate,
    ...mapMutations(['appendTrackToPlayerList']),
    playPlaylistByID (trackID = 'first') {
      const trackIDs = this.playlist.trackIds.map(t => t.id)
      this.$store.state.player.replacePlaylist(
        trackIDs,
        this.playlist.id,
        'playlist',
        trackID
      )
    },
    likePlaylist (showToast = false) {
      if (!isAccountLoggedIn()) {
        toast(this.$t('toast.needToLogin'))
        return
      }
      subscribePlaylist({
        id: this.playlist.id,
        t: this.playlist.subscribed ? 2 : 1
      }).then(data => {
        if (data.code === 200) {
          this.playlist.subscribed = !this.playlist.subscribed
          if (showToast === true) {
            toast(
              this.playlist.subscribed ? '已保存到音乐库' : '已从音乐库删除'
            )
          }
        }
        getPlaylistDetail(this.id, true).then(data => {
          this.playlist = data.playlist
        })
      })
    },
    loadData (id, next = undefined) {
      this.id = id
      getPlaylistDetail(this.id, true)
        .then(data => {
          this.playlist = data.playlist
          this.tracks = data.playlist.tracks
          NProgress.done()
          if (next !== undefined) next()
          this.show = true
          this.lastLoadedTrackIndex = data.playlist.tracks.length - 1
          return data
        })
        .then(() => {
          if (this.playlist.trackCount > this.tracks.length) {
            this.loadingMore = true
            this.loadMore()
          }
        })
    },
    loadMore (loadNum = 100) {
      let trackIDs = this.playlist.trackIds.filter((t, index) =>
        index > this.lastLoadedTrackIndex &&
        index <= this.lastLoadedTrackIndex + loadNum && t
      )
      trackIDs = trackIDs.map(t => t.id)
      getTrackDetail(trackIDs.join(',')).then(data => {
        this.tracks.push(...data.songs)
        this.lastLoadedTrackIndex += trackIDs.length
        this.loadingMore = false
        this.hasMore = this.lastLoadedTrackIndex + 1 !== this.playlist.trackIds.length
      })
    },
    openMenu (e) {
      this.$refs.playlistMenu.openMenu(e)
    },
    deletePlaylist () {
      if (!isAccountLoggedIn()) {
        toast(this.$t('toast.needToLogin'))
        return
      }
      const confirmation = confirm(`确定要删除歌单 ${this.playlist.name}？`)
      if (confirmation === true) {
        deletePlaylist(this.playlist.id).then(data => {
          if (data.code === 200) {
            alert(`已删除歌单 ${this.playlist.name}`)
            this.$router.go(-1)
          } else {
            alert('发生错误')
          }
        })
      }
    },
    editPlaylist () {
      alert('此功能开发中')
    },
    searchInPlaylist () {
      this.displaySearchInPlaylist =
        !this.displaySearchInPlaylist || this.isLikeSongsPage
      if (this.displaySearchInPlaylist === false) {
        this.searchKeyWords = ''
        this.inputSearchKeyWords = ''
      } else {
        this.searchInputWidth = '172px'
        this.loadMore(500)
      }
    },
    removeTrack (trackID) {
      if (!isAccountLoggedIn()) {
        toast(this.$t('toast.needToLogin'))
        return
      }
      this.tracks = this.tracks.filter(t => t.id !== trackID)
    },
    inputDebounce () {
      if (this.debounceTimeout) clearTimeout(this.debounceTimeout)
      this.debounceTimeout = setTimeout(() => {
        this.searchKeyWords = this.inputSearchKeyWords
      }, 600)
    },
    toggleFullDescription () {
      this.showFullDescription = !this.showFullDescription
      // TODO: change scroll
    }
  }
})
</script>

<style lang="scss" scoped>
.playlist {
  margin-top: 32px;
}
.playlist-info {
  display: flex;
  margin-bottom: 72px;
  position: relative;
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    margin-left: 56px;
    .title {
      font-size: 36px;
      font-weight: 700;
      color: var(--color-text);

      .lock-icon {
        opacity: 0.28;
        color: var(--color-text);
        margin-right: 8px;
        .svg-icon {
          height: 26px;
          width: 26px;
        }
      }
    }
    .artist {
      font-size: 18px;
      opacity: 0.88;
      color: var(--color-text);
      margin-top: 24px;
    }
    .date-and-count {
      font-size: 14px;
      opacity: 0.68;
      color: var(--color-text);
      margin-top: 2px;
    }
    .description {
      font-size: 14px;
      opacity: 0.68;
      color: var(--color-text);
      margin-top: 24px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      cursor: pointer;
      &:hover {
        transition: opacity 0.3s;
        opacity: 0.88;
      }
    }
    .buttons {
      margin-top: 32px;
      display: flex;
      button {
        margin-right: 16px;
      }
    }
  }
}

.special-playlist {
  margin-top: 192px;
  margin-bottom: 128px;
  border-radius: 1.25em;
  text-align: center;

  @keyframes letterSpacing4 {
    from {
      letter-spacing: 0px;
    }

    to {
      letter-spacing: 4px;
    }
  }

  @keyframes letterSpacing1 {
    from {
      letter-spacing: 0px;
    }

    to {
      letter-spacing: 1px;
    }
  }

  .title {
    font-size: 84px;
    line-height: 1.05;
    font-weight: 700;
    text-transform: uppercase;

    letter-spacing: 4px;
    animation-duration: 0.8s;
    animation-name: letterSpacing4;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    -webkit-background-clip: text;
    // background-image: linear-gradient(
    //   225deg,
    //   var(--color-primary),
    //   var(--color-primary)
    // );

    img {
      height: 78px;
      border-radius: 0.125em;
      margin-right: 24px;
    }
  }
  .subtitle {
    font-size: 18px;
    letter-spacing: 1px;
    margin: 28px 0 54px 0;
    animation-duration: 0.8s;
    animation-name: letterSpacing1;
    text-transform: uppercase;
    color: var(--color-text);
  }
  .buttons {
    margin-top: 32px;
    display: flex;
    justify-content: center;
    button {
      margin-right: 16px;
    }
  }
}

.gradient-test {
  background-image: linear-gradient(to left, #92fe9d 0%, #00c9ff 100%);
}

[data-theme="dark"] {
  .gradient-radar {
    background-image: linear-gradient(to left, #92fe9d 0%, #00c9ff 100%);
  }
}

.gradient-radar {
  background-image: linear-gradient(to left, #0ba360 0%, #3cba92 100%);
}

.gradient-blue-purple {
  background-image: linear-gradient(
    45deg,
    #89c4f5 0%,
    #6284ff 42%,
    #ff0000 100%
  );
}

.gradient-sharp-blue {
  background-image: linear-gradient(45deg, #00c6fb 0%, #005bea 100%);
}

.gradient-yellow-pink {
  background-image: linear-gradient(45deg, #f6d365 0%, #fda085 100%);
}

.gradient-pink {
  background-image: linear-gradient(45deg, #ee9ca7 0%, #ffdde1 100%);
}

.gradient-indigo-pink-yellow {
  background-image: linear-gradient(
    43deg,
    #4158d0 0%,
    #c850c0 46%,
    #ffcc70 100%
  );
}

.gradient-light-red-light-blue {
  background-image: linear-gradient(
    225deg,
    hsl(190, 30%, 50%) 0%,
    #081abb 38%,
    #ec3841 58%,
    hsl(13, 99%, 49%) 100%
  );
}

.gradient-fog {
  background: linear-gradient(-180deg, #bcc5ce 0%, #929ead 98%),
    radial-gradient(
      at top left,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(0, 0, 0, 0.3) 100%
    );
  background-blend-mode: screen;
}

.gradient-red {
  background-image: linear-gradient(213deg, #ff0844 0%, #ffb199 100%);
}

.gradient-sky-blue {
  background-image: linear-gradient(147deg, #48c6ef 0%, #6f86d6 100%);
}

.gradient-dark-blue-midnight-blue {
  background-image: linear-gradient(213deg, #09203f 0%, #537895 100%);
}

.gradient-yellow-red {
  background: linear-gradient(147deg, #fec867 0%, #f72c61 100%);
}

.gradient-yellow {
  background: linear-gradient(147deg, #fceb02 0%, #fec401 100%);
}

.gradient-midnight-blue {
  background-image: linear-gradient(-20deg, #2b5876 0%, #4e4376 100%);
}

.gradient-orange-red {
  background-image: linear-gradient(147deg, #ffe53b 0%, #ff2525 74%);
}

.gradient-moonstone-blue {
  background-image: linear-gradient(
    147deg,
    hsl(200, 34%, 8%) 0%,
    hsl(204, 35%, 38%) 50%,
    hsl(200, 34%, 18%) 100%
  );
}

.gradient-pink-purple-blue {
  background-image: linear-gradient(
    to right,
    #ff3cac 0%,
    #784ba0 50%,
    #2b86c5 100%
  ) !important;
}

.gradient-green {
  background-image: linear-gradient(
    90deg,
    #c6f6d5,
    #68d391,
    #38b2ac
  ) !important;
}

.user-info {
  h1 {
    font-size: 42px;
    position: relative;
    color: var(--color-text);
    .avatar {
      height: 44px;
      margin-right: 12px;
      vertical-align: -7px;
      border-radius: 50%;
      border: rgba(0, 0, 0, 0.2);
    }
  }
}

.search-box {
  display: flex;
  position: absolute;
  right: 20px;
  bottom: -55px;
  justify-content: flex-end;
  -webkit-app-region: no-drag;

  .container {
    display: flex;
    align-items: center;
    height: 32px;
    background: var(--color-secondary-bg-for-transparent);
    border-radius: 8px;
    width: 200px;
  }

  .svg-icon {
    height: 15px;
    width: 15px;
    color: var(--color-text);
    opacity: 0.28;
    margin: {
      left: 8px;
      right: 4px;
    }
  }

  input {
    font-size: 16px;
    border: none;
    background: transparent;
    width: 96%;
    font-weight: 600;
    margin-top: -1px;
    color: var(--color-text);
  }

  .active {
    background: var(--color-primary-bg-for-transparent);
    input,
    .svg-icon {
      opacity: 1;
      color: var(--color-primary);
    }
  }
}

[data-theme="dark"] {
  .search-box {
    .active {
      input,
      .svg-icon {
        color: var(--color-text);
      }
    }
  }
}

.search-box-likepage {
  display: flex;
  position: absolute;
  right: 12vw;
  top: 95px;
  justify-content: flex-end;
  -webkit-app-region: no-drag;

  .input {
    transition: all 0.5s;
  }

  .container {
    display: flex;
    align-items: center;
    height: 32px;
    background: var(--color-secondary-bg-for-transparent);
    border-radius: 8px;
  }

  .svg-icon {
    height: 15px;
    width: 15px;
    color: var(--color-text);
    opacity: 0.28;
    margin: {
      left: 8px;
      right: 8px;
    }
  }

  input {
    font-size: 16px;
    border: none;
    background: transparent;
    width: 96%;
    font-weight: 600;
    margin-top: -1px;
    color: var(--color-text);
  }

  .active {
    background: var(--color-primary-bg-for-transparent);
    input,
    .svg-icon {
      opacity: 1;
      color: var(--color-primary);
    }
  }
}

[data-theme="dark"] {
  .search-box-likepage {
    .active {
      input,
      .svg-icon {
        color: var(--color-text);
      }
    }
  }
}

@media (max-width: 1336px) {
  .search-box-likepage {
    right: 8vw;
  }
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>
