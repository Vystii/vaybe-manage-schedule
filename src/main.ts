import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Lara from '@primevue/themes/lara'

import App from './App.vue'
import { JsxEmit } from 'typescript'

const element: HTMLElement | null = document.getElementById('app')
console.log(element)
if (
  element &&
  element.hasAttribute('data-url-get-schedules') &&
  element.hasAttribute('data-csrf-token')
) {
  const url = element.getAttribute('data-url-get-schedules')
  const schedule_request_body = element.hasAttribute('data-request-body')
    ? element.hasAttribute('data-request-body')
    : null
  const course_url = element.hasAttribute('data-course-url')
    ? element.getAttribute(`data-course-url`)!
    : ''
  const csrf_token = element.hasAttribute('data-csrf-token')
    ? element.getAttribute('data-csrf-token')!
    : ''
  console.log('token: ', csrf_token)
  const schedule_source = {
    url: url,
    body: schedule_request_body,
  }
  const app = createApp(App, { schedule_source, course_url, csrf_token })
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
