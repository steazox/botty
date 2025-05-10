self.addEventListener('install', event => {
  console.log('Service Worker: Install')
  
  // Cache les fichiers essentiels
  event.waitUntil(
    caches.open('botty-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/favicon.ico',
        '/manifest.json',
        '/assets/main.css',
        '/assets/logo.svg'
      ])
    })
  )
})

self.addEventListener('activate', event => {
  console.log('Service Worker: Activate')
  
  // Supprime les caches obsolètes
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('botty-cache-') && cacheName !== 'botty-cache-v1'
        }).map(cacheName => {
          return caches.delete(cacheName)
        })
      )
    })
  )
})

// Gestion des notifications
self.addEventListener('push', event => {
  const data = event.data.json()
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png',
      tag: 'unique-tag'
    })
  )
})

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then(windowClients => {
      let client = windowClients.find(c => {
        return c.url === '/' && 'focus' in c
      })

      if (client) {
        return client.focus()
      } else {
        return clients.openWindow('/')
      }
    })
  )
})
