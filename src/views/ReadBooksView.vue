<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../modules/firebase'; 
import { getDocs, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore'; 

const auth = getAuth();
const readBooks = ref([]);

// Fetch read books fra Firestore
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

// Function til at remove a book fra Read Books list
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

// Function til at give en rating til book
const giveRating = async (bookId, rating) => {
  const user = auth.currentUser; // Hent den nuværende bruger
  if (user) {
    const bookDocRef = doc(db, 'users', user.uid, 'ReadBooks', bookId); // Reference til bogen i Firestore
    try {
      // Opdater dokumentet med den nye rating
      await updateDoc(bookDocRef, { rating });
      console.log('Rating given to book:', bookId, 'Rating:', rating);
      
      // Opdater den lokale værdi med rating
      const book = readBooks.value.find(b => b.id === bookId);
      if (book) {
        book.rating = rating; // Opdater den lokale værdi med rating
      }
    } catch (error) {
      console.error("Error giving rating to book:", error);
    }
  }
};

// Function til at handle rating 
const handleRatingChange = (bookId, rating) => {
  giveRating(bookId, rating);
};

onMounted(fetchReadBooks);
</script>

<template>
  <main>
    <h1>Books you have read:</h1>
    <ul>
      <!-- bøgerne der er læst som bliver vist -->
      <li v-for="book in readBooks" :key="book.id" class="book-item">
        <img :src="book.coverUrl" alt="Book Cover" class="book-cover" />
        <div class="book-details">
          <h2>{{ book.title }}</h2>
          <p><strong>Auhtor:</strong> {{ book.author }}</p>
          <p><strong>Release year:</strong> {{ book.releaseYear }}</p>
          <p><strong>Genre: </strong>{{ book.genre.join(', ') }}</p>
          <p v-if="book.rating"><strong>Rating:</strong> {{ book.rating }}</p>
        </div>
        
        <!-- ny container for rating og remove button -->
        <div class="action-container">
          <!-- Dropdown for rating -->
          <select @change="(e) => handleRatingChange(book.id, parseInt(e.target.value))" class="rating-dropdown">
            <option value="" disabled selected>Give a Rating</option>
            <option v-for="rate in [1, 2, 3, 4, 5]" :key="rate" :value="rate">{{ rate }}</option>
          </select>
          
          <button class="discard-button" @click="handleRemoveBook(book.id)">
            Remove from Read Books
          </button>
        </div>
      </li>
    </ul>
    <div v-if="!readBooks.length">
      <p>Looks like you haven't read any books yet...</p>
    </div>
  </main>
</template>

<style scoped>
main {
  padding-top: 5%;
}

.book-item {
  width: 80vh;
  display: flex;
  justify-content: space-between;
  align-items: center; 
  margin-bottom: 20px;
}

.book-cover {
  width: 100px; 
  height: auto;
}

.book-details {
  flex-grow: 1; 
  margin-left: 20px; 
}

.action-container {
  display: flex;
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  margin-left: 20px; 
}

.rating-dropdown {
  margin-bottom: 10px; 
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  color: #333;
  background-color: #fff;
}

.rating-dropdown:focus {
  outline: none;
  border-color: #66afe9;
}

.discard-button {
  background-color: #ec6060;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 8px 12px; 
  color: white;
  transition: background-color 0.3s;
  font-size: 14px; 
  width: 95%; 
}

.discard-button:hover {
  background-color: #ca4949;
}
</style>
