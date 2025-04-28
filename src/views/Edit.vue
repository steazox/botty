<template>
    <div>
      <button @click="triggerFileSelector">Modifier la photo</button>
      <input 
        ref="hiddenFileInput" 
        type="file" 
        style="display: none;" 
        @change="handleFileChange" 
      />
    </div>
  </template>
  
  <script>
  import { ref } from "vue";
  
  export default {
    setup() {
      const hiddenFileInput = ref(null);
  
      const triggerFileSelector = () => {
        if (hiddenFileInput.value) {
          hiddenFileInput.value.click();
        }
      };
  
      const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          console.log("Fichier sélectionné :", file.name);
          // Ajouter ici le traitement pour l'image
        }
      };
  
      return {
        hiddenFileInput,
        triggerFileSelector,
        handleFileChange,
      };
    },
  };
  </script>
  