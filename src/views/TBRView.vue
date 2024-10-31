<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../modules/firebase'; 
import { getDocs, collection } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore'; 
import { useRouter } from 'vue-router';

const auth = getAuth();
const tbrBooks = ref([]);
const router = useRouter();

// Fetch TBR books from Firestore
const fetchTBRBooks = async () => {
  const user = auth.currentUser;
  if (user) {
    const tbrBooksCollectionRef = collection(db, 'users', user.uid, 'TBRBooks');
    const snapshot = await getDocs(tbrBooksCollectionRef);
    const uniqueBooks = new Map();

    snapshot.docs.forEach(doc => {
      const bookData = { id: doc.id, ...doc.data() };
      uniqueBooks.set(doc.id, bookData);
    });

    tbrBooks.value = Array.from(uniqueBooks.values());
    console.log('Books fetched:', tbrBooks.value); // Log fetched books
  } else {
    console.log('No user is currently signed in.');
  }
};

// Function to remove a book from TBR Books list
const removeFromTBRBooks = async (bookId) => {
    const user = auth.currentUser;
    if (user) {
        const bookDocRef = doc(db, 'users', user.uid, 'TBRBooks', bookId); 
        try {
            await deleteDoc(bookDocRef);
            console.log('Book removed from TBR Books:', bookId);
        } catch (error) {
            console.error("Error removing book from TBR Books:", error);
        }
    }
};

// Handle book removal
const handleRemoveTBRBook = async (bookId) => {
  try {
    await removeFromTBRBooks(bookId);
    tbrBooks.value = tbrBooks.value.filter(book => book.id !== bookId); // Remove book locally
    console.log('Book removed locally:', bookId);
  } catch (error) {
    console.error("Failed to remove book:", error);
  }
};

// Check authentication status on component mount
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchTBRBooks();
    } else {
      console.log('User is not authenticated, redirecting to login page.');
      router.push('/login'); // Redirect to login page if not authenticated
    }
  });
});
</script>

<template>
  <div>
    <h1>To Be Read (TBR) bøger</h1>
    <ul>
      <li v-for="book in tbrBooks" :key="book.id" class="book-item">
        <img :src="book.coverUrl" alt="Book Cover" class="book-cover" />
        <div class="book-details">
          <h2>{{ book.title }}</h2>
          <p><strong>Forfatter:</strong> {{ book.author }}</p>
          <p><strong>Udgivelsesår:</strong> {{ book.releaseYear }}</p>
          <button class="discard-button" @click="handleRemoveTBRBook(book.id)">
            Fjern fra TBR-listen
          </button>  
        </div>
      </li>
    </ul>
    <div v-if="!tbrBooks.length">
      <p>Ingen bøger i din TBR-liste.</p>
    </div>
  </div>
</template>

<style scoped>
.discard-button {
  margin-top: 10px;
  padding: 5px 10px;
  color: white;
  background-color: red;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.discard-button:hover {
  background-color: #c61a07;
}

/* Brug de samme stilarter som i ReadBooks.vue */
.main {
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  margin-top: 10vh;
}

ul {
  margin-top: 2rem;
  list-style-type: none;
  padding: 0;
}

.book-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.book-cover {
  width: 100px;
  height: auto;
  margin-right: 20px;
}

.book-details {
  flex: 1;
  text-align: left;
}

.no-books {
  color: #999;
  font-size: 1.2em;
}

h1 {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 20px;
}
</style>