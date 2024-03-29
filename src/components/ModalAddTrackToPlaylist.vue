<template>
  <Modal
    class="add-track-to-playlist-modal"
    :show="show"
    :close="close"
    title="添加到歌单"
    width="25vw"
  >
    <template v-slot:default>
      <div class="new-playlist-button" @click="newPlaylist">
        <IconPlus />新建歌单
      </div>
      <div
        v-for="playlist in ownPlaylists"
        :key="playlist.id"
        class="playlist"
        @click="addTrackToPlaylist(playlist.id)"
      >
        <img :src="resizeImage(playlist.coverImgUrl, 224)" alt="cover" />
        <div class="info">
          <div class="title">{{ playlist.name }}</div>
          <div class="track-count">{{ playlist.trackCount }} 首</div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import { mapState } from 'vuex'
import Modal from '@/components/Modal.vue'
import { IconPlus } from '@/components/icons'
import { addOrRemoveTrackFromPlaylist } from '@/api/playlist'
import { resizeImage } from '@/utils/filters'
import { useToast } from '@/hook'

const [toast] = useToast()

export default {
  name: 'ModalAddTrackToPlaylist',
  components: {
    Modal,
    IconPlus
  },
  data () {
    return {
      playlists: []
    }
  },
  computed: {
    ...mapState(['modals', 'data', 'liked']),
    ownPlaylists () {
      return this.liked.playlists.filter(
        p =>
          p.creator.userId === this.data.user.userId &&
          p.id !== this.data.likedSongPlaylistID
      )
    }
  },
  methods: {
    resizeImage,
    close () {
      this.show = false
    },
    addTrackToPlaylist (playlistID) {
      addOrRemoveTrackFromPlaylist({
        op: 'add',
        pid: playlistID,
        tracks: this.modals.addTrackToPlaylistModal.selectedTrackID
      }).then(data => {
        if (data.body.code === 200) {
          this.show = false
          toast(this.$t('toast.savedToPlaylist'))
        } else {
          toast(data.body.message)
        }
      })
    },
    newPlaylist () {
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
.new-playlist-button {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
  background: var(--color-secondary-bg-for-transparent);
  border-radius: 8px;
  height: 48px;
  margin-bottom: 16px;
  margin-right: 6px;
  margin-left: 6px;
  cursor: pointer;
  transition: 0.2s;
  .svg-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }
  &:hover {
    color: var(--color-primary);
    background: var(--color-primary-bg-for-transparent);
  }
}
.playlist {
  display: flex;
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: var(--color-secondary-bg-for-transparent);
  }
  img {
    border-radius: 8px;
    height: 42px;
    width: 42px;
    margin-right: 12px;
    border: 1px solid rgba(0, 0, 0, 0.04);
  }
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .title {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text);
    padding-right: 16px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    word-break: break-all;
  }
  .track-count {
    margin-top: 2px;
    font-size: 13px;
    opacity: 0.68;
    color: var(--color-text);
  }
}
</style>
