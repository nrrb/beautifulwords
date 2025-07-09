import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import Google Fonts
const link = document.createElement('link')
link.href = 'https://fonts.googleapis.com/css2?family=Fleur+De+Leah&family=Kapakana:wght@300..400&family=Pinyon+Script&family=Monsieur+La+Doulaise&family=Ballet:opsz@16..72&family=Imperial+Script&family=Mea+Culpa&family=My+Soul&family=Updock&family=Lavishly+Yours&display=swap'
link.rel = 'stylesheet'
document.head.appendChild(link)

// Import global styles
import './assets/main.css'

const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)

app.mount('#app')
