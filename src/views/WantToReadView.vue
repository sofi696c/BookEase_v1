<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../modules/firebase'; 
import { getDocs, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { doc, deleteDoc, addDoc, getDoc } from 'firebase/firestore'; 

const auth = getAuth();

const wantToReadBooks = ref([]);

// Function til at hente want to read bøger fra Firestore
const fetchWantToReadBooks = async () => {
  const user = auth.currentUser;
  if (user) {
    const wantToReadCollectionRef = collection(db, 'users', user.uid, 'WantToRead'); 
    const snapshot = await getDocs(wantToReadCollectionRef);
    wantToReadBooks.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}; 

// Function til at remove book fra Want to Read list
const removeFromWantToRead = async (bookId) => {
  const user = auth.currentUser;
  if (user) {
    const bookDocRef = doc(db, 'users', user.uid, 'WantToRead', bookId); 
    try {
      await deleteDoc(bookDocRef);
      console.log('Book removed from Want to Read:', bookId);
    } catch (error) {
      console.error("Error removing book from Want to Read:", error);
    }
  }
}; 

// Function til at remove  book fra Want to Read list
const handleRemoveBook = async (bookId) => {
  try {
    await removeFromWantToRead(bookId);
    wantToReadBooks.value = wantToReadBooks.value.filter(book => book.id !== bookId); // Slet bogen lokalt
  } catch (error) {
    console.error("Failed to remove book:", error);
  }
};

// Function til at move a book fra Want to Read, til Read Books
const moveToReadBooks = async (bookId) => {
  const user = auth.currentUser;
  if (user) {
    const wantToReadBookRef = doc(db, 'users', user.uid, 'WantToRead', bookId);
    const readBooksCollectionRef = collection(db, 'users', user.uid, 'ReadBooks');
    
    try {
      const bookSnapshot = await getDoc(wantToReadBookRef);
      if (bookSnapshot.exists()) {
        await addDoc(readBooksCollectionRef, { ...bookSnapshot.data() });
        console.log('Book moved to Read Books:', bookId);
        
        await deleteDoc(wantToReadBookRef);
        wantToReadBooks.value = wantToReadBooks.value.filter(book => book.id !== bookId);
      }
    } catch (error) {
      console.error("Error moving book to Read Books:", error);
    }
  }
};

onMounted(fetchWantToReadBooks); 
</script>

<template>
  <main>
    <h1>Books you want to read:</h1>
    <ul>
      <!-- Viser bøgerne i want to read -->
      <li v-for="book in wantToReadBooks" :key="book.id" class="book-item">
        <img :src="book.coverUrl" alt="Book Cover" class="book-cover" />
        <div class="book-details">
          <h2>{{ book.title }}</h2>
          <p><strong>Author:</strong> {{ book.author }}</p>
          <p><strong>Release year:</strong> {{ book.releaseYear }}</p>
          <p><strong>Genre: </strong>{{ book.genre.join(', ') }}</p>
        </div> 
        
        <!-- Knapper til at flytte bogen til read books eller fjerne den fra want to read -->
        <div class="button-container">
          <button class="move-button" @click="moveToReadBooks(book.id)">
            Move to Read Books
          </button>
          <button class="discard-button" @click="handleRemoveBook(book.id)"> 
            Remove from Want to Read
          </button>
        </div>
      </li>
    </ul>
    <div v-if="!wantToReadBooks.length">
      <p>Looks like you haven't added any books you want to read yet..</p>
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
  align-items: center;
  margin-bottom: 20px;
  justify-content: space-between; 
}

.book-cover {
  width: 100px; 
  height: auto;
  margin-right: 20px;
}

.book-details {
  flex-grow: 1;
  margin-right: 20px; 
}

.button-container {
  display: flex;
  flex-direction: column; 
  align-items: flex-end; 
  padding: 0 5%;
  gap: 15px;
}

.move-button,
.discard-button {
  padding: 8px 12px; 
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
  width: 100%; 
}

.move-button {
  background-color: #a6b29b; 
}

.move-button:hover {
  background-color: #7b8274; 
}

.discard-button {
  background-color: #ec6060; 
}

.discard-button:hover {
  background-color: #ca4949; 
}
</style>
