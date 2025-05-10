import { collection, addDoc, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Fonction pour récupérer l'utilisateur actuel
export const getCurrentUser = () => {
  const auth = getAuth();
  return auth.currentUser;
};

// Charger les posts
export const loadPosts = async (postsRef) => {
  const db = getFirestore();
  const postsCollection = collection(db, "posts");
  try {
    const snapshot = await getDocs(postsCollection);
    postsRef.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erreur lors du chargement des posts :", error);
  }
};

// Créer un nouveau post
export const createNewPost = async (userId, content) => {
  const db = getFirestore();
  const user = getCurrentUser();

  if (!user) {
    throw new Error("Utilisateur non authentifié");
  }

  try {
    const userDoc = doc(db, "users", userId);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      throw new Error("Utilisateur non trouvé dans Firestore");
    }

    const userData = userSnapshot.data();
    const authorName = userData.displayName || "Utilisateur Anonyme";

    const newPost = {
      author: authorName,
      authorId: userId,
      content,
      likes: 0,
      likedBy: [],
      createdAt: new Date(),
    };

    const postsCollection = collection(db, "posts");
    const postRef = await addDoc(postsCollection, newPost);
    
    // Récupérer le post avec son ID
    const postSnap = await getDoc(postRef);
    return { id: postRef.id, ...postSnap.data() };
  } catch (error) {
    console.error("Erreur lors de la création du post :", error);
    throw error;
  }
};

// Aimer un post
export const likePost = async (postId) => {
  const db = getFirestore();
  const user = getCurrentUser();

  if (!user) {
    throw new Error("Utilisateur non authentifié");
  }

  const postRef = doc(db, "posts", postId);

  try {
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
      throw new Error("Post introuvable");
    }

    const postData = postSnap.data();
    const likedBy = postData.likedBy || [];

    let updatedLikes = postData.likes || 0;

    if (likedBy.includes(user.uid)) {
      // Retirer le like
      updatedLikes -= 1;
      await updateDoc(postRef, {
        likes: updatedLikes > 0 ? updatedLikes : 0,
        likedBy: arrayRemove(user.uid),
      });
    } else {
      // Ajouter un like
      updatedLikes += 1;
      await updateDoc(postRef, {
        likes: updatedLikes,
        likedBy: arrayUnion(user.uid),
      });
    }

    // Récupérer le post mis à jour
    const updatedPostSnap = await getDoc(postRef);
    return { id: postId, ...updatedPostSnap.data() };

  } catch (error) {
    console.error("Erreur lors du like :", error);
    throw error;
  }
};
