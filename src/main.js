import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import dayjs from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import App from './App.vue'
import router from './router'
import './assets/styles/global.css'

dayjs.extend(quarterOfYear)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(naive)

app.mount('#app')
