<template>
    <h1>Create An Account</h1>
    <br>
    <p><input type="text" placeholder="Email" v-model="email" /></p>
    <br>
    <p><input type="password" placeholder="Password" v-model="password" /></p>
    <br>
    <p><button @click="register">Submit</button></p>
    <ProfileModal v-if="showModal" @close="closeModal" :uid="userUid" />
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
  import { useRouter } from "vue-router";
  import ProfileModal from "../modal/ProfileModal.vue"; // Import du modal
  
  const email = ref("");
  const password = ref("");
  const showModal = ref(false);
  const userUid = ref("");
  const router = useRouter();
  
  const register = async () => {
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
      const user = userCredential.user;
  
      console.log("User registered!");
      userUid.value = user.uid;
      showModal.value = true; // Afficher le modal
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };
  
  const closeModal = () => {
    showModal.value = false;
    router.push("/feed");
  };
  </script>
  