<template>
    <div>
      <img src="/pp.jpg" class="pp" />
      <div class="box">
        <span class="username">{{ authorName }}</span><br />
        <span class="displayname">{{ hashtagName }}</span><br />
        <button class="follow">Follow</button>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { useRoute } from "vue-router"; // Importer useRoute pour récupérer les paramètres de la route
  import { doc, getDoc, getFirestore } from "firebase/firestore";
  
  export default {
    name: "UserProfile",
    setup() {
      const route = useRoute(); // Récupérer les paramètres de la route
      const userId = route.params.userId; // Obtenir userId depuis les paramètres
      const authorName = ref("Chargement...");
      const hashtagName = ref("Chargement...");
  
      console.log("Paramètre userId :", userId); // Debug : vérifier si userId est récupéré
  
      onMounted(async () => {
        if (!userId) {
          console.error("Erreur : userId est undefined");
          authorName.value = "Utilisateur Inconnu";
          hashtagName.value = "Utilisateur Inconnu";
          return;
        }
  
        const db = getFirestore();
        try {
          const userDoc = doc(db, "users", userId); // Construire la référence Firestore
          const userSnapshot = await getDoc(userDoc);
  
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            authorName.value = userData.displayName || "Utilisateur Anonyme";
            hashtagName.value = "@" + userData.pseudo || "Utilisateur Anonyme";
          } else {
            console.error("Utilisateur non trouvé dans Firestore");
            authorName.value = "Utilisateur Inconnu";
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de l'utilisateur :", error);
          authorName.value = "Erreur de chargement";
        }
      });
  
      return {
        authorName,
        hashtagName
      };
    },
  };
  </script>
  
  <style scoped>
  .pp {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1; /* z-index négatif mais pas excessif */
  }
  .box {
    background: #313131;
    z-index: 1;
    width: 100%;
    position: absolute;
    left: 0;
    top: 40%;
    height: 60%;
    border-radius: 25px 25px 0 0;
    padding: 30px;
  }
  .username {
    font-weight: 600;
    line-height: 1.2;
    color: #f1f1f1;
    font-size: xx-large;
  }
  .displayname {
    line-height: 1.2;
    color: #bbb; /* Amélioration de la lisibilité */
  }
  .follow {
    width: 100%;
    height: 40px; /* Hauteur fixe pour les boutons */
    margin: 10px 0;
    border-radius: 30px;
    border: none;
    font-weight: 600;
    font-size: medium;
    color: #313131;
    background-color: #f1f1f1; /* Contraste amélioré */
    cursor: pointer;
  }
  .follow:hover {
    background-color: #e1e1e1; /* Effet au survol */
  }
  </style>
  