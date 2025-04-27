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
        <router-link :to="`/profile/${post.authorId}`" class="username">{{ post.author }}</router-link>
        <button class="follow">Suivre</button>
      </div>
      <div class="box-content">
        <p>{{ post.content }}</p>
        <div class="row">
          <button class="like" @click="toggleLike(post)">
            <svg v-if="post.likedBy?.includes(currentUser?.uid)" class="heart active" xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512">
              <path
                d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
            </svg>
            <svg v-else class="heart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path
                d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8l0-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5l0 3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9z" />
            </svg>
          </button>
          <p class="likeCtn">{{ post.likedBy?.length || 0 }}</p>

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
.likeCtn {
  margin-right: 10px;
  font-weight: 900;
}
.like .heart.active {
  fill: #ff0000; /* Couleur pour le "like" actif */
}
.like .heart {
  fill: #cccccc; /* Couleur par défaut */
}
.heart {
  width: 22px;
  height: 22px;
  fill: red; /* Couleur de l'icône */
}
.like {
  background: transparent;
  border: none;
}

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

.heart {

  z-index: 99;
}
</style>
