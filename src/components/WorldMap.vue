<template>
  <div class="world-map">
    <div id="map" class="map-container"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import L from 'leaflet'

onMounted(() => {
  const map = L.map('map').setView([0, 0], 2)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  // Ajouter un marqueur
  L.marker([0, 0]).addTo(map)
    .bindPopup('Un marqueur.')
    .openPopup()
})
</script>

<style scoped>
.world-map {
  width: 100%;
  height: 400px;
}

.map-container {
  width: 100%;
  height: 100%;
}
</style>
