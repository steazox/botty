<template>
    <div>
        <button @click="showModal = true">Créer un post</button>

        <!-- Modal pour créer un post -->
        <div v-if="showModal" class="modal">
            <textarea v-model="newPostContent" placeholder="Votre post..."></textarea>
            <button @click="createPost">Publier</button>
            <button @click="showModal = false">Annuler</button>
        </div>

        <!-- Liste des posts -->
        <div v-for="post in posts" :key="post?.id || 'unknown'" class="post">
            <template v-if="post?.id">
                <div class="header">
                    <h3 class="username">{{ post.author }}</h3>
                    <button class="follow">follow</button>
                </div>
                <div class="box-content">
                    <p>{{ post.content }}</p>
                    <div class="row">
                        <button @click="() => toggleLike(post)">
                            {{ post.likedBy?.includes(currentUser?.uid) ? "Je n'aime plus" : "J'aime" }}
                        </button>
                        <p>{{ post.likes }} likes</p>
                    </div>
                </div>

            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { loadPosts, createNewPost, likePost } from "../postService";
import { getAuth } from "firebase/auth";

const posts = ref([]);
const showModal = ref(false);
const newPostContent = ref("");

const auth = getAuth();
const currentUser = auth.currentUser;

onMounted(() => {
    loadPosts(posts);
});

const createPost = async () => {
    if (currentUser && newPostContent.value.trim()) {
        const newPost = await createNewPost(currentUser.uid, newPostContent.value.trim());
        posts.value.unshift(newPost); // Ajoute le nouveau post en haut de la liste
        newPostContent.value = "";
        showModal.value = false;
    }
};

const toggleLike = async (post) => {
    const updatedPost = await likePost(post.id);
    // Met à jour directement le post dans le tableau local
    const index = posts.value.findIndex((p) => p.id === post.id);
    if (index !== -1) {
        posts.value[index] = { ...updatedPost }; // Mise à jour réactive
    }
};
</script>
<style scoped>
.header {
    background: rgb(54, 54, 54);
    display: flex;
    flex-direction: row;
    border-radius: 20px 20px 0px 0px;
    padding: 10px;
    min-width: 200px;
    max-width: 500px;
}

.username {
    font-weight: 800;
    margin-left: 50px;
    color: #f1f1f1;
}

.follow {
    margin-left: 10px;
    border: none;
    padding: 7px;
    border-radius: 12px;
    background: #7ab3ae;
    color: #f1f1f1;
    font-weight: 600;
}

.box-content {
    background: rgb(65, 64, 64);
    min-width: 200px;
    max-width: 500px;
    border-radius: 0px 0px 20px 20px;
    padding: 20px;
}

.row {
    display: flex;
    flex-direction: row;
}
</style>