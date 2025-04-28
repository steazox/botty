<script setup>
import { ref, onMounted } from "vue";
import L from "leaflet";

const map = ref(null);
const userPosition = ref({ lat: 0, lng: 0 });

onMounted(() => {
  // Initialiser la carte
  map.value = L.map("map").setView([20, 0], 2);

  // Ajouter les tuiles OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value);

  // Vérifier si la géolocalisation est disponible
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Récupérer les coordonnées de l'utilisateur
        userPosition.value.lat = position.coords.latitude;
        userPosition.value.lng = position.coords.longitude;

        // Centrer la carte sur la position de l'utilisateur
        map.value.setView([userPosition.value.lat, userPosition.value.lng], 13);

        // Ajouter un marqueur à la position de l'utilisateur
        L.marker([userPosition.value.lat, userPosition.value.lng])
          .addTo(map.value)
          .bindPopup("Vous êtes ici.")
          .openPopup();
      },
      (error) => {
        console.error("Erreur de géolocalisation : ", error.message);
        alert("Impossible de récupérer votre position.");
      }
    );
  } else {
    alert("La géolocalisation n'est pas prise en charge par ce navigateur.");
  }
});
</script>

<template>
  <div id="map" style="height: 500px; width: 100%;"></div>
</template>

<style>
#map {
  border: 2px solid #ccc;
  border-radius: 8px;
}
</style>
