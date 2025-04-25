<template>
    <h1>Sign In to an Account</h1><br>
    <p><input type="text" placeholder="Email" v-model="email"/></p><br>
    <p><input type="password" placeholder="Password" v-model="password"/></p><br>
    <p><button @click="register">Submit</button></p><br>
    <!-- <p><button @click="signInWithGoogle">Sign In With Google</button></p> -->
</template>

<script setup>
    import { ref } from "vue";
    import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
    import { useRouter } from 'vue-router'
    const email = ref("");
    const password = ref("");
    const router = useRouter();

    const register = () => {
        signInWithEmailAndPassword(getAuth(), email.value, password.value)
            .then((data) => {
                console.log("Successfully registered!");
                router.push('/feed');
            })
    };
    const signInWithGoogle = () => {

    }
</script>