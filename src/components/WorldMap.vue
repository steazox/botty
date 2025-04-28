<template>
    <div id="app">
      <div id="map" style="height: 100vh;"></div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import L from "leaflet";
  import { getFirestore, doc, setDoc, writeBatch } from "firebase/firestore";
  import { useRouter } from "vue-router";
  
  export default {
    name: "App",
    setup() {
      const map = ref(null);
      const userPosition = ref({ lat: 0, lng: 0 });
      const gridSize = 0.01; // Taille des carreaux en degrés
      const gridTiles = new Map();
      const db = getFirestore();
  
      const saveTilesBatch = async () => {
        if (gridTiles.size > 0) {
          const batch = writeBatch(db);
          gridTiles.forEach((tile, key) => {
            if (tile.visited) {
              const tileRef = doc(db, "tiles", key);
              batch.set(tileRef, { visited: true });
            }
          });
  
          try {
            await batch.commit();
            console.log("Carreaux enregistrés en lot");
          } catch (error) {
            console.error("Erreur lors de la sauvegarde des carreaux par lot", error);
          }
        }
      };
  
      const getTileKey = (lat, lng) => `${lat}_${lng}`;
  
      const drawGrid = async () => {
        const bounds = map.value.getBounds();
        const latStart = Math.floor(bounds.getSouth() / gridSize) * gridSize;
        const latEnd = Math.ceil(bounds.getNorth() / gridSize) * gridSize;
        const lngStart = Math.floor(bounds.getWest() / gridSize) * gridSize;
        const lngEnd = Math.ceil(bounds.getEast() / gridSize) * gridSize;
  
        // Supprimer les carreaux non visibles
        gridTiles.forEach((tile, key) => {
          const [lat, lng] = key.split("_").map((v) => parseFloat(v) * gridSize);
          if (
            lat < latStart ||
            lat > latEnd ||
            lng < lngStart ||
            lng > lngEnd
          ) {
            tile.rectangle.remove();
            gridTiles.delete(key);
          }
        });
  
        // Ajouter des nouveaux carreaux dans la vue
        for (let lat = latStart; lat <= latEnd; lat += gridSize) {
          for (let lng = lngStart; lng <= lngEnd; lng += gridSize) {
            const key = getTileKey(lat, lng);
  
            if (!gridTiles.has(key)) {
              const rectangle = L.rectangle(
                [
                  [lat, lng],
                  [lat + gridSize, lng + gridSize],
                ],
                { color: "#ccc", weight: 1, fillOpacity: 0.1 }
              ).addTo(map.value);
  
              gridTiles.set(key, { rectangle, visited: false });
            }
          }
        }
      };
  
      const checkUserTile = () => {
        const latStart = Math.floor(userPosition.value.lat / gridSize) * gridSize;
        const lngStart = Math.floor(userPosition.value.lng / gridSize) * gridSize;
        const key = getTileKey(latStart, lngStart);
  
        if (gridTiles.has(key)) {
          const tile = gridTiles.get(key);
          if (!tile.visited) {
            tile.visited = true;
            tile.rectangle.setStyle({ fillColor: "blue", fillOpacity: 0.5 });
          }
        }
      };
  
      const trackPosition = () => {
        let lastUpdate = Date.now();
  
        navigator.geolocation.watchPosition(
          (position) => {
            const now = Date.now();
            if (now - lastUpdate > 1000) {  // Mise à jour toutes les secondes
              userPosition.value.lat = position.coords.latitude;
              userPosition.value.lng = position.coords.longitude;
  
              // Mise à jour de la carte
              L.marker([userPosition.value.lat, userPosition.value.lng])
                .addTo(map.value)
                .bindPopup("Vous êtes ici")
                .openPopup();
  
              map.value.setView([userPosition.value.lat, userPosition.value.lng], 13);
              checkUserTile();
  
              lastUpdate = now;
            }
          },
          (error) => {
            console.error("Erreur de géolocalisation : ", error.message);
          },
          { enableHighAccuracy: true }
        );
      };
  
      onMounted(() => {
        // Initialisation de la carte
        map.value = L.map("map").setView([45.0, 5.0], 13); // Position par défaut
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map.value);
  
        // Gérer le dessin du quadrillage
        map.value.on("moveend", drawGrid);
  
        // Suivre la position de l'utilisateur
        trackPosition();
  
        // Sauvegarder les carreaux par lot toutes les 30 secondes
        setInterval(saveTilesBatch, 30000);
  
        // Dessiner le quadrillage initial
        drawGrid();
      });
  
      return {
        map,
      };
    },
  };
  </script>
  
  <style>
  #map {
    height: 100%;
  }
  </style>
  