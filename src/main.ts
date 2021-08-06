import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store, key } from './store'
import i18n from './locale'
import NProgress from 'nprogress'
import '@/assets/css/global.scss'
import '@/assets/css/nprogress.css'

NProgress.configure({ showSpinner: false, trickleSpeed: 100 })

;(async () => {
  await store.state.player.init()
  const app = createApp(App)
  app.use(store, key)
  app.use(router)
  app.use(i18n)
  app.mount('#app')
})()
