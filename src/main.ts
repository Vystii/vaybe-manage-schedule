import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Lara from '@primevue/themes/lara'

import App from './App.vue'
import { JsxEmit } from 'typescript'

const element: HTMLElement | null = document.getElementById('app')
console.log(element)
if (element && element.hasAttribute('data-url-get-schedules')) {
  const schedule_source = element.getAttribute('data-url-get-schedules')
  const course_url = element.hasAttribute('data-course-url')
    ? element.getAttribute('data-course-url')
    : ''
  const app = createApp(App, { schedule_source, course_url })
  app.use(PrimeVue, {
    theme: {
      preset: Lara,
      options: {
        darkModeSelector: '.fake-darkmode-selector',
      },
    },
  })
  app.use(createPinia())
  app.mount('#app')
}
