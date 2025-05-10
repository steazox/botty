<template>
  <div class="notification-manager">
    <button @click="showNotification" v-if="notificationPermission === 'granted'">
      Envoyer une notification
    </button>
    <button @click="requestPermission" v-else>
      Demander la permission pour les notifications
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const notificationPermission = ref('default')

const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    notificationPermission.value = permission
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error)
  }
}

const showNotification = () => {
  if (notificationPermission.value === 'granted') {
    const notification = new Notification('Nouvelle notification', {
      body: 'Ceci est une notification PWA',
      icon: '/icon.png',
      tag: 'unique-tag'
    })

    // Gérer l'action de la notification
    notification.onclick = () => {
      window.focus()
    }
  }
}

// Vérifier la permission au montage
onMounted(() => {
  notificationPermission.value = Notification.permission
})
</script>

<style scoped>
.notification-manager {
  padding: 1rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
