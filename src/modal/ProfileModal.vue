<template>
    <div class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
            <h2>Complete Your Profile</h2>
            <p><input type="text" placeholder="Pseudo" v-model="pseudo" class="input" /></p>
            <p><input type="text" placeholder="Display Name" v-model="displayName" class="input" /></p>
            <p><textarea placeholder="Bio" v-model="bio" class="input textbox"></textarea></p>
            <!-- <p><input type="file" @change="handleFileUpload" /></p> -->
            <p><button @click="saveProfile" class="button">Save Profile</button></p>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useRouter } from "vue-router";

// Déclaration de l'événement "close" à émettre
const emit = defineEmits(['close']);

const pseudo = ref("");
const displayName = ref("");
const bio = ref("");
const profilePicture = ref(null);
const props = defineProps({
    uid: String, // UID de l'utilisateur
});
const router = useRouter();

const handleFileUpload = (event) => {
    profilePicture.value = event.target.files[0];
};

const saveProfile = async () => {
    try {
        const firestore = getFirestore();
        const profileData = {
            pseudo: pseudo.value,
            displayName: displayName.value,
            bio: bio.value,
            profilePicture: profilePicture.value ? URL.createObjectURL(profilePicture.value) : null,
            updatedAt: new Date(),
        };

        // Sauvegarde des données dans Firestore
        await setDoc(doc(firestore, "users", props.uid), profileData, { merge: true });

        console.log("Profile saved!");
        closeModal();
        router.push("/feed");
    } catch (error) {
        console.error("Error saving profile:", error);
    }
};

// Fonction pour fermer le modal et émettre l'événement
const closeModal = () => {
    emit("close"); // Émettre l'événement "close"
};
</script>

<style scoped>
.input {
    border: none;
    background: #5f5f5f;
    padding: 10px;
    margin: 10px;
    border-radius: 10px;
    width: 189px !important;
}

.textbox {
    resize: none;
    width: 189px !important;
}

.button {
    background: #686868;
    color: #f1F1F1;
    border: none;
    padding: 10px;
    border-radius: 10px;
    transition-duration: 0.4s;
}

.button:hover {
    background: #5f5f5f;
    transition-duration: 0.4s;
    cursor: pointer;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: #313131;
    padding: 50px;
    border-radius: 22px;
    width: 300px;
    text-align: center;
}

button {
    margin-top: 10px;
}
</style>