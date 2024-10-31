<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../modules/firebase'; 
import { getDocs, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore'; 

const auth = getAuth();
const readBooks = ref([]);

// Fetch read books from Firestore
const fetchReadBooks = async () => {
  const user = auth.currentUser;
  if (user) {
    const readBooksCollectionRef = collection(db, 'users', user.uid, 'ReadBooks');
    const snapshot = await getDocs(readBooksCollectionRef);
    const uniqueBooks = new Map();

    snapshot.docs.forEach(doc => {
      const bookData = { id: doc.id, ...doc.data() };
      uniqueBooks.set(doc.id, bookData);
    });

    readBooks.value = Array.from(uniqueBooks.values());
  }
};

// Function to remove a book from Read Books list
const removeFromReadBooks = async (bookId) => {
    const user = auth.currentUser;
    if (user) {
        const bookDocRef = doc(db, 'users', user.uid, 'ReadBooks', bookId); 
        try {
            await deleteDoc(bookDocRef);
            console.log('Book removed from Read Books:', bookId);
        } catch (error) {
            console.error("Error removing book from Read Books:", error);
        }
    }
};

// Handle book removal
const handleRemoveBook = async (bookId) => {
  try {
    await removeFromReadBooks(bookId);
    readBooks.value = readBooks.value.filter(book => book.id !== bookId); // Remove book locally
  } catch (error) {
    console.error("Failed to remove book:", error);
  }
};

onMounted(fetchReadBooks);
</script>

<template>
  <div>
    <h1>Læste bøger</h1>
    <ul>
      <li v-for="book in readBooks" :key="book.id" class="book-item">
        <img :src="book.coverUrl" alt="Book Cover" class="book-cover" />
        <div class="book-details">
          <h2>{{ book.title }}</h2>
          <p><strong>Forfatter:</strong> {{ book.author }}</p>
          <p><strong>Udgivelsesår:</strong> {{ book.releaseYear }}</p>
          <button class="discard-button" @click="handleRemoveBook(book.id)">
            Fjern fra læste bøger
          </button>
        </div>
      </li>
    </ul>
    <div v-if="!readBooks.length">
      <p>Ingen bøger i din Read Books-liste.</p>
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
</style>
