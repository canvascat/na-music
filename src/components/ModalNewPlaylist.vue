<template>
  <Modal class="add-playlist-modal" :show="show" :close="close" title="新建歌单" width="25vw">
    <template v-slot:default>
      <input v-model="title" type="text" placeholder="歌单标题" maxlength="40" />
      <div class="checkbox">
        <input id="checkbox-private" v-model="privatePlaylist" type="checkbox" />
        <label for="checkbox-private">设置为隐私歌单</label>
      </div>
    </template>
    <template v-slot:footer>
      <button class="primary block" @click="submitCreatePlaylist">创建</button>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Modal from '@/components/Modal.vue'
import { createPlaylist, addOrRemoveTrackFromPlaylist } from '@/api/playlist'
import { useToast } from '@/hook'
import store from '@/store'

const [toast] = useToast()

export default defineComponent({
  name: 'ModalNewPlaylist',
  components: {
    Modal
  },
  props: {
    show: Boolean
  },
  emits: ['update:show'],
  setup (prop, context) {
    const title = ref('')
    const privatePlaylist = ref(false)

    async function submitCreatePlaylist () {
      const params: Record<string, any> = { name: title.value }
      if (privatePlaylist.value) params.type = 10
      let data = await createPlaylist(params)
      if (data.code !== 200) return
      const tracks = 123
      data = await addOrRemoveTrackFromPlaylist({ op: 'add', pid: data.id, tracks })
      if (data.body.code === 200) {
        toast(this.$t('toast.savedToPlaylist'))
      } else {
        toast(data.body.message)
      }
      this.resetAfterCreateAddTrackID()
      close()
      toast('成功创建歌单')
      store.dispatch('updateData', { key: 'libraryPlaylistFilter', value: 'mine' })
      store.dispatch('fetchLikedPlaylist')
    }
    function close () {
      context.emit('update:show', false)
      title.value = ''
      privatePlaylist.value = false
      // modal.newPlaylistModal.AfterCreateAddTrackID = 0
    }
    return {
      submitCreatePlaylist,
      privatePlaylist,
      title
    }
  }
})
</script>

<style lang="scss" scoped>
.add-playlist-modal {
  .content {
    display: flex;
    flex-direction: column;
    input {
      margin-bottom: 12px;
    }
    input[type="text"] {
      width: calc(100% - 24px);
      flex: 1;
      background: var(--color-secondary-bg-for-transparent);
      font-size: 16px;
      border: none;
      font-weight: 600;
      padding: 8px 12px;
      border-radius: 8px;
      margin-top: -1px;
      color: var(--color-text);
      &:focus {
        background: var(--color-primary-bg-for-transparent);
        opacity: 1;
      }
      [data-theme="light"] &:focus {
        color: var(--color-primary);
      }
    }
    .checkbox {
      input[type="checkbox" i] {
        margin: 3px 3px 3px 4px;
      }
      display: flex;
      align-items: center;
      label {
        font-size: 12px;
      }
    }
  }
}
</style>
