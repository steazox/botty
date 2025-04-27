<template>
  <div @scroll="onScroll" class="feed-container">
    <button @click="showModal = true">Créer un post</button>

    <!-- Modal pour créer un post -->
    <div v-if="showModal" class="modal">
      <textarea v-model="newPostContent" placeholder="Votre post..."></textarea>
      <button @click="createPost">Publier</button>
      <button @click="showModal = false">Annuler</button>
    </div>

    <!-- Liste des posts -->
    <div v-for="post in posts" :key="post.id" class="post">
      <div class="header">
        <!-- Vérification si l'ID de l'auteur est défini avant d'afficher le lien -->
        <router-link :to="`/profile/${getCurrentUser().uid}`" class="username">{{ post.author }}</router-link>
        <button class="follow">Suivre</button>
      </div>
      <div class="box-content">
        <p>{{ post.content }}</p>
        <div class="row">
          <button @click="toggleLike(post)">
            {{ post.likedBy?.includes(currentUser?.uid) ? "Je n'aime plus" : "J'aime" }}
          </button>
          <p>{{ post.likes || 0 }} likes</p>
          <button @click="toggleCommentBox(post.id)">Répondre</button>
        </div>
        <div class="comments-section">
          <div v-if="post.showCommentBox" class="comment-box">
            <textarea v-model="post.newComment" placeholder="Écrivez un commentaire..." rows="3"
              class="comment-input"></textarea>
            <button @click="submitComment(post)">Poster</button>
          </div>
          <div v-for="comment in post.comments || []" :key="comment.timestamp" class="comment">
            <router-link :to="`/profile/${comment.userId}`">{{ comment.username }}</router-link>: {{ comment.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getFirestore, doc, getDoc, collection, query, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { createNewPost, likePost, getCurrentUser } from "../postService";

const posts = ref([]);
const showModal = ref(false);
const newPostContent = ref("");
const isLoading = ref(false);

const auth = getAuth();
const currentUser = auth.currentUser;

const loadPosts = async (postsRef) => {
  try {
    const db = getFirestore();
    const postsQuery = query(collection(db, "posts"));
    const querySnapshot = await getDocs(postsQuery);

    for (const docSnap of querySnapshot.docs) {
      const post = docSnap.data();
      post.id = docSnap.id;
      console.log(post.authorId);
      if (post.authorId) {
        const userRef = doc(db, "users", post.authorId); // Utilise authorId pour récupérer l'utilisateur
        const userSnap = await getDoc(userRef);
        post.author = userSnap.exists() ? userSnap.data().displayName || "Utilisateur inconnu" : "Utilisateur supprimé";
        
      }
      post.comments = post.comments || [];
      postsRef.value.push(post);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des posts :", error);
  }
};


onMounted(() => {
  loadPosts(posts, 0, 10);
});

const toggleCommentBox = (postId) => {
  const post = posts.value.find((p) => p.id === postId);
  if (post) {
    post.showCommentBox = !post.showCommentBox;
    if (!post.newComment) post.newComment = "";
  }
};

const submitComment = async (post) => {
  if (post.newComment.trim()) {
    try {
      const db = getFirestore();
      const user = auth.currentUser;

      if (!user) {
        alert("Vous devez être connecté pour poster un commentaire !");
        return;
      }

      const postRef = doc(db, "posts", post.id);
      const userRef = doc(db, "users", user.uid);

      const userSnapshot = await getDoc(userRef);
      if (!userSnapshot.exists()) throw new Error("Utilisateur non trouvé dans Firestore");

      const userData = userSnapshot.data();
      const authorName = userData.displayName || "Utilisateur inconnu";

      const comment = {
        userId: user.uid,
        username: authorName,
        content: post.newComment.trim(),
        timestamp: new Date().toISOString(),
      };

      await updateDoc(postRef, { comments: arrayUnion(comment) });

      post.comments.push(comment);
      post.newComment = "";
      post.showCommentBox = false;

    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire :", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    }
  } else {
    alert("Le commentaire ne peut pas être vide !");
  }
};

const createPost = async () => {
  if (currentUser && newPostContent.value.trim()) {
    const newPost = await createNewPost(currentUser.uid, newPostContent.value.trim());
    posts.value.unshift(newPost);
    newPostContent.value = "";
    showModal.value = false;
  }
};

const toggleLike = async (post) => {
  const updatedPost = await likePost(post.id);
  const index = posts.value.findIndex((p) => p.id === post.id);
  if (index !== -1) {
    posts.value[index] = { ...updatedPost };
  }
};

const onScroll = async (event) => {
  const bottom = event.target.scrollHeight === event.target.scrollTop + event.target.clientHeight;
  if (bottom && !isLoading.value) {
    isLoading.value = true;
    const currentLength = posts.value.length;
    await loadPosts(posts, currentLength, 10);
    isLoading.value = false;
  }
};
</script>

<style scoped>
.feed-container {
  max-height: 80vh;
  overflow-y: auto;
  padding: 10px;
}

.post {
  margin: 20px 0px 20px 0px;
}

.header {
  background: #363636;
  display: flex;
  align-items: center;
  border-radius: 20px 20px 0 0;
  padding: 10px;
  min-width: 200px;
  max-width: 500px;
}

.username {
  font-weight: bold;
  margin-left: 10px;
  color: #f1f1f1;
  text-decoration: none;
}

.follow {
  margin-left: auto;
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
  border-radius: 0 0 20px 20px;
  padding: 20px;
}

.row {
  display: flex;
  flex-direction: row;
}

.comments-section {
  margin-top: 10px;
}

.comment {
  margin: 5px 0;
  padding: 5px;
  border-bottom: 1px solid #ddd;
}

.comment-box {
  margin-top: 10px;
}

.comment-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
}
</style>
