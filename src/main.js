import './assets/main.css'
import './assets/leaflet.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initializeApp } from "firebase/app";
import { register } from 'register-service-worker'

// Register the service worker
register('/service-worker.js', {
  ready() {
    console.log('Service Worker: Ready')
  },
  registered() {
    console.log('Service Worker: Registered')
  },
  cached() {
    console.log('Service Worker: Cached')
  },
  updatefound() {
    console.log('Service Worker: New content is downloading')
  },
  updated() {
    console.log('Service Worker: New content is available')
  },
  offline() {
    console.log('Service Worker: App is offline')
  },
  error(error) {
    console.error('Service Worker Error:', error)
  }
})

// Request notification permission
if ('Notification' in window) {
  Notification.requestPermission().then(function(permission) {
    console.log('Notification permission status:', permission)
  })
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwHOagmHuR2WwxHJU9oXV20vTMP3u_HsA",
  authDomain: "botty-e19d4.firebaseapp.com",
  projectId: "botty-e19d4",
  storageBucket: "botty-e19d4.firebasestorage.app",
  messagingSenderId: "383861962357",
  appId: "1:383861962357:web:d7c9b8c79f1150a404ea3c"
};

initializeApp(firebaseConfig);

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
