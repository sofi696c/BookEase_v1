<script>
import { ref, onMounted } from 'vue';
import { db } from '../modules/firebase'; 
import { getDocs, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { doc, deleteDoc, addDoc, getDoc } from 'firebase/firestore'; 


const auth = getAuth();


export default {
  setup() {
  const wantToReadBooks = ref([]);

  const fetchWantToReadBooks = async () => {
    const user = auth.currentUser;
    if (user) {
      const wantToReadCollectionRef = collection(db, 'users', user.uid, 'WantToRead');
      const snapshot = await getDocs(wantToReadCollectionRef);
      wantToReadBooks.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  };

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

  const handleRemoveBook = async (bookId) => {
    try {
      await removeFromWantToRead(bookId);
      wantToReadBooks.value = wantToReadBooks.value.filter(book => book.id !== bookId); // Remove book locally
    } catch (error) {
      console.error("Failed to remove book:", error);
    }
  };

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

  return {
    wantToReadBooks,
    handleRemoveBook,
    moveToReadBooks, // Tilføjet her
  };
}

};
</script>

<template>
  <div>
    <h1>Books, you want to read:</h1>
    <ul>
      <li v-for="book in wantToReadBooks" :key="book.id" class="book-item">
        <img :src="book.coverUrl" alt="Book Cover" class="book-cover" />
        <div class="book-details">
          <h2>{{ book.title }}</h2>
          <p><strong>Forfatter:</strong> {{ book.author }}</p>
          <p><strong>Udgivelsesår:</strong> {{ book.releaseYear }}</p>
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
      <p>Ingen bøger i din Want to Read-liste.</p>
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

.move-button {
  margin-top: 10px;
  padding: 5px 10px;
  color: white;
  background-color: #a6b29b;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.move-button:hover {
  background-color: #7b8274;
}
</style>
