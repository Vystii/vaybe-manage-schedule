import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Material from '@primevue/themes/material'

import App from './App.vue'
import { JsxEmit } from 'typescript'

const element: HTMLElement | null = document.getElementById('app')
// const settings = JSON.parse(element.getAttribute('data-settings'))
const settings = {}
const app = createApp(App, { settings })
app.use(PrimeVue, {
  theme: {
    preset: Material,
  },
})
app.use(createPinia())
app.mount('#app')
if (element && element.hasAttribute('data-settings')) {
}
