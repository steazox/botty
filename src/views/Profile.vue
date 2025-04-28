<template>
  <div>
    <div class="image-container">
      <img v-if="user.uid == userId" src="/pp.jpg" class="pp mod" />
      <div class="overlay">
        <input ref="fileInput" type="file" class="d-none" />
        <p v-if="!fileInput">fileInput n'est pas initialisé !</p>
        <button @click="openFileInput" class="edit-button">Modifier la photo</button>
      </div>
    </div>
    <div class="box">
      <span class="username">{{ authorName }}</span><br />
      <span class="displayname">{{ hashtagName }}</span><br />
      <button @click="follow(userId)" v-if="user.uid != userId" class="follow">Follow</button>
      <button @click="editProfile" v-else class="edit">Modifier le compte</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const fileInput = ref(null);

export default {
  name: "UserProfile",
  setup() {
    const route = useRoute();
    const userId = route.params.userId;
    const authorName = ref("Chargement...");
    const hashtagName = ref("Chargement...");
    const user = getAuth().currentUser;

    

    const openFileInput = async () => {
      await nextTick(); // Assure-toi que le DOM est prêt
      if (fileInput.value) {
        fileInput.value.click();
      } else {
        console.error("fileInput est null, vérifie que l'élément existe.");
      }
    };

    const editProfile = () => {
      console.log("Modification du compte de l'utilisateur");
    };

    const follow = async (id) => {
      console.log("Followed user with ID:", id);
      if (id == user.uid) {
        console.log("Vous ne pouvez pas vous suivre vous-même");
      }
    };

    onMounted(async () => {
      if (!userId) {
        console.error("Erreur : userId est undefined");
        authorName.value = "Utilisateur Inconnu";
        hashtagName.value = "Utilisateur Inconnu";
        return;
      }

      const db = getFirestore();
      try {
        const userDoc = doc(db, "users", userId);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          authorName.value = userData.displayName || "Utilisateur Anonyme";
          hashtagName.value = "@" + (userData.pseudo || "Utilisateur Anonyme");
        } else {
          console.error("Utilisateur non trouvé dans Firestore");
          authorName.value = "Utilisateur Inconnu";
          hashtagName.value = "@Utilisateur Inconnu";
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        authorName.value = "Erreur de chargement";
        hashtagName.value = "@Erreur";
      }
    });

    return {
      authorName,
      hashtagName,
      userId,
      follow,
      user,
      openFileInput,
      editProfile,
    };
  },
};
</script>


<style scoped>
.image-container {
  width: 100%;
  height: 100px;
}

.mod:hover+.overlay,
.overlay:hover {
  display: flex;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 120%;
  background: rgba(0, 0, 0, 0.5);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.edit-button {
  background: rgba(255, 255, 255, 0.8);
  color: #313131;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  position: absolute;
  top: 20%;
}

.edit-button:hover {
  background: #ffffff;
}

.pp {
  width: 100%;
  padding: -32px;

  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
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
  color: #bbb;
}

.follow {
  width: 100%;
  height: 40px;
  margin: 10px 0;
  border-radius: 30px;
  border: none;
  font-weight: 600;
  font-size: medium;
  color: #313131;
  background-color: #f1f1f1;
  cursor: pointer;
}

.follow:hover {
  background-color: #e1e1e1;
}

.edit {
  width: 100%;
  height: 40px;
  margin: 10px 0;
  border-radius: 30px;
  border-color: #f1f1f1;
  border-width: 2px;
  border-style: solid;
  font-weight: 600;
  font-size: medium;
  color: #f1f1f1;
  background-color: #313131;
  cursor: pointer;
}

.d-none {
  display: none;
}
</style>