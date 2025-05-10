export const showNotification = async (title, body) => {
  try {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/icon.png',
        tag: 'post-interaction'
      })

      // Gérer l'action de la notification
      notification.onclick = () => {
        window.focus()
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'affichage de la notification:', error)
  }
}

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error)
    return false
  }
}
