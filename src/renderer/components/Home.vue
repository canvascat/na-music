<template>
    <n-grid x-gap="12" y-gap="12" :cols="2" style="padding: 12px;box-sizing: border-box;">
      <n-grid-item>
        <n-card title="Electron Clipboard API">
          <p>{{ contentToCopy }}</p>
          <template #footer>
            <n-button @click="copyToClipboard">Click To Copy</n-button>
          </template>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="Electron Shell & Dialog API">
          <p>{{ contentToCopy }}</p>
          <p v-if="filePath"> {{ filePath }} </p>
          <p v-else style="color: grey"> File path will display here! </p>
          <template #footer>
            <n-space style="justify-content: center;">
              <n-button @click="pickItem">Click To Pick File</n-button>
              <n-button @click="showItem">Click To Show File in Directory</n-button>
            </n-space>
          </template>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="Vue reactivity">
          <p>Click below button to checkout vue reactivity</p>
          <template #footer>
            <sum-equation />
          </template>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="Vuex Store">
          <p> count: {{ count }} </p>
          <template #footer>
            <n-button @click="increment">Click To Increment by Commit！</n-button>
          </template>
        </n-card>
      </n-grid-item>
    </n-grid>
</template>

<script lang=ts>
import { defineComponent, reactive, toRefs } from 'vue'
import { NCard, NButton, NGrid, NGridItem, NSpace, useMessage } from 'naive-ui'
import { useClipboard, useShell, useDialog, useCount } from '../hooks'
import SumEquation from './SumEquation.vue'

export default defineComponent({
  components: {
    SumEquation,
    NCard,
    NButton,
    NGrid,
    NGridItem,
    NSpace
  },
  setup(props, context) {
    const message = useMessage()
    const data = reactive({
      contentToCopy: 'hello, you will copy/paste this piece of text!',
      filePath: ''
    })
    const { showItemInFolder } = useShell()
    const { write } = useClipboard()
    const { showOpenDialog } = useDialog()
    const name = 'abc'
    function copyToClipboard() {
      write({ text: data.contentToCopy })
      message.info(`${data.contentToCopy} 已复制到剪切板`)
    }
    async function pickItem() {
      const { filePaths } = await showOpenDialog({
        title: 'Pick the file to show',
        properties: ['openFile']
      })
      data.filePath = filePaths[0] ?? ''
    }
    function showItem() {
      showItemInFolder(data.filePath)
    }
    return {
      ...toRefs(data),
      ...useCount(),
      name,
      copyToClipboard,
      showItem,
      pickItem
    }
  }
})
</script>

<style scoped>
.n-card {
  height: 100%;
}
</style>
