import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './locale'
import NProgress from 'nprogress'
import { dailyTask } from '@/utils/common'
import '@/assets/css/global.scss'
import '@/assets/css/nprogress.css'

NProgress.configure({ showSpinner: false, trickleSpeed: 100 })
dailyTask()

const app = createApp(App)
app.use(store)
app.use(router)
app.use(i18n)
app.mount('#app')
