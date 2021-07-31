import { createApp } from 'vue'
import App from './App.vue'
// import './registerServiceWorker'
import router from './router'
import store from './store/index'
import i18n from './locale';

createApp(App).use(store).use(router).use(i18n).mount('#app')
