// TODO:
// import VueClipboard from 'vue-clipboard2';
import { createI18n } from 'vue-i18n'
import store from '@/store'

import en from './lang/en'
import zhCN from './lang/zh-CN'
import zhTW from './lang/zh-TW'

const i18n = createI18n({
  locale: store.state.settings.lang,
  messages: {
    en,
    'zh-CN': zhCN,
    'zh-TW': zhTW
  },
  silentTranslationWarn: true
})

export default i18n
