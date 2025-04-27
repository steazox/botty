<template>
  <div>
    <nav class="navbar">
      <div class="navbar-container">
        <!-- Navigation Links -->
        <div class="nav-links">
          <router-link to="/feed" class="nav-link" active-class="active-link">
            Feed
          </router-link>
          <router-link
            :to="`/profile/${currentUser}`"
            class="nav-link"
            active-class="active-link"
          >
            Profile
          </router-link>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  name: "Navbar",
  data() {
    return {
      currentUser: null, // Stocke l'utilisateur actuel
    };
  },
  mounted() {
    const auth = getAuth();

    // Écoute les changements d'état de l'utilisateur
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = user.uid; // Mise à jour de l'utilisateur
        console.log("Utilisateur connecté :", user);
      } else {
        this.currentUser = null; // Pas d'utilisateur connecté
        console.log("Aucun utilisateur connecté");
      }
    });
  },
};
</script>

<style>
/* Style général de la navbar */
.navbar {
  background-color: #333;
  color: white;
  padding: 16px;
  width: 100%;
  position: fixed;
  bottom: 0;
  /* Reste en bas de l'écran */
  left: 0;
  z-index: 1000;
  /* S'assurer que la navbar est au-dessus des autres éléments */
}

/* Conteneur pour aligner les éléments */
.navbar-container {
  display: flex;
  justify-content: center;
  /* Centre les éléments */
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

/* Style des liens de navigation */
.nav-links {
  display: flex;
  gap: 40px;
  /* Espacement entre les liens */
  align-items: center;
}

/* Style des liens avec effet de survol */
.nav-link {
  text-decoration: none;
  color: white;
  font-size: 18px;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #4db8ff;
  /* Couleur au survol */
}

/* Style pour le lien actif */
.active-link {
  color: #4db8ff;
  /* Couleur active */
  font-weight: bold;
}
</style>
