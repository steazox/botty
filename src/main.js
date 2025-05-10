import './assets/main.css'
import "leaflet/dist/leaflet.css";

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initializeApp } from "firebase/app";
import './registerServiceWorker'


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
