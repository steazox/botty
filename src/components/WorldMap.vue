<script setup>
import { ref, reactive, onMounted } from "vue";
import L from "leaflet";

const map = ref(null);
const userPosition = ref({ lat: 0, lng: 0 });
const gridSize = 0.1; // Taille d'un carreau en degrés
const gridTiles = reactive(new Map()); // Stocke l'état de chaque carreau
let currentTileKey = ref(null);
let stayTimer = null;

// Fonction pour obtenir la clé d'un carreau à partir d'une position
const getTileKey = (lat, lng) => {
  const tileLat = Math.floor(lat / gridSize) * gridSize;
  const tileLng = Math.floor(lng / gridSize) * gridSize;
  return `${tileLat},${tileLng}`;
};

// Fonction pour dessiner les carreaux sur la carte
const drawGrid = () => {
  const bounds = map.value.getBounds();
  const latStart = Math.floor(bounds.getSouth() / gridSize) * gridSize;
  const latEnd = Math.ceil(bounds.getNorth() / gridSize) * gridSize;
  const lngStart = Math.floor(bounds.getWest() / gridSize) * gridSize;
  const lngEnd = Math.ceil(bounds.getEast() / gridSize) * gridSize;

  for (let lat = latStart; lat <= latEnd; lat += gridSize) {
    for (let lng = lngStart; lng <= lngEnd; lng += gridSize) {
      const key = getTileKey(lat, lng);

      // Si le carreau n'est pas déjà dessiné, ajoutez-le
      if (!gridTiles.has(key)) {
        const tile = L.rectangle(
          [
            [lat, lng],
            [lat + gridSize, lng + gridSize],
          ],
          { color: "#ccc", weight: 1, fillOpacity: 0.1 }
        ).addTo(map.value);
        gridTiles.set(key, tile);
      }
    }
  }
};

// Fonction pour vérifier si l'utilisateur reste dans un carreau
const checkUserInTile = () => {
  if (!userPosition.value) return;

  const tileKey = getTileKey(userPosition.value.lat, userPosition.value.lng);

  if (currentTileKey.value !== tileKey) {
    // L'utilisateur a changé de carreau
    currentTileKey.value = tileKey;
    clearTimeout(stayTimer); // Réinitialiser le timer
    stayTimer = null;
  }

  // Démarrer un nouveau timer si nécessaire
  if (!stayTimer) {
    stayTimer = setTimeout(() => {
      const tile = gridTiles.get(tileKey);
      if (tile) {
        tile.setStyle({ color: "blue", fillOpacity: 0.5 });
      }
    }, 120000); // 2 minutes en millisecondes
  }
};

// Initialisation de la carte
onMounted(() => {
  map.value = L.map("map").setView([20, 0], 2);

  // Ajouter les tuiles esthétiques
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://carto.com/">Carto</a>',
  }).addTo(map.value);

  // Dessiner le cadrillage initial
  drawGrid();

  // Redessiner le cadrillage au déplacement de la carte
  map.value.on("moveend", drawGrid);

  // Suivre la position de l'utilisateur
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        userPosition.value.lat = position.coords.latitude;
        userPosition.value.lng = position.coords.longitude;

        // Mettre à jour la carte sur la position de l'utilisateur
        map.value.setView([userPosition.value.lat, userPosition.value.lng], 13);

        // Vérifier dans quel carreau se trouve l'utilisateur
        checkUserInTile();
      },
      (error) => {
        console.error("Erreur de géolocalisation : ", error.message);
      },
      { enableHighAccuracy: true }
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
